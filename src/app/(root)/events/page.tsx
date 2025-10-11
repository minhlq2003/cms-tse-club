"use client";

import ListEvent from "@/modules/event/ListEvent";
import { Button, DatePicker, Input, Select } from "antd";
import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export default function EventPage() {
  const { t } = useTranslation("common");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    eventType: undefined as string | undefined,
    startTime: undefined as string | undefined,
    endTime: undefined as string | undefined,
    isDone: undefined as boolean | undefined,
    status: undefined as string | undefined,
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

  return (
    <div className="min-h-[85vh] bg-white flex flex-col items-center justify-start rounded-lg shadow-sm gap-4 px-4 pt-10">
      <div className="flex flex-col md:flex-row justify-between w-full items-center gap-4">
        <h1 className="ml-[10px] text-2xl md:text-3xl font-bold text-center md:text-left">
          {t("List Event")}
        </h1>

        <div className="flex flex-wrap justify-center md:justify-end gap-2 w-full md:w-auto">
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
              className="px-2 rounded-md border border-gray-300 !w-[150px] md:!w-[200px] lg:!w-[250px]"
            />
            <Button className="h-[36px]" onClick={() => {}}>
              <Search className="text-gray-600" />
            </Button>
          </div>

          <Link href="/events/create">
            <Button className="h-[36px]" type="primary">
              {t("Create Event")}
            </Button>
          </Link>
        </div>
      </div>

      <ListEvent filters={{ ...filters, search: searchTerm }} />
    </div>
  );
}
