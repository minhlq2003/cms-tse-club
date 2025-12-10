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
import {
  searchMyTrainings,
  searchTrainingsByLeader,
  deleteTraining,
  recoverTrainingFromTrash,
} from "@/modules/services/trainingService";
import { getRoleUser, isLeader } from "@/lib/utils";
import { Member } from "@/constant/types";

const { RangePicker } = DatePicker;

interface Training {
  id: string;
  title: string;
  location?: {
    destination?: string;
    startTime?: string;
    endTime?: string;
  };
  status: string;
  creator?: Member;
  createdAt?: string;
  lastModifiedTime?: string;
  currentRegistered?: number;
  limitRegister?: number;
  category?: string;
}

export default function TrashTrainingPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(
    null
  );
  const [openRestoreModal, setOpenRestoreModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const [filters, setFilters] = useState({
    category: undefined as string | undefined,
    startTime: undefined as string | undefined,
    endTime: undefined as string | undefined,
    search: undefined as string | undefined,
    sort: undefined as string | undefined,
    searchs: "deleted",
    searchValues: "true",
  });

  const fetchDeletedTrainings = async () => {
    try {
      setLoading(true);
      let res;
      if (!isLeader()) {
        res = await searchMyTrainings({
          page: page - 1,
          limit: 10,
          ...filters,
        });
      } else {
        res = await searchTrainingsByLeader({
          page: page - 1,
          limit: 10,
          ...filters,
        });
      }

      if (Array.isArray(res.content)) {
        setTrainings(res.content);
        setTotal(res.totalElements);
      } else if (Array.isArray(res)) {
        setTrainings(res);
        setTotal(res.length);
      } else {
        setTrainings([]);
        setTotal(0);
      }
    } catch {
      message.error(t("Failed to fetch deleted trainings"));
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
      await recoverTrainingFromTrash(id);
      message.success(t("Training restored successfully"));
      fetchDeletedTrainings();
    } catch {
      message.error(t("Failed to restore training"));
    } finally {
      setOpenRestoreModal(false);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      await deleteTraining(id);
      message.success(t("Training permanently deleted"));
      fetchDeletedTrainings();
    } catch {
      message.error(t("Failed to delete training permanently"));
    } finally {
      setOpenDeleteModal(false);
    }
  };

  const handleEmptyTrash = () => {
    Modal.confirm({
      title: t("Empty Trash"),
      content: t(
        "Are you sure you want to permanently delete all trainings in trash? This action cannot be undone."
      ),
      okText: t("Delete All"),
      cancelText: t("Cancel"),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          for (const training of trainings) {
            await deleteTraining(String(training.id));
          }
          message.success(t("All trainings permanently deleted"));
          fetchDeletedTrainings();
        } catch {
          message.error(t("Failed to empty trash"));
        }
      },
    });
  };

  useEffect(() => {
    fetchDeletedTrainings();
  }, [JSON.stringify(filters), page]);

  const columns = [
    {
      title: t("Training"),
      dataIndex: "title",
      key: "title",
      width: "25%",
      render: (text: string, record: Training) => (
        <div>
          <span className="font-semibold break-before-all max-w-[300px]">
            {text}
          </span>
          <div className="mt-2 flex gap-10">
            <p>{record.category}</p>
            <p>
              {t("Số lượng đăng ký")}: {record.currentRegistered || 0}/
              {record.limitRegister || "∞"}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: t("Thời gian và địa điểm"),
      dataIndex: ["location", "startTime"],
      key: "startTime",
      render: (date: string | undefined, record: Training) => (
        <div>
          <p>
            {date ? new Date(date).toLocaleString() : ""} -{" "}
            {record.location?.endTime
              ? new Date(record.location.endTime).toLocaleString()
              : ""}
          </p>
          <p>{record.location?.destination || "-"}</p>
        </div>
      ),
    },
    {
      title: t("Creator"),
      dataIndex: ["creator", "fullName"],
      key: "creator",
      render: (text: string) => <span>{text || "-"}</span>,
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
    getRoleUser() === "ADMIN" || getRoleUser() === "LEADER"
      ? {
          title: t("Action"),
          key: "action",
          render: (_: any, record: Training) => (
            <div className="flex flex-wrap gap-2">
              <Tooltip title={t("Khôi phục")}>
                <Button
                  type="primary"
                  icon={<RotateCcw size={16} />}
                  onClick={() => {
                    setSelectedTraining(record);
                    setOpenRestoreModal(true);
                  }}
                ></Button>
              </Tooltip>

              <Tooltip title={t("Xóa vĩnh viễn")}>
                <Button
                  danger
                  icon={<Trash2 size={16} />}
                  onClick={() => {
                    setSelectedTraining(record);
                    setOpenDeleteModal(true);
                  }}
                ></Button>
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
          <Button className="h-[36px]" onClick={() => router.push("/training")}>
            {t("Back to Trainings")}
          </Button>

          {(getRoleUser() === "ADMIN" || getRoleUser() === "LEADER") && (
            <Button
              className="h-[36px]"
              danger
              icon={<Trash2 size={16} />}
              onClick={handleEmptyTrash}
              disabled={trainings.length === 0}
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
            onChange={(val) => setFilters({ ...filters, category: val })}
            options={[
              { label: t("Technical"), value: "TECHNICAL" },
              { label: t("Soft Skills"), value: "SOFT_SKILLS" },
              { label: t("Leadership"), value: "LEADERSHIP" },
              { label: t("Other"), value: "OTHER" },
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
                setFilters({ ...filters, search: searchTerm })
              }
              className="px-2 rounded-md border border-gray-300 !w-[150px] md:!w-[200px] lg:!w-[250px]"
            />
            <Button
              className="h-[36px]"
              onClick={() => setFilters({ ...filters, search: searchTerm })}
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
              {
                label: t("Deleted Date (Oldest)"),
                value: "lastModifiedTime,asc",
              },
              {
                label: t("Deleted Date (Newest)"),
                value: "lastModifiedTime,desc",
              },
              { label: t("Start Time (Oldest)"), value: "startTime,asc" },
              { label: t("Start Time (Newest)"), value: "startTime,desc" },
            ]}
          />
        </div>
      </div>

      <div className="w-full mt-5">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={trainings}
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
        onOk={() =>
          selectedTraining && handleRestore(String(selectedTraining.id))
        }
        okText={t("Restore")}
        cancelText={t("Cancel")}
      >
        <p>{t("Are you sure you want to restore this training?")}</p>
      </Modal>

      <Modal
        title={t("Confirm Permanent Delete")}
        open={openDeleteModal}
        onCancel={() => setOpenDeleteModal(false)}
        onOk={() =>
          selectedTraining && handlePermanentDelete(String(selectedTraining.id))
        }
        okButtonProps={{ danger: true }}
        okText={t("Delete Permanently")}
        cancelText={t("Cancel")}
      >
        <p>
          {t(
            "Are you sure you want to permanently delete this training? This action cannot be undone."
          )}
        </p>
      </Modal>
    </div>
  );
}
