"use client";

import { useEffect, useState } from "react";
import { Button, Modal, Table, Tag, message } from "antd";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  deleteTraining,
  searchMyTrainings,
  searchTrainingsByLeader,
  updateStatusTrainingByLeader,
} from "@/modules/services/trainingService";
import { getUser, isLeader } from "@/lib/utils";
import { Member } from "@/constant/types";

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
}

interface ListTrainingProps {
  filters?: {
    search?: string;
    category?: string;
    startTime?: string;
    endTime?: string;
    status?: string;
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
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
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
        });
      } else {
        res = await searchMyTrainings({
          page: page - 1,
          limit: 10,
          ...filters,
        });
      }

      if (Array.isArray(res.content)) {
        setTrainings(res.content);
        setTotal(res.totalElements);
      } else if (Array.isArray(res)) {
        setTrainings(res);
        setTotal(res.length);
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

  const handleDelete = async (id: string) => {
    try {
      await deleteTraining(id);
      message.success(t("Training deleted successfully"));
      fetchTrainings();
    } catch {
      message.error(t("Failed to delete training"));
    } finally {
      setOpenDeleteModal(false);
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
      title: t("Title"),
      dataIndex: "title",
      key: "title",
      render: (text: string) => (
        <span className="font-semibold break-all max-w-[300px]">{text}</span>
      ),
    },
    {
      title: t("Location"),
      dataIndex: ["location", "destination"],
      key: "destination",
    },
    {
      title: t("Start Time"),
      dataIndex: ["location", "startTime"],
      key: "startTime",
      render: (date: string | undefined) =>
        date ? new Date(date).toLocaleString() : "",
    },
    {
      title: t("End Time"),
      dataIndex: ["location", "endTime"],
      key: "endTime",
      render: (date: string | undefined) =>
        date ? new Date(date).toLocaleString() : "",
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
          <Button
            danger
            onClick={() => {
              setSelectedTraining(record);
              setOpenDeleteModal(true);
            }}
          >
            {t("Delete")}
          </Button>

          <Button
            type="primary"
            onClick={() => router.push(`/training/edit?id=${record.id}`)}
          >
            {getUser().id === record.creator?.id ? t("Edit") : t("View")}
          </Button>

          {isLeader() && record.status === "PENDING" && (
            <>
              <Button
                onClick={() => {
                  setSelectedTraining(record);
                  setOpenApproveModal(true);
                }}
              >
                {t("Approve")}
              </Button>
              <Button
                onClick={() => {
                  setSelectedTraining(record);
                  setOpenRejectModal(true);
                }}
              >
                {t("Reject")}
              </Button>
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
        scroll={{ x: "max-content" }}
      />

      {/* Delete Modal */}
      <Modal
        title={t("Confirm Delete")}
        open={openDeleteModal}
        onCancel={() => setOpenDeleteModal(false)}
        onOk={() =>
          selectedTraining && handleDelete(String(selectedTraining.id))
        }
        okButtonProps={{ danger: true }}
        okText={t("Delete")}
        cancelText={t("Cancel")}
      >
        <p>{t("Are you sure you want to delete this training?")}</p>
      </Modal>

      {/* Approve Modal */}
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

      {/* Reject Modal */}
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
