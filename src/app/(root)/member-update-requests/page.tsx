"use client";

import { isLeader } from "@/lib/utils";
import ListMember from "@/modules/member/ListMember";
import ListUpdateRequests from "@/modules/member/ListUpdateRequests";
import {
  resetAttendancePoint,
  resetContributionPoint,
} from "@/modules/services/userService";
import { Button, Input, Popconfirm, message } from "antd";
import { Search, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function MemberUpdateRequestsPage() {
  const { t } = useTranslation("common");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [reloadToggle, setReloadToggle] = useState<boolean>(false);
  const leader = isLeader();

  if (!leader) {
    return (
      <div className="min-h-[85vh] bg-white flex flex-col items-center justify-center rounded-lg shadow-sm gap-4 px-4 pt-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {t("Access Denied")}
        </h1>
        <p>{t("You do not have permission to view this page.")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-white flex flex-col items-center justify-start rounded-lg shadow-sm gap-4 px-4 pt-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full gap-4">
        <h1 className="ml-[10px] text-2xl md:text-3xl font-bold text-gray-900">
          {t("Member Update Requests")}
        </h1>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto items-center">
          <Button
            type="primary"
            icon={<RefreshCcw/>}
            onClick={() => setReloadToggle((prev) => !prev)}
          >
          </Button>
        </div>
        
      </div>

      {/* Table */}
      <ListUpdateRequests searchTerm={{
        size: 10,
        page: 1,
      }}
      reloadToggle={reloadToggle}
      />
    </div>
  );
}
