"use client";

import { Button, Form } from "antd";
import { useState } from "react";
import { Event, Organizer } from "@/constant/types";
import {
  createEvent,
  updateStatusEventByLeader,
} from "@/modules/services/eventService";
import { useTranslation } from "react-i18next";
import EventForm from "@/modules/event/EventForm";
import EventOrganizers from "@/modules/event/EventOrganizers";
import { toast } from "sonner";
import Publish from "@/components/Publish";
import { isLeader } from "@/lib/utils";

export default function AddEvent() {
  const { t } = useTranslation("common");
  const [form] = Form.useForm();
  const [uploadedImage, setUploadedImage] = useState<string>(""); // giữ lại nếu sau này cần featured image
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [status, setStatus] = useState<string>("PENDING");

  const onFinish = async (values: Event) => {
    const slug = values.title?.trim().replace(/\s+/g, "-").toLowerCase() || "";

    const dataPayload: Event = {
      ...values,
      title: values.title,
      description: values.description,
      status: status,
      category: values.category,
      multiple: Number(values.multiple),
      limitRegister: Number(values.multiple),
      location: values.location,
      organizers: organizers.map((org) => ({
        organizerId: org.organizerId,
        roles: org.roles,
        roleContent: org.roleContent,
      })),
    };

    try {
      const response = await createEvent(dataPayload);
      if (response && response.id) {
        if (isLeader() && dataPayload.status === "PENDING") {
          await updateStatusEventByLeader(response.id, "ACCEPTED");
        }

        toast.success(t("Event added successfully!"));
        form.resetFields();
        setOrganizers([]);
      } else {
        toast.error(t("Failed to add event. Please try again."));
      }
    } catch {
      toast.error(t("Failed to add event. Please try again."));
    }
  };

  return (
    <div className="min-h-[85vh] bg-white flex flex-col items-center justify-start rounded-lg shadow-sm gap-4 px-4 pt-10">
      <div className="w-full">
        <h1 className="ml-[10px] text-3xl font-bold pb-6">
          {t("Create Event")}
        </h1>

        <div className="flex flex-col lg:flex-row justify-between w-full gap-6">
          <div className="w-full lg:w-[78%]">
            <EventForm
              form={form}
              onFinish={onFinish}
              uploadedImages={uploadedImage}
              setUploadedImages={setUploadedImage}
            />
          </div>

          <div className="w-full lg:w-[22%] lg:pl-5">
            <Publish
              onSubmit={() => onFinish(form.getFieldsValue())}
              setStatus={setStatus}
              status={status}
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
