import React, { useState } from "react";
import { Modal, Input, Select, Button, Space, Divider, message } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import {
  BlockTemplate,
  ColumnTemplate,
  FieldTemplate,
  FieldType,
} from "@/constant/types";
import { toast } from "sonner";

const { TextArea } = Input;
const { Option } = Select;

interface ModalCreateBlockProps {
  open: boolean;
  onClose: () => void;
  onCreate: (block: BlockTemplate) => void;
}

const FIELD_TYPES: FieldType[] = [
  "Text",
  "Number",
  "TextArea",
  "Date",
  "DateTime",
  "RangeDate",
  "RangeDateTime",
  "Table",
];

export default function ModalCreateBlock({
  open,
  onClose,
  onCreate,
}: ModalCreateBlockProps) {
  const [title, setTitle] = useState("");
  const [fields, setFields] = useState<FieldTemplate[]>([]);

  const addField = (type: FieldType = "Text") => {
    setFields((prev) => [
      ...prev,
      {
        id: uuidv4(),
        label: `tên trường ${prev.length + 1}`,
        placeholder: "",
        type,
        columns: type === "Table" ? [] : undefined,
      },
    ]);
  };

  const removeField = (id: string) =>
    setFields((prev) => prev.filter((f) => f.id !== id));

  const updateField = (id: string, patch: Partial<FieldTemplate>) =>
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...patch } : f))
    );

  const addColumn = (fieldId: string) => {
    updateField(fieldId, {
      columns: [
        ...(fields.find((f) => f.id === fieldId)?.columns || []),
        { id: uuidv4(), name: "Tên cột", type: "Text" },
      ],
    });
  };

  const updateColumn = (
    fieldId: string,
    colId: string,
    patch: Partial<ColumnTemplate>
  ) => {
    const f = fields.find((x) => x.id === fieldId);
    if (!f || !f.columns) return;
    const updatedCols = f.columns.map((c) =>
      c.id === colId ? { ...c, ...patch } : c
    );
    updateField(fieldId, { columns: updatedCols });
  };

  const removeColumn = (fieldId: string, colId: string) => {
    const f = fields.find((x) => x.id === fieldId);
    if (!f || !f.columns) return;
    updateField(fieldId, { columns: f.columns.filter((c) => c.id !== colId) });
  };

  const handleConfirm = () => {
    if (!title.trim()) return toast.error("Vui lòng nhập tiêu đề block");
    if (fields.length === 0)
      return toast.error("Vui lòng thêm ít nhất 1 field");

    // Ensure labels exist and are unique
    const labels = fields.map((f, idx) => f.label || `field_${idx + 1}`);
    const setLabels = new Set(labels);
    if (setLabels.size !== labels.length)
      return toast.error("Các label phải duy nhất");

    const block: BlockTemplate = {
      id: uuidv4(),
      title: title.trim(),
      type: "custom",
      block: JSON.stringify(fields),
    };

    onCreate(block);
    setTitle("");
    setFields([]);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleConfirm}
      title="Tạo block mới"
      width={800}
      okText="Tạo"
    >
      <div className="space-y-3">
        <Input
          placeholder="Tiêu đề block"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Divider />

        <Space wrap>
          {FIELD_TYPES.map((ft) => (
            <Button
              key={ft}
              onClick={() => addField(ft)}
              icon={<PlusOutlined />}
            >
              Thêm {ft}
            </Button>
          ))}
        </Space>

        <div className="mt-4 space-y-3">
          {fields.map((f, idx) => (
            <div key={f.id} className="border p-3 rounded">
              <div className="flex justify-between items-center">
                <strong>
                  Trường #{idx + 1} — {f.type}
                </strong>
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => removeField(f.id)}
                />
              </div>

              <div className="mt-2 space-y-2">
                <Input
                  placeholder="Label"
                  value={f.label}
                  onChange={(e) => updateField(f.id, { label: e.target.value })}
                  className="!mb-2"
                />
                <Input
                  placeholder="Placeholder (optional)"
                  value={f.placeholder}
                  onChange={(e) =>
                    updateField(f.id, { placeholder: e.target.value })
                  }
                />

                {f.type === "Table" && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between">
                      <strong>Columns</strong>
                      <Button
                        size="small"
                        onClick={() => addColumn(f.id)}
                        icon={<PlusOutlined />}
                      >
                        Thêm cột
                      </Button>
                    </div>
                    <div className="mt-2 space-y-2">
                      {(f.columns || []).map((col) => (
                        <div key={col.id} className="flex gap-2">
                          <Input
                            placeholder="Tên cột"
                            value={col.name}
                            onChange={(e) =>
                              updateColumn(f.id, col.id, {
                                name: e.target.value,
                              })
                            }
                          />
                          <Select
                            value={col.type}
                            onChange={(val) =>
                              updateColumn(f.id, col.id, { type: val as any })
                            }
                            style={{ width: 180 }}
                          >
                            <Option value="Text">Text</Option>
                            <Option value="Number">Number</Option>
                            <Option value="Date">Date</Option>
                            <Option value="DateTime">DateTime</Option>
                            <Option value="RangeDate">RangeDate</Option>
                            <Option value="RangeDateTime">RangeDateTime</Option>
                          </Select>
                          <Button
                            danger
                            type="text"
                            onClick={() => removeColumn(f.id, col.id)}
                            icon={<DeleteOutlined />}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
