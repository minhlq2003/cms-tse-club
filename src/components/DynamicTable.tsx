import React from "react";
import { Table, Input, InputNumber, DatePicker, Button, Space } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { ColumnTemplate } from "@/constant/types";
import dayjs from "dayjs";

const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface DynamicTableProps {
  columnsTemplate: ColumnTemplate[];
  data: any[];
  onChange: (newData: any[]) => void;
  readonly?: boolean;
}

export default function DynamicTable({
  columnsTemplate,
  data,
  onChange,
  readonly = false,
}: DynamicTableProps) {
  // 🧩 Hàm render từng cell theo type
  const renderCell = (col: ColumnTemplate, record: any, idx: number) => {
    const value = record[col.name];

    const setValue = (newValue: any) => {
      if (readonly) return;
      const newData = [...data];
      newData[idx] = { ...newData[idx], [col.name]: newValue };
      onChange(newData);
    };

    switch (col.type) {
      case "Text":
        return (
          <Input
            value={value ?? ""}
            onChange={(e) => setValue(e.target.value)}
            disabled={readonly}
          />
        );
      case "Number":
        return (
          <InputNumber
            value={value ?? ""}
            onChange={(val) => setValue(val)}
            disabled={readonly}
            style={{ width: "100%" }}
          />
        );

      case "Date":
      case "DateTime":
        return (
          <DatePicker
            showTime={col.type === "DateTime"}
            value={value ? dayjs(value) : undefined}
            onChange={(d) => setValue(d ? d.toISOString() : "")}
            disabled={readonly}
            style={{ width: "100%" }}
          />
        );

      case "RangeDate":
      case "RangeDateTime":
        return (
          <RangePicker
            showTime={col.type === "RangeDateTime"}
            value={
              Array.isArray(value) && value[0]
                ? [dayjs(value[0]), dayjs(value[1])]
                : undefined
            }
            onChange={(vals) =>
              setValue(
                vals ? [vals[0]?.toISOString(), vals[1]?.toISOString()] : []
              )
            }
            disabled={readonly}
            style={{ width: "100%" }}
          />
        );

      default:
        return (
          <Input
            value={value ?? ""}
            onChange={(e) => setValue(e.target.value)}
            disabled={readonly}
          />
        );
    }
  };

  // 🧩 Cấu hình cột cho bảng
  const columns = columnsTemplate.map((col) => ({
    title: col.name,
    dataIndex: col.name,
    key: col.id,
    render: (_: any, record: any, idx: number) => renderCell(col, record, idx),
  }));

  // 🧩 Cột hành động (xóa dòng)
  if (!readonly) {
    columns.push({
      title: "",
      key: "__action",
      dataIndex: "__action",
      render: (_: any, record: any) => (
        <Button
          danger
          type="text"
          icon={<DeleteOutlined />}
          onClick={() => onChange(data.filter((d) => d !== record))}
        />
      ),
    });
  }

  // 🧩 Render component
  return (
    <div>
      <Table
        dataSource={data}
        columns={columns as any}
        pagination={false}
        rowKey={(r) => r.key || JSON.stringify(r)}
        size="small"
      />
      {!readonly && (
        <Button
          icon={<PlusOutlined />}
          onClick={() => onChange([...data, { key: Date.now().toString() }])}
          className="mt-2"
        >
          Thêm dòng
        </Button>
      )}
    </div>
  );
}
