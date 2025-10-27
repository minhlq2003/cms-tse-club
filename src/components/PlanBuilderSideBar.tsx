"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Modal,
  Divider,
  Space,
  Tabs,
  List,
  Card,
  Typography,
} from "antd";
import {
  PlusOutlined,
  CaretDownOutlined,
  CaretUpOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useTranslation } from "react-i18next";
import ModalCreateBlock from "./ModalCreateBlock";
import { BlockTemplate } from "@/constant/types";
import { BasicBlocks } from "@/constant/data";
import {
  createBlockTemplate,
  getBlockTemplates,
} from "@/modules/services/templateService";
import PlanFormDynamic from "./PlanFormDynamic";

const { Title } = Typography;

interface Props {
  order: string[];
  setOrder: React.Dispatch<React.SetStateAction<string[]>>;
  onAddBlock?: (block: BlockTemplate | "__REMOVE__") => void;
}

export default function PlanBuilderSidebar({
  order,
  setOrder,
  onAddBlock,
}: Props) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);
  const [customBlocks, setCustomBlocks] = useState<BlockTemplate[]>([]);
  const [apiBlocks, setApiBlocks] = useState<BlockTemplate[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectModalOpen, setSelectModalOpen] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<BlockTemplate | null>(
    null
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await getBlockTemplates();
        const fetched =
          res._embedded?.blockTemplateWrapperResponseDtoList || [];

        const uniqueBlocks = fetched.filter(
          (block: BlockTemplate, index: number, self: BlockTemplate[]) =>
            index === self.findIndex((b) => b.id === block.id)
        );

        setApiBlocks(uniqueBlocks);
        setCustomBlocks(uniqueBlocks);
      } catch (e) {
        console.error(e);
        setApiBlocks([]);
      }
    })();
  }, []);

  const allBlocks = useMemo(() => {
    const merged = [...BasicBlocks, ...apiBlocks];
    return merged.filter(
      (b, i, self) => i === self.findIndex((x) => x.id === b.id)
    );
  }, [apiBlocks]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const newOrder = Array.from(order);
    const [moved] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, moved);
    setOrder(newOrder);
  };

  const handleCreate = (block: BlockTemplate) => {
    const updated = [...apiBlocks, block];
    const unique = updated.filter(
      (b, i, self) => i === self.findIndex((x) => x.id === b.id)
    );
    setApiBlocks(unique);
    setCustomBlocks(unique);
    handleAddBlock(block);
    createBlockTemplate(block);
  };

  const handleAddBlock = (block: BlockTemplate) => {
    if (!block?.id) return;
    setOrder((prev) => (prev.includes(block.id) ? prev : [...prev, block.id]));
    onAddBlock?.(block);
  };

  const handleRemoveBlock = (id: string) => {
    setOrder((prev) => prev.filter((x) => x !== id));
    onAddBlock?.("__REMOVE__");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* 🔹 Header */}
      <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300">
        <Title level={4} className="!m-0">
          {t("Template Plan")}
        </Title>
        <Button
          type="text"
          icon={visible ? <CaretDownOutlined /> : <CaretUpOutlined />}
          onClick={() => setVisible(!visible)}
        />
      </div>

      {/* 🔹 Content */}
      {visible && (
        <div className="p-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="plan-order-droppable">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex flex-col gap-2"
                >
                  {order.map((id, idx) => {
                    const block = allBlocks.find((b) => b.id === id);
                    return (
                      <Draggable key={id} draggableId={id} index={idx}>
                        {(prov, snapshot) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            className={`p-2 rounded border border-gray-300 flex justify-between items-center ${
                              snapshot.isDragging ? "bg-blue-50" : "bg-gray-50"
                            }`}
                          >
                            <div>{block ? block.title : id}</div>
                            <Button
                              size="small"
                              danger
                              onClick={() => handleRemoveBlock(id)}
                            >
                              Xóa
                            </Button>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div className="mt-4 flex justify-between">
            <Button
              type="default"
              icon={<PlusOutlined />}
              onClick={() => setShowCreate(true)}
            >
              {t("Tạo block")}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setSelectModalOpen(true)}
            >
              {t("Thêm block")}
            </Button>
          </div>

          <div className="flex justify-end border-t bg-[#f6f7f7] border-gray-300 mt-3 rounded-b-[10px]">
            <div className=" pt-3 flex justify-between w-full">
              <Button type="primary">Lưu Template</Button>
              <Button type="primary">Chọn Template</Button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Modal tạo block */}
      <ModalCreateBlock
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
      />

      {/* 🔹 Modal chọn block */}
      <Modal
        open={selectModalOpen}
        onCancel={() => setSelectModalOpen(false)}
        title="Thêm block"
        width={700}
        footer={null}
      >
        <Tabs
          defaultActiveKey="basic"
          items={[
            {
              key: "basic",
              label: "Basic",
              children: (
                <div>
                  <List
                    dataSource={BasicBlocks}
                    renderItem={(b) => (
                      <List.Item
                        actions={[
                          <Button
                            type="link"
                            onClick={() => setSelectedPreview(b)}
                            icon={<EyeOutlined />}
                            key="preview"
                          >
                            Xem
                          </Button>,
                          <Button
                            type="primary"
                            onClick={() => handleAddBlock(b)}
                            key="choose"
                          >
                            Chọn
                          </Button>,
                        ]}
                      >
                        {b.title}
                      </List.Item>
                    )}
                  />
                  <Divider />
                  {selectedPreview && (
                    <Card
                      size="small"
                      title={`Xem trước: ${selectedPreview.title}`}
                    >
                      <PlanFormDynamic
                        selectedCategories={[selectedPreview.id]}
                        templates={[selectedPreview]}
                        planData={{}}
                        readonly
                      />
                    </Card>
                  )}
                </div>
              ),
            },
            {
              key: "custom",
              label: "Custom",
              children: (
                <div>
                  <List
                    dataSource={Array.isArray(apiBlocks) ? apiBlocks : []}
                    renderItem={(b) => (
                      <List.Item
                        actions={[
                          <Button
                            type="link"
                            onClick={() => setSelectedPreview(b)}
                            icon={<EyeOutlined />}
                            key="preview"
                          >
                            Xem
                          </Button>,
                          <Button
                            type="primary"
                            onClick={() => handleAddBlock(b)}
                            key="choose"
                          >
                            Chọn
                          </Button>,
                        ]}
                      >
                        {b.title}
                      </List.Item>
                    )}
                  />
                  <Divider />
                  {selectedPreview && (
                    <Card
                      size="small"
                      title={`Xem trước: ${selectedPreview.title}`}
                    >
                      <PlanFormDynamic
                        selectedCategories={[selectedPreview.id]}
                        templates={[selectedPreview]}
                        planData={{}}
                        readonly
                      />
                    </Card>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
}
