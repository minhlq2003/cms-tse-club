"use client";

import React from "react";
import { Checkbox, Typography } from "antd";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

const { Title } = Typography;

interface ListTitleProps {
  selected: string[];
  onChange: (values: string[]) => void;
  order: string[];
  setOrder: (values: string[]) => void;
}

export default function ListTitle({
  selected,
  onChange,
  order,
  setOrder,
}: ListTitleProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newOrder = Array.from(order);
    const [moved] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, moved);
    setOrder(newOrder);
  };

  const handleCheck = (value: string, checked: boolean) => {
    const newSelected = checked
      ? [...selected, value]
      : selected.filter((v) => v !== value);
    onChange(newSelected);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <Title level={4} className="mb-4">
        Danh mục kế hoạch
      </Title>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="category-list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex flex-col gap-2"
            >
              {order.map((item, index) => (
                <Draggable key={item} draggableId={item} index={index}>
                  {(prov, snapshot) => (
                    <div
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      {...prov.dragHandleProps}
                      className={`flex items-center justify-between px-3 py-2 rounded-md border transition-all ${
                        snapshot.isDragging
                          ? "bg-blue-50 border-blue-400 shadow-md"
                          : "bg-gray-50 hover:bg-gray-100 border-gray-300"
                      }`}
                      style={{
                        ...prov.draggableProps.style,
                        userSelect: "none",
                      }}
                    >
                      <Checkbox
                        checked={selected.includes(item)}
                        onChange={(e) => handleCheck(item, e.target.checked)}
                      >
                        {item}
                      </Checkbox>
                      <span
                        className="cursor-grab text-gray-400 select-none"
                        title="Kéo để sắp xếp"
                      >
                        ⋮⋮
                      </span>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
