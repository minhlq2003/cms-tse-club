"use client";

import { useEffect, useState } from "react";
import { Button, Modal, Table, Tag, Tooltip, message } from "antd";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  deleteTraining,
  searchMyTrainings,
  searchTrainingsByLeader,
  updateStatusTrainingByLeader,
  moveTrainingToTrash,
} from "@/modules/services/trainingService";
import { formatDate, getUser, isLeader } from "@/lib/utils";
import { Member } from "@/constant/types";
import { Check, Edit, Eye, Trash2, X } from "lucide-react";

interface Training {
  id: string;
  title: string;
  location?: {
    destination?: string;
    startTime?: string;
    endTime?: string;
  };
  status: string;
  creator?: Member;
  createdAt?: string;
  lastModifiedTime?: string;
  currentRegistered?: number;
  limitRegister?: number;
  category?: string;
}

interface ListTrainingProps {
  filters?: {
    search?: string;
    category?: string;
    startTime?: string;
    endTime?: string;
    status?: string;
    sort?: string;
  };
}

export default function ListTraining({ filters }: ListTrainingProps) {
  const { t } = useTranslation("common");
  const router = useRouter();

  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedTraining, setSelectedTraining] = useState<Training | null>(
    null
  );
  const [openMoveToTrashModal, setOpenMoveToTrashModal] = useState(false);
  const [openApproveModal, setOpenApproveModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);

  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      let res;

      if (isLeader()) {
        res = await searchTrainingsByLeader({
          page: page - 1,
          limit: 10,
          ...filters,
          searchs: "deleted",
          searchValues: "false",
        });
      } else {
        res = await searchMyTrainings({
          page: page - 1,
          limit: 10,
          ...filters,
          searchs: "deleted",
          searchValues: "false",
        });
      }

      if (Array.isArray(res.content)) {
        setTrainings(res.content);
        setTotal(res.totalElements);
      } else if (Array.isArray(res)) {
        setTrainings(res);
        setTotal(res.length);
      } else {
        setTrainings([]);
        setTotal(0);
      }
    } catch {
      message.error(t("Failed to fetch trainings"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, [JSON.stringify(filters), page]);

  const handleMoveToTrash = async (id: string) => {
    try {
      await moveTrainingToTrash(id);
      message.success(t("Training moved to trash successfully"));
      fetchTrainings();
    } catch {
      message.error(t("Failed to move training to trash"));
    } finally {
      setOpenMoveToTrashModal(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await updateStatusTrainingByLeader(id, "ACCEPTED");
      message.success(t("Training approved successfully"));
      fetchTrainings();
    } catch {
      message.error(t("Failed to approve training"));
    } finally {
      setOpenApproveModal(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateStatusTrainingByLeader(id, "REJECTED");
      message.success(t("Training rejected successfully"));
      fetchTrainings();
    } catch {
      message.error(t("Failed to reject training"));
    } finally {
      setOpenRejectModal(false);
    }
  };

  const columns = [
    {
      title: t("Training"),
      dataIndex: "title",
      key: "title",
      width: "25%",
      render: (text: string, record: Training) => (
        <div>
          <span className="font-semibold break-before-all max-w-[300px]">
            {text}
          </span>
          <div className="mt-2 flex gap-10">
            <p>
              {t("Số lượng đăng ký")}: {record.currentRegistered || 0}/
              {record.limitRegister || "∞"}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: t("Thời gian và địa điểm"),
      dataIndex: ["location", "startTime"],
      key: "startTime",
      width: "30%",
      render: (date: string | undefined, record: Training) => (
        <div>
          <p>
            {date ? new Date(date).toLocaleString() : ""} -{" "}
            {record.location?.endTime
              ? new Date(record.location.endTime).toLocaleString()
              : ""}
          </p>
          <p>{record.location?.destination || "-"}</p>
        </div>
      ),
    },
    {
      title: t("Creator"),
      dataIndex: ["creator", "fullName"],
      key: "creator",
      render: (text: string, record: Training) => (
        <div>
          <span className="font-semibold">{text || "-"}</span>
          <p>
            {formatDate(record.createdAt || "").formattedTime}{" "}
            {formatDate(record.createdAt || "").formattedDate}
          </p>
        </div>
      ),
    },
    {
      title: t("Lần chỉnh sửa gần nhất"),
      dataIndex: "lastModifiedTime",
      key: "lastModifiedTime",
      render: (date: string) => (
        <span>
          {formatDate(date).formattedTime} {formatDate(date).formattedDate}
        </span>
      ),
    },
    {
      title: t("Status"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          ACCEPTED: "green",
          PENDING: "orange",
          REJECTED: "red",
          DISABLED: "gray",
        };
        return <Tag color={colorMap[status] || "default"}>{t(status)}</Tag>;
      },
    },
    {
      title: t("Action"),
      key: "action",
      render: (_: any, record: Training) => (
        <div className="flex flex-wrap gap-2">
          <Tooltip title={t("Move to Trash")}>
            <Button
              danger
              icon={<Trash2 size={22} />}
              onClick={() => {
                setSelectedTraining(record);
                setOpenMoveToTrashModal(true);
              }}
            ></Button>
          </Tooltip>

          <Tooltip title={t("Edit")}>
            <Button
              type="primary"
              icon={<Edit size={22} />}
              onClick={() => router.push(`/training/edit?id=${record.id}`)}
            ></Button>
          </Tooltip>

          <Tooltip title={t("View")}>
            <Button
              icon={<Eye size={22} />}
              onClick={() => router.push(`/training/view?id=${record.id}`)}
            ></Button>
          </Tooltip>

          {isLeader() && record.status === "PENDING" && (
            <>
              <Tooltip title={t("Approve")}>
                <Button
                  className="!text-green-600 !border-green-600 !bg-green-50 hover:!bg-green-100"
                  icon={<Check size={22} />}
                  onClick={() => {
                    setSelectedTraining(record);
                    setOpenApproveModal(true);
                  }}
                ></Button>
              </Tooltip>
              <Tooltip title={t("Reject")}>
                <Button
                  className="!text-red-600 !border-red-600 !bg-red-50 hover:!bg-red-100"
                  icon={<X size={22} />}
                  onClick={() => {
                    setSelectedTraining(record);
                    setOpenRejectModal(true);
                  }}
                ></Button>
              </Tooltip>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full mt-5">
      <Table
        rowKey="id"
        columns={columns}
        dataSource={trainings}
        loading={loading}
        pagination={{
          pageSize: 10,
          current: page,
          onChange: setPage,
          total: total,
          showSizeChanger: false,
        }}
        scroll={{ x: 1500 }}
      />

      <Modal
        title={t("Confirm Move to Trash")}
        open={openMoveToTrashModal}
        onCancel={() => setOpenMoveToTrashModal(false)}
        onOk={() =>
          selectedTraining && handleMoveToTrash(String(selectedTraining.id))
        }
        okButtonProps={{ danger: true }}
        okText={t("Move to Trash")}
        cancelText={t("Cancel")}
      >
        <p>{t("Are you sure you want to move this training to trash?")}</p>
      </Modal>

      <Modal
        title={t("Confirm Approve")}
        open={openApproveModal}
        onCancel={() => setOpenApproveModal(false)}
        onOk={() =>
          selectedTraining && handleApprove(String(selectedTraining.id))
        }
        okText={t("Approve")}
        cancelText={t("Cancel")}
      >
        <p>{t("Are you sure you want to approve this training?")}</p>
      </Modal>

      <Modal
        title={t("Confirm Reject")}
        open={openRejectModal}
        onCancel={() => setOpenRejectModal(false)}
        onOk={() =>
          selectedTraining && handleReject(String(selectedTraining.id))
        }
        okText={t("Reject")}
        cancelText={t("Cancel")}
      >
        <p>{t("Are you sure you want to reject this training?")}</p>
      </Modal>
    </div>
  );
}
