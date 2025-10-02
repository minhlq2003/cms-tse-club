"use client";

import { Button, Form } from "antd";
import { useState } from "react";
import { Event, Member, Training } from "@/constant/types";
import { createTraining } from "@/modules/services/trainingService";
import { useTranslation } from "react-i18next";
import TrainingForm from "@/modules/training/TrainingForm";
import TrainingMentors from "@/modules/training/TrainingMentors";
import { toast } from "sonner";
import Publish from "@/components/Publish";
import TrainingEventTable from "@/modules/training/TrainingEvent";

export default function AddTraining() {
  const { t } = useTranslation("common");
  const [form] = Form.useForm();
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [mentors, setMentors] = useState<Member[]>([]);
  const [status, setStatus] = useState<string>("draft");
  const [trainingEvents, setTrainingEvents] = useState<Event[]>([]);

  const onFinish = async (values: Training) => {
    const slug = values.title?.trim().replace(/\s+/g, "-").toLowerCase() || "";

    const dataPayload: Training = {
      ...values,
      title: values.title,
      description: values.description,
      status: status,
      location: values.location,
      mentorIds: mentors.map((mentor) => mentor.id),
      trainingEvents: trainingEvents,
    };

    try {
      await createTraining(dataPayload);
      toast.success(t("Training added successfully!"));
      form.resetFields();
      setMentors([]);
    } catch {
      toast.error(t("Failed to add training. Please try again."));
    }
  };

  return (
    <div className="min-h-[85vh] bg-white flex flex-col items-center justify-start rounded-lg shadow-sm gap-4 px-4 pt-10">
      <div className="w-full">
        <h1 className="ml-[10px] text-3xl font-bold pb-6">
          {t("Create Training")}
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
    </div>
  );
}
