"use client";

import { Member } from "@/constant/types";
import {
  CaretDownOutlined,
  CaretUpOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Button, Modal, Table, Typography, message, Tag, Checkbox } from "antd";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getEventAttendees, manualCheckIn } from "../services/eventService";

const { Title } = Typography;

export interface Attendee {
  user: Member;
  status: string;
  checkIn?: boolean;
}

interface EventAttendeesProps {
  eventId?: string;
}

const EventAttendees: React.FC<EventAttendeesProps> = ({ eventId }) => {
  const { t } = useTranslation("common");
  const [isListVisible, setListVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAttendees();
  }, []);

  const fetchAttendees = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await getEventAttendees(eventId);
      if (Array.isArray(res._embedded?.attendeeDtoList)) {
        setAttendees(
          res._embedded.attendeeDtoList.map((a: Attendee) => ({
            ...a,
            checkIn: a.checkIn || false,
          }))
        );
      } else {
        setAttendees([]);
      }
    } catch (err) {
      message.error(t("Failed to fetch attendees"));
    } finally {
      setLoading(false);
    }
  };

  const toggleCheckIn = (userId: string) => {
    setAttendees((prev) =>
      prev.map((a) =>
        a.user.id === userId ? { ...a, checkIn: !a.checkIn } : a
      )
    );
  };

  const handleCheckInAll = () => {
    setAttendees((prev) => prev.map((a) => ({ ...a, checkIn: true })));
  };

  const handleCancelAll = () => {
    setAttendees((prev) => prev.map((a) => ({ ...a, checkIn: false })));
  };

  const handleSave = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const checkedIds = attendees
        .filter((a) => a.checkIn)
        .map((a) => a.user.id);

      const res = await manualCheckIn(eventId, checkedIds);

      if (res.ok) {
        message.success(t("Check-in data saved successfully!"));
        setIsModalOpen(false);
        fetchAttendees();
      } else {
        message.error(`${t("Failed to save check-in")} (status ${res.status})`);
      }
    } catch (err) {
      message.error(t("Error occurred while saving check-in data"));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    fetchAttendees();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // ====================
  // Columns for desktop
  // ====================
  const attendeeColumns = [
    {
      title: t("Full Name"),
      key: "fullName",
      render: (_: any, record: Attendee) => (
        <span className="font-semibold">{record.user.fullName}</span>
      ),
    },
    {
      title: t("Username"),
      key: "username",
      render: (_: any, record: Attendee) => record.user.username,
    },
    {
      title: t("Email"),
      key: "email",
      render: (_: any, record: Attendee) => record.user.email,
    },
    {
      title: t("Status"),
      key: "status",
      render: (_: any, record: Attendee) => {
        const status = record.status?.toUpperCase?.() || "UNKNOWN";
        let color = "default";

        switch (status) {
          case "CHECKED":
            color = "green";
            break;
          case "REGISTERED":
            color = "blue";
            break;
          case "MISSED":
            color = "red";
            break;
          default:
            color = "gray";
        }

        return <Tag color={color}>{t(status)}</Tag>;
      },
    },
    {
      title: t("Check in"),
      key: "checkin",
      render: (_: any, record: Attendee) => (
        <Checkbox
          checked={record.checkIn}
          onChange={() => toggleCheckIn(record.user.id)}
        />
      ),
    },
  ];

  // ====================
  // Columns for mobile
  // ====================
  const shortColumns = [
    {
      key: "fullName",
      render: (_: any, record: Attendee) => (
        <span className="font-semibold">{record.user.fullName}</span>
      ),
    },
    {
      key: "status",
      render: (_: any, record: Attendee) => {
        const status = record.status?.toUpperCase?.() || "UNKNOWN";
        const color =
          status === "CHECKED"
            ? "text-green-600"
            : status === "REGISTERED"
            ? "text-blue-600"
            : status === "MISSED"
            ? "text-red-600"
            : "text-gray-500";

        return <span className={color}>{t(status)}</span>;
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

      {/* Main content */}
      {isListVisible && (
        <div>
          <div className="block md:hidden">
            {/* Mobile Table */}
            <Table
              rowKey={(record) => record.user.id}
              columns={shortColumns}
              dataSource={attendees}
              loading={loading}
              showHeader={false}
              pagination={false}
              size="small"
            />
          </div>

          <div className="hidden md:block">
            {/* Desktop Table */}
            <Table
              className="p-2"
              rowKey={(record) => record.user.id}
              columns={shortColumns}
              dataSource={attendees}
              loading={loading}
              showHeader={false}
              pagination={false}
            />
          </div>

          <div className="flex justify-end border-t bg-[#f6f7f7] border-gray-300 rounded-b-[10px] p-4">
            <Button
              onClick={handleOpenModal}
              className="flex items-center"
              icon={<EyeOutlined />}
              type="primary"
            >
              {t("View Full List")}
            </Button>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        title={
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <p className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-0">
              {t("Attendee List")}
            </p>
            <div className="flex gap-2 sm:gap-4">
              <Button onClick={handleCheckInAll}>{t("Check in All")}</Button>
              <Button onClick={handleCancelAll} danger>
                {t("Cancel All")}
              </Button>
            </div>
          </div>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={
          <div className="flex justify-end">
            <Button type="primary" onClick={handleSave}>
              {t("Save")}
            </Button>
          </div>
        }
        width="90%"
        className="!max-w-[1100px]"
        bodyStyle={{ overflowX: "auto" }}
      >
        <Table
          rowKey={(record) => record.user.id}
          columns={attendeeColumns}
          dataSource={attendees}
          loading={loading}
          pagination={{ pageSize: 8 }}
          size="middle"
        />
      </Modal>
    </div>
  );
};

export default EventAttendees;
