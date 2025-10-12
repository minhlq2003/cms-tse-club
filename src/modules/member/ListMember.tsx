"use client";

import { useEffect, useState } from "react";
import { Button, Popconfirm, Table, Modal, Select, Form } from "antd";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { changeRole, getUser, resetPassword } from "../services/userService";
import { getRoleUser, isLeader } from "@/lib/utils";
import { toast } from "sonner";

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
  const currentUserRole = getRoleUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

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
      toast.error(t("Failed to fetch members"));
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
      toast.success(t("Password reset successfully"));
    } catch {
      toast.error(t("Failed to reset password"));
    }
  };

  const openChangeRoleModal = (member: Member) => {
    setSelectedMember(member);
    setSelectedRole(member.role);
    setIsModalOpen(true);
  };

  const handleConfirmChangeRole = async () => {
    if (!selectedMember) return;

    const currentRole = selectedMember.role;
    const newRole = selectedRole;
    if (currentRole === "NONE" && newRole === "LEADER") {
      toast.warning(t("Cannot change role from NONE to LEADER directly"));
      return;
    }

    if (
      currentUserRole === "LEADER" &&
      currentRole === "MEMBER" &&
      newRole === "LEADER"
    ) {
      Modal.confirm({
        title: t("Transfer leadership"),
        content: t(
          "Are you sure you want to transfer leadership to this member? You will be downgraded to MEMBER."
        ),
        okText: t("Yes"),
        cancelText: t("No"),
        async onOk() {
          try {
            await changeRole(selectedMember.id, newRole);
            toast.success(`${t("Changed role to")} ${newRole}`);
            fetchMembers();
          } catch {
            toast.error(t("Failed to change role"));
          }
        },
      });
      setIsModalOpen(false);
      return;
    }

    try {
      await changeRole(selectedMember.id, newRole);
      toast.success(`${t("Changed role to")} ${newRole}`);
      fetchMembers();
    } catch {
      toast.error(t("Failed to change role"));
    } finally {
      setIsModalOpen(false);
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
        (record.role !== "LEADER" || currentUserRole === "ADMIN") && (
          <div className="flex gap-2">
            <Popconfirm
              title={t("Are you sure you want to reset this user's password?")}
              onConfirm={() => handleResetPassword(record.id)}
              okText={t("Yes")}
              cancelText={t("No")}
            >
              <Button type="link">{t("Reset password")}</Button>
            </Popconfirm>

            <Button type="link" onClick={() => openChangeRoleModal(record)}>
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

      {/* Modal chọn role */}
      <Modal
        title={
          <p>
            {t("Change Role for ")}
            {`${selectedMember?.username}`}
          </p>
        }
        open={isModalOpen}
        onOk={handleConfirmChangeRole}
        onCancel={() => setIsModalOpen(false)}
        okText={t("Confirm")}
        cancelText={t("Cancel")}
      >
        <Form layout="vertical">
          <Form.Item label={t("Select new role")}>
            <Select
              value={selectedRole}
              onChange={setSelectedRole}
              options={[
                { label: "NONE", value: "NONE" },
                { label: "MEMBER", value: "MEMBER" },
                { label: "LEADER", value: "LEADER" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
