"use client";

import { Training } from "@/constant/types";
import { CameraOutlined, EditOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  FormInstance,
  Input,
  Modal,
  Select,
  DatePicker,
} from "antd";
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
    .replace(/[.,:\"'<>?`!@#$%^&*();/\\]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
};

export interface TrainingFormProps {
  form: FormInstance;
  onFinish: (values: Training) => void;
  uploadedImages: string;
  setUploadedImages: React.Dispatch<React.SetStateAction<string>>;
}

const TrainingForm: React.FC<TrainingFormProps> = ({
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
      setUploadedImages(media);
    } else if (modalAction === "addToContent") {
      const currentContent = form.getFieldValue("description") || "";
      const updatedContent = `${currentContent}<img src="${media}" alt="Selected Media" />`;
      form.setFieldsValue({ description: updatedContent });
    }
  };

  const handleTitleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const titleValue = e.target.value.trim();
    if (!titleValue) {
      form.setFields([{ name: "slug", errors: [] }]);
      return;
    }
    const slugValue = removeAccents(titleValue);
    form.setFieldsValue({ slug: slugValue });
    form.setFields([{ name: "slug", errors: [] }]);
  };

  return (
    <Form
      form={form}
      className="flex flex-col w-full"
      name="trainingForm"
      initialValues={{ remember: true }}
      onFinish={handleSubmit}
      autoComplete="off"
      layout="vertical"
    >
      <div className="border border-[#d9d9d9] p-4 rounded-md mb-4">
        {/* Title */}
        <Form.Item
          name="title"
          label={t("Training Title")}
          rules={[
            { required: true, message: t("Please enter training title!") },
          ]}
          className="mt-4"
        >
          <Input
            placeholder={t("Training Title")}
            className="custom-input"
            onBlur={handleTitleBlur}
          />
        </Form.Item>

        {/* Slug */}
        {/* <div className="flex w-full">
          <Form.Item
            className="w-1/2 mr-4"
            name="slug"
            label={t("Slug")}
            extra={
              <span className="text-sm">
                {t(
                  "May not need to be entered (automatically render by title)"
                )}
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
        </div> */}

        {/* Time */}
        <div className="flex gap-4">
          <Form.Item
            name={["location", "startTime"]}
            label={t("Start Time")}
            rules={[
              { required: true, message: t("Please select start time!") },
            ]}
            className="w-1/2"
          >
            <DatePicker className="w-full" showTime format="YYYY-MM-DD HH:mm" />
          </Form.Item>

          <Form.Item
            name={["location", "endTime"]}
            label={t("End Time")}
            rules={[{ required: true, message: t("Please select end time!") }]}
            className="w-1/2"
          >
            <DatePicker className="w-full" showTime format="YYYY-MM-DD HH:mm" />
          </Form.Item>

          <Form.Item
            name={["location", "destination"]}
            label={t("Localtion")}
            rules={[{ required: true, message: t("Please enter location!") }]}
            className="mt-4"
          >
            <Input
              placeholder={t("location")}
              className="custom-input"
              onBlur={handleTitleBlur}
            />
          </Form.Item>
          <Form.Item
            name={"limitRegister"}
            label={t("Limit Register")}
            rules={[
              { required: true, message: t("Please enter limit register!") },
            ]}
            className="mt-4"
          >
            <Input
              type="number"
              min={1}
              placeholder={t("Limit Register")}
              className="custom-input"
            />
          </Form.Item>
        </div>

        {/* Content */}
        <Form.Item>
          <Button
            icon={<CameraOutlined />}
            onClick={() => handleOpenModal("addToContent")}
          >
            {t("Add media to description")}
          </Button>
        </Form.Item>

        <Form.Item name="description" label={t("Description")}>
          <CKEditorComponent
            value={form.getFieldValue("description")}
            onChange={(data: string) => {
              form.setFieldsValue({ description: data });
            }}
          />
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

export default TrainingForm;
