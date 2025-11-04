"use client";

import { Button, Form, Spin } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { BlockTemplate, Event, Organizer, Post } from "@/constant/types";
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
import { getUser, isLeader } from "@/lib/utils";
import { exportPlanWithTemplate } from "@/lib/exportPlanWithTemplate";

import PlanFormDynamic from "@/components/PlanFormDynamic";
import PlanBuilderSidebar from "@/components/PlanBuilderSideBar";
import { BasicBlocks } from "@/constant/data";

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

  // --- Plan builder states ---
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

  // Handle add new block to sidebar
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

  // Fetch event data
  const fetchEvent = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const data = await getEventById(id);
        if (data) {
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

          // parse plan
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
        toast.error(t("Failed to fetch event."));
      }
      setLoading(false);
    },
    [form, t]
  );

  // Submit
  const onFinish = async (values: Event) => {
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
        dayjs(values.location.startTime).isBefore(
          dayjs(values.location.endTime),
          "day"
        )
      ) {
        toast.error(t("Vui lòng nhập đầy đủ thời gian và địa điểm"));
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

  // --- JSX ---
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
            {/* MAIN FORM */}
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

            {/* SIDEBAR */}
            <div className="w-full lg:w-[22%] space-y-4">
              <Publish
                onSubmit={() => onFinish(form.getFieldsValue())}
                setStatus={setStatus}
                status={status}
                type="event"
                eventId={id || ""}
                postId={post?.id}
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
                    BasicBlocks
                  )
                }
              >
                Xuất kế hoạch ra Word (FIT - IUH)
              </Button>

              <PlanBuilderSidebar
                order={categoryOrder}
                setOrder={setCategoryOrder}
                onAddBlock={handleAddBlock}
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
