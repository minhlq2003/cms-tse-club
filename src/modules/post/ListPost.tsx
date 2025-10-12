"use client";

import { Post } from "@/constant/types";
import { getRoleUser, getUser } from "@/lib/utils";
import {
  approvePostByLeader,
  deletePost,
  getPosts,
  rejectPostByLeader,
} from "@/modules/services/postService";
import { Button, Table, Modal, Tag, message } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface ListPostProps {
  searchTerm: string;
  status: string;
}

export default function ListPost({ searchTerm, status }: ListPostProps) {
  const { t } = useTranslation("common");
  const [data, setData] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalPosts, setTotalPosts] = useState(0);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<string | undefined>();

  const showDeleteModal = (record: Post) => {
    setPostToDelete(record);
    setIsModalVisible(true);
  };

  const handleApprove = async (record: Post) => {
    Modal.confirm({
      title: t("Confirm Approve"),
      content: t("Are you sure you want to approve this post?"),
      okText: t("Approve"),
      cancelText: t("Cancel"),
      onOk: async () => {
        try {
          await approvePostByLeader(String(record.id));
          message.success(t("Post approved successfully"));
          fetchPosts(currentPage, pageSize);
        } catch {
          message.error(t("Failed to approve post"));
        }
      },
    });
  };

  const handleReject = async (record: Post) => {
    Modal.confirm({
      title: t("Confirm Reject"),
      content: t("Are you sure you want to reject this post?"),
      okText: t("Reject"),
      cancelText: t("Cancel"),
      onOk: async () => {
        try {
          await rejectPostByLeader(String(record.id));
          message.success(t("Post rejected successfully"));
          fetchPosts(currentPage, pageSize);
        } catch {
          message.error(t("Failed to reject post"));
        }
      },
    });
  };

  const fetchPosts = async (
    pageNo: number,
    pageSize: number,
    sortBy?: string,
    sortOrder?: string
  ) => {
    try {
      setLoading(true);
      const response = await getPosts({
        page: pageNo,
        size: pageSize,
        sort: sortBy,
        title: searchTerm,
        status: status,
      });

      if (Array.isArray(response._embedded?.postWrapperDtoList)) {
        setData(response._embedded.postWrapperDtoList);
        setTotalPosts(response.page.totalElements ?? 0);
      }
    } catch {
      message.error(t("Failed to fetch posts"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage, pageSize, sortBy, sortOrder);
  }, [currentPage, pageSize, sortBy, sortOrder, searchTerm, status]);

  const handleDelete = async () => {
    if (!postToDelete?.id) return;
    try {
      await deletePost(String(postToDelete.id));
      message.success(t("Post deleted successfully"));
      fetchPosts(currentPage, pageSize);
    } catch {
      message.error(t("Failed to delete post"));
    } finally {
      setIsModalVisible(false);
      setPostToDelete(null);
    }
  };

  const handleTableChange = (
    pagination: TablePaginationConfig,
    _: Record<string, unknown>,
    sorter: SorterResult<Post> | SorterResult<Post>[]
  ) => {
    setCurrentPage((pagination.current ?? 1) - 1);
    setPageSize(pagination.pageSize ?? 5);

    if (!Array.isArray(sorter)) {
      setSortBy((sorter.field as string) || undefined);
      setSortOrder(
        sorter.order === "ascend"
          ? "asc"
          : sorter.order === "descend"
          ? "desc"
          : undefined
      );
    }
  };

  const columns: ColumnsType<Post> = [
    {
      title: t("Image"),
      dataIndex: "image",
      key: "image",
      render: (url: string | undefined) =>
        url ? (
          <Image
            src={url}
            alt="Post image"
            width={100}
            height={60}
            className="rounded-md object-cover"
          />
        ) : (
          t("No image")
        ),
    },
    {
      title: t("Title"),
      dataIndex: "title",
      key: "title",
      sorter: true,
      width: 400,
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
        };
        return <Tag color={colorMap[status] || "default"}>{t(status)}</Tag>;
      },
    },
    {
      title: t("Created Date (MM/DD/YYYY)"),
      dataIndex: "postTime",
      key: "postTime",
      sorter: true,
      render: (date: string | undefined) =>
        date ? new Date(date).toLocaleString() : "",
    },
    {
      title: t("Action"),
      key: "action",
      render: (_, record) => (
        <div className="flex flex-wrap gap-2">
          <Button danger onClick={() => showDeleteModal(record)}>
            {t("Delete")}
          </Button>

          {getUser().id === record.writer?.id && (
            <Button type="primary">
              <a href={`/posts/edit?id=${record.id}`}>{t("Edit")}</a>
            </Button>
          )}

          {(getRoleUser() === "ADMIN" || getRoleUser() === "LEADER") &&
            record.status === "PENDING" && (
              <>
                <Button onClick={() => handleApprove(record)}>
                  {t("Approve")}
                </Button>
                <Button onClick={() => handleReject(record)}>
                  {t("Reject")}
                </Button>
              </>
            )}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full mt-5">
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={{
          current: currentPage + 1,
          pageSize,
          total: totalPosts,
          showSizeChanger: false,
        }}
        onChange={handleTableChange}
        scroll={{ x: "max-content" }}
      />

      {/* Delete Modal */}
      <Modal
        title={t("Confirm Delete")}
        open={isModalVisible}
        onOk={handleDelete}
        onCancel={() => setIsModalVisible(false)}
        okText={t("Delete")}
        cancelText={t("Cancel")}
        okButtonProps={{ danger: true }}
      >
        <p>{t("Are you sure you want to delete this post?")}</p>
      </Modal>
    </div>
  );
}
