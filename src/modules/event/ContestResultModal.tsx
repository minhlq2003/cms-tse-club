"use client";

import React, { useEffect, useState } from "react";
import { Modal, Table, Button, InputNumber, Alert, message } from "antd";
import { toast } from "sonner";
import { TrophyOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import {
  getContestExamResults,
  updateContestResults,
} from "../services/eventService";
import { Member, ExamResult, AttendeeDto } from "@/constant/types";

interface ContestResultsModalProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  attendees: AttendeeDto[];
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
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
    
  });

  const fetchResults = async (page: number = 1, size: number = 10) => {
    if (open) {
      setLoading(true);
      try {
        const res = await getContestExamResults(eventId, {
          page: page - 1,
          size,
          sort: "point,desc",
        });
        const initialResults: ExamResult[] = Array.isArray(
          res._embedded?.examResultDtoList
        )
          ? res._embedded.examResultDtoList
          : Array.isArray(res)
          ? res
          : [];
        setContestResults(initialResults);
        setPagination(prev => ({
          ...prev,
          total: res.page?.totalElements || 0,
        }));
      } catch (error) {
        toast.error(t("Failed to fetch contest results"));
      } finally {
        setLoading(false);
      }
    } else {
      setContestResults([]);
    }
  };

  useEffect(() => {
    fetchResults(pagination.current, pagination.pageSize);
  }, [open, pagination.current, pagination.pageSize]);  const handleResultChange = (
    userId: string,
    field: "rank" | "point",
    value: number | null
  ) => {
    setContestResults((prev) =>
      prev.map((result) =>
        result.student?.id === userId ? { ...result, [field]: value || 0 } : result
      )
    );
  };

  const handleTableChange = (pagination: any) => {
    setPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: pagination.total,
    });
  };

  const handleSave = async () => {
    const invalid = contestResults.some(
      (r) => r.rank === undefined || r.point === undefined
    );

    if (invalid) {
      toast.warning(t("Vui lòng nhập đầy đủ thứ hạng và điểm số"));
      return;
    }

    try {
      setLoading(true);
      const payload = {
        examResults: contestResults.map((r) => ({
          userId: r.student?.id,
          rank: r.rank,
          point: r.point,
        })),
      };

      const res = await updateContestResults(eventId, payload);
      console.log("Update response:", res);
      if (res?.status && res.status >= 400){
        toast.error(t("Không thể cập nhật kết quả"));
      }
      else{
        toast.success(t("Đã cập nhật kết quả thi thành công"));
        onClose();
      }
    } catch (err) {
      console.error("Error updating contest results:", err);
      toast.error(t("Có lỗi xảy ra khi cập nhật kết quả"));
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
          onChange={(val) => handleResultChange(record.student?.id!, "rank", val)}
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
          value={record.point}
          onChange={(val) => handleResultChange(record.student?.id!, "point", val)}
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
        rowKey={(record: ExamResult) => record.student?.id!}
        columns={columns}
        dataSource={contestResults}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: 600 }}
      />
    </Modal>
  );
};

export default ContestResultsModal;
