"use client";

import { Button, Form, Spin } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Event, Member, Training } from "@/constant/types";
import {
  getTrainingById,
  updateStatusTrainingByLeader,
  updateTraining,
} from "@/modules/services/trainingService";
import TrainingForm from "@/modules/training/TrainingForm";
import TrainingMentors from "@/modules/training/TrainingMentors";
import Publish from "@/components/Publish";
import TrainingEventTable from "@/modules/training/TrainingEvent";
import moment from "moment";
import { isLeader } from "@/lib/utils";

const EditTraining = () => {
  const { t } = useTranslation("common");
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [mentors, setMentors] = useState<Member[]>([]);
  const [status, setStatus] = useState<string>("PENDING");
  const [trainingEvents, setTrainingEvents] = useState<Event[]>([]);

  const fetchTraining = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const res = await getTrainingById(id);
        const data = res;

        if (data) {
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

          form.setFieldsValue(formattedData);
          setUploadedImage(data.image || "");
          setStatus(
            data.status === "PENDING" || data.status === "ACCEPTED"
              ? "PENDING"
              : "ARCHIVED"
          );

          // Gán mentors
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

          // Gán trainingEvents
          setTrainingEvents(
            Array.isArray(data.trainingEvents)
              ? data.trainingEvents.map((ev: any) => ({
                  id: ev.id,
                  title: ev.title,
                  description: ev.description,
                  multiple: ev.multiple,
                  category: ev.category,
                  status: ev.status,
                  done: ev.done,
                  timeStatus: ev.timeStatus,
                  host: ev.host,
                  location: {
                    ...ev.location,
                    startTime: ev.location?.startTime
                      ? moment(ev.location.startTime)
                      : null,
                    endTime: ev.location?.endTime
                      ? moment(ev.location.endTime)
                      : null,
                  },
                }))
              : []
          );
        }
      } catch {
        toast.error(t("Failed to fetch training."));
      }
      setLoading(false);
    },
    [form, t]
  );

  const onFinish = async (values: Training) => {
    const slug = values.title?.trim().replace(/\s+/g, "-").toLowerCase() || "";

    const dataPayload: Training = {
      ...values,
      title: values.title,
      description: values.description,
      status: status,
      location: values.location,
      limitRegister: Number(values.limitRegister),
    };

    try {
      if (id) {
        const response = await updateTraining(id, dataPayload);

        if (response) {
          if (isLeader() && dataPayload.status === "PENDING") {
            await updateStatusTrainingByLeader(String(id), "ACCEPTED");
          }

          toast.success(t("Training updated successfully!"));
          router.push("/training");
        } else {
          toast.error(t("Failed to update training. Please try again."));
        }
      } else {
        toast.error(t("Invalid training ID."));
      }
    } catch {
      toast.error(t("Failed to update training. Please try again."));
    }
  };

  useEffect(() => {
    if (id) {
      fetchTraining(id);
    }
  }, [id, fetchTraining]);

  return (
    <div className="min-h-[85vh] bg-white flex flex-col items-center justify-start rounded-lg shadow-sm gap-4 px-4 pt-10">
      {loading ? (
        <div className="flex items-center justify-center min-h-[500px]">
          <Spin size="large" />
        </div>
      ) : (
        <div className="w-full">
          <h1 className="ml-[10px] text-3xl font-bold pb-6">
            {t("Edit Training")}
          </h1>

          <div className="flex justify-between w-full">
            <div className="w-full">
              <TrainingForm
                form={form}
                onFinish={onFinish}
                uploadedImages={uploadedImage}
                setUploadedImages={setUploadedImage}
              />

              <TrainingEventTable
                trainingEvent={trainingEvents}
                setTrainingEvent={setTrainingEvents}
              />
            </div>

            <div className="w-[22%] pl-5">
              <Publish
                onSubmit={() => onFinish(form.getFieldsValue())}
                setStatus={setStatus}
                status={status}
              />

              <TrainingMentors mentors={mentors} onChangeMentors={setMentors} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditTraining;
