"use client";

import { Button, Form, message } from "antd";
import { useState } from "react";
import { Post } from "@/constant/types";
import { createPost } from "@/modules/services/postService";
import { useTranslation } from "react-i18next";
import PostForm from "@/modules/post/PostForm";
import FeaturedImage from "@/modules/post/FeaturedImage";
import Categories from "@/modules/post/Categories";
import { toast } from "sonner";
import Publish from "@/components/Publish";

export default function AddPost() {
  const { t } = useTranslation("common");
  const [form] = Form.useForm();
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("draft");

  const onFinish = async (values: Post) => {
    const slug = values.title?.trim().replace(/\s+/g, "-").toLowerCase() || "";
    const categoryString = Array.isArray(categories)
      ? categories.join(",")
      : "";
    const dataPayload: Post = {
      title: values.title,
      content: values.content,
      status: status,
    };

    try {
      await createPost(dataPayload);
      toast.success(t("Post added successfully!"));
      form.resetFields();
      setUploadedImage("");
    } catch {
      toast.error(t("Failed to add post. Please try again."));
    }
  };

  return (
    <div className="min-h-[85vh] bg-white flex flex-col items-center justify-start rounded-lg shadow-sm gap-4 px-4 pt-10">
      <div className="w-full">
        <h1 className="ml-[10px] text-3xl font-bold pb-6">
          {t("Create Post")}
        </h1>

        <div className="flex justify-between w-full">
          <PostForm
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
    </div>
  );
}
