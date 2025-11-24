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
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  CaretDownOutlined,
  CaretUpOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
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
  updateEventTemplate,
  deleteBlockTemplate,
  updateBlockTemplate,
} from "@/modules/services/templateService";
import PlanFormDynamic from "./PlanFormDynamic";
import { formatDate, getUser } from "@/lib/utils";
import { toast } from "sonner";

const { Title } = Typography;

interface Props {
  order: string[];
  setOrder: React.Dispatch<React.SetStateAction<string[]>>;
  onAddBlock?: (block: BlockTemplate | "__REMOVE__") => void;
  onTemplateSelect?: (blocks: BlockTemplate[]) => void; // 🆕 callback mới
}

export default function PlanBuilderSidebar({
  order,
  setOrder,
  onAddBlock,
  onTemplateSelect,
}: Props) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);
  const [customBlocks, setCustomBlocks] = useState<BlockTemplate[]>([]);
  const [apiBlocks, setApiBlocks] = useState<BlockTemplate[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingBlock, setEditingBlock] = useState<BlockTemplate | null>(null);
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
  const [editingTemplate, setEditingTemplate] = useState<EventTemplate | null>(
    null
  );
  const [isEditingTemplateMode, setIsEditingTemplateMode] = useState(false);

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    try {
      const res = await getBlockTemplates();
      const fetched = res._embedded?.blockTemplateWrapperResponseDtoList || [];

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
  };

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

  const handleCreate = async (block: BlockTemplate) => {
    const response = await createBlockTemplate(block);
    await fetchBlocks();
    handleAddBlock(response);
    setShowCreate(false);

    // Quay lại modal sửa template nếu đang trong chế độ edit
    if (isEditingTemplateMode) {
      setSaveTemplateModal(true);
    }
  };

  const handleUpdateBlock = async (block: BlockTemplate) => {
    try {
      await updateBlockTemplate(block.id, block);
      await fetchBlocks();
      toast.success("Cập nhật block thành công");
      setEditingBlock(null);
    } catch (error) {
      toast.error("Cập nhật block thất bại");
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    try {
      await deleteBlockTemplate(blockId);
      await fetchBlocks();
      // Remove from order if exists
      setOrder((prev) => prev.filter((id) => id !== blockId));
      toast.success("Xóa block thành công");
    } catch (error) {
      toast.error("Xóa block thất bại");
    }
  };

  const handleAddBlock = (block: BlockTemplate) => {
    if (!block?.id) return;
    setOrder((prev) => (prev.includes(block.id) ? prev : [...prev, block.id]));
    onAddBlock?.(block);

    // Đóng modal chọn block và quay lại modal sửa template
    if (isEditingTemplateMode && selectModalOpen) {
      setSelectModalOpen(false);
      setSaveTemplateModal(true);
    }
  };

  const handleRemoveBlock = (id: string) => {
    setOrder((prev) => prev.filter((x) => x !== id));
    onAddBlock?.("__REMOVE__");
  };

  const handleSaveTemplate = async () => {
    if (!templateTitle.trim()) return toast.error("Vui lòng nhập tên template");

    try {
      const data: EventTemplate = {
        id: editingTemplate?.id,
        title: templateTitle.trim(),
        blockTemplateIds: order,
      };

      if (editingTemplate) {
        await updateEventTemplate(editingTemplate.id || "", data);
        toast.success("Cập nhật template thành công");
      } else {
        await createEventTemplate(data);
        toast.success("Lưu template thành công");
      }

      setSaveTemplateModal(false);
      setTemplateTitle("");
      setEditingTemplate(null);
      setIsEditingTemplateMode(false);
    } catch (error) {
      toast.error("Thao tác thất bại");
    }
  };

  const handleOpenChooseTemplate = async () => {
    try {
      const res = await getEventTemplates();
      const list = res._embedded?.eventTemplateWrapperResponseDtoList || [];
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
      console.log(mappedBlocks);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChooseTemplate = async () => {
    if (!selectedTemplate) return;

    const blocks = selectedTemplate.blocks || [];
    const ids = blocks.map((b) => b.id);

    setOrder(ids);

    // 🆕 Gọi callback để parent có thể merge blocks vào templates
    if (onTemplateSelect) {
      const blockTemplates: BlockTemplate[] = blocks.map((b) => ({
        id: b.id,
        title: b.title,
        block: b.block,
        createdAt: b.createdAt,
        lastModifiedTime: b.lastModifiedTime,
        type: b.type || "custom",
        author: b.author,
      }));
      onTemplateSelect(blockTemplates);
    }

    setChooseTemplateModal(false);
    toast.success("Đã chọn template");
  };

  const handleEditTemplate = async (template: EventTemplate) => {
    try {
      const res = await getEventTemplateById(template.id || "");
      const detail = res as EventTemplate;
      const blocks = detail.blocks || [];
      const ids = blocks.map((b) => b.id);

      setEditingTemplate(detail);
      setTemplateTitle(detail.title);
      setOrder(ids);
      setIsEditingTemplateMode(true);
      setSaveTemplateModal(true);
      setChooseTemplateModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải thông tin template");
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteEventTemplate(templateId);
      const res = await getEventTemplates();
      const list = res._embedded?.eventTemplateWrapperResponseDtoList || [];
      setTemplates(list);
      toast.success("Xóa template thành công");
    } catch (error) {
      toast.error("Xóa template thất bại");
    }
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
                              {block?.title ? block.title : id}
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

          <div className="flex flex-col gap-2 mt-4">
            <Button
              type="default"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingBlock(null);
                setShowCreate(true);
              }}
            >
              {t("Tạo block mới")}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setSelectModalOpen(true)}
            >
              {t("Thêm block có sẵn")}
            </Button>
          </div>

          <div className="flex justify-end border-t bg-[#f6f7f7] border-gray-300 mt-3 rounded-b-[10px]">
            <div className="pt-3 flex justify-between w-full">
              <Button
                type="primary"
                onClick={() => {
                  setEditingTemplate(null);
                  setTemplateTitle("");
                  setIsEditingTemplateMode(false);
                  setSaveTemplateModal(true);
                }}
              >
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
        onClose={() => {
          setShowCreate(false);
          setEditingBlock(null);
          // Quay lại modal sửa template nếu đang trong chế độ edit
          if (isEditingTemplateMode) {
            setSaveTemplateModal(true);
          }
        }}
        onCreate={handleCreate}
        editingBlock={editingBlock}
        onUpdate={handleUpdateBlock}
      />

      <Modal
        open={selectModalOpen}
        onCancel={() => {
          setSelectModalOpen(false);
          // Quay lại modal sửa template nếu đang trong chế độ edit
          if (isEditingTemplateMode) {
            setSaveTemplateModal(true);
          }
        }}
        title="Thêm block"
        width={900}
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
                      const currentUser = getUser();
                      const isAuthor =
                        currentUser && b.author?.id === currentUser.id;

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
                            ></Button>,
                            isAuthor && (
                              <Button
                                type="link"
                                onClick={() => {
                                  setEditingBlock(b);
                                  setShowCreate(true);
                                  setSelectModalOpen(false);
                                }}
                                icon={<EditOutlined />}
                                key="edit"
                              ></Button>
                            ),
                            isAuthor && (
                              <Popconfirm
                                title="Xác nhận xóa block?"
                                onConfirm={() => handleDeleteBlock(b.id)}
                                okText="Xóa"
                                cancelText="Hủy"
                                key="delete"
                              >
                                <Button
                                  type="link"
                                  danger
                                  icon={<DeleteOutlined />}
                                ></Button>
                              </Popconfirm>
                            ),
                            <Button
                              type="primary"
                              disabled={isSelected}
                              onClick={() => handleAddBlock(b)}
                              key="choose"
                            >
                              {isSelected ? "Đã chọn" : "Chọn"}
                            </Button>,
                          ].filter(Boolean)}
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
        onCancel={() => {
          setSaveTemplateModal(false);
          setEditingTemplate(null);
          setTemplateTitle("");
          setIsEditingTemplateMode(false);
        }}
        title={editingTemplate ? "Sửa Template" : "Lưu Template mới"}
        onOk={handleSaveTemplate}
        okText={editingTemplate ? "Cập nhật" : "Lưu"}
        width={1200}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setSaveTemplateModal(false);
              setEditingTemplate(null);
              setTemplateTitle("");
              setIsEditingTemplateMode(false);
            }}
          >
            Hủy
          </Button>,
          <Button key="save" type="primary" onClick={handleSaveTemplate}>
            {editingTemplate ? "Cập nhật" : "Lưu"}
          </Button>,
        ]}
      >
        <div className="grid grid-cols-3 gap-4">
          {/* Left: Block Manager */}
          <div className="border rounded p-3">
            <Input
              placeholder="Nhập tiêu đề template"
              value={templateTitle}
              onChange={(e) => setTemplateTitle(e.target.value)}
              className="mb-3"
            />
            <Divider className="my-2" />

            <div className="mb-3">
              <p className="font-semibold mb-2">Thứ tự Block</p>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="template-edit-droppable">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex flex-col gap-2 max-h-[300px] overflow-y-auto"
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
                                className={`p-2 rounded border flex justify-between items-center text-sm ${
                                  snapshot.isDragging
                                    ? "bg-blue-50 border-blue-300"
                                    : "bg-gray-50 border-gray-300"
                                }`}
                              >
                                <div className="truncate flex-1">
                                  {block?.title || id}
                                </div>
                                {id !== "basic_thoi_gian" && (
                                  <Button
                                    size="small"
                                    danger
                                    type="text"
                                    onClick={() => handleRemoveBlock(id)}
                                    icon={<DeleteOutlined />}
                                  />
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
            </div>

            <Divider className="my-2" />

            <div className="flex flex-col gap-2">
              <Button
                type="default"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingBlock(null);
                  setShowCreate(true);
                  setSaveTemplateModal(false);
                }}
                block
              >
                Tạo Block Mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setSelectModalOpen(true);
                  setSaveTemplateModal(false);
                }}
                block
              >
                Thêm Block Có Sẵn
              </Button>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="col-span-2 border rounded p-3">
            <p className="font-semibold mb-2">Preview Template</p>
            <Divider className="my-2" />
            <div className="max-h-[500px] overflow-y-auto">
              {order.length > 0 ? (
                <PlanFormDynamic
                  selectedCategories={order}
                  templates={allBlocks.filter((b) => order.includes(b.id))}
                  planData={{}}
                  readonly
                />
              ) : (
                <p className="text-gray-400 italic text-center py-10">
                  Chưa có block nào. Thêm block để xem preview.
                </p>
              )}
            </div>
          </div>
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
                const currentUser = getUser();
                const isAuthor = currentUser && t.author?.id === currentUser.id;

                return (
                  <List.Item
                    className={`border-b border-gray-100 py-2 ${
                      isSelected ? "bg-blue-50 rounded" : ""
                    }`}
                  >
                    <div className="flex flex-col px-3 w-full">
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
                      <div className="flex flex-row flex-wrap gap-1">
                        <Button
                          type="link"
                          onClick={() => handlePreviewTemplate(t)}
                          icon={<EyeOutlined />}
                          key="preview"
                          size="small"
                        ></Button>
                        {isAuthor && (
                          <>
                            <Button
                              type="link"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => handleEditTemplate(t)}
                            ></Button>
                            <Popconfirm
                              title="Xác nhận xóa template?"
                              onConfirm={() => handleDeleteTemplate(t.id || "")}
                              okText="Xóa"
                              cancelText="Hủy"
                            >
                              <Button
                                danger
                                type="link"
                                size="small"
                                icon={<DeleteOutlined />}
                              ></Button>
                            </Popconfirm>
                          </>
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
