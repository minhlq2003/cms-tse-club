"use client";

import { Training } from "@/constant/types";
import { CameraOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, FormInstance, Input, Switch } from "antd";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ModalSelectMedia from "../media/pages/ModalSelectMedia";

const CKEditorComponent = dynamic(() => import("../../lib/ckeditor"), {
  ssr: false,
});

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

  const allowedOptions = [
    { label: "Sinh viên", value: 1 },
    { label: "Thành viên", value: 2 },
    { label: "Giảng viên", value: 4 },
    { label: "Nghiên cứu sinh", value: 8 },
  ];

  useEffect(() => {
    const allowedType = form.getFieldValue("allowedType") || 0;
    const selectedValues = allowedOptions
      .filter((opt) => (allowedType & opt.value) !== 0)
      .map((opt) => opt.value);
    form.setFieldsValue({ allowedArray: selectedValues });
  }, [form]);

  const isPublic = Form.useWatch("isPublic", form);

  useEffect(() => {
    if (isPublic) {
      form.setFieldsValue({ allowedArray: [], allowedType: 0 });
    }
  }, [isPublic, form]);

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
          <Input placeholder={t("Training Title")} className="custom-input" />
        </Form.Item>

        <div className="flex justify-between">
          <Form.Item
            name="limitRegister"
            label={t("Limit Register")}
            rules={[
              { required: true, message: t("Please enter limit register!") },
            ]}
            className="mt-4 w-1/3"
          >
            <Input
              type="number"
              min={1}
              placeholder={t("Limit Register")}
              className="custom-input"
            />
          </Form.Item>
          <div className="flex w-1/2">
            <Form.Item
              name="isPublic"
              label={t("Public Event")}
              valuePropName="checked"
              className="flex items-center md:mt-8 w-1/3"
            >
              <Switch checkedChildren={t("Yes")} unCheckedChildren={t("No")} />
            </Form.Item>
            <Form.Item
              name="allowedArray"
              label={t("Allowed Participants")}
              rules={[
                {
                  validator: (_, value) => {
                    const isPublicValue = form.getFieldValue("isPublic");
                    if (!isPublicValue && (!value || value.length === 0)) {
                      return Promise.reject(
                        new Error(
                          t("Please select at least one participant type!")
                        )
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Checkbox.Group
                disabled={isPublic}
                onChange={(checkedValues: number[]) => {
                  const total = checkedValues.reduce(
                    (acc, val) => acc + val,
                    0
                  );
                  form.setFieldsValue({ allowedType: total });
                }}
              >
                <div className="grid grid-cols-2 gap-2">
                  {allowedOptions.map((opt) => (
                    <Checkbox key={opt.value} value={opt.value}>
                      {t(opt.label)}
                    </Checkbox>
                  ))}
                </div>
              </Checkbox.Group>
            </Form.Item>
          </div>
        </div>
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
