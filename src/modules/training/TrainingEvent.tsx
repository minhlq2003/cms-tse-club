"use client";

import { useState } from "react";
import { Table, Button, Popconfirm, Tag, Card } from "antd";
import { Event, Member } from "@/constant/types";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import TrainingEventModal from "./TrainingEventModal";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import dayjs from "dayjs";

interface Props {
  trainingEvent: Event[];
  setTrainingEvent: React.Dispatch<React.SetStateAction<Event[]>>;
  mentors?: Member[];
}

export default function TrainingEventTable({
  trainingEvent,
  setTrainingEvent,
  mentors = [],
}: Props) {
  const [openModal, setOpenModal] = useState(false);
  const { t } = useTranslation("common");

  const handleDelete = (id: string) => {
    setTrainingEvent((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddLesson = (lesson: Event) => {
    setTrainingEvent((prev) => [...prev, lesson]);
  };

  // Desktop columns
  const columns = [
    {
      title: t("Title"),
      dataIndex: "title",
      key: "title",
      width: "25%",
    },
    {
      title: t("Start Time"),
      dataIndex: ["location", "startTime"],
      key: "startTime",
      width: "18%",
      render: (text: string) =>
        text ? dayjs(text).format("DD/MM/YYYY HH:mm") : "-",
    },
    {
      title: t("End Time"),
      dataIndex: ["location", "endTime"],
      key: "endTime",
      width: "18%",
      render: (text: string) =>
        text ? dayjs(text).format("DD/MM/YYYY HH:mm") : "-",
    },
    {
      title: t("Place"),
      dataIndex: ["location", "destination"],
      key: "location",
      width: "15%",
    },
    {
      title: t("Organizers"),
      key: "organizers",
      width: "14%",
      render: (_: any, record: Event) => (
        <div className="flex flex-wrap gap-1">
          {record.organizers && record.organizers.length > 0 ? (
            record.organizers.map((org) => (
              <Tag key={org.organizerId} color="blue" className="text-xs">
                {org.fullName || org.username}
              </Tag>
            ))
          ) : (
            <span className="text-gray-400 text-xs">{t("No organizers")}</span>
          )}
        </div>
      ),
    },
    {
      title: t("Action"),
      key: "action",
      width: "10%",
      render: (_: any, record: Event) => (
        <div className="flex gap-2">
          <Popconfirm
            title={t("Are you sure to delete this lesson?")}
            onConfirm={() => handleDelete(record.id || "")}
            okText={t("Yes")}
            cancelText={t("No")}
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              {t("Delete")}
            </Button>
          </Popconfirm>
          {record.id && (
            <Link href={`/events/edit?id=${record.id}`}>
              <Button size="small" type="primary" icon={<EditOutlined />}>
                {t("Edit")}
              </Button>
            </Link>
          )}
        </div>
      ),
    },
  ];

  // Mobile card view
  const renderMobileCard = (lesson: Event) => (
    <Card
      key={lesson.id}
      className="mb-3"
      size="small"
      title={
        <div className="flex justify-between items-start">
          <span className="font-semibold text-base">{lesson.title}</span>
          <div className="flex gap-1">
            {lesson.id && (
              <Link href={`/events/edit?id=${lesson.id}`}>
                <Button size="small" type="primary" icon={<EditOutlined />} />
              </Link>
            )}
            <Popconfirm
              title={t("Are you sure to delete this lesson?")}
              onConfirm={() => handleDelete(lesson.id || "")}
              okText={t("Yes")}
              cancelText={t("No")}
            >
              <Button danger size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          </div>
        </div>
      }
    >
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium text-gray-600">{t("Start Time")}: </span>
          <span>
            {lesson.location?.startTime
              ? dayjs(lesson.location.startTime).format("DD/MM/YYYY HH:mm")
              : "-"}
          </span>
        </div>
        <div>
          <span className="font-medium text-gray-600">{t("End Time")}: </span>
          <span>
            {lesson.location?.endTime
              ? dayjs(lesson.location.endTime).format("DD/MM/YYYY HH:mm")
              : "-"}
          </span>
        </div>
        <div>
          <span className="font-medium text-gray-600">{t("Place")}: </span>
          <span>{lesson.location?.destination || "-"}</span>
        </div>
        {lesson.organizers && lesson.organizers.length > 0 && (
          <div>
            <span className="font-medium text-gray-600">
              {t("Organizers")}:{" "}
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {lesson.organizers.map((org) => (
                <Tag key={org.organizerId} color="blue" className="text-xs">
                  {org.fullName || org.username}
                </Tag>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="border border-[#d9d9d9] p-3 md:p-4 rounded-md mb-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pb-3">
        <p className="font-semibold text-lg md:text-xl">{t("Lesson")}</p>
        <Button
          icon={<PlusOutlined />}
          type="primary"
          onClick={() => setOpenModal(true)}
          className="w-full sm:w-auto"
        >
          {t("Add Lesson")}
        </Button>
      </div>

      {/* Desktop view */}
      <div className="hidden md:block">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={trainingEvent}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
          locale={{
            emptyText: t("No lessons yet"),
          }}
        />
      </div>

      {/* Mobile view */}
      <div className="block md:hidden">
        {trainingEvent.length > 0 ? (
          trainingEvent.map(renderMobileCard)
        ) : (
          <div className="text-center py-8 text-gray-400">
            {t("No lessons yet")}
          </div>
        )}
      </div>

      <TrainingEventModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onAddLesson={handleAddLesson}
        mentors={mentors}
      />
    </div>
  );
}
