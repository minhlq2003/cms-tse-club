"use client";

import { Post } from "@/constant/types";
import { CameraOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Form, FormInstance, Input, Modal, Select } from "antd";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ModalSelectMedia from "../media/pages/ModalSelectMedia";

const CKEditorComponent = dynamic(() => import("../../lib/ckeditor"), {
  ssr: false,
});

const removeAccents = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[âÂ]/g, "a")
    .replace(/[êÊ]/g, "e")
    .replace(/[.,:"'<>?`!@#$%^&*();/\\]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
};

const isValidJson = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

export interface PostFormProps {
  form: FormInstance;
  onFinish: (values: Post) => void;
  uploadedImages: string;
  setUploadedImages: React.Dispatch<React.SetStateAction<string>>;
}
const PostForm: React.FC<PostFormProps> = ({
  form,
  onFinish,
  uploadedImages,
  setUploadedImages,
}) => {
  const { t } = useTranslation("common");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditableSlug, setIsEditableSlug] = useState(true);
  const [modalAction, setModalAction] = useState<
    "selectMedia" | "addToContent"
  >("selectMedia");

  const handleSubmit = () => {
    const formData = form.getFieldsValue();
    onFinish(formData);
  };

  const handleOpenModal = (action: "selectMedia" | "addToContent") => {
    setModalAction(action);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSelectMedia = (media: string) => {
    setIsModalOpen(false);

    if (modalAction === "selectMedia") {
      // Set the selected image to uploadedImages
      setUploadedImages(media);
    } else if (modalAction === "addToContent") {
      // Add the selected image to CKEditor content
      const currentContent = form.getFieldValue("content") || "";
      const updatedContent = `${currentContent}<img src="${media}" alt="Selected Media" />`;
      form.setFieldsValue({ content: updatedContent });
    }
  };

  const handleNameBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const nameValue = e.target.value.trim();
    if (!nameValue) {
      form.setFields([{ name: "slug", errors: [] }]);
      return;
    }

    const slugValue = removeAccents(nameValue);

    form.setFieldsValue({ slug: slugValue });
    form.setFields([{ name: "slug", errors: [] }]);
  };

  return (
    <Form
      form={form}
      className="flex flex-col w-full"
      name="basic"
      initialValues={{ remember: true }}
      onFinish={handleSubmit}
      autoComplete="off"
      layout="vertical"
    >
      <div className="border border-[#d9d9d9] p-4 rounded-md mb-4">
        <Form.Item
          name="title"
          label={t("Title")}
          rules={[{ required: true, message: t("Please enter article name!") }]}
          className="mt-4"
        >
          <Input
            placeholder={t("Title")}
            className="custom-input"
            onBlur={handleNameBlur}
          />
        </Form.Item>
        <div className="flex w-full">
          <Form.Item
            className="w-1/2 mr-4"
            name="slug"
            label={t("Slug")}
            extra={
              <span className="text-sm">
                {t("May not need to be entered (automatically render by name)")}
              </span>
            }
          >
            <Input
              disabled={isEditableSlug}
              placeholder={t("slug")}
              className="custom-input"
            />
          </Form.Item>
          <Button
            className="self-start mt-7"
            icon={<EditOutlined />}
            color={!isEditableSlug ? "primary" : "default"}
            variant="outlined"
            onClick={() => setIsEditableSlug(!isEditableSlug)}
          >
            {t("Edit")}
          </Button>
        </div>
        <Form.Item>
          <Button
            icon={<CameraOutlined />}
            onClick={() => handleOpenModal("addToContent")}
          >
            {t("Add media to content")}
          </Button>
        </Form.Item>

        <Form.Item name="content">
          <div className="">
            <CKEditorComponent
              value={form.getFieldValue("content")}
              onChange={(data: string) => {
                form.setFieldsValue({ content: data });
              }}
            />
          </div>
        </Form.Item>

        <Form.Item name="excerpt" label={t("Excerpt")}>
          <Input className="custom-input" />
        </Form.Item>
      </div>

      <p className="my-2 font-semibold text-lg">{t("SEO")}</p>

      <div className="flex flex-col p-4 border rounded-[10px] mb-4">
        <div className="flex flex-row w-full justify-between gap-10">
          <Form.Item
            name="meta_title"
            label={<p className="">{t("Meta Title")}</p>}
            className="w-1/2"
          >
            <Input className="custom-input" />
          </Form.Item>

          <Form.Item
            className="w-1/2"
            name="keywords"
            label={<p className="">{t("Meta Keywords")}</p>}
          >
            <Input className="custom-input" />
          </Form.Item>
        </div>

        <Form.Item
          name="meta_desc"
          className=""
          label={<p className="">{t("Meta Description")}</p>}
        >
          <Input.TextArea className="custom-input" rows={5} />
        </Form.Item>
      </div>

      <ModalSelectMedia
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelectMedia={handleSelectMedia}
      />
    </Form>
  );
};

export default PostForm;
