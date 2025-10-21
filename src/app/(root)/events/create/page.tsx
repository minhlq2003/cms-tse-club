"use client";

import { Button, Form } from "antd";
import { useState } from "react";
import { Event, Organizer } from "@/constant/types";
import {
  createEvent,
  updateStatusEventByLeader,
} from "@/modules/services/eventService";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import EventForm from "@/modules/event/EventForm";
import EventOrganizers from "@/modules/event/EventOrganizers";
import Publish from "@/components/Publish";
import ListTitle from "@/components/ListTitle";
import PlanForm from "@/components/PlanForm";
import { getUser, isLeader } from "@/lib/utils";
import { exportPlanWithTemplate } from "@/lib/exportPlanWithTemplate";

export default function AddEvent() {
  const { t } = useTranslation("common");
  const [form] = Form.useForm();
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [status, setStatus] = useState<string>("PENDING");

  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Mục đích",
    "Thời gian & địa điểm",
    "Nội dung chương trình",
    "Tiến độ thực hiện chương trình",
  ]);

  const [planData, setPlanData] = useState<Record<string, any>>({});

  const [categoryOrder, setCategoryOrder] = useState<string[]>([
    "Mục đích",
    "Thời gian & địa điểm",
    "Kế hoạch di chuyển",
    "Nội dung chương trình",
    "Ban tổ chức chương trình",
    "Tiến độ thực hiện chương trình",
    "Kinh phí thực hiện",
    "Thành phần tham dự",
  ]);

  const onFinish = async (values: Event) => {
    const slug = values.title?.trim().replace(/\s+/g, "-").toLowerCase() || "";

    const locationFromPlan = planData["Thời gian & địa điểm"];
    if (locationFromPlan) {
      values.location = {
        destination: locationFromPlan["Địa điểm"] || "",
        startTime: locationFromPlan["Thời gian"]?.[0] || "",
        endTime: locationFromPlan["Thời gian"]?.[1] || "",
      };
    }

    const allowedType = Array.isArray(values.allowedArray)
      ? values.allowedArray.reduce((acc, val) => acc + val, 0)
      : 0;

    const dataPayload: Event = {
      ...values,
      title: values.title,
      description: values.description || "none",
      status,
      category: values.category,
      isPublic: true,
      allowedType: allowedType,
      plans: JSON.stringify({
        selected: selectedCategories,
        order: categoryOrder,
        data: planData,
      }),

      organizers: organizers.map((org) => ({
        organizerId: org.organizerId,
        roles: org.roles,
        roleContent: org.roleContent,
      })),
    };

    try {
      const res = await createEvent(dataPayload);

      if (res && res.id) {
        if (isLeader() && dataPayload.status === "PENDING") {
          await updateStatusEventByLeader(res.id, "ACCEPTED");
        }

        toast.success(t("Event added successfully!"));
        form.resetFields();
        setOrganizers([]);
        setPlanData({});
      } else {
        toast.error(t("Failed to add event. Please try again."));
      }
    } catch {
      toast.error(t("Failed to add event. Please try again."));
    }
  };

  // ===== JSX =====
  return (
    <div className="min-h-[85vh] bg-white flex flex-col items-center justify-start rounded-lg shadow-sm gap-4 px-4 pt-10">
      <div className="w-full">
        <h1 className="ml-[10px] text-3xl font-bold pb-6">
          {t("Create Event")}
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
              onChange={(updater) => {
                if (typeof updater === "function") {
                  setPlanData((prev) => updater(prev));
                } else {
                  setPlanData(updater);
                }
              }}
              order={categoryOrder}
              form={form}
              organizers={organizers}
            />
          </div>

          <div className="w-full lg:w-[22%] space-y-4">
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
                  form.getFieldValue("title") || "KeHoachMoi",
                  categoryOrder,
                  getUser()?.fullName || "..."
                )
              }
            >
              Xuất kế hoạch ra Word (FIT - IUH)
            </Button>
            <ListTitle
              selected={selectedCategories}
              onChange={setSelectedCategories}
              order={categoryOrder}
              setOrder={setCategoryOrder}
            />

            <EventOrganizers
              organizers={organizers}
              onChangeOrganizers={setOrganizers}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
