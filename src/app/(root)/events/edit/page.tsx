"use client";

import { Button, Form, Spin, Modal, message, Input, Typography } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { BlockTemplate, Event, Organizer, Post } from "@/constant/types";
import dayjs from "dayjs";
import { QrcodeOutlined, CheckCircleOutlined } from "@ant-design/icons";

import {
  getEventById,
  updateEvent,
  updateStatusEventByLeader,
  getCodeCheckIn,
  triggerEventDone,
} from "@/modules/services/eventService";
import EventForm from "@/modules/event/EventForm";
import EventOrganizers from "@/modules/event/EventOrganizers";
import Publish from "@/components/Publish";
import EventAttendees from "@/modules/event/Attendee";
import { getRoleUser, getUser, isLeader } from "@/lib/utils";
import { exportPlanWithTemplate } from "@/lib/exportPlanWithTemplate";

import PlanFormDynamic from "@/components/PlanFormDynamic";
import PlanBuilderSidebar from "@/components/PlanBuilderSideBar";
import { BasicBlocks } from "@/constant/data";

const { Text } = Typography;

const EditEvent = () => {
  const { t } = useTranslation("common");
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [status, setStatus] = useState<string>("PENDING");
  const [post, setPost] = useState<Post | undefined>(undefined);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [planData, setPlanData] = useState<Record<string, any>>({});

  const [eventData, setEventData] = useState<any>(null);
  const [canModify, setCanModify] = useState(false);
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [eventStarted, setEventStarted] = useState(false);
  const [eventDone, setEventDone] = useState(false);

  const [checkInModalVisible, setCheckInModalVisible] = useState(false);
  const [checkInCode, setCheckInCode] = useState("");
  const [loadingCode, setLoadingCode] = useState(false);

  useEffect(() => {
    const customRaw = localStorage.getItem("plan_block_templates") || "[]";
    const custom = JSON.parse(customRaw);
    setTemplates([...BasicBlocks, ...custom]);
  }, []);

  const handleAddBlock = useCallback(
    (block: BlockTemplate | "__REMOVE__") => {
      if (block === "__REMOVE__") return;
      const id = block.id;
      if (!id) return;

      setSelectedCategories((prev) =>
        prev.includes(id) ? prev : [...prev, id]
      );
      setCategoryOrder((prev) => (prev.includes(id) ? prev : [...prev, id]));

      const exists = templates.find((t) => t.id === id);
      if (!exists) setTemplates((prev) => [...prev, block]);
    },
    [templates]
  );

  const checkPermissions = (data: any) => {
    const currentUser = getUser();
    if (!currentUser) return;

    const userId = currentUser.id;

    const isUserHost = data.host?.id === userId || data.isHost === true;
    setIsHost(isUserHost);

    const now = dayjs();
    const startTime = data.location?.startTime
      ? dayjs(data.location.startTime)
      : null;
    const hasStarted = startTime ? now.isAfter(startTime) : false;
    setEventStarted(hasStarted);

    setEventDone(data.done === true);

    const userAsOrganizer = data.userAsOrganizer;
    const roles = userAsOrganizer?.roles || [];

    if (isUserHost || getRoleUser() === "LEADER" || getRoleUser() === "ADMIN") {
      setCanModify(!hasStarted && !data.done);
      setCanCheckIn(!data.done);
    } else {
      setCanModify(roles.includes("MODIFY") && !hasStarted && !data.done);

      setCanCheckIn(roles.includes("CHECK_IN") && !data.done);
    }
  };

  const fetchEvent = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const data = await getEventById(id);
        if (data) {
          setEventData(data);
          checkPermissions(data);

          const formattedData = {
            ...data,
            location: {
              ...data.location,
              startTime: data.location?.startTime
                ? dayjs(data.location.startTime)
                : null,
              endTime: data.location?.endTime
                ? dayjs(data.location.endTime)
                : null,
            },
          };

          form.setFieldsValue(formattedData);
          setUploadedImage(data.image || "");
          setPost(data.eventPost || undefined);

          setOrganizers(
            Array.isArray(data.organizers)
              ? data.organizers.map((org: any) => ({
                  organizerId: org.organizer.id,
                  fullName: org.organizer.fullName,
                  email: org.organizer.email,
                  username: org.organizer.username,
                  roles: org.roles,
                  roleContent: org.roleContent,
                }))
              : []
          );

          if (data.plans) {
            try {
              const parsed = JSON.parse(data.plans);
              setPlanData(parsed.data || {});
              setSelectedCategories(parsed.selected || []);
              setCategoryOrder(parsed.order || []);
              if (parsed.templates) setTemplates(parsed.templates);
            } catch {
              setPlanData({});
            }
          }
        }
      } catch {
        toast.error(t("Lấy thông tin sự kiện thất bại."));
      }
      setLoading(false);
    },
    [form, t]
  );

  // Generate Check-in Code
  const handleGenerateCode = async (forceNew: boolean = false) => {
    if (!id || !eventData?.location?.endTime) return;

    setLoadingCode(true);
    try {
      const endTime = dayjs(eventData.location.endTime).format(
        "YYYY-MM-DDTHH:mm:ss"
      );
      const res = await getCodeCheckIn(id, endTime, forceNew);
      if (res?.checkInCode) {
        setCheckInCode(res.checkInCode);
        message.success(
          forceNew ? t("Đã tạo mã mới thành công") : t("Lấy mã thành công")
        );
      }
    } catch (error: any) {
      message.error(error?.message || t("Không thể tạo mã điểm danh"));
    } finally {
      setLoadingCode(false);
    }
  };

  const handleTriggerDone = async () => {
    if (!id) return;

    Modal.confirm({
      title: t("Xác nhận kết thúc sự kiện"),
      content: t(
        "Sau khi kết thúc, sự kiện sẽ không thể điểm danh hoặc chỉnh sửa. Bạn có chắc chắn?"
      ),
      okText: t("Xác nhận"),
      cancelText: t("Hủy"),
      onOk: async () => {
        try {
          setLoading(true);
          await triggerEventDone(id);
          message.success(t("Đã kết thúc sự kiện thành công"));
          fetchEvent(id); // Reload event data
        } catch (error) {
          message.error(t("Không thể kết thúc sự kiện"));
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Submit
  const onFinish = async (values: Event) => {
    if (!canModify) {
      toast.error(t("Bạn không có quyền chỉnh sửa sự kiện này"));
      return;
    }

    const locationFromPlan = planData["basic_thoi_gian"];
    if (locationFromPlan) {
      values.location = {
        destination: locationFromPlan["Địa điểm"],
        startTime: locationFromPlan["Thời gian"]?.[0],
        endTime: locationFromPlan["Thời gian"]?.[1],
      };
      if (
        values.location.startTime === null ||
        values.location.endTime === null ||
        values.location.destination === null
      ) {
        toast.error(t("Vui lòng nhập đầy đủ thời gian và địa điểm"));
        return;
      } else if (
        dayjs(values.location.startTime).isAfter(
          dayjs(values.location.endTime),
          "day"
        )
      ) {
        toast.error(t("Ngày bắt đầu phải trước ngày kết thúc"));
        return;
      }
    } else {
      toast.error(t("Vui lòng nhập đầy đủ thời gian và địa điểm"));
      return;
    }

    const allowedType = Array.isArray(values.allowedArray)
      ? values.allowedArray.reduce((acc, val) => acc + val, 0)
      : 0;

    const dataPayload: Event = {
      ...values,
      limitRegister: values.multiple,
      description: values.description,
      status,
      allowedType,
      category: values.category,
      organizers: organizers.map((org) => ({
        organizerId: org.organizerId,
        roles: org.roles,
        roleContent: org.roleContent,
      })),
      plans: JSON.stringify({
        selected: selectedCategories,
        order: categoryOrder,
        templates,
        data: planData,
      }),
    };

    try {
      if (!id) return toast.error(t("Invalid event ID."));
      const res = await updateEvent(id, dataPayload);

      if (res?.id) {
        if (isLeader() && dataPayload.status === "PENDING") {
          await updateStatusEventByLeader(String(res.id), "ACCEPTED");
        }
        toast.success(t("Cập nhật sự kiện thành công."));
        router.push("/events");
      } else {
        toast.error(t("Cập nhật sự kiện thất bại."));
      }
    } catch {
      toast.error(t("Cập nhật sự kiện thất bại."));
    }
  };

  useEffect(() => {
    if (id) fetchEvent(id);
  }, [id, fetchEvent]);

  // --- JSX ---
  return (
    <div className="min-h-[85vh] bg-white flex flex-col items-center justify-start rounded-lg shadow-sm gap-4 px-4 pt-10">
      {loading ? (
        <div className="flex items-center justify-center min-h-[500px]">
          <Spin size="large" />
        </div>
      ) : (
        <div className="w-full">
          <div className="flex justify-between items-center mb-4">
            <h1 className="ml-[10px] text-3xl font-bold">{t("Edit Event")}</h1>

            {/* Permission Info */}
            <div className="flex gap-2">
              {eventDone && (
                <Text type="danger" strong>
                  {t("Sự kiện đã kết thúc")}
                </Text>
              )}
              {eventStarted && !eventDone && (
                <Text type="warning" strong>
                  {t("Sự kiện đang diễn ra")}
                </Text>
              )}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row justify-between w-full gap-6">
            {/* MAIN FORM */}
            <div className="w-full lg:w-[78%] space-y-6">
              <EventForm
                form={form}
                onFinish={onFinish}
                uploadedImages={uploadedImage}
                setUploadedImages={setUploadedImage}
                disabled={!canModify}
              />

              <PlanFormDynamic
                selectedCategories={categoryOrder}
                organizers={organizers}
                templates={templates}
                planData={planData}
                onChange={(updater) => {
                  if (typeof updater === "function")
                    setPlanData((prev) => updater(prev));
                  else setPlanData(updater);
                }}
                readonly={!canModify}
              />
            </div>

            {/* SIDEBAR */}
            <div className="w-full lg:w-[22%] space-y-4">
              <Publish
                onSubmit={() => onFinish(form.getFieldsValue())}
                setStatus={setStatus}
                status={status}
                type="event"
                eventId={id || ""}
                postId={post?.id}
                disabled={!canModify}
              />

              {/* Trigger Done Button (Leader only) */}
              {getRoleUser() === "LEADER" && !eventDone && (
                <Button
                  type="primary"
                  danger
                  icon={<CheckCircleOutlined />}
                  className="w-full"
                  onClick={handleTriggerDone}
                >
                  {t("Kết thúc sự kiện")}
                </Button>
              )}

              <Button
                type="primary"
                className="!mb-4 w-full"
                onClick={() =>
                  exportPlanWithTemplate(
                    planData,
                    form.getFieldValue("title") || "KeHoachMoi",
                    categoryOrder,
                    getUser()?.fullName || "...",
                    templates
                  )
                }
              >
                {t("Xuất kế hoạch ra Word (FIT - IUH)")}
              </Button>

              {canModify && (
                <PlanBuilderSidebar
                  order={categoryOrder}
                  setOrder={setCategoryOrder}
                  onAddBlock={handleAddBlock}
                />
              )}

              <EventOrganizers
                organizers={organizers}
                onChangeOrganizers={setOrganizers}
                eventId={id || ""}
                isView={!isHost}
              />

              <EventAttendees
                startTime={form.getFieldValue(["location", "startTime"])}
                endTime={form.getFieldValue(["location", "endTime"])}
                eventId={id || ""}
                userRole={getRoleUser()}
                eventCategory={form.getFieldValue("category")}
                canCheckIn={canCheckIn}
              />
            </div>
          </div>
        </div>
      )}

      <Modal
        title={
          <div className="flex items-center gap-2">
            <QrcodeOutlined style={{ fontSize: 24 }} />
            <span>{t("Mã điểm danh")}</span>
          </div>
        }
        open={checkInModalVisible}
        onCancel={() => setCheckInModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setCheckInModalVisible(false)}>
            {t("Đóng")}
          </Button>,
          <Button
            key="refresh"
            type="primary"
            loading={loadingCode}
            onClick={() => handleGenerateCode(true)}
          >
            {t("Tạo mã mới")}
          </Button>,
        ]}
        width={500}
      >
        <div className="py-4">
          {loadingCode ? (
            <div className="flex justify-center py-8">
              <Spin />
            </div>
          ) : checkInCode ? (
            <div className="text-center">
              <div className="mb-4">
                <Text type="secondary">{t("Mã điểm danh hiện tại")}:</Text>
              </div>
              <Input
                value={checkInCode}
                readOnly
                size="large"
                className="text-center font-mono text-2xl font-bold"
                style={{ fontSize: 28 }}
              />
              <div className="mt-4">
                <Text type="secondary" className="text-sm">
                  {t("Mã này sẽ hết hiệu lực sau 10 phút kể từ thời điểm tạo")}
                </Text>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Text type="secondary">{t("Không thể tải mã điểm danh")}</Text>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default EditEvent;
