"use client";

import { useEffect, useState } from "react";
import { Button, Popconfirm, Table, Tag, message } from "antd";
import { useRouter } from "next/navigation";
import { Event } from "@/constant/types";
import { getEvents, deleteEvent } from "@/modules/services/eventService";
import { useTranslation } from "react-i18next";

export default function ListEvent() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await getEvents({
        eventType: "ALL",
      });
      if (Array.isArray(res)) {
        setEvents(res);
      }
    } catch {
      message.error(t("Failed to fetch events"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEvent(id);
      message.success(t("Event deleted successfully"));
      fetchEvents();
    } catch {
      message.error(t("Failed to delete event"));
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const columns = [
    {
      title: t("Title"),
      dataIndex: "title",
      key: "title",
      render: (text: string) => <span className="font-semibold">{text}</span>,
    },
    {
      title: t("Category"),
      dataIndex: "category",
      key: "category",
    },
    {
      title: t("Location"),
      dataIndex: ["location", "destination"],
      key: "destination",
    },
    {
      title: t("Status"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "default";
        if (status === "published") color = "green";
        if (status === "draft") color = "orange";
        if (status === "cancelled") color = "red";
        return <Tag color={color}>{t(status)}</Tag>;
      },
    },
    {
      title: t("Actions"),
      key: "actions",
      render: (_: any, record: any) => (
        <div className="flex gap-2">
          <Button
            type="link"
            onClick={() => router.push(`/events/edit?id=${record.id}`)}
          >
            {t("Edit")}
          </Button>
          <Popconfirm
            title={t("Are you sure delete this seminar?")}
            onConfirm={() => handleDelete(record.id)}
            okText={t("Yes")}
            cancelText={t("No")}
          >
            <Button danger type="link">
              {t("Delete")}
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full mt-5">
      <Table
        rowKey="id"
        columns={columns}
        dataSource={events}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
