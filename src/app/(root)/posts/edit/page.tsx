"use client";

import { Form, Spin } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { FunctionStatus, Post } from "@/constant/types";
import {
  approvePostByLeader,
  getPostById,
  updatePost,
} from "@/modules/services/postService";
import { useTranslation } from "react-i18next";
import PostForm from "@/modules/post/PostForm";
import FeaturedImage from "@/modules/post/FeaturedImage";
import Categories from "@/modules/post/Categories";
import { toast } from "sonner";
import Publish from "@/components/Publish";
import { isLeader } from "@/lib/utils";

const EditPost = () => {
  const { t } = useTranslation("common");
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [status, setStatus] = useState<FunctionStatus>(FunctionStatus.PENDING);
  const [eventId, setEventId] = useState<string>("");
  const fetchPost = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const res = await getPostById(id);
        const data = res;
        if (data) {
          setPost(data);
          form.setFieldsValue(data);
          setUploadedImage(data.featureImageUrl || "");
          const categoriesArray = data.category
            ? data.category.split(",")?.map((cat: string) => cat.trim())
            : [];
          setCategories(categoriesArray);
          setEventId(data.event?.id || "");
        }
      } catch {
        toast.error(t("Failed to fetch post."));
      }
      setLoading(false);
    },
    [form, t]
  );

  const onFinish = async (values: Post) => {
    const slug = values.title?.trim().replace(/\s+/g, "-").toLowerCase() || "";

    const categoryString = Array.isArray(categories)
      ? categories.join(",")
      : "";
    const dataPayload: Post = {
      ...values,
      title: values.title,
      slug,
      status: status,
      content: values.content,
      category: categoryString,
      featureImageUrl: uploadedImage,
      eventId: eventId || undefined,
    };

    try {
      const response = await updatePost(id || "", dataPayload);

      if (response && response.id) {
        if (isLeader()) {
          if (status === "PENDING") {
            approvePostByLeader(String(response.id));
          }
        }
        toast.success(t("Post added successfully!"));
        form.resetFields();
        setUploadedImage("");
      } else {
        toast.error(t("Failed to add post. Please try again."));
      }
    } catch {
      toast.error(t("Failed to update post. Please try again."));
    }
  };

  useEffect(() => {
    if (id) {
      fetchPost(id);
    }
  }, [id, fetchPost]);

  return (
    <div className="min-h-[85vh] bg-white flex flex-col items-center justify-start rounded-lg shadow-sm gap-4 px-4 pt-10">
      {loading ? (
        <div className="flex items-center justify-center min-h-[500px]">
          <Spin size="large" />
        </div>
      ) : (
        <div className="w-full">
          <h1 className="ml-[10px] text-3xl font-bold pb-6">
            {t("Edit Post")}
          </h1>

          <div className="flex justify-between w-full">
            <div className="flex w-full md:w-[78%]">
              <PostForm
                form={form}
                onFinish={onFinish}
                uploadedImages={uploadedImage}
                setUploadedImages={setUploadedImage}
              />
            </div>

            <div className="w-[22%] pl-5">
              <Publish
                onSubmit={() => onFinish(form.getFieldsValue())}
                setStatus={setStatus}
                status={status}
                type="post"
                postId={id || ""}
                eventId={eventId}
                setEventId={setEventId}
              />
              <FeaturedImage
                selectedMedia={uploadedImage}
                setSelectedMedia={setUploadedImage}
              />
              <Categories
                onChangeCategories={setCategories}
                selectedCategories={categories}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditPost;
