"use client";

import { useState } from "react";
import { Table, Button, Popconfirm } from "antd";
import { Event } from "@/constant/types";
import { PlusOutlined } from "@ant-design/icons";
import TrainingEventModal from "./TrainingEventModal";
import { useTranslation } from "react-i18next";
import Link from "next/link";

interface Props {
  trainingEvent: Event[];
  setTrainingEvent: React.Dispatch<React.SetStateAction<Event[]>>;
}

export default function TrainingEventTable({
  trainingEvent,
  setTrainingEvent,
}: Props) {
  const [openModal, setOpenModal] = useState(false);
  const { t } = useTranslation("common");

  const handleDelete = (id: string) => {
    setTrainingEvent((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddLesson = (lesson: Event) => {
    setTrainingEvent((prev) => [...prev, lesson]);
  };

  const columns = [
    { title: "Title", dataIndex: "title", key: "title" },
    {
      title: "Start Time",
      dataIndex: ["location", "startTime"],
      key: "startTime",
      render: (text: string) => (text ? new Date(text).toLocaleString() : ""),
    },
    {
      title: "End Time",
      dataIndex: ["location", "endTime"],
      key: "endTime",
      render: (text: string) => (text ? new Date(text).toLocaleString() : ""),
    },
    {
      title: "Place",
      dataIndex: ["location", "destination"],
      key: "location",
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: Event) => (
        <div className="flex gap-2">
          <Popconfirm
            title="Are you sure to delete this event?"
            onConfirm={() => handleDelete(record.id || "")}
          >
            <Button danger size="small">
              Delete
            </Button>
          </Popconfirm>
          <Link href={`/events/edit?id=${record.id}`}>
            <Button size="small" type="primary">
              {t("Edit")}
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="border border-[#d9d9d9] p-4 rounded-md mb-4">
      <div className="flex justify-between pb-3">
        <p className="font-semibold text-xl">Lesson</p>
        <Button
          icon={<PlusOutlined />}
          type="primary"
          onClick={() => setOpenModal(true)}
        >
          Add Lesson
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={trainingEvent}
        pagination={{ pageSize: 10 }}
      />

      <TrainingEventModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onAddLesson={handleAddLesson}
      />
    </div>
  );
}
