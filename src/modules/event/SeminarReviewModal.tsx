"use client";

import React, { useEffect, useState } from "react";
import { Modal, Table, Button, message } from "antd";
import { StarOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { getSeminarReview } from "../services/eventService";

interface SeminarReviewsModalProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
}

interface Review {
  id: string;
  user: {
    fullName: string;
    email: string;
  };
  content: string;
  rating: number;
}

const SeminarReviewsModal: React.FC<SeminarReviewsModalProps> = ({
  open,
  onClose,
  eventId,
}) => {
  const { t } = useTranslation("common");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && eventId) {
      fetchReviews();
    }
  }, [open, eventId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await getSeminarReview(eventId);
      const reviewList = Array.isArray(res.reviews)
        ? res.reviews
        : Array.isArray(res)
        ? res
        : [];
      setReviews(reviewList);
    } catch (err) {
      message.error(t("Không thể tải đánh giá"));
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: t("Người đánh giá"),
      dataIndex: ["user", "fullName"],
      key: "reviewer",
      render: (text: string, record: Review) => (
        <div>
          <div className="font-semibold">{text}</div>
          <div className="text-sm text-gray-500">{record.user.email}</div>
        </div>
      ),
    },
    {
      title: t("Nội dung"),
      dataIndex: "content",
      key: "content",
      render: (text: string) => (
        <div className="max-w-md">{text || t("Không có nội dung")}</div>
      ),
    },
    {
      title: t("Đánh giá"),
      dataIndex: "rating",
      key: "rating",
      width: 120,
      align: "center" as const,
      render: (rating: number) => (
        <span className="text-yellow-500 font-semibold">
          {rating} <StarOutlined />
        </span>
      ),
    },
  ];

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "0";

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <StarOutlined style={{ fontSize: 24, color: "#faad14" }} />
          <span className="text-lg md:text-xl font-semibold">
            {t("Đánh giá seminar")}
          </span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={
        <Button type="primary" onClick={onClose}>
          {t("Đóng")}
        </Button>
      }
      width="90%"
      className="!max-w-[900px]"
    >
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">
            {t("Tổng số đánh giá")}: <strong>{reviews.length}</strong>
          </span>
          <span className="text-gray-700">
            {t("Đánh giá trung bình")}:
            <strong className="text-yellow-600 text-lg">
              {averageRating} <StarOutlined />
            </strong>
          </span>
        </div>
      </div>

      <Table
        rowKey={(record: Review) => record.id}
        columns={columns}
        dataSource={reviews}
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 600 }}
        locale={{
          emptyText: t("Chưa có đánh giá nào"),
        }}
      />
    </Modal>
  );
};

export default SeminarReviewsModal;
