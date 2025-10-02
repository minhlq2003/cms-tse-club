"use client";

import { useEffect, useState } from "react";
import { Button, Popconfirm, Table, Tag, message } from "antd";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { searchMyTrainings } from "@/modules/services/trainingService";

type Training = {
  id: string;
  title: string;
  location?: {
    destination?: string;
    startTime?: string;
    endTime?: string;
  };
  status: string;
  creator?: {
    fullName?: string;
    email?: string;
  };
};

interface ListTrainingProps {
  keyword?: string;
}

export default function ListTraining({ keyword }: ListTrainingProps) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const res = await searchMyTrainings({
        keyword,
      });
      if (Array.isArray(res)) {
        setTrainings(res);
      }
    } catch {
      message.error(t("Failed to fetch trainings"));
    } finally {
      setLoading(false);
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
    },
    {
      title: t("End Time"),
      dataIndex: ["location", "endTime"],
      key: "endTime",
    },
    {
      title: t("Status"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "default";
        if (status === "PENDING") color = "orange";
        if (status === "APPROVED") color = "green";
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
        <div className="flex gap-2">
          <Button
            type="link"
            onClick={() => router.push(`/training/edit?id=${record.id}`)}
          >
            {t("Edit")}
          </Button>
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
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
