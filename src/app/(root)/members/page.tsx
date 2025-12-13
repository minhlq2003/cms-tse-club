"use client";

import { isLeader } from "@/lib/utils";
import ListMember from "@/modules/member/ListMember";
import {
  resetAttendancePoint,
  resetContributionPoint,
} from "@/modules/services/userService";
import { Button, Input, Popconfirm, Select, message } from "antd";
import { Search, RefreshCcw, ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function MemberPage() {
  const { t } = useTranslation("common");
  const [searchTerm, setSearchTerm] = useState<string>("");
  // State mới cho việc sắp xếp
  const [sortBy, setSortBy] = useState<string>("attendancePoint,desc");
  const [reloadToggle, setReloadToggle] = useState<boolean>(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleResetAttendance = async () => {
    try {
      await resetAttendancePoint();
      setReloadToggle((prev) => !prev);
      toast.success(t("Reset attendance points successfully!"));
    } catch {
      toast.error(t("Failed to reset attendance points"));
    }
  };

  const handleResetContribution = async () => {
    try {
      await resetContributionPoint();
      setReloadToggle((prev) => !prev);
      toast.success(t("Reset contribution points successfully!"));
    } catch {
      toast.error(t("Failed to reset contribution points"));
    }
  };

  return (
    <div className="min-h-[85vh] bg-white flex flex-col items-center justify-start rounded-lg shadow-sm gap-4 px-4 pt-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full gap-4">
        <h1 className="ml-[10px] text-2xl md:text-3xl font-bold text-gray-900">
          {t("List Members")}
        </h1>

        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto items-center">
          {isLeader() && (
            <div className="flex gap-2">
              <Popconfirm
                title={t("Are you sure you want to reset attendance points?")}
                onConfirm={handleResetAttendance}
                okText={t("Yes")}
                cancelText={t("No")}
              >
                <Button
                  icon={<RefreshCcw size={16} />}
                  className="h-[38px]"
                  type="primary"
                  danger
                >
                  {t("Reset Attendance Point")}
                </Button>
              </Popconfirm>

              <Popconfirm
                title={t("Are you sure you want to reset contribution points?")}
                onConfirm={handleResetContribution}
                okText={t("Yes")}
                cancelText={t("No")}
              >
                <Button
                  icon={<RefreshCcw size={16} />}
                  className="h-[38px]"
                  type="primary"
                  danger
                >
                  {t("Reset Contribution Point")}
                </Button>
              </Popconfirm>
            </div>
          )}

          {/* Nhóm Tìm kiếm và Sắp xếp */}
          <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto">
            {/* Component Sort */}
            <Select
              className="w-full md:w-[180px] h-[38px]"
              placeholder={t("Sort by")}
              value={sortBy}
              onChange={(value) => setSortBy(value)}
              options={[
                { value: "username,asc", label: t("Name (A-Z)") },
                { value: "username,desc", label: t("Name (Z-A)") },
                { value: "attendancePoint,desc", label: t("Highest Attendance") },
                { value: "contributionPoint,desc", label: t("Highest Contribution") },
              ]}
              suffixIcon={<ArrowUpDown size={14} />}
            />

            <div className="flex gap-2 w-full">
              <Input
                type="text"
                placeholder={t("Find username or email")}
                value={searchTerm}
                onChange={handleSearchChange}
                className="rounded-md border border-gray-300 dark:border-gray-600 !h-[38px] w-full md:!w-[250px]"
              />
              <Button
                variant="outlined"
                className="h-[38px] flex items-center justify-center"
              >
                <Search className="text-gray-600 w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <Input
              type="text"
              placeholder={t("Find username or email")}
              value={searchTerm}
              onChange={handleSearchChange}
              className="rounded-md border border-gray-300 dark:border-gray-600 !h-[38px] w-full md:!w-[300px]"
            />
            <Button
              variant="outlined"
              className="h-[38px] flex items-center justify-center"
            >
              <Search className="text-gray-600 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <ListMember searchTerm={searchTerm} reloadToggle={reloadToggle} sortBy={sortBy}/>
    </div>
  );
}
