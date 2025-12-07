"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { Button, Modal, Table, Tag, Tooltip, message } from "antd";
import { useRouter } from "next/navigation";
import { Event, GlobalConfigurationDto, ListEventProps } from "@/constant/types";
import {
  getEvents,
  deleteEvent,
  updateStatusEventByLeader,
  getEventByLeader,
  moveEventToTrash,
  triggerEventDone,
} from "@/modules/services/eventService";
import { useTranslation } from "react-i18next";
import { formatDate, getUser, isLeader, isLeaderOrHigher } from "@/lib/utils";
import { Check, Edit, Eye, Trash2, View, X, CheckCircle, Redo } from "lucide-react";
import dayjs from "dayjs";
import { toast } from "sonner";
import { getLastResetPointTime } from "../services/commonService";

export default function ListEvent({ filters }: ListEventProps) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [lastResetPointTime, setLastResetPointTime] = useState<GlobalConfigurationDto | null>(null);

  const [openMoveToTrashModal, setOpenMoveToTrashModal] = useState(false);
  const [openApproveModal, setOpenApproveModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [openDoneModal, setOpenDoneModal] = useState(false);
  const [openRevertDoneModal, setOpenRevertDoneModal] = useState(false);

  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  
  const fetchEvents = async () => {
    let res;
    try {
      setLoading(true);
      if (!isLeader()) {
        res = await getEvents({
          page: page - 1,
          size: 10,
          ...filters,
          searchs: ["deleted"],
          searchValues: ["false"],
        });
      } else {
        res = await getEventByLeader({
          page: page - 1,
          size: 10,
          ...filters,
          searchs: ["deleted"],
          searchValues: ["false"],
        });
      }

      if (Array.isArray(res._embedded?.eventWrapperDtoList)) {
        setEvents(res._embedded.eventWrapperDtoList);
        setTotal(res.page.totalElements);
      } else {
        setEvents([]);
        setTotal(0);
      }
    } catch {
      toast.error(t("Failed to fetch events"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [JSON.stringify(filters), page]);

  useLayoutEffect(() => {
    // Fetch last reset point time
    const fetchLastResetPointTime = async () => {
      try {
        const res = await getLastResetPointTime();
        setLastResetPointTime(res);
      }
      catch {
        console.error("Failed to fetch last reset point time");
      }
    };

    fetchLastResetPointTime();
  }, []);

  const handleMoveToTrash = async (id: string) => {
    try {
      const response = await moveEventToTrash(id);
      console.log(response);

      if (response === null) {
        toast.error(t("Bạn không có quyền xóa sự kiện này"));
      } else {
        toast.success(t("Xóa sự kiện thành công"));
      }
      fetchEvents();
    } catch {
      toast.error(t("Xóa sự kiện không thành công"));
    } finally {
      setOpenMoveToTrashModal(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await updateStatusEventByLeader(id, "ACCEPTED");
      toast.success(t("Event approved successfully"));
      fetchEvents();
    } catch {
      toast.error(t("Failed to approve event"));
    } finally {
      setOpenApproveModal(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateStatusEventByLeader(id, "REJECTED");
      toast.success(t("Event rejected successfully"));
      fetchEvents();
    } catch {
      toast.error(t("Failed to reject event"));
    } finally {
      setOpenRejectModal(false);
    }
  };

  const handleTriggerDone = async (id: string) => {
    try {
      const response = await triggerEventDone(id);
      toast.success(t("Event marked as done successfully"));
      fetchEvents();
    } catch {
      toast.error(t("Failed to mark event as done"));
    } finally {
      setOpenDoneModal(false);
    }
  };

  const handleRevertDone = async (id: string) => {
    let response
    try {
      response = await triggerEventDone(id);
      if (response?.status === 400) {
        throw new Error("Bad Request");
      }
      toast.success(t("Event reverted successfully"));
      fetchEvents();
    } catch (e) {
      
      toast.error(response?.response?.data.detail || t("Failed to revert event"));
    } finally {
      setOpenRevertDoneModal(false);
    }
  };

  const ableToRevertDone = (event: Event) => {
    if (!lastResetPointTime) return false;
    
    const resetTime = dayjs(lastResetPointTime.configValue);
    const eventDoneTime = dayjs(event.lastModifiedTime || "");
    return eventDoneTime.isAfter(resetTime) && isLeader() &&
            event.status === "ACCEPTED" &&
            event.done;
  }

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
    {
      title: t("Thời gian và địa điểm"),
      dataIndex: ["location", "startTime"],
      key: "startTime",
      width: "30%",
      render: (date: string | undefined, record: Event) => (
        <div>
          <p>
            {formatDate(date || "").formattedTime}{" "}
            {formatDate(date || "").formattedDate} -{" "}
            {formatDate(record.location.endTime).formattedTime}{" "}
            {formatDate(record.location.endTime).formattedDate}
          </p>
          <p>{record.location.destination}</p>
        </div>
      ),
    },
    {
      title: t("Host"),
      dataIndex: ["host", "fullName"],
      key: "fullName",
      render: (text: string, record: Event) => (
        <div>
          <span className="font-semibold">{text}</span>
          <p>
            {formatDate(record.createdAt || "").formattedTime}{" "}
            {formatDate(record.createdAt || "").formattedDate}{" "}
          </p>
        </div>
      ),
    },
    {
      title: t("Lần chỉnh sửa gần nhất"),
      dataIndex: "lastModifiedTime",
      key: "lastModifiedTime",
      render: (date: string) => (
        <span>
          {formatDate(date).formattedTime} {formatDate(date).formattedDate}
        </span>
      ),
    },
    {
      title: t("Status"),
      dataIndex: "status",
      key: "status",
      render: (status: string, record: Event) => {
        // Check if event is done
        if (record.done) {
          return <Tag color="purple">{t("DONE")}</Tag>;
        }

        const colorMap: Record<string, string> = {
          ACCEPTED: "green",
          PENDING: "orange",
          REJECTED: "red",
          DISABLED: "gray",
          ARCHIVED: "blue",
        };
        return <Tag color={colorMap[status] || "default"}>{t(status)}</Tag>;
      },
    },
    {
      title: t("Action"),
      key: "action",
      render: (_: any, record: Event) => (
        
        <div className="flex flex-wrap gap-2">
        {
          (isLeaderOrHigher() || record.host?.id === getUser()?.id) &&
          
          <Tooltip title={t("Move to Trash")}>
            <Button
              danger
              icon={<Trash2 size={22} />}
              onClick={() => {
                setSelectedEvent(record);
                setOpenMoveToTrashModal(true);
              }}
            ></Button>
          </Tooltip>
        }
          {/* Hide Edit button if event is done */}
          {!record.done && (
            <Tooltip title={t("Edit")}>
              <Button
                type="primary"
                icon={<Edit size={22} />}
                onClick={() => router.push(`/events/edit?id=${record.id}`)}
              ></Button>
            </Tooltip>
          )}

          <Tooltip title={t("View")}>
            <Button
              icon={<Eye size={22} />}
              onClick={() => router.push(`/events/view?id=${record.id}`)}
            ></Button>
          </Tooltip>

          {/* Trigger Done button - only for leaders and if not done yet */}
          {isLeader() &&
            record.status === "ACCEPTED" &&
            !record.done &&
            dayjs(record.location.startTime).isBefore(Date.now()) && (
              <Tooltip title={t("Mark as Done")}>
                <Button
                  className="!text-purple-600 !border-purple-600 !bg-purple-50 hover:!bg-purple-100"
                  icon={<CheckCircle size={22} />}
                  onClick={() => {
                    setSelectedEvent(record);
                    setOpenDoneModal(true);
                  }}
                ></Button>
              </Tooltip>
            )}

            {
              ableToRevertDone(record) &&
            
            dayjs(record.location.startTime).isBefore(Date.now()) && (
              <Tooltip title={t("Revert done attempt")}>
                <Button
                  className="!text-yellow-600 !border-yellow-600 !bg-yellow-50 hover:!bg-yellow-100"
                  icon={<Redo size={22} />}
                  onClick={() => {
                    setSelectedEvent(record);
                    setOpenRevertDoneModal(true);
                  }}
                ></Button>
              </Tooltip>
            )}

          {isLeader() && record.status === "PENDING" && (
            <>
              <Tooltip title={t("Approve")}>
                <Button
                  className="!text-green-600 !border-green-600 !bg-green-50 hover:!bg-green-100"
                  icon={<Check size={22} />}
                  onClick={() => {
                    setSelectedEvent(record);
                    setOpenApproveModal(true);
                  }}
                ></Button>
              </Tooltip>
              <Tooltip title={t("Reject")}>
                <Button
                  className="!text-red-600 !border-red-600 !bg-red-50 hover:!bg-red-100"
                  icon={<X size={22} />}
                  onClick={() => {
                    setSelectedEvent(record);
                    setOpenRejectModal(true);
                  }}
                ></Button>
              </Tooltip>
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
        title={t("Confirm Move to Trash")}
        open={openMoveToTrashModal}
        onCancel={() => setOpenMoveToTrashModal(false)}
        onOk={() =>
          selectedEvent && handleMoveToTrash(String(selectedEvent.id))
        }
        okButtonProps={{ danger: true }}
        okText={t("Move to Trash")}
        cancelText={t("Cancel")}
      >
        <p>{t("Are you sure you want to move this event to trash?")}</p>
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

      <Modal
        title={t("Confirm Mark as Done")}
        open={openDoneModal}
        onCancel={() => setOpenDoneModal(false)}
        onOk={() =>
          selectedEvent && handleTriggerDone(String(selectedEvent.id))
        }
        okText={t("Mark as Done")}
        cancelText={t("Cancel")}
      >
        <p>
          {t(
            "Are you sure you want to mark this event as done? This action cannot be undone."
          )}
        </p>
      </Modal>
      <Modal
        title={t("Revert done attempt")}
        open={openRevertDoneModal}
        onCancel={() => setOpenRevertDoneModal(false)}
        onOk={() =>
          selectedEvent && handleRevertDone(String(selectedEvent.id))
        }
        okText={t("Revert done attempt")}
        cancelText={t("Cancel")}
      >
        <p>
          {t(
            "Are you sure you want to revert the done status of this event? This action may not be accepted."
          )}
        </p>
      </Modal>
    </div>
  );
}
