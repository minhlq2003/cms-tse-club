"use client";

import { Button, Form, Spin } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Event, Member, Organizer } from "@/constant/types";
import dayjs from "dayjs";

import {
  getEventAttendees,
  getEventById,
  updateEvent,
  updateStatusEventByLeader,
} from "@/modules/services/eventService";
import EventForm from "@/modules/event/EventForm";
import EventOrganizers from "@/modules/event/EventOrganizers";
import moment from "moment";
import Publish from "@/components/Publish";
import EventAttendees from "@/modules/event/Attendee";
import { isLeader } from "@/lib/utils";

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

  const fetchEvent = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const res = await getEventById(id);
        const data = res;
        if (data) {
          const formattedData = {
            ...data,
            location: {
              ...data.location,
              startTime: data.location?.startTime
                ? dayjs(data.location.startTime, "YYYY-MM-DDTHH:mm:ss")
                : null,
              endTime: data.location?.endTime
                ? dayjs(data.location.endTime, "YYYY-MM-DDTHH:mm:ss")
                : null,
            },
          };

          form.setFieldsValue(formattedData);
          setUploadedImage(data.image || "");
          setStatus(
            data.status === "PENDING" || data.status === "ACCEPTED"
              ? "PENDING"
              : "ARCHIVED"
          );
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
      limitRegister: Number(values.multiple),
      location: values.location,
      organizers: organizers.map((org) => ({
        organizerId: org.organizerId,
        roles: org.roles,
        roleContent: org.roleContent,
      })),
    };

    try {
      if (id) {
        const response = await updateEvent(id, dataPayload);

        if (response && response.id) {
          // Nếu người cập nhật là Leader và status vẫn là "PENDING" thì duyệt luôn
          if (isLeader() && dataPayload.status === "PENDING") {
            await updateStatusEventByLeader(String(response.id), "ACCEPTED");
          }

          toast.success(t("Event updated successfully!"));
          router.push("/events");
        } else {
          toast.error(t("Failed to update event. Please try again."));
        }
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
          <h1 className="ml-[10px] text-3xl font-bold pb-3 md:pb-6">
            {t("Edit Event")}
          </h1>

          <div className="flex flex-col md:flex-row justify-between w-full">
            <EventForm
              form={form}
              onFinish={onFinish}
              uploadedImages={uploadedImage}
              setUploadedImages={setUploadedImage}
            />

            <div className="md:w-[22%] w-full pl-0 md:pl-5">
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
              <EventAttendees eventId={id || ""} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditEvent;
