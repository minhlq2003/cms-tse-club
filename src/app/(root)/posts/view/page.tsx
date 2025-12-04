"use client";

import {
  Button,
  Card,
  Descriptions,
  Input,
  Modal,
  Space,
  Spin,
  Tag,
  Divider,
} from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Post } from "@/constant/types";
import dayjs from "dayjs";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined,
  EditOutlined,
  TagOutlined,
  LinkOutlined,
} from "@ant-design/icons";

import {
  getPostById,
  approvePostByLeader,
  rejectPostByLeader,
} from "@/modules/services/postService";
import { isLeader } from "@/lib/utils";
import Link from "next/link";

const { TextArea } = Input;

const ViewPost = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [post, setPost] = useState<Post | null>(null);

  // Modal states
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Fetch post data
  const fetchPost = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const data = await getPostById(id);
        if (data) {
          setPost(data);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error(t("Lấy thông tin bài viết thất bại."));
      }
      setLoading(false);
    },
    [t]
  );

  useEffect(() => {
    if (id) fetchPost(id);
  }, [id, fetchPost]);

  // Approve post
  const handleApprove = async () => {
    Modal.confirm({
      title: t("Xác nhận duyệt"),
      content: t("Bạn có chắc chắn muốn duyệt bài viết này?"),
      okText: t("Duyệt"),
      cancelText: t("Hủy"),
      onOk: async () => {
        try {
          setActionLoading(true);
          if (!id) return;
          await approvePostByLeader(id);
          toast.success(t("Đã duyệt bài viết thành công"));
          fetchPost(id);
        } catch (error) {
          console.error("Error approving post:", error);
          toast.error(t("Không thể duyệt bài viết"));
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // Reject post
  const handleReject = () => {
    setRejectModalVisible(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      toast.warning(t("Vui lòng nhập lý do từ chối"));
      return;
    }

    try {
      setActionLoading(true);
      if (!id) return;
      await rejectPostByLeader(id);
      toast.success(t("Đã từ chối bài viết"));
      setRejectModalVisible(false);
      setRejectReason("");
      fetchPost(id);
    } catch (error) {
      console.error("Error rejecting post:", error);
      toast.error(t("Không thể từ chối bài viết"));
    } finally {
      setActionLoading(false);
    }
  };

  // Get status tag
  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      PENDING: { color: "orange", text: "Chờ duyệt" },
      ACCEPTED: { color: "green", text: "Đã duyệt" },
      REJECTED: { color: "red", text: "Đã từ chối" },
      DRAFT: { color: "default", text: "Nháp" },
      ARCHIVED: { color: "default", text: "Lưu trữ" },
    };

    const config = statusMap[status] || { color: "default", text: status };
    return <Tag color={config.color}>{t(config.text)}</Tag>;
  };

  // Parse categories
  const getCategories = () => {
    if (!post?.category) return [];
    return post.category.split(",").map((cat) => cat.trim());
  };

  // Check if user can approve/reject
  const canApprove = isLeader() && post?.status === "PENDING";

  // --- RENDER ---
  if (loading) {
    return (
      <div className="min-h-[85vh] bg-white flex items-center justify-center rounded-lg shadow-sm">
        <Spin size="large" tip={t("Đang tải...")} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[85vh] bg-white flex items-center justify-center rounded-lg shadow-sm">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {t("Không tìm thấy bài viết")}
          </h2>
          <Button type="primary" onClick={() => router.back()}>
            {t("Quay lại")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-white rounded-lg shadow-sm p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{post.title}</h1>
          <Space size="middle" wrap>
            {getStatusTag(post.status || "")}
            {getCategories().map((cat, index) => (
              <Tag key={index} color="blue" icon={<TagOutlined />}>
                {cat}
              </Tag>
            ))}
          </Space>
        </div>

        <Space wrap>
          {canApprove && (
            <>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleApprove}
                loading={actionLoading}
                size="large"
              >
                {t("Duyệt")}
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={handleReject}
                loading={actionLoading}
                size="large"
              >
                {t("Từ chối")}
              </Button>
            </>
          )}
          <Button
            icon={<EditOutlined />}
            onClick={() => router.push(`/posts/edit?id=${id}`)}
          >
            {t("Chỉnh sửa")}
          </Button>
          <Button onClick={() => router.back()}>{t("Quay lại")}</Button>
        </Space>
      </div>

      {/* Featured Image */}
      {post.featureImageUrl && (
        <Card className="mb-6">
          <img
            src={post.featureImageUrl}
            alt={post.title}
            className="w-full max-h-96 object-cover rounded"
          />
        </Card>
      )}

      {/* Post Details */}
      <Card className="mb-6" title={t("Thông tin bài viết")}>
        <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }}>
          <Descriptions.Item
            label={
              <span>
                <UserOutlined className="mr-2" />
                {t("Tác giả")}
              </span>
            }
          >
            {post.writer?.fullName || t("Không xác định")}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span>
                <CalendarOutlined className="mr-2" />
                {t("Ngày tạo")}
              </span>
            }
          >
            {post.postTime
              ? dayjs(post.postTime).format("DD/MM/YYYY HH:mm")
              : t("Không xác định")}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span>
                <CalendarOutlined className="mr-2" />
                {t("Cập nhật lần cuối")}
              </span>
            }
          >
            {post.lastModifiedTime
              ? dayjs(post.lastModifiedTime).format("DD/MM/YYYY HH:mm")
              : t("Không xác định")}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span>
                <LinkOutlined className="mr-2" />
                {t("Slug")}
              </span>
            }
          >
            <Link
              href={`${
                process.env.WEB_PUBLIC_URL ?? "htts://tse-club.vercel.app"
              }/posts/${post.id}`}
              target="_blank"
            >
              {`${
                process.env.WEB_PUBLIC_URL ?? "htts://tse-club.vercel.app"
              }/posts/${post.id}`}
            </Link>
          </Descriptions.Item>

          {post.event && (
            <Descriptions.Item
              label={
                <span>
                  <FileTextOutlined className="mr-2" />
                  {t("Sự kiện liên quan")}
                </span>
              }
              span={2}
            >
              <Button
                type="link"
                onClick={() => router.push(`/events/view?id=${post.event?.id}`)}
              >
                {post.event.title}
              </Button>
            </Descriptions.Item>
          )}

          {post.excerpt && (
            <Descriptions.Item
              label={
                <span>
                  <FileTextOutlined className="mr-2" />
                  {t("Tóm tắt")}
                </span>
              }
              span={2}
            >
              {post.excerpt}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Post Content */}
      <Card title={t("Nội dung bài viết")} className="mb-6">
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content || "" }}
        />
      </Card>

      {/* Reject Modal */}
      <Modal
        title={t("Từ chối bài viết")}
        open={rejectModalVisible}
        onOk={confirmReject}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectReason("");
        }}
        okText={t("Xác nhận từ chối")}
        cancelText={t("Hủy")}
        okButtonProps={{ danger: true, loading: actionLoading }}
      >
        <div className="mb-4">
          <p className="mb-2 font-medium">
            {t("Vui lòng nhập lý do từ chối:")}
          </p>
          <TextArea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={t("Nhập lý do từ chối bài viết...")}
            maxLength={500}
            showCount
          />
        </div>
      </Modal>
    </div>
  );
};

export default ViewPost;
