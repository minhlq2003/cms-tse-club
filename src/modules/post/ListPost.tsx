"use client";

import { Post } from "@/constant/types";
import { deletePost, getPosts } from "@/modules/services/postService";
import { Button, Table, Modal } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ListPostProps {
  searchTerm: string;
}

export default function ListPost({ searchTerm }: ListPostProps) {
  const [data, setData] = useState<Post[]>([]);
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

  const fetchPosts = async (
    pageNo: number,
    pageSize: number,
    sortBy?: string,
    sortOrder?: string
  ) => {
    const response = await getPosts({
      page: pageNo,
      size: pageSize,
      sort: sortBy,
      title: searchTerm,
    });

    if (Array.isArray(response._embedded.postWrapperDtoList)) {
      setData(response._embedded.postWrapperDtoList ?? []);
      setTotalPosts(response?.page.totalElements ?? 0);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage, pageSize, sortBy, sortOrder);
  }, [currentPage, pageSize, sortBy, sortOrder, searchTerm]);

  const handleDelete = () => {
    if (!postToDelete?.id) return;
    deletePost(String(postToDelete.id)).then(() => {
      setIsModalVisible(false);
      setPostToDelete(null);
      fetchPosts(currentPage, pageSize);
    });
  };

  const handleTableChange = (
    pagination: TablePaginationConfig,
    _: Record<string, unknown>,
    sorter: SorterResult<Post> | SorterResult<Post>[]
  ) => {
    setCurrentPage(pagination.current ?? 0);
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
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (url: string | undefined) =>
        url ? (
          <Image src={url} alt="Post image" width={100} height={60} />
        ) : (
          "Không có ảnh"
        ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      sorter: true,
      width: 400,
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      width: 400,
      render: (value, record, index) => <p className="break-all">{value}</p>,
    },
    { title: "Danh mục", dataIndex: "category", key: "category" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: boolean | undefined) => (status ? "Công khai" : "Nháp"),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      sorter: true,
      render: (date: string | undefined) =>
        date ? new Date(date).toLocaleString() : "",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <>
          <Button
            danger
            onClick={() => showDeleteModal(record)}
            style={{ marginRight: 8 }}
          >
            Xóa
          </Button>
          <Button type="primary">
            <a href={`/posts/edit?id=${record.id}`}>Sửa</a>
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="w-full mt-5">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{
          current: currentPage + 1,
          pageSize: pageSize,
          total: totalPosts,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title="Xác nhận xóa"
        open={isModalVisible}
        onOk={handleDelete}
        onCancel={() => setIsModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xóa bài viết này không?</p>
      </Modal>
    </div>
  );
}
