"use client";

import { Button, Form, Spin } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Event, Organizer } from "@/constant/types";
import dayjs from "dayjs";

import {
  getEventById,
  updateEvent,
  updateStatusEventByLeader,
} from "@/modules/services/eventService";
import EventForm from "@/modules/event/EventForm";
import EventOrganizers from "@/modules/event/EventOrganizers";
import Publish from "@/components/Publish";
import EventAttendees from "@/modules/event/Attendee";
import { isLeader } from "@/lib/utils";
import ListTitle from "@/components/ListTitle";
import PlanForm from "@/components/PlanForm";
import { exportPlanWithTemplate } from "@/lib/exportPlanWithTemplate";

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

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [order, setOrder] = useState<string[]>([
    "Mục đích",
    "Thời gian & địa điểm",
    "Kế hoạch di chuyển",
    "Nội dung chương trình",
    "Tiến độ thực hiện chương trình",
    "Ban tổ chức chương trình",
    "Kinh phí thực hiện",
  ]);
  const [planData, setPlanData] = useState<Record<string, any>>({});

  const fetchEvent = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const data = await getEventById(id);
        if (data) {
          // Đổ dữ liệu cơ bản
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

          // Organizer
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

          // Kế hoạch (nếu có)
          if (data.plans) {
            try {
              const parsed = JSON.parse(data.plans);
              setPlanData(parsed.data || {});
              setSelectedCategories(parsed.selected || []);
              setOrder(order);
            } catch {
              setPlanData({});
            }
          }
        }
      } catch {
        toast.error(t("Failed to fetch event."));
      }
      setLoading(false);
    },
    [form, t]
  );

  const onFinish = async (values: Event) => {
    const locationFromPlan = planData["Thời gian & địa điểm"];
    if (locationFromPlan) {
      values.location = {
        destination: locationFromPlan["Địa điểm"] || "",
        startTime: locationFromPlan["Thời gian"]?.[0] || "",
        endTime: locationFromPlan["Thời gian"]?.[1] || "",
      };
    }
    const dataPayload: Event = {
      ...values,
      limitRegister: values.multiple,
      description: values.description,
      status,
      category: values.category,
      organizers: organizers.map((org) => ({
        organizerId: org.organizerId,
        roles: org.roles,
        roleContent: org.roleContent,
      })),
      plans: JSON.stringify({
        selected: selectedCategories,
        order,
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
        toast.success(t("Event updated successfully!"));
        router.push("/events");
      } else {
        toast.error(t("Failed to update event."));
      }
    } catch {
      toast.error(t("Failed to update event."));
    }
  };

  useEffect(() => {
    if (id) fetchEvent(id);
  }, [id, fetchEvent]);

  return (
    <div className="min-h-[85vh] bg-white flex flex-col items-center justify-start rounded-lg shadow-sm gap-4 px-4 pt-10">
      {loading ? (
        <div className="flex items-center justify-center min-h-[500px]">
          <Spin size="large" />
        </div>
      ) : (
        <div className="w-full">
          <h1 className="ml-[10px] text-3xl font-bold pb-3 md:pb-6">
            {t("Edit Event")}
          </h1>

          <div className="flex flex-col lg:flex-row justify-between w-full gap-6">
            <div className="w-full lg:w-[78%] space-y-6">
              <EventForm
                form={form}
                onFinish={onFinish}
                uploadedImages={uploadedImage}
                setUploadedImages={setUploadedImage}
              />

              <PlanForm
                selectedCategories={selectedCategories}
                planData={planData}
                onChange={setPlanData}
                order={order}
                form={form}
                organizers={organizers}
              />
            </div>

            <div className="w-full lg:w-[22%]">
              <Publish
                onSubmit={() => onFinish(form.getFieldsValue())}
                setStatus={setStatus}
                status={status}
              />
              <Button
                type="primary"
                className="!mb-4 w-full"
                onClick={() =>
                  exportPlanWithTemplate(
                    planData,
                    form.getFieldValue("title") || "KeHoachMoi"
                  )
                }
              >
                Xuất kế hoạch ra Word (FIT - IUH)
              </Button>
              <ListTitle
                selected={selectedCategories}
                onChange={setSelectedCategories}
                order={order}
                setOrder={setOrder}
              />

              <EventOrganizers
                organizers={organizers}
                onChangeOrganizers={setOrganizers}
                eventId={id || ""}
              />
              <EventAttendees
                startTime={form.getFieldValue(["location", "startTime"])}
                endTime={form.getFieldValue(["location", "endTime"])}
                eventId={id || ""}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditEvent;
