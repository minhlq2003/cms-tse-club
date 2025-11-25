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
  Table,
} from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Member, Training } from "@/constant/types";
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
  getTrainingById,
  updateStatusTrainingByLeader,
} from "@/modules/services/trainingService";
import { getUser, isLeader } from "@/lib/utils";

import PlanFormDynamic from "@/components/PlanFormDynamic";
import { BasicBlocks } from "@/constant/data";

const { TextArea } = Input;

const ViewTraining = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [training, setTraining] = useState<Training | null>(null);
  const [mentors, setMentors] = useState<Member[]>([]);
  const [trainingEvents, setTrainingEvents] = useState<any[]>([]);

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
    const customRaw = localStorage.getItem("training_block_templates") || "[]";
    const custom = JSON.parse(customRaw);
    setTemplates([...BasicBlocks, ...custom]);
  }, []);

  // Fetch training data
  const fetchTraining = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const data = await getTrainingById(id);
        if (data) {
          setTraining(data);

          // Set mentors
          setMentors(
            Array.isArray(data.mentors)
              ? data.mentors.map((m: any) => ({
                  id: m.id,
                  fullName: m.fullName,
                  username: m.username,
                  email: m.email,
                  nickname: m.nickname,
                  userUrl: m.userUrl,
                }))
              : []
          );

          // Set training events
          setTrainingEvents(
            Array.isArray(data.trainingEvents) ? data.trainingEvents : []
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
                setTemplates((prev) => {
                  const merged = [...prev];
                  parsed.templates.forEach((t: any) => {
                    const exists = merged.find((x) => x.id === t.id);
                    if (!exists) {
                      merged.push(t);
                    }
                  });
                  return merged;
                });
              }
            } catch (err) {
              console.error("Error parsing plans:", err);
              // Fallback: create planData from location and mentors
              setPlanData({
                basic_thoi_gian: {
                  "Thời gian":
                    data.location?.startTime && data.location?.endTime
                      ? [data.location.startTime, data.location.endTime]
                      : undefined,
                  "Địa điểm": data.location?.destination || "",
                },
                basic_mentor: {
                  Mentors:
                    data.mentors?.map((m: any) => ({
                      key: m.id,
                      mentorId: m.id,
                      fullName: m.fullName || "",
                      expertise: "",
                    })) || [],
                },
              });
              setSelectedCategories(["basic_thoi_gian", "basic_mentor"]);
              setCategoryOrder(["basic_thoi_gian", "basic_mentor"]);
            }
          } else {
            // No plans → create default
            setPlanData({
              basic_thoi_gian: {
                "Thời gian":
                  data.location?.startTime && data.location?.endTime
                    ? [data.location.startTime, data.location.endTime]
                    : undefined,
                "Địa điểm": data.location?.destination || "",
              },
              basic_mentor: {
                Mentors:
                  data.mentors?.map((m: any) => ({
                    key: m.id,
                    mentorId: m.id,
                    fullName: m.fullName || "",
                    expertise: "",
                  })) || [],
              },
            });
            setSelectedCategories(["basic_thoi_gian", "basic_mentor"]);
            setCategoryOrder(["basic_thoi_gian", "basic_mentor"]);
          }
        }
      } catch (error) {
        console.error("Error fetching training:", error);
        toast.error(t("Lấy thông tin training thất bại."));
      }
      setLoading(false);
    },
    [t]
  );

  useEffect(() => {
    if (id) fetchTraining(id);
  }, [id, fetchTraining]);

  // Approve training
  const handleApprove = async () => {
    Modal.confirm({
      title: t("Xác nhận duyệt"),
      content: t("Bạn có chắc chắn muốn duyệt training này?"),
      okText: t("Duyệt"),
      cancelText: t("Hủy"),
      onOk: async () => {
        try {
          setActionLoading(true);
          if (!id) return;
          await updateStatusTrainingByLeader(id, "ACCEPTED");
          toast.success(t("Đã duyệt training thành công"));
          fetchTraining(id);
        } catch (error) {
          console.error("Error approving training:", error);
          toast.error(t("Không thể duyệt training"));
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // Reject training
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
      await updateStatusTrainingByLeader(id, "REJECTED");
      toast.success(t("Đã từ chối training"));
      setRejectModalVisible(false);
      setRejectReason("");
      fetchTraining(id);
    } catch (error) {
      console.error("Error rejecting training:", error);
      toast.error(t("Không thể từ chối training"));
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
    };

    const config = statusMap[status] || { color: "default", text: status };
    return <Tag color={config.color}>{t(config.text)}</Tag>;
  };

  // Check if user can approve/reject
  const canApprove = isLeader() && training?.status === "PENDING";

  // Training Events table columns
  const eventColumns = [
    {
      title: t("Tiêu đề"),
      dataIndex: "title",
      key: "title",
      render: (text: string, record: any) => (
        <Button
          type="link"
          onClick={() => router.push(`/events/view?id=${record.id}`)}
        >
          {text}
        </Button>
      ),
    },
    {
      title: t("Thời gian bắt đầu"),
      dataIndex: ["location", "startTime"],
      key: "startTime",
      render: (date: string) =>
        date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-",
    },
    {
      title: t("Thời gian kết thúc"),
      dataIndex: ["location", "endTime"],
      key: "endTime",
      render: (date: string) =>
        date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-",
    },
    {
      title: t("Địa điểm"),
      dataIndex: ["location", "destination"],
      key: "destination",
    },
    {
      title: t("Trạng thái"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
  ];

  // --- RENDER ---
  if (loading) {
    return (
      <div className="min-h-[85vh] bg-white flex items-center justify-center rounded-lg shadow-sm">
        <Spin size="large" tip={t("Đang tải...")} />
      </div>
    );
  }

  if (!training) {
    return (
      <div className="min-h-[85vh] bg-white flex items-center justify-center rounded-lg shadow-sm">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {t("Không tìm thấy training")}
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
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {training.title}
          </h1>
          <Space size="middle" wrap>
            {getStatusTag(training.status || "")}
            {training.isPublic ? (
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
            onClick={() => router.push(`/training/edit?id=${id}`)}
          >
            {t("Chỉnh sửa")}
          </Button>
          <Button onClick={() => router.back()}>{t("Quay lại")}</Button>
        </Space>
      </div>

      {/* Featured Image */}
      {training.featuredImageUrl && (
        <Card className="mb-6">
          <img
            src={training.featuredImageUrl}
            alt={training.title}
            className="w-full max-h-96 object-cover rounded"
          />
        </Card>
      )}

      {/* Training Details */}
      <Card className="mb-6" title={t("Thông tin training")}>
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
            {training.location?.startTime
              ? dayjs(training.location.startTime).format("DD/MM/YYYY HH:mm")
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
            {training.location?.endTime
              ? dayjs(training.location.endTime).format("DD/MM/YYYY HH:mm")
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
            {training.location?.destination || t("Chưa xác định")}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span>
                <TeamOutlined className="mr-2" />
                {t("Giới hạn đăng ký")}
              </span>
            }
          >
            {training.limitRegister || t("Không giới hạn")}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span>
                <UserOutlined className="mr-2" />
                {t("Loại đối tượng")}
              </span>
            }
          >
            {training.allowedType ? (
              <Space wrap>
                {(training.allowedType & 1) > 0 && <Tag>Sinh viên</Tag>}
                {(training.allowedType & 2) > 0 && <Tag>Thành viên</Tag>}
                {(training.allowedType & 4) > 0 && <Tag>Giảng viên</Tag>}
                {(training.allowedType & 8) > 0 && <Tag>Nghiên cứu sinh</Tag>}
              </Space>
            ) : (
              t("Tất cả")
            )}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span>
                <FileTextOutlined className="mr-2" />
                {t("Mô tả")}
              </span>
            }
            span={2}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: training.description || t("Không có mô tả"),
              }}
            />
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Mentors */}
      {mentors.length > 0 && (
        <Card title={t("Mentors")} className="mb-6">
          <div className="space-y-3">
            {mentors.map((mentor, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded gap-2"
              >
                <div className="flex-1">
                  <div className="font-semibold">{mentor.fullName}</div>
                  {mentor.email && (
                    <div className="text-gray-500 text-sm">{mentor.email}</div>
                  )}
                  {mentor.username && (
                    <div className="text-gray-400 text-xs">
                      @{mentor.username}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Training Events */}
      {trainingEvents.length > 0 && (
        <Card title={t("Các buổi training")} className="mb-6">
          <Table
            dataSource={trainingEvents}
            columns={eventColumns}
            rowKey="id"
            pagination={false}
            scroll={{ x: 800 }}
          />
        </Card>
      )}

      {/* Plan Details */}
      {categoryOrder.length > 0 && (
        <Card title={t("Kế hoạch chi tiết")} className="mb-6">
          <PlanFormDynamic
            selectedCategories={categoryOrder}
            templates={templates}
            planData={planData}
            mentors={mentors}
            readonly={true}
          />
        </Card>
      )}

      {/* Reject Modal */}
      <Modal
        title={t("Từ chối training")}
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
            placeholder={t("Nhập lý do từ chối training...")}
            maxLength={500}
            showCount
          />
        </div>
      </Modal>
    </div>
  );
};

export default ViewTraining;
