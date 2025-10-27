"use client";

import { Button, Select, Space, Typography } from "antd";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getRoleUser, isLeader } from "@/lib/utils";
import Link from "next/link";
import { getEvents } from "@/modules/services/eventService";

const { Title } = Typography;

interface PublishProps {
  onSubmit: () => void;
  setStatus: (val: string) => void;
  status: string;
  type?: string;
  eventId?: string;
  postId?: string;
  setEventId?: (id: string) => void;
}

export default function Publish({
  onSubmit,
  setStatus,
  status,
  type,
  eventId,
  postId,
  setEventId,
}: PublishProps) {
  const { t } = useTranslation("common");
  const [isPublishListVisible, setPublishListVisible] = useState(true);
  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    if (type === "post") {
      setLoadingEvents(true);
      getEvents({ status: "ACCEPTED" })
        .then((res) => {
          if (Array.isArray(res?._embedded?.eventWrapperDtoList)) {
            setEvents(
              res._embedded?.eventWrapperDtoList.map((e: any) => ({
                id: e.id,
                title: e.title || e.name || "Không có tiêu đề",
              }))
            );
          }
        })
        .catch((err) => console.error("Lỗi khi tải sự kiện:", err))
        .finally(() => setLoadingEvents(false));
    }
  }, [type]);

  const renderLinkButton = () => {
    if (type === "event") {
      return (
        <Space direction="horizontal" className="px-4 pb-2">
          <p>Bài truyền thông: </p>
          <Link
            href={`${
              postId
                ? "/posts/edit?id=" + postId
                : "/posts/create?eventId=" + eventId
            }`}
            target="_blank"
          >
            <Button className="!h-[28px]" type="default">
              {postId ? "Sửa bài" : "Tạo bài"}
            </Button>
          </Link>
        </Space>
      );
    }

    if (type === "post") {
      return (
        <Space direction="horizontal" className="px-4 pb-2">
          <p>Sự kiện: </p>
          <Select<string>
            showSearch
            placeholder="Chọn sự kiện"
            className="!max-w-[200px]"
            loading={loadingEvents}
            value={eventId || undefined}
            onChange={(value) => setEventId?.(value)}
            optionFilterProp="label"
            filterOption={(input, option) =>
              (option?.label as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
            options={events.map((event) => ({
              label: event.title,
              value: event.id,
            }))}
          />
        </Space>
      );
    }

    return null;
  };

  return (
    <div
      className={`publish border-gray-300 border rounded-[10px] mb-5 bg-white ${
        isMobile ? "fixed top-13 right-0 left-0 z-50 shadow-lg" : "relative"
      }`}
    >
      <div className="flex justify-between items-center px-4 py-1 md:py-3 border-b border-gray-300">
        <Title level={isMobile ? 5 : 4} className="!m-0">
          {t("Publish")}
        </Title>
        <Button
          onClick={() => setPublishListVisible(!isPublishListVisible)}
          className="flex items-center"
          icon={
            isPublishListVisible ? <CaretDownOutlined /> : <CaretUpOutlined />
          }
          type="text"
        />
      </div>

      {isPublishListVisible && (
        <div>
          <Space direction="horizontal" className="px-4 py-2 md:py-4">
            <p>{t("Status: ")}</p>
            <Select
              onChange={(value) => setStatus(value)}
              defaultValue={status}
              className="w-[120px] !h-[28px]"
            >
              {getRoleUser() === "ADMIN" || getRoleUser() === "LEADER" ? (
                <Select.Option value="PENDING">{t("Publish")}</Select.Option>
              ) : (
                <Select.Option value="PENDING">{t("Submit")}</Select.Option>
              )}
              <Select.Option value="ARCHIVED">{t("Draft")}</Select.Option>
            </Select>
          </Space>
          {renderLinkButton()}

          <div className="flex justify-end border-t bg-[#f6f7f7] border-gray-300 rounded-b-[10px]">
            <div className="px-4 py-3">
              <Button type="primary" onClick={onSubmit}>
                {status.match("ARCHIVED")
                  ? t("Save Draft")
                  : isLeader()
                  ? t("Publish")
                  : t("Submit to leader")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
