// Attendee.tsx (hoặc EventAttendee.tsx)
"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Table,
  Typography,
  message,
  Tag,
  Checkbox,
  Alert,
  Input,
  Select,
} from "antd";
import {
  CaretDownOutlined,
  CaretUpOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { getEventAttendees, manualCheckIn } from "../services/eventService";
import { Member } from "@/constant/types";

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

export interface Attendee {
  id?: string;
  user: Member;
  status: string;
  checkIn?: boolean;
}

interface EventAttendeesProps {
  eventId?: string;
  startTime?: string;
  endTime?: string;
  userRole?: string;
}

const EventAttendees: React.FC<EventAttendeesProps> = ({
  eventId,
  startTime,
  endTime,
  userRole,
}) => {
  const { t } = useTranslation("common");
  const [isListVisible, setListVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters (ONLY inside modal)
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  // Time checks
  const now = new Date();
  const start = startTime ? new Date(startTime) : null;
  const end = endTime ? new Date(endTime) : null;
  const isDuringEvent = Boolean(start && end && now >= start && now <= end);

  // Permission: only HOST or CHECKER can check-in
  const canCheckIn =
    isDuringEvent && ["HOST", "CHECKER"].includes(userRole || "");

  useEffect(() => {
    // initial fetch (do not open modal)
    fetchAttendees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const fetchAttendees = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await getEventAttendees(eventId);
      // expecting structure: res._embedded.attendeeDtoList or array directly
      const list = Array.isArray(res._embedded?.attendeeDtoList)
        ? res._embedded.attendeeDtoList
        : Array.isArray(res)
        ? res
        : [];
      setAttendees(
        list.map((a: any) => ({
          id: a.id,
          user: a.user || a.attendee || a.userDto || {},
          status: a.status || a.attendeeStatus || "UNKNOWN",
          checkIn: a.checkIn || false,
        }))
      );
    } catch (err) {
      message.error(t("Failed to fetch attendees"));
    } finally {
      setLoading(false);
    }
  };

  const toggleCheckInLocal = (userId: string) => {
    setAttendees((prev) =>
      prev.map((a) =>
        a.user.id === userId ? { ...a, checkIn: !a.checkIn } : a
      )
    );
  };

  const handleCheckInAllLocal = () => {
    setAttendees((prev) => prev.map((a) => ({ ...a, checkIn: true })));
  };

  const handleCancelAllLocal = () => {
    setAttendees((prev) => prev.map((a) => ({ ...a, checkIn: false })));
  };

  const handleSave = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const checkedIds = attendees
        .filter((a) => a.checkIn)
        .map((a) => a.user.id);

      // manualCheckIn(eventId, checkedIds) expected to return an object with .ok / .status
      const res = await manualCheckIn(eventId, checkedIds);

      if (res?.ok || res?.status === 200 || res === true) {
        message.success(t("Check-in data saved successfully!"));
        setIsModalOpen(false);
        fetchAttendees();
      } else {
        // show available status if present
        message.error(
          `${t("Failed to save check-in")} ${
            res?.status ? `(status ${res.status})` : ""
          }`
        );
      }
    } catch (err) {
      message.error(t("Error occurred while saving check-in data"));
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    fetchAttendees();
  };

  const closeModal = () => setIsModalOpen(false);

  // Filtering only used inside modal/table
  const filteredAttendees = attendees.filter((a) => {
    const kw = keyword.trim().toLowerCase();
    const matchesKeyword =
      !kw ||
      (a.user?.fullName || "").toLowerCase().includes(kw) ||
      (a.user?.username || "").toLowerCase().includes(kw) ||
      (a.user?.email || "").toLowerCase().includes(kw);

    const matchesStatus = statusFilter ? a.status === statusFilter : true;

    return matchesKeyword && matchesStatus;
  });

  const attendeeColumns = [
    {
      title: t("Full Name"),
      key: "fullName",
      render: (_: any, record: Attendee) => (
        <span className="font-semibold">
          {record.user?.fullName || record.user?.username}
        </span>
      ),
    },
    {
      title: t("Username"),
      key: "username",
      render: (_: any, record: Attendee) => record.user?.username || "-",
    },
    {
      title: t("Email"),
      key: "email",
      render: (_: any, record: Attendee) => record.user?.email || "-",
    },
    {
      title: t("Status"),
      key: "status",
      render: (_: any, record: Attendee) => {
        const status = (record.status || "UNKNOWN").toUpperCase();
        let color = "default";
        if (status === "CHECKED") color = "green";
        else if (status === "REGISTERED") color = "blue";
        else if (status === "MISSED") color = "red";
        else color = "gray";
        return <Tag color={color}>{t(status)}</Tag>;
      },
    },
    {
      title: t("Check in"),
      key: "checkin",
      render: (_: any, record: Attendee) => (
        <Checkbox
          checked={Boolean(record.checkIn)}
          onChange={() => toggleCheckInLocal(record.user.id)}
          disabled={!canCheckIn}
        />
      ),
    },
  ];

  const shortColumns = [
    {
      key: "fullName",
      render: (_: any, record: Attendee) => (
        <span className="font-semibold">
          {record.user?.fullName || record.user?.username}
        </span>
      ),
    },
    {
      key: "status",
      render: (_: any, record: Attendee) => {
        const s = (record.status || "UNKNOWN").toUpperCase();
        const cls =
          s === "CHECKED"
            ? "text-green-600"
            : s === "REGISTERED"
            ? "text-blue-600"
            : s === "MISSED"
            ? "text-red-600"
            : "text-gray-500";
        return <span className={cls}>{t(s)}</span>;
      },
    },
  ];

  return (
    <div className="event-attendees border border-gray-300 rounded-[10px] mb-5">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300">
        <Title level={4} className="!m-0">
          {t("Attendees")}
        </Title>
        <Button
          onClick={() => setListVisible(!isListVisible)}
          className="flex items-center"
          icon={isListVisible ? <CaretDownOutlined /> : <CaretUpOutlined />}
          type="text"
        />
      </div>

      {/* Main content (no filters here) */}
      {isListVisible && (
        <div>
          <div className="block md:hidden">
            <Table
              rowKey={(record: Attendee) => record.user.id}
              columns={shortColumns}
              dataSource={attendees}
              loading={loading}
              showHeader={false}
              pagination={false}
              size="small"
            />
          </div>

          <div className="hidden md:block">
            <Table
              className="p-2"
              rowKey={(record: Attendee) => record.user.id}
              columns={shortColumns}
              dataSource={attendees}
              loading={loading}
              showHeader={false}
              pagination={false}
            />
          </div>

          <div className="flex justify-end border-t bg-[#f6f7f7] border-gray-300 rounded-b-[10px] p-4">
            <Button
              onClick={openModal}
              className="flex items-center"
              icon={<EyeOutlined />}
              type="primary"
            >
              {t("View Full List")}
            </Button>
          </div>
        </div>
      )}

      {/* Modal: filters + full table + actions */}
      <Modal
        title={
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <p className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-0">
              {t("Attendee List")}
            </p>
            <div className="flex gap-2 sm:gap-4">
              <Button onClick={handleCheckInAllLocal} disabled={!canCheckIn}>
                {t("Check in All")}
              </Button>
              <Button
                onClick={handleCancelAllLocal}
                danger
                disabled={!canCheckIn}
              >
                {t("Cancel All")}
              </Button>
            </div>
          </div>
        }
        open={isModalOpen}
        onCancel={closeModal}
        footer={
          <div className="flex flex-col items-end gap-2">
            {!canCheckIn && (
              <Alert
                type="warning"
                message={t(
                  "Chỉ được điểm danh trong thời gian diễn ra sự kiện"
                )}
                showIcon
              />
            )}
            <div className="flex gap-2">
              <Button onClick={closeModal}>{t("Close")}</Button>
              <Button
                type="primary"
                onClick={handleSave}
                disabled={!canCheckIn}
              >
                {t("Save")}
              </Button>
            </div>
          </div>
        }
        width="90%"
        className="!max-w-[1100px]"
        bodyStyle={{ overflowX: "auto" }}
      >
        {/* FILTERS: only inside modal */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Search
            placeholder={t("Search attendee")}
            allowClear
            onChange={(e) => setKeyword(e.target.value)}
            style={{ maxWidth: 320 }}
            enterButton
          />
          <Select
            placeholder={t("Filter by status")}
            allowClear
            style={{ width: 200 }}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
          >
            <Option value="REGISTERED">{t("REGISTERED")}</Option>
            <Option value="CHECKED">{t("CHECKED")}</Option>
            <Option value="MISSED">{t("MISSED")}</Option>
          </Select>
        </div>

        <Table
          rowKey={(record: Attendee) => record.user.id}
          columns={attendeeColumns}
          dataSource={filteredAttendees}
          loading={loading}
          pagination={{ pageSize: 8 }}
          size="middle"
        />
      </Modal>
    </div>
  );
};

export default EventAttendees;
