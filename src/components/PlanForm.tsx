"use client";

import {
  Input,
  Typography,
  DatePicker,
  Button,
  Table,
  Space,
  TimePicker,
  FormInstance,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import React, { useEffect } from "react";
import dayjs from "dayjs";
import { Organizer } from "@/constant/types";

const { TextArea } = Input;
const { Title } = Typography;
const { RangePicker } = DatePicker;

interface PlanFormProps {
  selectedCategories: string[];
  planData: Record<string, any>;
  onChange: (
    data: Record<string, any> | ((prev: any) => Record<string, any>)
  ) => void;
  order: string[];
  form: FormInstance;
  organizers?: Organizer[];
}

export default function PlanForm({
  selectedCategories,
  planData,
  onChange,
  order,
  form,
  organizers,
}: PlanFormProps) {
  const handleChange = (category: string, key: string, value: any) => {
    onChange((prev: any) => {
      const updatedCategory = {
        ...(prev[category] || {}),
        [key]: value,
      };

      console.log("Updated Category:", updatedCategory);

      return { ...prev, [category]: updatedCategory };
    });
  };

  const handleAddRow = (
    category: string,
    field: string,
    base: Record<string, any> = {}
  ) => {
    onChange((prev: any) => {
      const currentCategory = prev[category] || {};
      const currentList = currentCategory[field] || [];

      const newList = [...currentList, { key: Date.now().toString(), ...base }];
      console.log("Current List:", currentList);

      console.log("New List:", newList);

      return {
        ...prev,
        [category]: { ...currentCategory, [field]: newList },
      };
    });
  };

  const handleDeleteRow = (category: string, field: string, key: string) => {
    const newList = planData[category]?.[field]?.filter(
      (r: any) => r.key !== key
    );
    handleChange(category, field, newList);
  };

  const handleRowChange = (
    category: string,
    field: string,
    key: string,
    column: string,
    value: any
  ) => {
    const updated = planData[category]?.[field]?.map((r: any) =>
      r.key === key ? { ...r, [column]: value } : r
    );
    console.log("Updated Rows:", updated);

    handleChange(category, field, updated);
  };

  useEffect(() => {
    if (!organizers || organizers.length === 0) return;

    onChange((prev: any) => {
      const current = prev["Ban tổ chức chương trình"] || {};
      const currentList = current["Ban tổ chức"] || [];

      // Tạo map để tránh trùng organizerId
      const mergedMap = new Map<string, any>();

      // 1. Thêm các organizer hiện có từ props
      organizers.forEach((o) => {
        mergedMap.set(o.organizerId, {
          key: o.organizerId,
          organizerId: o.organizerId,
          roleContent: o.roleContent,
          fullName: o.fullName || "",
          title:
            currentList.find((r: any) => r.organizerId === o.organizerId)
              ?.title || "",
        });
      });

      // 2. Giữ lại các dòng thêm thủ công (không có organizerId)
      currentList
        .filter((r: any) => !r.organizerId)
        .forEach((r: any) => {
          mergedMap.set(r.key, r);
        });

      const mergedList = Array.from(mergedMap.values());

      return {
        ...prev,
        ["Ban tổ chức chương trình"]: {
          ...current,
          ["Ban tổ chức"]: mergedList,
        },
      };
    });
  }, [organizers, onChange]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
      <Title level={4}>Chi tiết kế hoạch</Title>

      {order
        .filter((category) => selectedCategories.includes(category))
        .map((category) => (
          <div
            key={category}
            className="border border-gray-300 p-4 rounded-lg space-y-3"
          >
            <Title level={5} className="!mb-2">
              {category}
            </Title>

            {category === "Mục đích" && (
              <TextArea
                rows={4}
                placeholder="Nhập mục đích chương trình..."
                value={planData[category]?.["Nội dung"] || ""}
                onChange={(e) =>
                  handleChange(category, "Nội dung", e.target.value)
                }
              />
            )}

            {/* ===== THỜI GIAN & ĐỊA ĐIỂM ===== */}
            {category === "Thời gian & địa điểm" && (
              <div className="space-y-2">
                <RangePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  className="w-full"
                  value={
                    planData[category]?.["Thời gian"]
                      ? [
                          dayjs(planData[category]?.["Thời gian"][0]),
                          dayjs(planData[category]?.["Thời gian"][1]),
                        ]
                      : undefined
                  }
                  onChange={(val) => {
                    handleChange(category, "Thời gian", [
                      val?.[0]?.toISOString(),
                      val?.[1]?.toISOString(),
                    ]);
                  }}
                />
                <Input
                  placeholder="Địa điểm tổ chức (VD: FPT Software HCM...)"
                  value={planData[category]?.["Địa điểm"] || ""}
                  onChange={(e) => {
                    handleChange(category, "Địa điểm", e.target.value);
                  }}
                />
              </div>
            )}
            {/* ===== BAN TỔ CHỨC CHƯƠNG TRÌNH ===== */}
            {category === "Ban tổ chức chương trình" && (
              <div>
                <Table
                  bordered
                  pagination={false}
                  size="small"
                  dataSource={planData[category]?.["Ban tổ chức"] || []}
                  rowKey="key"
                  columns={[
                    {
                      title: "Vai trò",
                      dataIndex: "roleContent",
                      render: (text, record: any) => (
                        <Input
                          value={text}
                          onChange={(e) =>
                            handleRowChange(
                              category,
                              "Ban tổ chức",
                              record.key,
                              "roleContent",
                              e.target.value
                            )
                          }
                        />
                      ),
                    },
                    {
                      title: "Họ và tên",
                      dataIndex: "fullName",
                      render: (text, record: any) => (
                        <Input
                          value={text}
                          onChange={(e) =>
                            handleRowChange(
                              category,
                              "Ban tổ chức",
                              record.key,
                              "fullName",
                              e.target.value
                            )
                          }
                        />
                      ),
                    },
                    {
                      title: "Chức vụ",
                      dataIndex: "title",
                      render: (text, record: any) => (
                        <Input
                          value={text}
                          onChange={(e) =>
                            handleRowChange(
                              category,
                              "Ban tổ chức",
                              record.key,
                              "title",
                              e.target.value
                            )
                          }
                        />
                      ),
                    },
                    {
                      title: "",
                      width: 50,
                      render: (_: any, record: any) => (
                        <Button
                          icon={<DeleteOutlined />}
                          type="text"
                          danger
                          onClick={() =>
                            handleDeleteRow(category, "Ban tổ chức", record.key)
                          }
                        />
                      ),
                    },
                  ]}
                />
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => handleAddRow(category, "Ban tổ chức")}
                  className="mt-2"
                >
                  Thêm dòng
                </Button>
              </div>
            )}

            {category === "Kế hoạch di chuyển" && (
              <div className="space-y-2">
                <Input
                  placeholder="Phương tiện"
                  value={planData[category]?.["Phương tiện"] || ""}
                  onChange={(e) =>
                    handleChange(category, "Phương tiện", e.target.value)
                  }
                />
                <TimePicker
                  className="w-full"
                  format="HH:mm"
                  placeholder="Giờ khởi hành"
                  value={
                    planData[category]?.["Giờ khởi hành"]
                      ? dayjs(planData[category]?.["Giờ khởi hành"], "HH:mm")
                      : null
                  }
                  onChange={(time) =>
                    handleChange(
                      category,
                      "Giờ khởi hành",
                      time ? time.format("HH:mm") : ""
                    )
                  }
                />
                <Input
                  placeholder="Địa điểm tập trung"
                  value={planData[category]?.["Địa điểm tập trung"] || ""}
                  onChange={(e) =>
                    handleChange(category, "Địa điểm tập trung", e.target.value)
                  }
                />
              </div>
            )}

            {category === "Nội dung chương trình" && (
              <div>
                <Table
                  bordered
                  pagination={false}
                  size="small"
                  dataSource={planData[category]?.["Chương trình"] || []}
                  rowKey="key"
                  columns={[
                    {
                      title: "Thời gian",
                      dataIndex: "Thời_gian",
                      width: "30%",
                      render: (text, record: any) => (
                        <TimePicker
                          className="w-full"
                          format="HH:mm"
                          value={text ? dayjs(text, "HH:mm") : undefined}
                          onChange={(val) =>
                            handleRowChange(
                              category,
                              "Chương trình",
                              record.key,
                              "Thời_gian",
                              val ? val.format("HH:mm") : ""
                            )
                          }
                        />
                      ),
                    },
                    {
                      title: "Hoạt động",
                      dataIndex: "Hoạt_động",
                      render: (text, record: any) => (
                        <Input
                          value={text}
                          onChange={(e) =>
                            handleRowChange(
                              category,
                              "Chương trình",
                              record.key,
                              "Hoạt_động",
                              e.target.value
                            )
                          }
                        />
                      ),
                    },
                    {
                      title: "",
                      width: 50,
                      render: (_: any, record: any) => (
                        <Button
                          icon={<DeleteOutlined />}
                          type="text"
                          danger
                          onClick={() =>
                            handleDeleteRow(
                              category,
                              "Chương trình",
                              record.key
                            )
                          }
                        />
                      ),
                    },
                  ]}
                />
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => handleAddRow(category, "Chương trình")}
                  className="mt-2"
                >
                  Thêm dòng
                </Button>
              </div>
            )}

            {category === "Tiến độ thực hiện chương trình" && (
              <div>
                <Table
                  bordered
                  pagination={false}
                  size="small"
                  dataSource={planData[category]?.["Tiến độ"] || []}
                  rowKey="key"
                  columns={[
                    {
                      title: "Thời gian",
                      dataIndex: "Thời_gian",
                      width: "30%",
                      render: (text, record: any) => (
                        <DatePicker
                          className="w-full"
                          format="DD/MM/YYYY"
                          value={text ? dayjs(text, "YYYY-MM-DD") : undefined}
                          onChange={(val) =>
                            handleRowChange(
                              category,
                              "Tiến độ",
                              record.key,
                              "Thời_gian",
                              val ? val.format("YYYY-MM-DD") : ""
                            )
                          }
                        />
                      ),
                    },
                    {
                      title: "Nội dung",
                      dataIndex: "Nội_dung",
                      render: (text, record: any) => (
                        <Input
                          value={text}
                          onChange={(e) =>
                            handleRowChange(
                              category,
                              "Tiến độ",
                              record.key,
                              "Nội_dung",
                              e.target.value
                            )
                          }
                        />
                      ),
                    },
                    {
                      title: "Người thực hiện",
                      dataIndex: "Người_thực_hiện",
                      render: (text, record: any) => (
                        <Input
                          value={text}
                          onChange={(e) =>
                            handleRowChange(
                              category,
                              "Tiến độ",
                              record.key,
                              "Người_thực_hiện",
                              e.target.value
                            )
                          }
                        />
                      ),
                    },
                    {
                      title: "",
                      width: 50,
                      render: (_: any, record: any) => (
                        <Button
                          icon={<DeleteOutlined />}
                          type="text"
                          danger
                          onClick={() =>
                            handleDeleteRow(category, "Tiến độ", record.key)
                          }
                        />
                      ),
                    },
                  ]}
                />
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => handleAddRow(category, "Tiến độ")}
                  className="mt-2"
                >
                  Thêm dòng
                </Button>
              </div>
            )}

            {/* ===== KINH PHÍ ===== */}
            {category === "Kinh phí thực hiện" && (
              <div>
                <Table
                  bordered
                  pagination={false}
                  size="small"
                  dataSource={planData[category]?.["Kinh phí"] || []}
                  rowKey="key"
                  columns={[
                    {
                      title: "STT",
                      render: (_: any, __: any, index: number) => index + 1,
                    },
                    {
                      title: "Nội dung",
                      dataIndex: "Nội_dung",
                      render: (text, record: any) => (
                        <Input
                          value={text}
                          onChange={(e) =>
                            handleRowChange(
                              category,
                              "Kinh phí",
                              record.key,
                              "Nội_dung",
                              e.target.value
                            )
                          }
                        />
                      ),
                    },
                    {
                      title: "Đơn vị",
                      dataIndex: "Đơn_vị",
                      render: (text, record: any) => (
                        <Input
                          value={text}
                          onChange={(e) =>
                            handleRowChange(
                              category,
                              "Kinh phí",
                              record.key,
                              "Đơn_vị",
                              e.target.value
                            )
                          }
                        />
                      ),
                    },
                    {
                      title: "Thành tiền",
                      dataIndex: "Thành_tiền",
                      render: (text, record: any) => (
                        <Input
                          value={text}
                          onChange={(e) =>
                            handleRowChange(
                              category,
                              "Kinh phí",
                              record.key,
                              "Thành_tiền",
                              e.target.value
                            )
                          }
                        />
                      ),
                    },
                    {
                      title: "",
                      width: 50,
                      render: (_: any, record: any) => (
                        <Button
                          icon={<DeleteOutlined />}
                          type="text"
                          danger
                          onClick={() =>
                            handleDeleteRow(category, "Kinh phí", record.key)
                          }
                        />
                      ),
                    },
                  ]}
                />
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => handleAddRow(category, "Kinh phí")}
                  className="mt-2"
                >
                  Thêm dòng
                </Button>
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
