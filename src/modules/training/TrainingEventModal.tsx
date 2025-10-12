"use client";

import {
  Modal,
  Tabs,
  Form,
  Input,
  DatePicker,
  Button,
  Select,
  Space,
  TimePicker,
} from "antd";
import dayjs from "dayjs";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { Event } from "@/constant/types";
import { useState } from "react";

const { RangePicker } = DatePicker;
const daysOfWeek = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onAddLesson: (lesson: Event) => void;
}

export default function TrainingEventModal({
  open,
  onClose,
  onAddLesson,
}: Props) {
  const [formLesson] = Form.useForm();
  const [formSchedule] = Form.useForm();

  const handleAddLesson = async () => {
    try {
      const values = await formLesson.validateFields();
      const newLesson: Event = {
        id: crypto.randomUUID(),
        title: values.title,
        description: values.description || "",
        location: {
          destination: values.destination,
          startTime: values.time[0].toISOString(),
          endTime: values.time[1].toISOString(),
        },
        organizers: [],
      };
      onAddLesson(newLesson);
      formLesson.resetFields();
      onClose();
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddSchedule = async () => {
    try {
      const values = await formSchedule.validateFields();
      const [startDate, endDate] = values.dateRange;

      let current = startDate.startOf("day");
      const lessons: Event[] = [];

      while (current.isBefore(endDate.add(1, "day"), "day")) {
        values.timeSlots.forEach((slot: any) => {
          if (current.day() === slot.day) {
            const startTime = current
              .hour(slot.time[0].hour())
              .minute(slot.time[0].minute());
            const endTime = current
              .hour(slot.time[1].hour())
              .minute(slot.time[1].minute());

            lessons.push({
              title: `${values.title} ${current.format(
                "YYYY-MM-DD"
              )} ${slot.time[0].format("HH:mm")}`,
              description: values.description || "",
              location: {
                destination: values.destination,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
              },
              organizers: [],
            });
          }
        });
        current = current.add(1, "day");
      }

      lessons.forEach((l) => onAddLesson(l));
      formSchedule.resetFields();
      onClose();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Add Lesson / Schedule"
      footer={null}
      width={600}
      destroyOnClose
    >
      <Tabs
        defaultActiveKey="lesson"
        items={[
          {
            key: "lesson",
            label: "Add Lesson",
            children: (
              <Form
                form={formLesson}
                layout="vertical"
                initialValues={{}}
                onFinish={handleAddLesson}
              >
                <Form.Item
                  name="title"
                  label="Title"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Lesson title" />
                </Form.Item>

                <Form.Item name="description" label="Description">
                  <Input.TextArea rows={3} placeholder="Optional description" />
                </Form.Item>

                <Form.Item
                  name="destination"
                  label="Destination"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Location / Room" />
                </Form.Item>

                <Form.Item
                  name="time"
                  label="Start & End Time"
                  rules={[{ required: true }]}
                >
                  <DatePicker.RangePicker showTime format="YYYY-MM-DD HH:mm" />
                </Form.Item>

                <Button type="primary" htmlType="submit" block>
                  Add Lesson
                </Button>
              </Form>
            ),
          },
          {
            key: "schedule",
            label: "Add Schedule",
            children: (
              <Form
                form={formSchedule}
                layout="vertical"
                onFinish={handleAddSchedule}
              >
                <Form.Item
                  name="title"
                  label="Title"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Title" />
                </Form.Item>
                <Form.Item name="description" label="Description">
                  <Input.TextArea rows={3} placeholder="Optional description" />
                </Form.Item>

                <Form.Item
                  name="destination"
                  label="Destination"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Location / Room" />
                </Form.Item>

                <Form.Item
                  name="dateRange"
                  label="Date Range"
                  rules={[{ required: true }]}
                >
                  <RangePicker />
                </Form.Item>

                <Form.List
                  name="timeSlots"
                  rules={[
                    {
                      validator: async (_, value) => {
                        if (!value || value.length === 0) {
                          return Promise.reject(
                            new Error("At least one time slot is required")
                          );
                        }
                      },
                    },
                  ]}
                >
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Space
                          key={key}
                          align="baseline"
                          className="flex w-full justify-between mb-2"
                        >
                          <Form.Item
                            {...restField}
                            name={[name, "day"]}
                            rules={[{ required: true }]}
                          >
                            <Select
                              placeholder="Day of week"
                              style={{ width: 130 }}
                              options={daysOfWeek}
                            />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, "time"]}
                            rules={[{ required: true }]}
                          >
                            <TimePicker.RangePicker format="HH:mm" />
                          </Form.Item>

                          <MinusCircleOutlined
                            onClick={() => remove(name)}
                            className="cursor-pointer text-red-500"
                          />
                        </Space>
                      ))}
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Add Time Slot
                      </Button>
                    </>
                  )}
                </Form.List>

                <Button type="primary" htmlType="submit" block>
                  Generate Lessons
                </Button>
              </Form>
            ),
          },
        ]}
      />
    </Modal>
  );
}
