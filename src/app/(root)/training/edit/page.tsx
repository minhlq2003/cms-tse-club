"use client";

import { Button, Form, Spin } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { BlockTemplate, Event, FunctionStatus, Member, Post, Training } from "@/constant/types";
import {
  getTrainingById,
  modifyTrainingMentors,
  updateStatusTrainingByLeader,
  updateTraining,
} from "@/modules/services/trainingService";
import TrainingForm from "@/modules/training/TrainingForm";
import TrainingMentors from "@/modules/training/TrainingMentors";
import TrainingEventTable from "@/modules/training/TrainingEvent";
import Publish from "@/components/Publish";
import { isLeader } from "@/lib/utils";
import { BasicBlocks } from "@/constant/data";
import PlanBuilderSidebar from "@/components/PlanBuilderSideBar";
import PlanFormDynamic from "@/components/PlanFormDynamic";
import dayjs from "dayjs";
import { getBlockTemplates } from "@/modules/services/templateService";
import FeaturedImage from "@/modules/post/FeaturedImage";

const EditTraining = () => {
  const { t } = useTranslation("common");
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [mentors, setMentors] = useState<Member[]>([]);
  const [status, setStatus] = useState<FunctionStatus>(FunctionStatus.PENDING);
  const [trainingEvents, setTrainingEvents] = useState<Event[]>([]);
  const [post, setPost] = useState<Post>();

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
        const res = await getBlockTemplates();
        const apiBlocks =
          res._embedded?.blockTemplateWrapperResponseDtoList || [];
        const allTemplates = [...BasicBlocks, ...apiBlocks];
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

    setTemplates((prev) => {
      const exists = prev.find((t) => t.id === id);
      return exists ? prev : [...prev, block];
    });
  }, []);

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

  const fetchTraining = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const res = await getTrainingById(id);
        const data = res;

        if (data) {
          form.setFieldsValue({
            title: data.title,
            limitRegister: data.limitRegister,
            description: data.description,
            ...data,
          });

          setUploadedImage(data.featuredImageUrl || "");
          setStatus(
            data.status as FunctionStatus
          );
          setPost(data.post);

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

          setTrainingEvents(
            Array.isArray(data.trainingEvents) ? data.trainingEvents : []
          );

          if (data.plans) {
            try {
              const parsedPlans = JSON.parse(data.plans);

              if (parsedPlans.selected) {
                setSelectedCategories(parsedPlans.selected);
              }
              if (parsedPlans.order) {
                setCategoryOrder(parsedPlans.order);
              }
              if (parsedPlans.templates) {
                // Merge saved templates with current templates
                setTemplates((prev) => {
                  const merged = [...prev];
                  parsedPlans.templates.forEach((t: any) => {
                    const exists = merged.find((x) => x.id === t.id);
                    if (!exists) {
                      merged.push(t);
                    }
                  });
                  return merged;
                });
              }
              if (parsedPlans.data) {
                setPlanData(parsedPlans.data);
              }
            } catch (e) {
              setPlanData({
                basic_thoi_gian: {
                  "Thời gian":
                    data.location?.startTime && data.location?.endTime
                      ? [data.location.startTime, data.location.endTime]
                      : undefined,
                  "Địa điểm": data.location?.destination || "",
                },
                basic_mentor: {
                  Mentors:
                    data.mentors?.map((m: any) => ({
                      key: m.id,
                      mentorId: m.id,
                      fullName: m.fullName || "",
                      expertise: "",
                    })) || [],
                },
              });
            }
          } else {
            setPlanData({
              basic_thoi_gian: {
                "Thời gian":
                  data.location?.startTime && data.location?.endTime
                    ? [data.location.startTime, data.location.endTime]
                    : undefined,
                "Địa điểm": data.location?.destination || "",
              },
              basic_mentor: {
                Mentors:
                  data.mentors?.map((m: any) => ({
                    key: m.id,
                    mentorId: m.id,
                    fullName: m.fullName || "",
                    expertise: "",
                  })) || [],
              },
            });
          }
        }
      } catch {
        toast.error(t("Failed to fetch training."));
      }
      setLoading(false);
    },
    [form, t]
  );

  const onFinish = async (values: Training) => {
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
      description: values.description,
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
      if (id) {
        const response = await updateTraining(id, dataPayload);

        if (response) {
          if (isLeader() && dataPayload.status === "PENDING") {
            await updateStatusTrainingByLeader(String(id), "ACCEPTED");
          }

          toast.success(t("Cập nhật training thành công"));
          router.push("/training");
        } else {
          toast.error(t("Cập nhật training thất bại"));
        }
      } else {
        toast.error(t("Invalid training ID."));
      }
    } catch {
      toast.error(t("Cập nhật training thất bại"));
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
                trainingId={id || ""}
                trainingEvent={trainingEvents}
                setTrainingEvent={setTrainingEvents}
                mentors={mentors} // 🆕 Truyền mentors từ state
                fetchTraining={() => fetchTraining(id || "")}
              />
            </div>

            <div className="w-full lg:w-[22%] space-y-4">
              <Publish
                onSubmit={() => onFinish(form.getFieldsValue())}
                setStatus={setStatus}
                status={status}
                type="event"
                eventId={id || ""}
                postId={post?.id}
              />

              <PlanBuilderSidebar
                order={categoryOrder}
                setOrder={setCategoryOrder}
                onAddBlock={handleAddBlock}
                onTemplateSelect={handleTemplateSelect}
              />

              <TrainingMentors 
                trainingId= {id || ""}
                mentors={mentors} 
                onChangeMentors={setMentors}
                />
              <FeaturedImage
                selectedMedia={uploadedImage}
                setSelectedMedia={setUploadedImage}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditTraining;
