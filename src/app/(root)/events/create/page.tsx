"use client";

import { Button, Form } from "antd";
import { useCallback, useEffect, useState } from "react";
import { BlockTemplate, Event, Organizer } from "@/constant/types";
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
import { get } from "lodash";
import PlanBuilderSidebar from "@/components/PlanBuilderSideBar";
import PlanFormDynamic from "@/components/PlanFormDynamic";
import { BasicBlocks } from "@/constant/data";
import dayjs from "dayjs";

export default function AddEvent() {
  const { t } = useTranslation("common");
  const [form] = Form.useForm();
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [organizers, setOrganizers] = useState<Organizer[]>([
    {
      ...getUser(),
      organizerId: getUser().id,
      roles: ["MODIFY", "CHECK_IN"],
      roleContent: "Trưởng ban",
    },
  ]);
  const [status, setStatus] = useState<string>("PENDING");

  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "basic_muc_dich",
    "basic_thoi_gian",
  ]);
  const [categoryOrder, setCategoryOrder] = useState<string[]>([
    "basic_muc_dich",
    "basic_thoi_gian",
  ]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [planData, setPlanData] = useState<Record<string, any>>({});

  useEffect(() => {
    const customRaw = localStorage.getItem("plan_block_templates") || "[]";
    const custom = JSON.parse(customRaw);

    const basic = BasicBlocks;

    setTemplates([...basic, ...custom]);
  }, []);

  const handleAddBlock = useCallback((block: BlockTemplate | "__REMOVE__") => {
    if (block === "__REMOVE__") return;

    const id = block.id;
    if (!id) return;

    setSelectedCategories((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setCategoryOrder((prev) => (prev.includes(id) ? prev : [...prev, id]));

    // Đảm bảo block được thêm vào templates nếu chưa có
    setTemplates((prev) => {
      const exists = prev.find((t) => t.id === id);
      return exists ? prev : [...prev, block];
    });
  }, []);

  // 🆕 Callback khi chọn template
  const handleTemplateSelect = useCallback((blocks: BlockTemplate[]) => {
    setTemplates((prev) => {
      const merged = [...prev];
      blocks.forEach((block) => {
        const exists = merged.find((t) => t.id === block.id);
        if (!exists) {
          merged.push(block);
        }
      });
      return merged;
    });
  }, []);

  const onFinish = async (values: Event) => {
    const slug = values.title?.trim().replace(/\s+/g, "-").toLowerCase() || "";

    const locationFromPlan = planData["basic_thoi_gian"];
    console.log(locationFromPlan);

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
      title: values.title,
      limitRegister: values.limitRegister || 0,
      category: values.category,
      isPublic: values.isPublic !== undefined ? values.isPublic : false,
      allowedType: allowedType,
      plans: JSON.stringify({
        selected: selectedCategories,
        order: categoryOrder,
        templates,
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

        toast.success(t("Tạo sự kiện thành công"));
        form.resetFields();
        setOrganizers([]);
        setPlanData({});
      } else {
        toast.error(t("Tạo sự kiện thất bại"));
      }
    } catch {
      toast.error(t("Tạo sự kiện thất bại"));
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
                  getUser()?.fullName || "...",
                  templates
                )
              }
            >
              Xuất kế hoạch ra Word (FIT - IUH)
            </Button>

            <PlanBuilderSidebar
              order={categoryOrder}
              setOrder={setCategoryOrder}
              onAddBlock={handleAddBlock}
              onTemplateSelect={handleTemplateSelect}
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
