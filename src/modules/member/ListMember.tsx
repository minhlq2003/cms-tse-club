"use client";

import { useEffect, useState } from "react";
import { Button, Popconfirm, Table, message } from "antd";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { getUser } from "../services/userService";

interface Member {
  id: string;
  username: string;
  email: string;
  nickname?: string | null;
  fullName: string;
  userUrl: string;
}

export default function ListMember({ searchTerm }: { searchTerm: string }) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await getUser({
        keyword: searchTerm,
      });
      if (Array.isArray(res)) {
        setMembers(res);
      }
    } catch {
      message.error(t("Failed to fetch members"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const columns = [
    {
      title: t("Full Name"),
      dataIndex: "fullName",
      key: "fullName",
      render: (text: string) => <span className="font-semibold">{text}</span>,
    },
    {
      title: t("Username"),
      dataIndex: "username",
      key: "username",
    },
    {
      title: t("Email"),
      dataIndex: "email",
      key: "email",
    },
    {
      title: t("Nickname"),
      dataIndex: "nickname",
      key: "nickname",
      render: (text: string | null) => text || "-",
    },
    {
      title: t("Actions"),
      key: "actions",
      render: (_: any, record: Member) => (
        <div className="flex gap-2">
          <Button
            type="link"
            onClick={() => router.push(`/member/edit/${record.id}`)}
          >
            {t("Edit")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full mt-5">
      <Table
        rowKey="id"
        columns={columns}
        dataSource={members}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
