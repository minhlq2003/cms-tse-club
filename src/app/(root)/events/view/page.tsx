"use client";

import {
  Button,
  Form,
  Spin,
  Card,
  Descriptions,
  Tag,
  Space,
  Modal,
  Input,
} from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Event, Organizer, OrganizerRole, Post } from "@/constant/types";
import dayjs from "dayjs";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  EditOutlined,
} from "@ant-design/icons";

import {
  getEventById,
  updateStatusEventByLeader,
} from "@/modules/services/eventService";
import { getUser, isLeader } from "@/lib/utils";
import { exportPlanWithTemplate } from "@/lib/exportPlanWithTemplate";

import PlanFormDynamic from "@/components/PlanFormDynamic";
import { BasicBlocks } from "@/constant/data";

const { TextArea } = Input;

const ViewEvent = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [post, setPost] = useState<Post | undefined>(undefined);

  // Modal states
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Plan data
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [planData, setPlanData] = useState<Record<string, any>>({});

  // Load basic + custom templates
  useEffect(() => {
    const customRaw = localStorage.getItem("plan_block_templates") || "[]";
    const custom = JSON.parse(customRaw);
    setTemplates([...BasicBlocks, ...custom]);
  }, []);

  // Fetch event data
  const fetchEvent = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const data = await getEventById(id);
        if (data) {
          setEvent(data);
          setPost(data.eventPost || undefined);

          setOrganizers(
            Array.isArray(data.organizers)
              ? data.organizers.map((org: any) => ({
                  organizerId: org.organizer?.id || org.organizerId,
                  fullName: org.organizer?.fullName || org.fullName,
                  email: org.organizer?.email || org.email,
                  username: org.organizer?.username || org.username,
                  roles: org.roles,
                  roleContent: org.roleContent,
                }))
              : []
          );

          // Parse plan
          if (data.plans) {
            try {
              const parsed =
                typeof data.plans === "string"
                  ? JSON.parse(data.plans)
                  : data.plans;

              setPlanData(parsed.data || {});
              setSelectedCategories(parsed.selected || []);
              setCategoryOrder(parsed.order || parsed.selected || []);

              if (parsed.templates) {
                setTemplates(parsed.templates);
              }
            } catch (err) {
              console.error("Error parsing plans:", err);
              setPlanData({});
            }
          }
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        toast.error(t("Lấy thông tin sự kiện thất bại."));
      }
      setLoading(false);
    },
    [t]
  );

  useEffect(() => {
    if (id) fetchEvent(id);
  }, [id, fetchEvent]);

  // Approve event
  const handleApprove = async () => {
    Modal.confirm({
      title: t("Xác nhận duyệt"),
      content: t("Bạn có chắc chắn muốn duyệt sự kiện này?"),
      okText: t("Duyệt"),
      cancelText: t("Hủy"),
      onOk: async () => {
        try {
          setActionLoading(true);
          if (!id) return;
          await updateStatusEventByLeader(id, "ACCEPTED");
          toast.success(t("Đã duyệt sự kiện thành công"));
          fetchEvent(id);
        } catch (error) {
          console.error("Error approving event:", error);
          toast.error(t("Không thể duyệt sự kiện"));
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // Reject event
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
      await updateStatusEventByLeader(id, "REJECTED");
      toast.success(t("Đã từ chối sự kiện"));
      setRejectModalVisible(false);
      setRejectReason("");
      fetchEvent(id);
    } catch (error) {
      console.error("Error rejecting event:", error);
      toast.error(t("Không thể từ chối sự kiện"));
    } finally {
      setActionLoading(false);
    }
  };

  // Export plan to Word
  const handleExportPlan = () => {
    if (!event) return;

    exportPlanWithTemplate(
      planData,
      event.title || "KeHoach",
      categoryOrder,
      getUser()?.fullName || "...",
      templates
    );
  };

  // Get status tag
  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      PENDING: { color: "orange", text: "Chờ duyệt" },
      ACCEPTED: { color: "green", text: "Đã duyệt" },
      REJECTED: { color: "red", text: "Đã từ chối" },
      DRAFT: { color: "default", text: "Nháp" },
    };

    const config = statusMap[status] || { color: "default", text: status };
    return <Tag color={config.color}>{t(config.text)}</Tag>;
  };

  // Get category label
  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      ACADEMIC: "Học thuật",
      SPORTS: "Thể thao",
      CULTURAL: "Văn hóa",
      SOCIAL: "Xã hội",
      TECHNOLOGY: "Công nghệ",
      OTHER: "Khác",
    };
    return categoryMap[category] || category;
  };

  // Check if user can approve/reject
  const canApprove = isLeader() && event?.status === "PENDING";

  // --- RENDER ---
  if (loading) {
    return (
      <div className="min-h-[85vh] bg-white flex items-center justify-center rounded-lg shadow-sm">
        <Spin size="large" tip={t("Đang tải...")} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[85vh] bg-white flex items-center justify-center rounded-lg shadow-sm">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {t("Không tìm thấy sự kiện")}
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
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{event.title}</h1>
          <Space size="middle" wrap>
            {getStatusTag(event.status || "")}
            <Tag color="blue">{getCategoryLabel(event.category || "")}</Tag>
            {event.isPublic ? (
              <Tag color="green">{t("Công khai")}</Tag>
            ) : (
              <Tag color="default">{t("Riêng tư")}</Tag>
            )}
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
            onClick={() => router.push(`/events/edit?id=${id}`)}
          >
            {t("Chỉnh sửa")}
          </Button>
          <Button onClick={() => router.back()}>{t("Quay lại")}</Button>
        </Space>
      </div>

      {/* Event Details */}
      <Card className="mb-6" title={t("Thông tin sự kiện")}>
        <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }}>
          <Descriptions.Item
            label={
              <span>
                <CalendarOutlined className="mr-2" />
                {t("Thời gian bắt đầu")}
              </span>
            }
            span={2}
          >
            {event.location?.startTime
              ? dayjs(event.location.startTime).format("DD/MM/YYYY HH:mm")
              : t("Chưa xác định")}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span>
                <CalendarOutlined className="mr-2" />
                {t("Thời gian kết thúc")}
              </span>
            }
            span={2}
          >
            {event.location?.endTime
              ? dayjs(event.location.endTime).format("DD/MM/YYYY HH:mm")
              : t("Chưa xác định")}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span>
                <EnvironmentOutlined className="mr-2" />
                {t("Địa điểm")}
              </span>
            }
            span={2}
          >
            {event.location?.destination || t("Chưa xác định")}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span>
                <TeamOutlined className="mr-2" />
                {t("Giới hạn đăng ký")}
              </span>
            }
          >
            {event.limitRegister || t("Không giới hạn")}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span>
                <UserOutlined className="mr-2" />
                {t("Loại đối tượng")}
              </span>
            }
            span={2}
          >
            {event.allowedType ? (
              <Space wrap>
                {(event.allowedType & 1) > 0 && <Tag>Sinh viên</Tag>}
                {(event.allowedType & 2) > 0 && <Tag>Giảng viên</Tag>}
                {(event.allowedType & 4) > 0 && <Tag>Khách mời</Tag>}
                {(event.allowedType & 8) > 0 && <Tag>Nghiên cứu sinh</Tag>}
              </Space>
            ) : (
              t("Tất cả")
            )}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span>
                <FileTextOutlined className="mr-2" />
                {t("Multiple")}
              </span>
            }
            span={2}
          >
            {event.multiple || t("Không có mô tả")}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Organizers */}
      {organizers.length > 0 && (
        <Card title={t("Ban tổ chức")} className="mb-6">
          <div className="space-y-3">
            {organizers.map((org, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded gap-2"
              >
                <div className="flex-1">
                  <div className="font-semibold">{org.fullName}</div>
                  <div className="text-gray-600 text-sm">{org.roleContent}</div>
                  {org.email && (
                    <div className="text-gray-500 text-xs">{org.email}</div>
                  )}
                </div>
                <Space wrap>
                  {org.roles?.includes(OrganizerRole.MODIFY) && (
                    <Tag color="blue">{t("Quản lý")}</Tag>
                  )}
                </Space>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Plan Details */}
      {categoryOrder.length > 0 && (
        <Card
          title={t("Kế hoạch chi tiết")}
          className="mb-6"
          extra={
            <Button
              type="primary"
              icon={<FileTextOutlined />}
              onClick={handleExportPlan}
            >
              {t("Xuất Word")}
            </Button>
          }
        >
          <PlanFormDynamic
            selectedCategories={categoryOrder}
            templates={templates}
            planData={planData}
            organizers={organizers}
            readonly={true}
          />
        </Card>
      )}

      {/* Reject Modal */}
      <Modal
        title={t("Từ chối sự kiện")}
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
            placeholder={t("Nhập lý do từ chối sự kiện...")}
            maxLength={500}
            showCount
          />
        </div>
      </Modal>
    </div>
  );
};

export default ViewEvent;
