"use client";

import { Button, Select, Space, Typography } from "antd";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getRoleUser, isLeader } from "@/lib/utils";

const { Title } = Typography;

interface PublishProps {
  onSubmit: () => void;
  setStatus: (val: string) => void;
  status: string;
}

export default function Publish({ onSubmit, setStatus, status }: PublishProps) {
  const { t } = useTranslation("common");
  const [isPublishListVisible, setPublishListVisible] = useState(true);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div
      className={`publish border-gray-300 border rounded-[10px] mb-5 bg-white ${
        isMobile ? "fixed top-13 right-0 left-0 z-50 shadow-lg" : "relative"
      }`}
    >
      <div className="flex justify-between items-center px-4 py-1 md:py-3 border-b border-gray-300">
        <Title level={isMobile ? 5 : 4} className="!m-0">
          {t("Publish")}
        </Title>
        <Button
          onClick={() => setPublishListVisible(!isPublishListVisible)}
          className="flex items-center"
          icon={
            isPublishListVisible ? <CaretDownOutlined /> : <CaretUpOutlined />
          }
          type="text"
        />
      </div>

      {isPublishListVisible && (
        <div>
          <Space direction="horizontal" className="px-4 py-2 md:py-4">
            <p>{t("Status: ")}</p>
            <Select
              onChange={(value) => setStatus(value)}
              defaultValue={status}
              className="w-[120px] !h-[28px]"
            >
              {getRoleUser() === "ADMIN" || getRoleUser() === "LEADER" ? (
                <Select.Option value="PENDING">{t("Publish")}</Select.Option>
              ) : (
                <Select.Option value="PENDING">{t("Submit")}</Select.Option>
              )}
              <Select.Option value="ARCHIVED">{t("Draft")}</Select.Option>
            </Select>
          </Space>

          <div className="flex justify-end border-t bg-[#f6f7f7] border-gray-300 rounded-b-[10px]">
            <div className="px-4 py-3">
              <Button type="primary" onClick={onSubmit}>
                {status.match("ARCHIVED")
                  ? t("Save Draft")
                  : isLeader()
                  ? t("Publish")
                  : t("Submit to leader")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
