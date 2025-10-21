"use client";

import { Event } from "@/constant/types";
import { Form, FormInstance, Input, Select, Checkbox } from "antd";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export interface EventFormProps {
  form: FormInstance;
  onFinish: (values: Event) => void;
  uploadedImages: string;
  setUploadedImages: React.Dispatch<React.SetStateAction<string>>;
}

const EventForm: React.FC<EventFormProps> = ({
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

  const handleSubmit = () => {
    const formData = form.getFieldsValue();
    onFinish(formData);
  };

  return (
    <Form
      form={form}
      className="flex flex-col w-full"
      name="eventForm"
      onFinish={handleSubmit}
      layout="vertical"
      autoComplete="off"
    >
      <div className="border border-gray-300 p-2 md:p-4 rounded-md mb-4">
        <Form.Item
          name="title"
          label={t("Title")}
          rules={[{ required: true, message: t("Please enter event title!") }]}
        >
          <Input placeholder={t("Enter event title")} />
        </Form.Item>

        <div className="flex flex-col md:flex-row gap-0 md:gap-4">
          <Form.Item
            className="w-full md:w-1/3"
            name="category"
            label={t("Event Type")}
            rules={[
              { required: true, message: t("Please select Event Type!") },
            ]}
          >
            <Select
              placeholder={t("Select event type")}
              options={[
                { label: t("Seminar"), value: "SEMINAR" },
                { label: t("Contest"), value: "CONTEST" },
              ]}
            />
          </Form.Item>
          <Form.Item
            className="w-full md:w-1/4"
            name="multiple"
            label={t("Limit Attendees")}
            rules={[{ required: true, message: t("Please enter number!") }]}
          >
            <Input type="number" min={1} />
          </Form.Item>
          <Form.Item name="allowedArray" label={t("Allowed Participants")}>
            <Checkbox.Group
              onChange={(checkedValues: number[]) => {
                const total = checkedValues.reduce((acc, val) => acc + val, 0);
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
    </Form>
  );
};

export default EventForm;
