"use client";

import { useEffect, useState } from "react";
import { Button, Popconfirm, Table, message } from "antd";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { changeRole, getUser, resetPassword } from "../services/userService";
import { getRoleUser, isLeader } from "@/lib/utils";

interface Member {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  attendancePoint?: number;
  contributionPoint?: number;
}

export default function ListMember({
  searchTerm,
}: {
  searchTerm: string | undefined;
}) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const leader = isLeader();

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await getUser({
        keyword: searchTerm,
        page: currentPage - 1,
      });
      if (Array.isArray(res._embedded.userShortInfoResponseDtoList)) {
        setMembers(res._embedded.userShortInfoResponseDtoList);
        setCurrentPage(res.page.number + 1);
        setTotal(res.page.totalElements);
      }
    } catch {
      message.error(t("Failed to fetch members"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [searchTerm, currentPage]);

  const handleResetPassword = async (userId: string) => {
    try {
      const newPassword = prompt(t("Enter new password:"));
      if (!newPassword) return;
      await resetPassword(userId, newPassword);
      message.success(t("Password reset successfully"));
    } catch {
      message.error(t("Failed to reset password"));
    }
  };

  const handleChangeRole = async (userId: string, currentRole: string) => {
    try {
      let newRole = "NONE";
      if (currentRole === "NONE") newRole = "MEMBER";
      else if (currentRole === "MEMBER") newRole = "LEADER";
      else if (currentRole === "LEADER") newRole = "NONE";

      await changeRole(userId, newRole);
      message.success(`${t("Changed role to")} ${newRole}`);
      fetchMembers();
    } catch {
      message.error(t("Failed to change role"));
    }
  };

  const columns: any[] = [
    {
      title: t("Full Name"),
      dataIndex: "fullName",
      key: "fullName",
      render: (text: string) => <span className="font-semibold">{text}</span>,
    },
    { title: t("Username"), dataIndex: "username", key: "username" },
    { title: t("Email"), dataIndex: "email", key: "email" },
    { title: t("Role"), dataIndex: "role", key: "role" },
    {
      title: t("Attendance Point"),
      dataIndex: "attendancePoint",
      key: "attendancePoint",
    },
    {
      title: t("Contribution Point"),
      dataIndex: "contributionPoint",
      key: "contributionPoint",
    },
  ];

  if (leader) {
    columns.push({
      title: t("Actions"),
      key: "actions",
      render: (_: any, record: Member) =>
        record.role !== "ADMIN" &&
        (record.role !== "LEADER" || getRoleUser() === "ADMIN") && (
          <div className="flex gap-2">
            <Popconfirm
              title={t("Are you sure you want to reset this user's password?")}
              onConfirm={() => handleResetPassword(record.id)}
              okText={t("Yes")}
              cancelText={t("No")}
            >
              <Button type="link">{t("Reset password")}</Button>
            </Popconfirm>

            <Button
              type="link"
              onClick={() => handleChangeRole(record.id, record.role)}
            >
              {t("Change role")}
            </Button>
          </div>
        ),
    });
  }

  return (
    <div className="w-full mt-5 overflow-x-auto">
      <Table
        rowKey="id"
        columns={columns}
        dataSource={members}
        loading={loading}
        pagination={{
          pageSize: 10,
          total,
          current: currentPage,
          onChange: setCurrentPage,
          showSizeChanger: false,
        }}
        scroll={{ x: 800 }}
        className="min-w-full"
      />
    </div>
  );
}
