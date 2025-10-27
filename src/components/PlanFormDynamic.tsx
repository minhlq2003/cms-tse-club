"use client";

import React, { useEffect } from "react";
import { Input, DatePicker, Button, Table, TimePicker } from "antd";
import dayjs from "dayjs";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import DynamicTable from "./DynamicTable";
import {
  BlockTemplate,
  ColumnTemplate,
  FieldTemplate,
  Organizer,
} from "@/constant/types";
import Title from "antd/es/typography/Title";

const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface PlanFormDynamicProps {
  selectedCategories: string[]; // array of template ids
  templates: BlockTemplate[]; // templates list (id + title + block)
  planData: Record<string, any>; // keyed by template.id
  onChange?: (updater: any) => void;
  readonly?: boolean;
  organizers?: Organizer[];
}

export default function PlanFormDynamic({
  selectedCategories,
  templates,
  planData,
  onChange,
  readonly = false,
  organizers = [],
}: PlanFormDynamicProps) {
  const getTemplateById = (id: string) =>
    templates.find((t) => t.id === id) || null;

  const setValue = (blockId: string, key: string, val: any) => {
    if (readonly || !onChange) return;
    onChange((prev: any) => ({
      ...prev,
      [blockId]: {
        ...(prev?.[blockId] || {}),
        [key]: val,
      },
    }));
  };

  const handleAddRow = (blockId: string, field: string, base = {}) => {
    if (readonly || !onChange) return;
    onChange((prev: any) => {
      const list = prev?.[blockId]?.[field] || [];
      return {
        ...prev,
        [blockId]: {
          ...(prev?.[blockId] || {}),
          [field]: [...list, { key: Date.now().toString(), ...base }],
        },
      };
    });
  };

  const handleDeleteRow = (blockId: string, field: string, key: string) => {
    if (readonly || !onChange) return;
    const list = planData?.[blockId]?.[field] || [];
    const newList = list.filter((r: any) => r.key !== key);
    setValue(blockId, field, newList);
  };

  const handleRowChange = (
    blockId: string,
    field: string,
    key: string,
    column: string,
    value: any
  ) => {
    if (readonly || !onChange) return;
    const updated = planData?.[blockId]?.[field]?.map((r: any) =>
      r.key === key ? { ...r, [column]: value } : r
    );
    setValue(blockId, field, updated);
  };

  useEffect(() => {
    if (!organizers || organizers.length === 0 || !onChange) return;

    onChange((prev: any) => {
      const blockId = "basic_ban_to_chuc";
      const currentBlock = prev?.[blockId] || {};
      const currentList = currentBlock["Ban tổ chức"] || [];

      const mergedMap = new Map<string, any>();

      // thêm organizers mới hoặc cập nhật organizer cũ
      organizers.forEach((o) => {
        mergedMap.set(o.organizerId, {
          key: o.organizerId,
          organizerId: o.organizerId,
          roleContent: o.roleContent || "",
          fullName: o.fullName || "",
          title:
            currentList.find((r: any) => r.organizerId === o.organizerId)
              ?.title || "",
        });
      });

      // giữ lại các dòng tự thêm (chưa có organizerId)
      currentList
        .filter((r: any) => !r.organizerId)
        .forEach((r: any) => mergedMap.set(r.key, r));

      const mergedList = Array.from(mergedMap.values());

      return {
        ...prev,
        [blockId]: {
          ...currentBlock,
          ["Ban tổ chức"]: mergedList,
        },
      };
    });
  }, [organizers, onChange]);

  const renderField = (blockId: string, field: FieldTemplate) => {
    const key = field.label || field.id;
    const value = planData?.[blockId]?.[key];

    switch (field.type) {
      case "Text":
      case "Number":
        return (
          <Input
            placeholder={field.placeholder}
            value={value ?? ""}
            onChange={(e) => setValue(blockId, key, e.target.value)}
            disabled={readonly}
          />
        );

      case "TextArea":
        return (
          <TextArea
            rows={4}
            placeholder={field.placeholder}
            value={value ?? ""}
            onChange={(e) => setValue(blockId, key, e.target.value)}
            disabled={readonly}
          />
        );

      case "Date":
      case "DateTime":
        return (
          <DatePicker
            value={value ? dayjs(value) : undefined}
            showTime={field.type === "DateTime"}
            onChange={(d) => setValue(blockId, key, d ? d.toISOString() : "")}
            disabled={readonly}
          />
        );

      case "RangeDate":
      case "RangeDateTime":
        return (
          <RangePicker
            showTime
            value={
              Array.isArray(value) && value[0]
                ? [dayjs(value[0]), dayjs(value[1])]
                : undefined
            }
            onChange={(vals) => {
              if (!vals) return setValue(blockId, key, []);
              setValue(blockId, key, [
                vals[0]?.toISOString(),
                vals[1]?.toISOString(),
              ]);
            }}
            disabled={readonly}
          />
        );

      case "Table":
        return (
          <DynamicTable
            columnsTemplate={(field.columns || []) as ColumnTemplate[]}
            data={value || []}
            onChange={(newData) => setValue(blockId, key, newData)}
            readonly={readonly}
          />
        );

      default:
        return (
          <Input
            placeholder={field.placeholder}
            value={value ?? ""}
            onChange={(e) => setValue(blockId, key, e.target.value)}
            disabled={readonly}
          />
        );
    }
  };

  const renderBasicBlocks = (blockId: string) => {
    const data = planData[blockId] || {};

    if (blockId === "basic_thoi_gian") {
      return (
        <div className="space-y-2">
          <RangePicker
            showTime
            format="DD/MM/YYYY HH:mm"
            className="w-full !mb-2"
            value={
              data?.["Thời gian"]
                ? [dayjs(data["Thời gian"][0]), dayjs(data["Thời gian"][1])]
                : undefined
            }
            onChange={(val) =>
              setValue(blockId, "Thời gian", [
                val?.[0]?.toISOString(),
                val?.[1]?.toISOString(),
              ])
            }
            disabled={readonly}
          />
          <Input
            placeholder="Địa điểm tổ chức (VD: FPT Software HCM...)"
            value={data?.["Địa điểm"] || ""}
            onChange={(e) => setValue(blockId, "Địa điểm", e.target.value)}
            disabled={readonly}
          />
        </div>
      );
    }

    if (blockId === "basic_ban_to_chuc") {
      const rows = data?.["Ban tổ chức"] || [];
      const columns = [
        {
          title: "Vai trò",
          dataIndex: "roleContent",
          render: (text: any, record: any) =>
            readonly ? (
              text
            ) : (
              <Input
                value={text}
                onChange={(e) =>
                  handleRowChange(
                    blockId,
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
          render: (text: any, record: any) =>
            readonly ? (
              text
            ) : (
              <Input
                value={text}
                onChange={(e) =>
                  handleRowChange(
                    blockId,
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
          render: (text: any, record: any) =>
            readonly ? (
              text
            ) : (
              <Input
                value={text}
                onChange={(e) =>
                  handleRowChange(
                    blockId,
                    "Ban tổ chức",
                    record.key,
                    "title",
                    e.target.value
                  )
                }
              />
            ),
        },
        ...(readonly
          ? []
          : [
              {
                title: "",
                width: 50,
                render: (_: any, record: any) => (
                  <Button
                    icon={<DeleteOutlined />}
                    type="text"
                    danger
                    onClick={() =>
                      handleDeleteRow(blockId, "Ban tổ chức", record.key)
                    }
                  />
                ),
              },
            ]),
      ];

      return (
        <div>
          <Table
            bordered
            pagination={false}
            size="small"
            dataSource={rows}
            columns={columns}
            rowKey="key"
          />
          {!readonly && (
            <Button
              icon={<PlusOutlined />}
              onClick={() => handleAddRow(blockId, "Ban tổ chức")}
              className="mt-2"
            >
              Thêm dòng
            </Button>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {selectedCategories?.map((id) => {
        const t = getTemplateById(id);
        if (!t) return null;

        // Nếu là block cơ bản => render đặc biệt
        if (["basic_thoi_gian", "basic_ban_to_chuc"].includes(id)) {
          return (
            <div
              key={t.id}
              className="border border-gray-300 p-4 rounded-lg bg-white shadow-sm"
            >
              <Title level={5}>{t.title}</Title>
              {renderBasicBlocks(id)}
            </div>
          );
        }

        // Các block còn lại => render từ template JSON
        let fields: FieldTemplate[] = [];
        try {
          fields = JSON.parse(t.block || "[]");
        } catch {
          console.error("Invalid block JSON:", t.block);
        }

        return (
          <div
            key={t.id}
            className="border border-gray-300 p-4 rounded-lg bg-white shadow-sm"
          >
            <Title level={5}>{t.title}</Title>
            <div className="space-y-3">
              {fields.map((f) => (
                <div key={f.id}>
                  <div className="mb-2 font-medium">{f.label || ""}</div>
                  {renderField(t.id, f)}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {selectedCategories?.length === 0 && (
        <div className="text-gray-400 italic text-center py-4">
          Không có block nào được chọn.
        </div>
      )}
    </div>
  );
}
