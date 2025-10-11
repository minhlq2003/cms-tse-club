"use client";

import { useEffect, useState } from "react";
import { Button, Modal, Popconfirm, Table, Tag, message } from "antd";
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
import { update } from "lodash";

type Training = {
  id: string;
  title: string;
  location?: {
    destination?: string;
    startTime?: string;
    endTime?: string;
  };
  status: string;
  creator?: Member;
};

interface ListTrainingProps {
  keyword?: string;
}

export default function ListTraining({ keyword }: ListTrainingProps) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openApproveModal, setOpenApproveModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(
    null
  );

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      let res;
      if (isLeader()) {
        res = await searchTrainingsByLeader({
          keyword,
        });
      } else {
        res = await searchMyTrainings({
          keyword,
        });
      }
      if (Array.isArray(res)) {
        setTrainings(res);
      }
    } catch {
      message.error(t("Failed to fetch trainings"));
    } finally {
      setLoading(false);
    }
  };

  const showDeleteModal = (record: Training) => {
    setSelectedTraining(record);
    setOpenDeleteModal(true);
  };

  const showApproveModal = (record: Training) => {
    setSelectedTraining(record);
    setOpenApproveModal(true);
  };

  const showRejectModal = (record: Training) => {
    setSelectedTraining(record);
    setOpenRejectModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTraining) return;
    try {
      await handleDelete(selectedTraining.id);
      setOpenDeleteModal(false);
    } catch {
      message.error(t("Failed to delete training"));
    }
  };

  const handleConfirmApprove = async () => {
    if (!selectedTraining) return;
    try {
      await updateStatusTrainingByLeader(selectedTraining.id, "ACCEPTED");
      message.success(t("Training approved successfully"));
      fetchTrainings();
    } catch {
      message.error(t("Failed to approve training"));
    } finally {
      setOpenApproveModal(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedTraining) return;
    try {
      await updateStatusTrainingByLeader(selectedTraining.id, "REJECTED");
      message.success(t("Training rejected successfully"));
      fetchTrainings();
    } catch {
      message.error(t("Failed to reject training"));
    } finally {
      setOpenRejectModal(false);
    }
  };
  const handleDelete = async (id: string) => {
    try {
      deleteTraining(id);
      message.success(t("Training deleted successfully"));
      fetchTrainings();
    } catch {
      message.error(t("Failed to delete training"));
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, [keyword]);

  const columns = [
    {
      title: t("Title"),
      dataIndex: "title",
      key: "title",
      render: (text: string) => <span className="font-semibold">{text}</span>,
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
        let color = "default";
        if (status === "PENDING") color = "orange";
        if (status === "ACCEPTED") color = "green";
        if (status === "REJECTED") color = "red";
        return <Tag color={color}>{t(status)}</Tag>;
      },
    },
    {
      title: t("Creator"),
      dataIndex: ["creator", "fullName"],
      key: "creator",
    },
    {
      title: t("Actions"),
      key: "actions",
      render: (_: any, record: Training) => (
        <>
          <Button
            danger
            onClick={() => showDeleteModal(record)}
            style={{ marginRight: 8 }}
          >
            Xóa
          </Button>
          {getUser().id === record.creator?.id && (
            <Button type="primary">
              <a href={`/training/edit?id=${record.id}`}>Sửa</a>
            </Button>
          )}

          {isLeader() && record.status === "PENDING" && (
            <div>
              <Button
                onClick={() => showApproveModal(record)}
                style={{ marginLeft: 8 }}
              >
                Duyệt
              </Button>
              <Button
                onClick={() => showRejectModal(record)}
                style={{ marginLeft: 8 }}
              >
                Từ chối
              </Button>
            </div>
          )}
        </>
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
        pagination={{ pageSize: 10 }}
      />
      {/* Delete Modal */}
      <Modal
        title={t("Confirm Delete")}
        open={openDeleteModal}
        onCancel={() => setOpenDeleteModal(false)}
        onOk={handleConfirmDelete}
        okButtonProps={{ danger: true }}
        okText={t("Delete")}
        cancelText={t("Cancel")}
      >
        <p>{t("Are you sure you want to delete this training?")}</p>
      </Modal>

      {/* Approve Modal */}
      <Modal
        title="Xác nhận duyệt bài viết"
        open={openApproveModal}
        onCancel={() => setOpenApproveModal(false)}
        onOk={handleConfirmApprove}
        okText="Duyệt"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn duyệt bài viết này không?</p>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Xác nhận từ chối bài viết"
        open={openRejectModal}
        onCancel={() => setOpenRejectModal(false)}
        onOk={handleConfirmReject}
        okText="Từ chối"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn từ chối bài viết này không?</p>
      </Modal>
    </div>
  );
}
