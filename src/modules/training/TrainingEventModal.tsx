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
  Transfer,
} from "antd";
import dayjs from "dayjs";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { Event, Member, Organizer } from "@/constant/types";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const { RangePicker } = DatePicker;

interface Props {
  open: boolean;
  onClose: () => void;
  onAddLesson: (lesson: Event) => void;
  mentors?: Member[];
}

export default function TrainingEventModal({
  open,
  onClose,
  onAddLesson,
  mentors = [],
}: Props) {
  const { t } = useTranslation("common");
  const [formLesson] = Form.useForm();
  const [formSchedule] = Form.useForm();

  const [selectedOrganizersLesson, setSelectedOrganizersLesson] = useState<
    string[]
  >([]);
  const [selectedOrganizersSchedule, setSelectedOrganizersSchedule] = useState<
    string[]
  >([]);

  const daysOfWeek = [
    { label: t("Sunday"), value: 0 },
    { label: t("Monday"), value: 1 },
    { label: t("Tuesday"), value: 2 },
    { label: t("Wednesday"), value: 3 },
    { label: t("Thursday"), value: 4 },
    { label: t("Friday"), value: 5 },
    { label: t("Saturday"), value: 6 },
  ];

  const createOrganizers = (mentorIds: string[]): Organizer[] => {
    return mentorIds
      .map((id) => {
        const mentor = mentors.find((m) => m.id === id);
        if (!mentor) return null;
        return {
          organizerId: mentor.id,
          fullName: mentor.fullName,
          username: mentor.username,
          email: mentor.email,
          roles: ["MODIFY", "CHECK_IN"],
          roleContent: "Mentor",
        };
      })
      .filter(Boolean) as Organizer[];
  };

  const handleAddLesson = async () => {
    try {
      const values = await formLesson.validateFields();
      const newLesson: Event = {
        id: crypto.randomUUID(),
        title: values.title,
        location: {
          destination: values.destination,
          startTime: values.time[0].toISOString(),
          endTime: values.time[1].toISOString(),
        },
        multiple: values.multiple || 1,
        organizers: createOrganizers(selectedOrganizersLesson),
      };
      onAddLesson(newLesson);
      formLesson.resetFields();
      setSelectedOrganizersLesson([]);
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

      const organizers = createOrganizers(selectedOrganizersSchedule);

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
              title: `${values.title} - ${current.format(
                "DD/MM/YYYY"
              )} ${slot.time[0].format("HH:mm")}`,
              location: {
                destination: values.destination,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
              },
              organizers: organizers,
            });
          }
        });
        current = current.add(1, "day");
      }

      lessons.forEach((l) => onAddLesson(l));
      formSchedule.resetFields();
      setSelectedOrganizersSchedule([]);
      onClose();
    } catch (err) {
      console.log(err);
    }
  };

  const mentorDataSource = mentors.map((m) => ({
    key: m.id,
    title: m.fullName || m.username,
    description: m.email,
  }));

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={t("Add Lesson / Schedule")}
      footer={null}
      width="95%"
      style={{ maxWidth: 900, top: 20 }}
      destroyOnClose
      className="training-event-modal"
    >
      <Tabs
        defaultActiveKey="lesson"
        items={[
          {
            key: "lesson",
            label: t("Add Lesson"),
            children: (
              <Form
                form={formLesson}
                layout="vertical"
                initialValues={{}}
                onFinish={handleAddLesson}
                className="space-y-4"
              >
                <Form.Item
                  name="title"
                  label={t("Title")}
                  rules={[{ required: true, message: t("Please enter title") }]}
                >
                  <Input placeholder={t("Lesson title")} />
                </Form.Item>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    name="destination"
                    label={t("Destination")}
                    rules={[
                      {
                        required: true,
                        message: t("Please enter destination"),
                      },
                    ]}
                  >
                    <Input placeholder={t("Location / Room")} />
                  </Form.Item>

                  <Form.Item
                    name="time"
                    label={t("Start & End Time")}
                    rules={[
                      { required: true, message: t("Please select time") },
                    ]}
                  >
                    <DatePicker.RangePicker
                      showTime
                      format="DD/MM/YYYY HH:mm"
                      className="w-full"
                      placeholder={[t("Start time"), t("End time")]}
                    />
                  </Form.Item>
                  <Form.Item
                    name="multiple"
                    label={t("Multiple")}
                    rules={[{ required: false }]}
                  >
                    <Input placeholder={t("Multiple")} type="number" />
                  </Form.Item>
                </div>

                {mentors.length > 0 && (
                  <Form.Item label={t("Organizers (Mentors)")}>
                    <div className="hidden md:block">
                      <Transfer
                        dataSource={mentorDataSource}
                        targetKeys={selectedOrganizersLesson}
                        onChange={(targetKeys) =>
                          setSelectedOrganizersLesson(targetKeys as string[])
                        }
                        render={(item) => item.title}
                        listStyle={{ width: "45%", height: 300 }}
                        titles={[
                          t("Available Mentors"),
                          t("Selected Organizers"),
                        ]}
                        locale={{
                          itemUnit: t("item"),
                          itemsUnit: t("items"),
                          searchPlaceholder: t("Search"),
                          notFoundContent: t("No data"),
                        }}
                        showSearch
                      />
                    </div>

                    {/* Mobile: Use Select instead of Transfer */}
                    <div className="block md:hidden">
                      <Select
                        mode="multiple"
                        style={{ width: "100%" }}
                        placeholder={t("Select organizers")}
                        value={selectedOrganizersLesson}
                        onChange={(values) =>
                          setSelectedOrganizersLesson(values)
                        }
                        options={mentorDataSource.map((m) => ({
                          label: m.title,
                          value: m.key,
                        }))}
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      />
                    </div>
                  </Form.Item>
                )}

                <Button type="primary" htmlType="submit" block>
                  {t("Add Lesson")}
                </Button>
              </Form>
            ),
          },
          {
            key: "schedule",
            label: t("Add Schedule"),
            children: (
              <Form
                form={formSchedule}
                layout="vertical"
                onFinish={handleAddSchedule}
                className="space-y-4"
              >
                <Form.Item
                  name="title"
                  label={t("Title")}
                  rules={[{ required: true, message: t("Please enter title") }]}
                >
                  <Input placeholder={t("Title")} />
                </Form.Item>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    name="destination"
                    label={t("Destination")}
                    rules={[
                      {
                        required: true,
                        message: t("Please enter destination"),
                      },
                    ]}
                  >
                    <Input placeholder={t("Location / Room")} />
                  </Form.Item>

                  <Form.Item
                    name="dateRange"
                    label={t("Date Range")}
                    rules={[
                      {
                        required: true,
                        message: t("Please select date range"),
                      },
                    ]}
                  >
                    <RangePicker
                      className="w-full"
                      format="DD/MM/YYYY"
                      placeholder={[t("Start date"), t("End date")]}
                    />
                  </Form.Item>
                </div>

                <Form.Item
                  name="multiple"
                  label={t("Multiple")}
                  rules={[{ required: false }]}
                >
                  <Input placeholder={t("Multiple")} type="number" />
                </Form.Item>

                <Form.List
                  name="timeSlots"
                  rules={[
                    {
                      validator: async (_, value) => {
                        if (!value || value.length === 0) {
                          return Promise.reject(
                            new Error(t("At least one time slot is required"))
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
                          className="flex w-full flex-col sm:flex-row sm:justify-between mb-2 gap-2"
                        >
                          <Form.Item
                            {...restField}
                            name={[name, "day"]}
                            rules={[
                              { required: true, message: t("Select day") },
                            ]}
                            className="mb-0 w-full sm:w-auto flex-1"
                          >
                            <Select
                              placeholder={t("Day of week")}
                              className="w-full sm:w-32"
                              options={daysOfWeek}
                            />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, "time"]}
                            rules={[
                              { required: true, message: t("Select time") },
                            ]}
                            className="mb-0 w-full sm:w-auto flex-1"
                          >
                            <TimePicker.RangePicker
                              format="HH:mm"
                              className="w-full"
                              placeholder={[t("Start"), t("End")]}
                            />
                          </Form.Item>

                          <MinusCircleOutlined
                            onClick={() => remove(name)}
                            className="cursor-pointer text-red-500 text-lg"
                          />
                        </Space>
                      ))}
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        {t("Add Time Slot")}
                      </Button>
                    </>
                  )}
                </Form.List>

                {mentors.length > 0 && (
                  <Form.Item label={t("Organizers (Mentors)")}>
                    <div className="hidden md:block">
                      <Transfer
                        dataSource={mentorDataSource}
                        targetKeys={selectedOrganizersSchedule}
                        onChange={(targetKeys) =>
                          setSelectedOrganizersSchedule(targetKeys as string[])
                        }
                        render={(item) => item.title}
                        listStyle={{ width: "45%", height: 300 }}
                        titles={[
                          t("Available Mentors"),
                          t("Selected Organizers"),
                        ]}
                        locale={{
                          itemUnit: t("item"),
                          itemsUnit: t("items"),
                          searchPlaceholder: t("Search"),
                          notFoundContent: t("No data"),
                        }}
                        showSearch
                      />
                    </div>

                    {/* Mobile: Use Select instead of Transfer */}
                    <div className="block md:hidden">
                      <Select
                        mode="multiple"
                        style={{ width: "100%" }}
                        placeholder={t("Select organizers")}
                        value={selectedOrganizersSchedule}
                        onChange={(values) =>
                          setSelectedOrganizersSchedule(values)
                        }
                        options={mentorDataSource.map((m) => ({
                          label: m.title,
                          value: m.key,
                        }))}
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      />
                    </div>

                    <div className="text-sm text-gray-500 mt-2">
                      {t(
                        "These organizers will be added to all generated lessons"
                      )}
                    </div>
                  </Form.Item>
                )}

                <Button type="primary" htmlType="submit" block>
                  {t("Generate Lessons")}
                </Button>
              </Form>
            ),
          },
        ]}
      />
    </Modal>
  );
}
