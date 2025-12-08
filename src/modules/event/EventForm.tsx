"use client";

import { Event } from "@/constant/types";
import { Form, FormInstance, Input, Select, Checkbox, Switch } from "antd";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

export interface EventFormProps {
  form: FormInstance;
  onFinish: (values: Event) => void;
  event?: Event;
  uploadedImages: string;
  setUploadedImages: React.Dispatch<React.SetStateAction<string>>;
  disabled?: boolean;
}

const EventForm: React.FC<EventFormProps> = ({
  form,
  onFinish,
  uploadedImages,
  setUploadedImages,
  disabled = false,
  event,
}) => {

  console.log("Event in EventForm:", event);

  const { t } = useTranslation("common");

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
      disabled={disabled}
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
                { label: t("Other"), value: "SIMPLE" },
              ]}
            />
          </Form.Item>

          <Form.Item
            className="w-full md:w-1/4"
            name="limitRegister"
            label={t("Limit Attendees")}
            rules={[{ required: true, message: t("Please enter number!") }]}
          >
            <Input 
            disabled = {event && !event.single}
            type="number" min={1} />
          </Form.Item>

          <Form.Item
            className="w-full md:w-1/8"
            name="multiple"
            label={t("Multiple")}
            rules={[{ required: false, message: t("Please enter number!") }]}
          >
            <Input type="number" min={1} />
          </Form.Item>

          <Form.Item
            name="isPublic"
            label={t("Public Event")}
            valuePropName="checked"
            className="flex items-center md:mt-8"
          >
            <Switch 
              disabled = {event && !event.single}
              checkedChildren={t("Yes")} 
              unCheckedChildren={t("No")} />
          </Form.Item>
        </div>

        <Form.Item
          name="allowedArray"
          label={t("Allowed Participants")}
          rules={[
            {
              validator: (_, value) => {
                const isPublicValue = form.getFieldValue("isPublic");
                if (!isPublicValue && (!value || value.length === 0)) {
                  return Promise.reject(
                    new Error(t("Please select at least one participant type!"))
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Checkbox.Group
            disabled={isPublic || disabled || (event && !event.single)}
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
    </Form>
  );
};

export default EventForm;
