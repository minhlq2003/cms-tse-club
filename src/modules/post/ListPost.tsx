"use client";

import { useEffect, useState } from "react";
import { Button, Modal, Table, Tag, Tooltip } from "antd";
import { useRouter } from "next/navigation";
import { Post } from "@/constant/types";
import { formatDate, getRoleUser, getUser } from "@/lib/utils";
import {
  getPosts,
  deletePost,
  approvePostByLeader,
  rejectPostByLeader,
} from "@/modules/services/postService";
import { useTranslation } from "react-i18next";
import { Check, Edit, Eye, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface ListPostProps {
  filters: {
    status?: string;
    keyword?: string;
    sort?: string;
  };
}

export default function ListPost({ filters }: ListPostProps) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openApproveModal, setOpenApproveModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);

  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await getPosts({
        page: page - 1,
        size: 10,
        sort: filters.sort,
        title: filters.keyword,
        status: filters.status,
      });

      if (Array.isArray(response._embedded?.postWrapperDtoList)) {
        setPosts(response._embedded.postWrapperDtoList);
        setTotal(response.page.totalElements ?? 0);
      } else {
        setPosts([]);
        setTotal(0);
      }
    } catch {
      toast.error(t("Failed to fetch posts"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [JSON.stringify(filters), page]);

  const handleDelete = async (id: string) => {
    try {
      await deletePost(id);
      toast.success(t("Post deleted successfully"));
      fetchPosts();
    } catch {
      toast.error(t("Failed to delete post"));
    } finally {
      setOpenDeleteModal(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approvePostByLeader(id);
      toast.success(t("Post approved successfully"));
      fetchPosts();
    } catch {
      toast.error(t("Failed to approve post"));
    } finally {
      setOpenApproveModal(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectPostByLeader(id);
      toast.success(t("Post rejected successfully"));
      fetchPosts();
    } catch {
      toast.error(t("Failed to reject post"));
    } finally {
      setOpenRejectModal(false);
    }
  };

  const columns = [
    {
      title: t("Post"),
      dataIndex: "title",
      key: "title",
      width: "30%",
      render: (text: string, record: Post) => (
        <div className="flex gap-3 items-start">
          {record.featureImageUrl && (
            <Image
              src={record.featureImageUrl}
              alt="Post image"
              width={80}
              height={80}
              className="rounded-md object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1">
            <span className="font-semibold break-words">{text}</span>
          </div>
        </div>
      ),
    },
    {
      title: t("Writer"),
      dataIndex: ["writer", "fullName"],
      key: "fullName",
      render: (text: string, record: Post) => (
        <div>
          <span className="font-semibold">{text}</span>
          <p>
            {formatDate(record.postTime || "").formattedTime}{" "}
            {formatDate(record.postTime || "").formattedDate}
          </p>
        </div>
      ),
    },
    {
      title: t("Last Modified"),
      dataIndex: "lastModifiedTime",
      key: "lastModifiedTime",
      render: (date: string) => (
        <span>
          {formatDate(date).formattedTime} {formatDate(date).formattedDate}
        </span>
      ),
    },
    {
      title: t("Status"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          ACCEPTED: "green",
          PENDING: "orange",
          REJECTED: "red",
          DISABLED: "gray",
          ARCHIVED: "blue",
        };
        return <Tag color={colorMap[status] || "default"}>{t(status)}</Tag>;
      },
    },
    {
      title: t("Action"),
      key: "action",
      render: (_: any, record: Post) => (
        <div className="flex flex-wrap gap-2">
          <Tooltip title={t("Delete")}>
            <Button
              danger
              icon={<Trash2 size={22} />}
              onClick={() => {
                setSelectedPost(record);
                setOpenDeleteModal(true);
              }}
            ></Button>
          </Tooltip>

          {getUser().id === record.writer?.id && (
            <Tooltip title={t("Edit")}>
              <Button
                type="primary"
                icon={<Edit size={22} />}
                onClick={() => router.push(`/posts/edit?id=${record.id}`)}
              ></Button>
            </Tooltip>
          )}

          <Tooltip title={t("View")}>
            <Button
              icon={<Eye size={22} />}
              onClick={() => router.push(`/posts/view?id=${record.id}`)}
            ></Button>
          </Tooltip>

          {(getRoleUser() === "ADMIN" || getRoleUser() === "LEADER") &&
            record.status === "PENDING" && (
              <>
                <Tooltip title={t("Approve")}>
                  <Button
                    className="!text-green-600 !border-green-600 !bg-green-50 hover:!bg-green-100"
                    icon={<Check size={22} />}
                    onClick={() => {
                      setSelectedPost(record);
                      setOpenApproveModal(true);
                    }}
                  ></Button>
                </Tooltip>
                <Tooltip title={t("Reject")}>
                  <Button
                    className="!text-red-600 !border-red-600 !bg-red-50 hover:!bg-red-100"
                    icon={<X size={22} />}
                    onClick={() => {
                      setSelectedPost(record);
                      setOpenRejectModal(true);
                    }}
                  ></Button>
                </Tooltip>
              </>
            )}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full mt-5">
      <Table
        rowKey="id"
        columns={columns}
        dataSource={posts}
        loading={loading}
        pagination={{
          pageSize: 10,
          current: page,
          onChange: setPage,
          total: total,
          showSizeChanger: false,
        }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={t("Confirm Delete")}
        open={openDeleteModal}
        onCancel={() => setOpenDeleteModal(false)}
        onOk={() => selectedPost && handleDelete(String(selectedPost.id))}
        okButtonProps={{ danger: true }}
        okText={t("Delete")}
        cancelText={t("Cancel")}
      >
        <p>{t("Are you sure you want to delete this post?")}</p>
      </Modal>

      <Modal
        title={t("Confirm Approve")}
        open={openApproveModal}
        onCancel={() => setOpenApproveModal(false)}
        onOk={() => selectedPost && handleApprove(String(selectedPost.id))}
        okText={t("Approve")}
        cancelText={t("Cancel")}
      >
        <p>{t("Are you sure you want to approve this post?")}</p>
      </Modal>

      <Modal
        title={t("Confirm Reject")}
        open={openRejectModal}
        onCancel={() => setOpenRejectModal(false)}
        onOk={() => selectedPost && handleReject(String(selectedPost.id))}
        okText={t("Reject")}
        cancelText={t("Cancel")}
      >
        <p>{t("Are you sure you want to reject this post?")}</p>
      </Modal>
    </div>
  );
}
