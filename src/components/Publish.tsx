"use client";

import { Button, Select, Space, Typography } from "antd";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getRoleUser, isLeader, getUser } from "@/lib/utils";
import Link from "next/link";
import { getEvents } from "@/modules/services/eventService";
import { searchMyTrainings } from "@/modules/services/trainingService";
import { FunctionStatus } from "@/constant/types";

const { Title } = Typography;

interface PublishProps {
  onSubmit: () => void;
  setStatus: (val: FunctionStatus) => void;
  status: FunctionStatus;
  type?: string;
  eventId?: string;
  postId?: string;
  setEventId?: (id: string) => void;
  disabled?: boolean;
  // 🆕 Props cho event permission check
  isHost?: boolean;
  userAsOrganizer?: { roles: string[] };
}

export default function Publish({
  onSubmit,
  setStatus,
  status,
  type,
  eventId,
  postId,
  setEventId,
  disabled = false,
  isHost = false,
  userAsOrganizer,
}: PublishProps) {
  const { t } = useTranslation("common");
  const [isPublishListVisible, setPublishListVisible] = useState(true);
  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // 🆕 Kiểm tra quyền chỉnh sửa bài truyền thông
  const canEditPost = () => {
    if (type !== "event") return true;

    const userRole = getRoleUser();

    // Host, Leader, Admin luôn có quyền
    if (isHost || userRole === "LEADER" || userRole === "ADMIN") {
      return true;
    }

    // Kiểm tra role POST của organizer
    const roles = userAsOrganizer?.roles || [];
    return roles.includes("POST");
  };

  const showPostLink = canEditPost();

  useEffect(() => {
    if (type === "post") {
      async function fetchData() {
        setLoadingEvents(true);

        try {
          const [eventRes, trainingRes] = await Promise.all([
            getEvents({ status: FunctionStatus.ACCEPTED, isDone: false }),
            searchMyTrainings({ status: FunctionStatus.ACCEPTED, isDone: false }),
          ]);

          let newEvents: any[] = [];

          if (Array.isArray(eventRes?._embedded?.eventWrapperDtoList)) {
            newEvents = eventRes._embedded.eventWrapperDtoList.map(
              (e: any) => ({
                id: e.id,
                title: e.title || e.name || "Không có tiêu đề",
              })
            );
          }

          if (Array.isArray(trainingRes)) {
            const trainingEvents = trainingRes.map((e: any) => ({
              id: e.id,
              title: e.title || e.name || "Không có tiêu đề",
            }));

            newEvents = [...newEvents, ...trainingEvents];
          }

          setEvents(newEvents);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingEvents(false);
        }
      }

      fetchData();
    }
  }, [type]);

  const renderLinkButton = () => {
    if (type === "event") {
      // 🆕 Chỉ hiển thị nếu có quyền
      if (!showPostLink) {
        return (
          <Space direction="horizontal" className="px-4 pb-2">
            <p className="text-gray-400">{t("Bài truyền thông")}: </p>
            <span className="text-sm text-gray-500">
              {t("Bạn không có quyền chỉnh sửa")}
            </span>
          </Space>
        );
      }

      return (
        <Space direction="horizontal" className="px-4 pb-2">
          <p>{t("Bài truyền thông")}: </p>
          <Link
            href={`${
              postId
                ? "/posts/edit?id=" + postId
                : "/posts/create?eventId=" + eventId
            }`}
            target="_blank"
          >
            <Button className="!h-[28px]" type="default">
              {postId ? t("Sửa bài") : t("Tạo bài")}
            </Button>
          </Link>
        </Space>
      );
    }

    if (type === "post") {
      return (
        <Space direction="horizontal" className="px-4 pb-2">
          <p>{t("Sự kiện")}: </p>
          <Select<string>
            showSearch
            placeholder={t("Chọn sự kiện")}
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
            disabled={disabled}
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
              onChange={(value ) => {
                setStatus(value as FunctionStatus);
              }}
              defaultValue={status}
              className="w-[120px] !h-[28px]"
              disabled={disabled}
            >
              {getRoleUser() === "ADMIN" || getRoleUser() === "LEADER" ? (
                <Select.Option value={FunctionStatus.PENDING}>{t("Publish")}</Select.Option>
              ) : (
                <Select.Option value={FunctionStatus.PENDING}>{t("Submit")}</Select.Option>
              )}
              <Select.Option value={FunctionStatus.ARCHIVED}>{t("Draft")}</Select.Option>
            </Select>
          </Space>
          {renderLinkButton()}

          <div className="flex justify-end border-t bg-[#f6f7f7] border-gray-300 rounded-b-[10px]">
            <div className="px-4 py-3">
              <Button type="primary" onClick={onSubmit} disabled={disabled}>
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
