"use client";

import {
  Button,
  DatePicker,
  Input,
  Select,
  Table,
  Tag,
  Modal,
  message,
  Tooltip,
} from "antd";
import { Search, RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { Event, EventSearchRequestDto, FunctionStatus } from "@/constant/types";
import {
  getEvents,
  deleteEvent,
  updateStatusEventByLeader,
  getEventByLeader,
  recoverEventFromTrash,
} from "@/modules/services/eventService";
import { getRoleUser, isLeader } from "@/lib/utils";
import { toast } from "sonner";

const { RangePicker } = DatePicker;

export default function TrashEventPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [openRestoreModal, setOpenRestoreModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);


  const [filters, setFilters] = useState<EventSearchRequestDto & {
    status?: FunctionStatus;
    isHost?: boolean;
  }>();

  const fetchDeletedEvents = async () => {
    try {
      setLoading(true);
      let res;
      if (!isLeader()) {
        res = await getEvents({
          page: page - 1,
          size: 10,
          searchs: ["deleted"],
          searchValues: ["true"],
          ...filters,
        });
      } else {
        res = await getEventByLeader({
          page: page - 1,
          size: 10,
          ...filters,
          searchs: ["deleted"],
          searchValues: ["true"],
        });
      }
      if (res._embedded === undefined) {
        setEvents([]);
        setTotal(0);
        return;
      }
      else if (Array.isArray(res._embedded?.eventWrapperDtoList)) {
        setEvents(res._embedded.eventWrapperDtoList);
        setTotal(res.page.totalElements);
      } else {
        setEvents([]);
        setTotal(0);
      }
    } catch {
      toast.error(t("Failed to fetch deleted events"));
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDateChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setFilters({
        ...filters,
        startTime: dayjs(dates[0]).toISOString(),
        endTime: dayjs(dates[1]).toISOString(),
      });
    } else {
      setFilters({ ...filters, startTime: undefined, endTime: undefined });
    }
  };

  const handleSortChange = (value: string) => {
    setFilters({ ...filters, sort: value });
  };

  const handleRestore = async (id: string) => {
    try {
      await recoverEventFromTrash(id);
      toast.success(t("Event restored successfully"));
      fetchDeletedEvents();
    } catch {
      toast.error(t("Failed to restore event"));
    } finally {
      setOpenRestoreModal(false);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      await deleteEvent(id);
      toast.success(t("Event permanently deleted"));
      fetchDeletedEvents();
    } catch {
      toast.error(t("Failed to delete event permanently"));
    } finally {
      setOpenDeleteModal(false);
    }
  };

  const handleEmptyTrash = () => {
    Modal.confirm({
      title: t("Empty Trash"),
      content: t(
        "Are you sure you want to permanently delete all events in trash? This action cannot be undone."
      ),
      okText: t("Delete All"),
      cancelText: t("Cancel"),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          // Delete all events in trash
          for (const event of events) {
            await deleteEvent(String(event.id));
          }
          toast.success(t("All events permanently deleted"));
          fetchDeletedEvents();
        } catch {
          toast.error(t("Failed to empty trash"));
        }
      },
    });
  };

  useEffect(() => {
    fetchDeletedEvents();
  }, [JSON.stringify(filters), page]);

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
      title: t("Remaining Days"),
      dataIndex: "lastModifiedTime",
      key: "lastModifiedTime",
      render: (date: string) => {
        const remainingDays = 30 - Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
        return (
        <span>{remainingDays > 0 ? remainingDays : ""} {t("days")}</span>
      )},
    },
    getRoleUser() === "LEADER" || getRoleUser() === "ADMIN"
      ? {
          title: t("Action"),
          key: "action",
          render: (_: any, record: Event) => (
            <div className="flex flex-wrap gap-2">
              <Tooltip title={t("Khôi phục")}>
                <Button
                  type="primary"
                  icon={<RotateCcw size={16} />}
                  onClick={() => {
                    setSelectedEvent(record);
                    setOpenRestoreModal(true);
                  }}
                />
              </Tooltip>

              <Tooltip title={t("Xóa vĩnh viễn")}>
                <Button
                  danger
                  icon={<Trash2 size={16} />}
                  onClick={() => {
                    setSelectedEvent(record);
                    setOpenDeleteModal(true);
                  }}
                />
              </Tooltip>
            </div>
          ),
        }
      : {},
  ];

  return (
    <div className="min-h-[85vh] bg-white flex flex-col items-center justify-start rounded-lg shadow-sm gap-4 px-4 pt-10">
      <div className="flex flex-col md:flex-row justify-between w-full items-center gap-4">
        <h1 className="ml-[10px] text-2xl md:text-3xl font-bold text-center md:text-left">
          {t("Trash")}
        </h1>

        <div className="flex flex-wrap justify-center md:justify-end gap-2 w-full md:w-auto">
          <Button className="h-[36px]" onClick={() => router.push("/events")}>
            {t("Back to Events")}
          </Button>

          {(getRoleUser() === "LEADER" || getRoleUser() === "ADMIN") && (
            <Button
              className="h-[36px]"
              danger
              icon={<Trash2 size={16} />}
              onClick={handleEmptyTrash}
              disabled={events.length === 0}
            >
              {t("Empty Trash")}
            </Button>
          )}
        </div>
      </div>

      <div className="flex w-full justify-between align-middle ml-4 py-3 border-[0.5px] border-[#a5a1a18e] rounded-lg px-4">
        <div className="flex gap-2 flex-wrap">
          <Select
            placeholder={t("Category")}
            style={{ width: 150 }}
            allowClear
            onChange={(val) => setFilters({ ...filters, eventType: val })}
            options={[
              { label: t("Seminar"), value: "SEMINAR" },
              { label: t("Contest"), value: "CONTEST" },
              { label: t("Training"), value: "TRAINING_EVENT" },
            ]}
          />

          <RangePicker onChange={handleDateChange} />

          <div className="flex items-center gap-1">
            <Input
              type="text"
              placeholder={t("Title...")}
              value={searchTerm}
              onChange={handleSearchChange}
              onPressEnter={() =>
                setFilters({ ...filters, keyword: searchTerm })
              }
              className="px-2 rounded-md border border-gray-300 !w-[150px] md:!w-[200px] lg:!w-[250px]"
            />
            <Button
              className="h-[36px]"
              onClick={() => setFilters({ ...filters, keyword: searchTerm })}
            >
              <Search className="text-gray-600" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <p className="!mb-0">{t("Sort by: ")}</p>
          <Select
            placeholder={t("Select sort")}
            style={{ width: 200 }}
            allowClear
            onChange={handleSortChange}
            options={[
              { label: t("Title (A-Z)"), value: "title,asc" },
              { label: t("Title (Z-A)"), value: "title,desc" },
              { label: t("Deleted Date (Oldest)"), value: "lastModifiedTime,asc" },
              { label: t("Deleted Date (Newest)"), value: "lastModifiedTime,desc" },
              { label: t("Start Time (Oldest)"), value: "location.startTime,asc" },
              { label: t("Start Time (Newest)"), value: "location.startTime,desc" },
            ]}
          />
        </div>
      </div>

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
      </div>

      <Modal
        title={t("Confirm Restore")}
        open={openRestoreModal}
        onCancel={() => setOpenRestoreModal(false)}
        onOk={() => selectedEvent && handleRestore(String(selectedEvent.id))}
        okText={t("Restore")}
        cancelText={t("Cancel")}
      >
        <p>{t("Are you sure you want to restore this event?")}</p>
      </Modal>

      <Modal
        title={t("Confirm Permanent Delete")}
        open={openDeleteModal}
        onCancel={() => setOpenDeleteModal(false)}
        onOk={() =>
          selectedEvent && handlePermanentDelete(String(selectedEvent.id))
        }
        okButtonProps={{ danger: true }}
        okText={t("Delete Permanently")}
        cancelText={t("Cancel")}
      >
        <p>
          {t(
            "Are you sure you want to permanently delete this event? This action cannot be undone."
          )}
        </p>
      </Modal>
    </div>
  );
}
