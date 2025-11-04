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
  Input,
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
import { BlockTemplate, EventTemplate } from "@/constant/types";
import { BasicBlocks } from "@/constant/data";
import {
  createBlockTemplate,
  getBlockTemplates,
  getEventTemplates,
  getEventTemplateById,
  createEventTemplate,
  deleteEventTemplate,
} from "@/modules/services/templateService";
import PlanFormDynamic from "./PlanFormDynamic";
import { formatDate, getUser } from "@/lib/utils";

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
  const [saveTemplateModal, setSaveTemplateModal] = useState(false);
  const [templateTitle, setTemplateTitle] = useState("");
  const [chooseTemplateModal, setChooseTemplateModal] = useState(false);
  const [templates, setTemplates] = useState<EventTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<EventTemplate | null>(null);
  const [templateBlocks, setTemplateBlocks] = useState<BlockTemplate[]>([]);

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

        const basicIds = BasicBlocks.map((b) => b.id);
        const filteredBlocks = uniqueBlocks.filter(
          (block: BlockTemplate) => !basicIds.includes(block.id)
        );

        setApiBlocks(filteredBlocks);
        setCustomBlocks(filteredBlocks);
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

  const handleSaveTemplate = async () => {
    if (!templateTitle.trim()) return;
    const data: EventTemplate = {
      title: templateTitle.trim(),
      blockTemplateIds: order,
    };
    await createEventTemplate(data);
    setSaveTemplateModal(false);
    setTemplateTitle("");
  };

  const handleOpenChooseTemplate = async () => {
    try {
      const res = await getEventTemplates();
      const list = res._embedded?.eventTemplateResponseDtoList || [];
      setTemplates(list);
      setChooseTemplateModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePreviewTemplate = async (template: EventTemplate) => {
    try {
      const res = await getEventTemplateById(template.id || "");
      const detail = res as EventTemplate;
      const blocks = detail.blocks || [];
      const mappedBlocks: BlockTemplate[] = blocks.map((b) => ({
        id: b.id,
        title: b.title,
        block: b.block,
        createdAt: b.createdAt,
        lastModifiedTime: b.lastModifiedTime,
        type: "custom",
      }));
      setSelectedTemplate(detail);
      setTemplateBlocks(mappedBlocks);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChooseTemplate = async () => {
    if (!selectedTemplate) return;
    const blocks = selectedTemplate.blocks || [];
    const ids = blocks.map((b) => b.id);
    setOrder(ids);
    setChooseTemplateModal(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
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

      {visible && (
        <div className="p-4">
          <p className="font-semibold">
            {selectedTemplate ? `${selectedTemplate.title}` : "Mẫu cơ bản"}
          </p>
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
                            <div className="min-h-[22px]">
                              {block ? block.title : id}
                            </div>
                            {id !== "basic_thoi_gian" && (
                              <Button
                                size="small"
                                danger
                                onClick={() => handleRemoveBlock(id)}
                              >
                                Xóa
                              </Button>
                            )}
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
              <Button type="primary" onClick={() => setSaveTemplateModal(true)}>
                Lưu Template
              </Button>
              <Button type="primary" onClick={handleOpenChooseTemplate}>
                Chọn Template
              </Button>
            </div>
          </div>
        </div>
      )}

      <ModalCreateBlock
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
      />

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
                    renderItem={(b) => {
                      const isSelected = order.includes(b.id);
                      const isPreviewed = selectedPreview?.id === b.id;
                      return (
                        <List.Item
                          className={`border-b border-gray-100 p-2 ${
                            isPreviewed ? "bg-blue-50 rounded" : ""
                          }`}
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
                              disabled={isSelected}
                              onClick={() => handleAddBlock(b)}
                              key="choose"
                            >
                              {isSelected ? "Đã chọn" : "Chọn"}
                            </Button>,
                          ]}
                        >
                          <div>
                            <p className="!font-semibold ml-3">{b.title}</p>
                          </div>
                        </List.Item>
                      );
                    }}
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
                    dataSource={apiBlocks}
                    renderItem={(b) => {
                      const isSelected = order.includes(b.id);
                      const isPrev = selectedPreview?.id === b.id;
                      return (
                        <List.Item
                          className={`border-b border-gray-100 p-2 ${
                            isPrev ? "bg-blue-50 rounded" : ""
                          }`}
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
                              disabled={isSelected}
                              onClick={() => handleAddBlock(b)}
                              key="choose"
                            >
                              {isSelected ? "Đã chọn" : "Chọn"}
                            </Button>,
                          ]}
                        >
                          <div className="flex justify-start gap-2">
                            <p className="!font-semibold mx-3">{b.title}</p>
                            {t("uploaded by")}
                            <p className="!font-semibold mr-3">
                              {b.author?.fullName}
                            </p>
                            {t("at")}{" "}
                            <p className="!font-semibold">
                              {formatDate(b.createdAt || "").formattedDate}
                            </p>
                          </div>
                        </List.Item>
                      );
                    }}
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

      <Modal
        open={saveTemplateModal}
        onCancel={() => setSaveTemplateModal(false)}
        title="Lưu Template mới"
        onOk={handleSaveTemplate}
        okText="Lưu"
        width={800}
      >
        <Input
          placeholder="Nhập tiêu đề template"
          value={templateTitle}
          onChange={(e) => setTemplateTitle(e.target.value)}
          className="mb-3"
        />
        <Divider />
        <div className="max-h-[500px] overflow-scroll">
          <PlanFormDynamic
            selectedCategories={order}
            templates={allBlocks.filter((b) => order.includes(b.id))}
            planData={{}}
            readonly
          />
        </div>
      </Modal>

      <Modal
        open={chooseTemplateModal}
        onCancel={() => setChooseTemplateModal(false)}
        title="Chọn Template"
        width={1000}
        footer={[
          <Button key="cancel" onClick={() => setChooseTemplateModal(false)}>
            Hủy
          </Button>,
          <Button
            key="choose"
            type="primary"
            onClick={handleChooseTemplate}
            disabled={!selectedTemplate}
          >
            Chọn Template
          </Button>,
        ]}
      >
        <div className="grid grid-cols-3 gap-3">
          {/* Danh sách template */}
          <div className="border rounded p-2 h-[600px] overflow-y-auto">
            <List
              dataSource={templates}
              renderItem={(t) => {
                const isSelected = selectedTemplate?.id === t.id;
                const currentUser = getUser(); // ✅ lấy user hiện tại
                const isAuthor = currentUser && t.author?.id === currentUser.id;

                return (
                  <List.Item
                    className={`border-b border-gray-100 py-2 ${
                      isSelected ? "bg-blue-50 rounded" : ""
                    }`}
                  >
                    <div className="flex flex-col px-3">
                      <p className="font-medium text-gray-800">{t.title}</p>
                      {t.author?.fullName && (
                        <p className="text-gray-500 text-sm">
                          Tác giả: {t.author.fullName}
                        </p>
                      )}
                      {t.createdAt && (
                        <p className="text-gray-400 text-xs">
                          {new Date(t.createdAt).toLocaleString("vi-VN")}
                        </p>
                      )}
                      <div className="flex flex-row">
                        <Button
                          type="link"
                          onClick={() => handlePreviewTemplate(t)}
                          icon={<EyeOutlined />}
                          key="preview"
                        >
                          Xem
                        </Button>
                        {isAuthor && (
                          <div>
                            <Button type="link">Sửa</Button>
                            <Button
                              danger
                              type="link"
                              onClick={async () => {
                                await deleteEventTemplate(t.id || "");
                                const res = await getEventTemplates();
                                const list =
                                  res._embedded?.eventTemplateResponseDtoList ||
                                  [];
                                setTemplates(list);
                              }}
                              key="delete"
                            >
                              Xóa
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
          </div>

          {/* Preview template */}
          <div className="col-span-2 border rounded p-2 h-[600px] overflow-y-auto">
            {selectedTemplate ? (
              <PlanFormDynamic
                selectedCategories={templateBlocks.map((b) => b.id)}
                templates={[...templateBlocks, ...BasicBlocks]}
                planData={{}}
                readonly
              />
            ) : (
              <p className="text-gray-400 italic text-center mt-20">
                Chọn một template để xem preview
              </p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
