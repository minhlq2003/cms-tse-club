"use client";

import React, { useEffect, useState } from "react";
import { Modal, Table, Button, InputNumber, Alert, message } from "antd";
import { TrophyOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { updateContestResults } from "../services/eventService";
import { Member, ExamResult } from "@/constant/types";

interface ContestResultsModalProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  attendees: Array<{
    user: Member;
    status: string;
  }>;
}

const ContestResultsModal: React.FC<ContestResultsModalProps> = ({
  open,
  onClose,
  eventId,
  attendees,
}) => {
  const { t } = useTranslation("common");
  const [contestResults, setContestResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Initialize results for checked attendees
      const initialResults: ExamResult[] = attendees
        .filter((a) => a.status === "CHECKED")
        .map((a) => ({
          userId: a.user.id,
          student: a.user,
          rank: 0,
          point: 0,
        }));
      setContestResults(initialResults);
    }
  }, [open, attendees]);

  const handleResultChange = (
    userId: string,
    field: "rank" | "point",
    value: number | null
  ) => {
    setContestResults((prev) =>
      prev.map((result) =>
        result.userId === userId ? { ...result, [field]: value || 0 } : result
      )
    );
  };

  const handleSave = async () => {
    const invalid = contestResults.some(
      (r) => r.rank === undefined || r.point === undefined
    );

    if (invalid) {
      message.warning(t("Vui lòng nhập đầy đủ thứ hạng và điểm số"));
      return;
    }

    try {
      setLoading(true);
      const payload = {
        examResults: contestResults.map((r) => ({
          userId: r.userId,
          rank: r.rank,
          point: r.point,
        })),
      };

      const res = await updateContestResults(eventId, payload);
      if (res) {
        message.success(t("Đã cập nhật kết quả thi thành công"));
        onClose();
      } else {
        message.error(t("Không thể cập nhật kết quả"));
      }
    } catch (err) {
      console.error("Error updating contest results:", err);
      message.error(t("Có lỗi xảy ra khi cập nhật kết quả"));
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: t("Sinh viên"),
      key: "student",
      render: (_: any, record: ExamResult) => (
        <div>
          <div className="font-semibold">{record.student?.fullName}</div>
          <div className="text-sm text-gray-500">{record.student?.email}</div>
        </div>
      ),
    },
    {
      title: t("Thứ hạng"),
      key: "rank",
      width: 150,
      render: (_: any, record: ExamResult) => (
        <InputNumber
          min={1}
          value={record.rank}
          onChange={(val) => handleResultChange(record.userId!, "rank", val)}
          style={{ width: "100%" }}
          placeholder={t("Nhập thứ hạng")}
        />
      ),
    },
    {
      title: t("Điểm số"),
      key: "point",
      width: 150,
      render: (_: any, record: ExamResult) => (
        <InputNumber
          min={0}
          max={100}
          value={record.point}
          onChange={(val) => handleResultChange(record.userId!, "point", val)}
          style={{ width: "100%" }}
          placeholder={t("Nhập điểm")}
        />
      ),
    },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <TrophyOutlined style={{ fontSize: 24, color: "#faad14" }} />
          <span className="text-lg md:text-xl font-semibold">
            {t("Cập nhật kết quả thi")}
          </span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>{t("Hủy")}</Button>
          <Button type="primary" onClick={handleSave} loading={loading}>
            {t("Lưu kết quả")}
          </Button>
        </div>
      }
      width="90%"
      className="!max-w-[900px]"
    >
      <Alert
        message={t("Lưu ý")}
        description={t(
          "Chỉ sinh viên đã điểm danh mới được hiển thị để cập nhật kết quả"
        )}
        type="info"
        showIcon
        className="mb-4"
      />
      <Table
        rowKey={(record: ExamResult) => record.userId!}
        columns={columns}
        dataSource={contestResults}
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 600 }}
      />
    </Modal>
  );
};

export default ContestResultsModal;
