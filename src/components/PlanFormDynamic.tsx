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
import { BasicBlocks } from "@/constant/data";
import { toast } from "sonner";

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
  const basicIds = ["basic_muc_dich", "basic_noi_dung", "basic_tien_do"];
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

    const blockId = "basic_ban_to_chuc";
    const currentBlock = planData?.[blockId] || {};
    const currentList = currentBlock["Ban tổ chức"] || [];

    const mergedMap = new Map<string, any>();
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
    currentList
      .filter((r: any) => !r.organizerId)
      .forEach((r: any) => mergedMap.set(r.key, r));

    const mergedList = Array.from(mergedMap.values());

    // 🧠 So sánh để tránh update vô ích (và vòng lặp)
    const isEqual = JSON.stringify(currentList) === JSON.stringify(mergedList);

    if (!isEqual) {
      onChange((prev: any) => ({
        ...prev,
        [blockId]: {
          ...currentBlock,
          ["Ban tổ chức"]: mergedList,
        },
      }));
    }
  }, [organizers]);

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
      const handleTimeChange = (val: any) => {
        if (!val || !val[0] || !val[1]) {
          toast.warning("Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc!");
          return;
        }

        const now = dayjs();
        const start = dayjs(val[0]);

        if (start.isBefore(now, "minute")) {
          toast.error("Thời gian bắt đầu phải sau thời điểm hiện tại!");
          return;
        }

        setValue(blockId, "Thời gian", [
          val[0].toISOString(),
          val[1].toISOString(),
        ]);
      };

      const handleLocationChange = (e: any) => {
        const val = e.target.value;
        if (!val.trim()) {
          toast.warning("Vui lòng nhập địa điểm tổ chức!");
        }
        setValue(blockId, "Địa điểm", val);
      };

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
            onChange={handleTimeChange}
            disabled={readonly}
          />
          <Input
            placeholder="Địa điểm tổ chức (VD: FPT Software HCM...)"
            value={data?.["Địa điểm"] || ""}
            onChange={handleLocationChange}
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
        if (basicIds.includes(t.id)) {
          const matched = BasicBlocks.find((b) => b.id === t.id);
          if (matched) {
            try {
              fields = JSON.parse(matched.block || "[]");
            } catch {
              console.error("Invalid BasicBlock JSON:", matched.block);
            }
          }
        } else {
          // ⚙️ Nếu không phải basic block → lấy từ template JSON của t
          try {
            fields = JSON.parse(t.block || "[]");
          } catch {
            console.error("Invalid block JSON:", t.block);
          }
        }

        return (
          <div
            key={t.id}
            className="border border-gray-300 p-4 rounded-lg bg-white shadow-sm"
          >
            <Title level={5}>{t.title}</Title>
            <div className="space-y-3">
              {Array.isArray(fields) &&
                fields?.map((f) => (
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
