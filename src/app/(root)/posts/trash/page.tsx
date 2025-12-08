"use client";

import {
  Button,
  DatePicker,
  Input,
  Select,
  Table,
  Tag,
  Modal,
  Tooltip,
} from "antd";
import { Search, RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { Post } from "@/constant/types";
import {
  getPosts,
  deletePost,
  recoverPostFromTrash,
  getPostsByLeader,
} from "@/modules/services/postService";
import { formatDate, getRoleUser, isLeaderOrHigher } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";

const { RangePicker } = DatePicker;

export default function TrashPostPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [openRestoreModal, setOpenRestoreModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const [filters, setFilters] = useState({
    startTime: undefined as string | undefined,
    endTime: undefined as string | undefined,
    keyword: undefined as string | undefined,
    sort: undefined as string | undefined,
    deleted: true,
  });

  const fetchDeletedPosts = async () => {
    try {
      setLoading(true);

      let response 
      
      if (isLeaderOrHigher()){
        response = await getPostsByLeader({
          page: page - 1,
          size: 10,
          sort: filters.sort,
          searchs: ["title","deleted"],
          searchValues: ["*" + (filters.keyword || "") + "*", "true"],
        });
      }
      else{
        response = await getPosts({
          page: page - 1,
          size: 10,
          sort: filters.sort,
          searchs: ["title","deleted"],
          searchValues: ["*" + (filters.keyword || "") + "*", "true"],
          // Assuming the API supports deleted filter
          // You may need to adjust this based on your actual API
        });
      }
      

      if (Array.isArray(response._embedded?.postWrapperDtoList)) {
        // Filter deleted posts on client side if API doesn't support it
        const deletedPosts = response._embedded.postWrapperDtoList.filter(
          (post: Post) => post.deleted === true
        );
        setPosts(deletedPosts);
        setTotal(deletedPosts. length);
      } else {
        setPosts([]);
        setTotal(0);
      }
    } catch {
      toast.error(t("Failed to fetch deleted posts"));
    } finally {
      setLoading(false);
    }
  };

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

  const handleSortChange = (value: string) => {
    setFilters({ ...filters, sort: value });
  };

  const handleRestore = async (id: string) => {
    try {
      await recoverPostFromTrash(id);
      toast.success(t("Post restored successfully"));
      fetchDeletedPosts();
    } catch {
      toast.error(t("Failed to restore post"));
    } finally {
      setOpenRestoreModal(false);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      await deletePost(id);
      toast.success(t("Post permanently deleted"));
      fetchDeletedPosts();
    } catch {
      toast.error(t("Failed to delete post permanently"));
    } finally {
      setOpenDeleteModal(false);
    }
  };

  const handleEmptyTrash = () => {
    Modal.confirm({
      title: t("Empty Trash"),
      content: t(
        "Are you sure you want to permanently delete all posts in trash? This action cannot be undone."
      ),
      okText: t("Delete All"),
      cancelText: t("Cancel"),
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          for (const post of posts) {
            await deletePost(String(post.id));
          }
          toast.success(t("All posts permanently deleted"));
          fetchDeletedPosts();
        } catch {
          toast.error(t("Failed to empty trash"));
        }
      },
    });
  };

  useEffect(() => {
    fetchDeletedPosts();
  }, [JSON.stringify(filters), page]);

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
      title: t("Deleted Date"),
      dataIndex: "lastModifiedTime",
      key: "lastModifiedTime",
      render: (date: string) => (
        <span>
          {formatDate(date).formattedTime} {formatDate(date).formattedDate}
        </span>
      ),
    },
    getRoleUser() === "LEADER" || getRoleUser() === "ADMIN"
      ? {
          title: t("Action"),
          key: "action",
          render: (_: any, record: Post) => (
            <div className="flex flex-wrap gap-2">
              <Tooltip title={t("Restore")}>
                <Button
                  type="primary"
                  icon={<RotateCcw size={16} />}
                  onClick={() => {
                    setSelectedPost(record);
                    setOpenRestoreModal(true);
                  }}
                />
              </Tooltip>

              <Tooltip title={t("Delete Permanently")}>
                <Button
                  danger
                  icon={<Trash2 size={16} />}
                  onClick={() => {
                    setSelectedPost(record);
                    setOpenDeleteModal(true);
                  }}
                />
              </Tooltip>
            </div>
          ),
        }
      : {},
  ];

  return (
    <div className="min-h-[85vh] bg-white flex flex-col items-center justify-start rounded-lg shadow-sm gap-4 px-4 pt-10">
      <div className="flex flex-col md:flex-row justify-between w-full items-center gap-4">
        <h1 className="ml-[10px] text-2xl md:text-3xl font-bold text-center md:text-left">
          {t("Trash")}
        </h1>

        <div className="flex flex-wrap justify-center md:justify-end gap-2 w-full md:w-auto">
          <Button className="h-[36px]" onClick={() => router.push("/posts")}>
            {t("Back to Posts")}
          </Button>

          {(getRoleUser() === "LEADER" || getRoleUser() === "ADMIN") && (
            <Button
              className="h-[36px]"
              danger
              icon={<Trash2 size={16} />}
              onClick={handleEmptyTrash}
              disabled={posts.length === 0}
            >
              {t("Empty Trash")}
            </Button>
          )}
        </div>
      </div>

      <div className="flex w-full justify-between align-middle ml-4 py-3 border-[0.5px] border-[#a5a1a18e] rounded-lg px-4">
        <div className="flex gap-2 flex-wrap">
          <RangePicker onChange={handleDateChange} />

          <div className="flex items-center gap-1">
            <Input
              type="text"
              placeholder={t("Title...")}
              value={searchTerm}
              onChange={handleSearchChange}
              onPressEnter={() =>
                setFilters({ ...filters, keyword: searchTerm })
              }
              className="px-2 rounded-md border border-gray-300 !w-[150px] md:!w-[200px] lg:!w-[250px]"
            />
            <Button
              className="h-[36px]"
              onClick={() => setFilters({ ...filters, keyword: searchTerm })}
            >
              <Search className="text-gray-600" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <p className="!mb-0">{t("Sort by:")}</p>
          <Select
            placeholder={t("Select sort")}
            style={{ width: 200 }}
            allowClear
            onChange={handleSortChange}
            options={[
              { label: t("Title (A-Z)"), value: "title,asc" },
              { label: t("Title (Z-A)"), value: "title,desc" },
              { label: t("Deleted Date (Oldest)"), value: "lastModifiedTime,asc" },
              { label: t("Deleted Date (Newest)"), value: "lastModifiedTime,desc" },
              { label: t("Post Time (Oldest)"), value: "postTime,asc" },
              { label: t("Post Time (Newest)"), value: "postTime,desc" },
            ]}
          />
        </div>
      </div>

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
      </div>

      <Modal
        title={t("Confirm Restore")}
        open={openRestoreModal}
        onCancel={() => setOpenRestoreModal(false)}
        onOk={() => selectedPost && handleRestore(String(selectedPost.id))}
        okText={t("Restore")}
        cancelText={t("Cancel")}
      >
        <p>{t("Are you sure you want to restore this post?")}</p>
      </Modal>

      <Modal
        title={t("Confirm Permanent Delete")}
        open={openDeleteModal}
        onCancel={() => setOpenDeleteModal(false)}
        onOk={() =>
          selectedPost && handlePermanentDelete(String(selectedPost.id))
        }
        okButtonProps={{ danger: true }}
        okText={t("Delete Permanently")}
        cancelText={t("Cancel")}
      >
        <p>
          {t(
            "Are you sure you want to permanently delete this post? This action cannot be undone."
          )}
        </p>
      </Modal>
    </div>
  );
}
