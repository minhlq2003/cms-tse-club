"use client";

import ListPost from "@/modules/post/ListPost";
import { Button, Input, Select } from "antd";
import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function PostPage() {
  const { t } = useTranslation("common");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="min-h-[85vh] bg-white flex flex-col items-center justify-start rounded-lg shadow-sm gap-4 px-4 pt-10">
      {/* Header + Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-3 md:gap-0">
        <h1 className="text-2xl md:text-3xl font-bold ml-[10px]">
          {t("List Posts")}
        </h1>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Status Filter */}
          <Select
            placeholder={t("Status")}
            style={{ width: 180 }}
            allowClear
            onChange={(val) => setStatusFilter(val)}
            options={[
              { label: t("Pending"), value: "PENDING" },
              { label: t("Archived"), value: "ARCHIVED" },
              { label: t("Accepted"), value: "ACCEPTED" },
              { label: t("Rejected"), value: "REJECTED" },
              { label: t("Disabled"), value: "DISABLED" },
            ]}
          />

          {/* Search Input */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              type="text"
              placeholder={t("Find post...")}
              value={searchTerm}
              onChange={handleSearchChange}
              className="px-2 rounded-md border border-gray-300 dark:border-gray-600 h-[36px] sm:w-[250px] md:w-[300px]"
            />
            <Button className="h-[36px] flex items-center justify-center">
              <Search className="text-gray-600" />
            </Button>
          </div>

          {/* Create Button */}
          <Link href="/posts/create">
            <Button type="primary" className="h-[36px] w-full sm:w-auto">
              {t("Create Post")}
            </Button>
          </Link>
        </div>
      </div>

      {/* List Component */}
      <div className="w-full">
        <ListPost status={statusFilter} searchTerm={searchTerm} />
      </div>
    </div>
  );
}
