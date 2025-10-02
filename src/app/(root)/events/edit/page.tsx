"use client";

import { Button, Form, Spin } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Event, Organizer } from "@/constant/types";
import { getEventById, updateEvent } from "@/modules/services/eventService";
import EventForm from "@/modules/event/EventForm";
import EventOrganizers from "@/modules/event/EventOrganizers";
import moment from "moment";
import Publish from "@/components/Publish";

const EditEvent = () => {
  const { t } = useTranslation("common");
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [status, setStatus] = useState<string>("draft");

  const fetchEvent = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const res = await getEventById(id);
        const data = res;
        if (data) {
          // Gán dữ liệu vào form
          const formattedData = {
            ...data,
            location: {
              ...data.location,
              startTime: data.location?.startTime
                ? moment(data.location.startTime)
                : null,
              endTime: data.location?.endTime
                ? moment(data.location.endTime)
                : null,
            },
          };

          // Set the formatted data to the form
          form.setFieldsValue(formattedData);
          setUploadedImage(data.image || "");
          setStatus(data.status || "draft");
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
        }
      } catch {
        toast.error(t("Failed to fetch event."));
      }
      setLoading(false);
    },
    [form, t]
  );

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
      if (id) {
        await updateEvent(id, dataPayload);
        toast.success(t("Event updated successfully!"));
        router.push("/admin/events");
      } else {
        toast.error(t("Invalid event ID."));
      }
    } catch {
      toast.error(t("Failed to update event. Please try again."));
    }
  };

  useEffect(() => {
    if (id) {
      fetchEvent(id);
    }
  }, [id, fetchEvent]);

  return (
    <div className="min-h-[85vh] bg-white flex flex-col items-center justify-start rounded-lg shadow-sm gap-4 px-4 pt-10">
      {loading ? (
        <div className="flex items-center justify-center min-h-[500px]">
          <Spin size="large" />
        </div>
      ) : (
        <div className="w-full">
          <h1 className="ml-[10px] text-3xl font-bold pb-6">
            {t("Edit Event")}
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
