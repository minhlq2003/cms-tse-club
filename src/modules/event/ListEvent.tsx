"use client";

import { useEffect, useState } from "react";
import { Button, Modal, Table, Tag, message } from "antd";
import { useRouter } from "next/navigation";
import { Event } from "@/constant/types";
import {
  getEvents,
  deleteEvent,
  updateStatusEventByLeader,
  getEventByLeader,
} from "@/modules/services/eventService";
import { useTranslation } from "react-i18next";
import { getUser, isLeader } from "@/lib/utils";
import { max } from "lodash";
import { title } from "node:process";

interface ListEventProps {
  filters?: {
    search?: string;
    eventType?: string;
    startTime?: string;
    endTime?: string;
    isDone?: boolean;
    status?: string;
  };
}

export default function ListEvent({ filters }: ListEventProps) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openApproveModal, setOpenApproveModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);

  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let res;
      if (!isLeader()) {
        res = await getEvents({
          page: page - 1,
          size: 10,
          ...filters,
        });
      } else {
        res = await getEventByLeader({
          page: page - 1,
          size: 10,
          ...filters,
        });
      }

      if (Array.isArray(res._embedded?.eventWrapperDtoList)) {
        setEvents(res._embedded.eventWrapperDtoList);
        setTotal(res.page.totalElements);
      }
    } catch {
      message.error(t("Failed to fetch events"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [JSON.stringify(filters), page]);

  const handleDelete = async (id: string) => {
    try {
      await deleteEvent(id);
      message.success(t("Event deleted successfully"));
      fetchEvents();
    } catch {
      message.error(t("Failed to delete event"));
    } finally {
      setOpenDeleteModal(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await updateStatusEventByLeader(id, "ACCEPTED");
      message.success(t("Event approved successfully"));
      fetchEvents();
    } catch {
      message.error(t("Failed to approve event"));
    } finally {
      setOpenApproveModal(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateStatusEventByLeader(id, "REJECTED");
      message.success(t("Event rejected successfully"));
      fetchEvents();
    } catch {
      message.error(t("Failed to reject event"));
    } finally {
      setOpenRejectModal(false);
    }
  };

  const columns = [
    {
      title: t("Sự kiện"),
      dataIndex: "title",
      key: "title",
      width: "25%",
      render: (text: string, record: Event) => (
        <div>
          <span className="font-semibold break-before-all max-w-[300px]">
            {text}
          </span>
          <div className="mt-2 flex gap-10">
            <p>{record.category}</p>
            <p>
              Số lượng đăng ký: {record.currentRegistered}/
              {record.limitRegister}
            </p>
          </div>
        </div>
      ),
    },
    // {
    //   title: t("Category"),
    //   dataIndex: "category",
    //   key: "category",
    // },
    // {
    //   title: t("Location"),
    //   dataIndex: ["location", "destination"],
    //   key: "destination",
    //   width: "20%",
    //   render: (text: string) => (
    //     <span className="break-after-all !max-w-[300px]">{text}</span>
    //   ),
    // },
    // {
    //   title: t("Attendees"),
    //   dataIndex: "currentRegistered",
    //   key: "currentRegistered",
    //   render: (count: number, record: Event) => (
    //     <span>
    //       {count} / {record.limitRegister}
    //     </span>
    //   ),
    // },
    {
      title: t("Thời gian và địa điểm"),
      dataIndex: ["location", "startTime"],
      key: "startTime",
      render: (date: string | undefined, record: Event) => (
        <div>
          <p>
            {date ? new Date(date).toLocaleString() : ""} -{" "}
            {record.location.endTime
              ? new Date(record.location.endTime).toLocaleString()
              : ""}
          </p>
          <p>{record.location.destination}</p>
        </div>
      ),
    },
    {
      title: t("Host"),
      dataIndex: ["host", "fullName"],
      key: "fullName",
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: t("Status"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          ACCEPTED: "green",
          PENDING: "orange",
          REJECTED: "red",
          DISABLED: "gray",
        };
        return <Tag color={colorMap[status] || "default"}>{t(status)}</Tag>;
      },
    },
    {
      title: t("Action"),
      key: "action",
      render: (_: any, record: Event) => (
        <div className="flex flex-wrap gap-2">
          <Button
            danger
            onClick={() => {
              setSelectedEvent(record);
              setOpenDeleteModal(true);
            }}
          >
            {t("Delete")}
          </Button>

          <Button
            type="primary"
            onClick={() => router.push(`/events/edit?id=${record.id}`)}
          >
            {t("Edit")}
          </Button>
          <Button onClick={() => router.push(`/events/view?id=${record.id}`)}>
            Xem
          </Button>

          {isLeader() && record.status === "PENDING" && (
            <>
              <Button
                onClick={() => {
                  setSelectedEvent(record);
                  setOpenApproveModal(true);
                }}
              >
                {t("Approve")}
              </Button>
              <Button
                onClick={() => {
                  setSelectedEvent(record);
                  setOpenRejectModal(true);
                }}
              >
                {t("Reject")}
              </Button>
            </>
          )}
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
        pagination={{
          pageSize: 10,
          current: page,
          onChange: setPage,
          total: total,
          showSizeChanger: false,
        }}
        scroll={{ x: 1500 }}
      />

      <Modal
        title={t("Confirm Delete")}
        open={openDeleteModal}
        onCancel={() => setOpenDeleteModal(false)}
        onOk={() => selectedEvent && handleDelete(String(selectedEvent.id))}
        okButtonProps={{ danger: true }}
        okText={t("Delete")}
        cancelText={t("Cancel")}
      >
        <p>{t("Are you sure you want to delete this event?")}</p>
      </Modal>

      <Modal
        title={t("Confirm Approve")}
        open={openApproveModal}
        onCancel={() => setOpenApproveModal(false)}
        onOk={() => selectedEvent && handleApprove(String(selectedEvent.id))}
        okText={t("Approve")}
        cancelText={t("Cancel")}
      >
        <p>{t("Are you sure you want to approve this event?")}</p>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title={t("Confirm Reject")}
        open={openRejectModal}
        onCancel={() => setOpenRejectModal(false)}
        onOk={() => selectedEvent && handleReject(String(selectedEvent.id))}
        okText={t("Reject")}
        cancelText={t("Cancel")}
      >
        <p>{t("Are you sure you want to reject this event?")}</p>
      </Modal>
    </div>
  );
}
