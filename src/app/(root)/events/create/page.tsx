"use client";

import { Button, Form } from "antd";
import { useState } from "react";
import { Event, Organizer } from "@/constant/types";
import { createEvent } from "@/modules/services/eventService";
import { useTranslation } from "react-i18next";
import EventForm from "@/modules/event/EventForm";
import EventOrganizers from "@/modules/event/EventOrganizers";
import { toast } from "sonner";
import Publish from "@/components/Publish";

export default function AddEvent() {
  const { t } = useTranslation("common");
  const [form] = Form.useForm();
  const [uploadedImage, setUploadedImage] = useState<string>(""); // giữ lại nếu sau này cần featured image
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [status, setStatus] = useState<string>("draft");

  const onFinish = async (values: Event) => {
    const slug = values.title?.trim().replace(/\s+/g, "-").toLowerCase() || "";

    const dataPayload: Event = {
      ...values,
      title: values.title,
      description: values.description,
      status: status,
      category: values.category,
      multiple: Number(values.multiple),
      location: values.location,
      organizers: organizers.map((org) => ({
        organizerId: org.organizerId,
        roles: org.roles,
        roleContent: org.roleContent,
      })),
    };

    try {
      await createEvent(dataPayload);
      toast.success(t("Event added successfully!"));
      form.resetFields();
      setOrganizers([]);
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

        <div className="flex justify-between w-full">
          <EventForm
            form={form}
            onFinish={onFinish}
            uploadedImages={uploadedImage}
            setUploadedImages={setUploadedImage}
          />

          <div className="w-[22%] pl-5">
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
