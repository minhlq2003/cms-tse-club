"use client";

import { Button, Form } from "antd";
import { useCallback, useEffect, useState } from "react";
import { BlockTemplate, Member, Training } from "@/constant/types";
import {
  createTraining,
  updateStatusTrainingByLeader,
} from "@/modules/services/trainingService";
import { useTranslation } from "react-i18next";
import TrainingForm from "@/modules/training/TrainingForm";
import TrainingMentors from "@/modules/training/TrainingMentors";
import TrainingEventTable from "@/modules/training/TrainingEvent";
import { toast } from "sonner";
import Publish from "@/components/Publish";
import { getUser, isLeader } from "@/lib/utils";
import { BasicBlocks } from "@/constant/data";
import PlanBuilderSidebar from "@/components/PlanBuilderSideBar";
import PlanFormDynamic from "@/components/PlanFormDynamic";
import dayjs from "dayjs";
import { getBlockTemplates } from "@/modules/services/templateService";
import FeaturedImage from "@/modules/post/FeaturedImage";

export default function AddTraining() {
  const { t } = useTranslation("common");
  const [form] = Form.useForm();
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [mentors, setMentors] = useState<Member[]>([]);
  const [status, setStatus] = useState<string>("PENDING");
  const [trainingEvents, setTrainingEvents] = useState<any[]>([]);

  // Dynamic plan states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "basic_thoi_gian",
    "basic_mentor",
  ]);
  const [categoryOrder, setCategoryOrder] = useState<string[]>([
    "basic_thoi_gian",
    "basic_mentor",
  ]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [planData, setPlanData] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        // Lấy custom blocks từ API
        const res = await getBlockTemplates();
        const apiBlocks =
          res._embedded?.blockTemplateWrapperResponseDtoList || [];

        // Merge với basic blocks
        const allTemplates = [...BasicBlocks, ...apiBlocks];

        // Lọc trùng lặp theo id
        const uniqueTemplates = allTemplates.filter(
          (t, index, self) => index === self.findIndex((x) => x.id === t.id)
        );

        setTemplates(uniqueTemplates);
      } catch (error) {
        console.error("Failed to fetch block templates:", error);
        setTemplates(BasicBlocks);
      }
    };

    fetchTemplates();
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

  const onFinish = async (values: Training) => {
    // Lấy thông tin thời gian và địa điểm từ planData
    const locationFromPlan = planData["basic_thoi_gian"];

    if (locationFromPlan) {
      values.location = {
        destination: locationFromPlan["Địa điểm"],
        startTime: locationFromPlan["Thời gian"]?.[0],
        endTime: locationFromPlan["Thời gian"]?.[1],
      };

      if (
        !values.location.startTime ||
        !values.location.endTime ||
        !values.location.destination
      ) {
        toast.error(t("Vui lòng nhập đầy đủ thời gian và địa điểm"));
        return;
      }

      if (
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

    // Lấy mentors từ planData
    const mentorsFromPlan = planData["basic_mentor"]?.["Mentors"] || [];
    const mentorIds = mentorsFromPlan
      .map((m: any) => m.mentorId)
      .filter(Boolean);

    const allowedType = Array.isArray(values.allowedArray)
      ? values.allowedArray.reduce((acc, val) => acc + val, 0)
      : 0;

    const dataPayload: Training = {
      ...values,
      title: values.title,
      description:
        "nonemmmmmmmmmmmmmmmmmmmdfdfdfdfdfdffdfdf mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm",
      status,
      location: values.location,
      limitRegister: Number(values.limitRegister),
      mentorIds: mentorIds.length > 0 ? mentorIds : mentors.map((m) => m.id),
      allowedType: allowedType,
      trainingEvents: trainingEvents,
      featuredImageUrl: uploadedImage,
      plans: JSON.stringify({
        selected: selectedCategories,
        order: categoryOrder,
        templates,
        data: planData,
      }),
    };

    try {
      const response = await createTraining(dataPayload);

      if (response && response.id) {
        if (isLeader() && dataPayload.status === "PENDING") {
          await updateStatusTrainingByLeader(String(response.id), "ACCEPTED");
        }

        toast.success(t("Tạo training thành công"));
        form.resetFields();
        setMentors([]);
        setPlanData({});
      } else {
        toast.error(t("Tạo training thất bại"));
      }
    } catch {
      toast.error(t("Tạo training thất bại"));
    }
  };

  return (
    <div className="min-h-[85vh] bg-white flex flex-col items-center justify-start rounded-lg shadow-sm gap-4 px-4 pt-10">
      <div className="w-full">
        <h1 className="ml-[10px] text-3xl font-bold pb-6">
          {t("Create Training")}
        </h1>

        <div className="flex flex-col lg:flex-row justify-between w-full gap-6">
          <div className="w-full lg:w-[78%] space-y-6">
            <TrainingForm
              form={form}
              onFinish={onFinish}
              uploadedImages={uploadedImage}
              setUploadedImages={setUploadedImage}
            />

            <PlanFormDynamic
              selectedCategories={categoryOrder}
              mentors={mentors}
              onChangeMentors={setMentors}
              templates={templates}
              planData={planData}
              onChange={(updater) => {
                if (typeof updater === "function")
                  setPlanData((prev) => updater(prev));
                else setPlanData(updater);
              }}
            />

            <TrainingEventTable
              trainingEvent={trainingEvents}
              setTrainingEvent={setTrainingEvents}
              mentors={mentors}
            />
          </div>

          <div className="w-full lg:w-[22%] space-y-4">
            <Publish
              onSubmit={() => onFinish(form.getFieldsValue())}
              setStatus={setStatus}
              status={status}
            />

            <PlanBuilderSidebar
              order={categoryOrder}
              setOrder={setCategoryOrder}
              onAddBlock={handleAddBlock}
              onTemplateSelect={handleTemplateSelect}
            />

            <TrainingMentors mentors={mentors} onChangeMentors={setMentors} />
            <FeaturedImage
              selectedMedia={uploadedImage}
              setSelectedMedia={setUploadedImage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
