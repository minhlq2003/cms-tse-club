"use client";

import { Form, Spin } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Post } from "@/constant/types";
import { getPostById, updatePost } from "@/modules/services/postService";
import { useTranslation } from "react-i18next";
import PostForm from "@/modules/post/PostForm";
import FeaturedImage from "@/modules/post/FeaturedImage";
import Categories from "@/modules/post/Categories";
import { toast } from "sonner";
import Publish from "@/components/Publish";

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
  const [status, setStatus] = useState<string>("PENDING");
  const fetchPost = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const res = await getPostById(id);
        const data = res;
        if (data) {
          setPost(data);
          form.setFieldsValue(data);
          setUploadedImage(data.image || "");
          const categoriesArray = data.category
            ? data.category.split(",")?.map((cat: string) => cat.trim())
            : [];
          setCategories(categoriesArray);
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
      content: values.content,
      category: categoryString,
      status: values.status ? "draft" : "published",
      image: uploadedImage,
    };

    try {
      if (id) {
        await updatePost(id, dataPayload);
        toast.success(t("Post updated successfully!"));
        form.resetFields();
        router.push("/posts");
      } else {
        toast.error(t("Invalid post ID."));
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
      )}
    </div>
  );
};

export default EditPost;
