"use client";

import ListTraining from "@/modules/training/ListTraining";
import { Button, DatePicker, Input, Select, message } from "antd";
import { Search, Download, Upload, Trash2, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export default function TrainingPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: undefined as string | undefined,
    startTime: undefined as string | undefined,
    endTime: undefined as string | undefined,
    status: undefined as string | undefined,
    search: undefined as string | undefined,
    sort: undefined as string | undefined,
  });

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

  const handleExport = () => {
    // TODO: Implement export logic
    message.success(t("Exporting trainings..."));
  };

  const handleImport = () => {
    // TODO: Implement import logic
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.xlsx";
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        message.success(t("Importing file: ") + file.name);
        // Process file here
      }
    };
    input.click();
  };

  const handleSortChange = (value: string) => {
    setFilters({ ...filters, sort: value });
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchTerm });
  };

  return (
    <div className="min-h-[85vh] bg-white flex flex-col items-center justify-start rounded-lg shadow-sm gap-4 px-4 pt-10">
      <div className="flex flex-col md:flex-row justify-between w-full items-center gap-4">
        <h1 className="ml-[10px] text-2xl md:text-3xl font-bold text-center md:text-left">
          {t("List Training")}
        </h1>

        <div className="flex flex-wrap justify-center md:justify-end gap-2 w-full md:w-auto">
          <Button
            className="h-[36px]"
            icon={<Download size={16} />}
            onClick={handleExport}
          >
            {t("Export")}
          </Button>

          <Button
            className="h-[36px]"
            icon={<Upload size={16} />}
            onClick={handleImport}
          >
            {t("Import")}
          </Button>

          <Button
            className="h-[36px]"
            icon={<Trash2 size={16} />}
            onClick={() => router.push("/training/trash")}
          >
            {t("Trash")}
          </Button>

          <Link href="/training/create">
            <Button
              icon={<PlusIcon size={16} />}
              className="h-[36px]"
              type="primary"
            >
              {t("Create Training")}
            </Button>
          </Link>
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

          <Select
            placeholder={t("Status")}
            style={{ width: 150 }}
            allowClear
            onChange={(val) => setFilters({ ...filters, status: val })}
            options={[
              { label: t("Pending"), value: "PENDING" },
              { label: t("Archived"), value: "ARCHIVED" },
              { label: t("Accepted"), value: "ACCEPTED" },
              { label: t("Rejected"), value: "REJECTED" },
              { label: t("Disabled"), value: "DISABLED" },
            ]}
          />

          <div className="flex items-center gap-1">
            <Input
              type="text"
              placeholder={t("Title...")}
              value={searchTerm}
              onChange={handleSearchChange}
              onPressEnter={handleSearch}
              className="px-2 rounded-md border border-gray-300 !w-[150px] md:!w-[200px] lg:!w-[250px]"
            />
            <Button className="h-[36px]" onClick={handleSearch}>
              <Search className="text-gray-600" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <p className="!mb-0">{t("Sort by:")}</p>
          <Select
            placeholder={t("Select sort")}
            style={{ width: 200 }}
            allowClear
            onChange={handleSortChange}
            options={[
              { label: t("Title (A-Z)"), value: "title,asc" },
              { label: t("Title (Z-A)"), value: "title,desc" },
              { label: t("Start Time (Oldest)"), value: "startTime,asc" },
              { label: t("Start Time (Newest)"), value: "startTime,desc" },
              { label: t("Created Date (Oldest)"), value: "createdAt,asc" },
              { label: t("Created Date (Newest)"), value: "createdAt,desc" },
            ]}
          />
        </div>
      </div>

      <ListTraining filters={{ ...filters }} />
    </div>
  );
}
