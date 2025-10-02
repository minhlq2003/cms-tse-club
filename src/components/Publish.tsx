"use client";

import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import { Button, Select, Space, Typography } from "antd";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const { Title } = Typography;

export interface PublishProps {
  onSubmit: () => void;
  setStatus: (status: string) => void;
  status: string;
}

const Publish: React.FC<PublishProps> = ({ onSubmit, setStatus, status }) => {
  const { t } = useTranslation("common");
  const [isPublishListVisible, setPublishListVisible] = useState(true);

  return (
    <div className="publish border-gray-300 border rounded-[10px] mb-5 ">
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-300">
        <Title level={4} className="!m-0">
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
          <Space direction="horizontal" className="px-4 py-4">
            <p>{t("Status: ")}</p>
            <Select
              onChange={(value) => setStatus(value)}
              defaultValue={status}
              className="w-[120px]"
            >
              <Select.Option value="PENDING">{t("Publish")}</Select.Option>
              <Select.Option value="ARCHIVED">{t("Draft")}</Select.Option>
            </Select>
          </Space>
          <div className="flex justify-end border-t bg-[#f6f7f7] border-gray-300 rounded-b-[10px]">
            <div className="px-4 py-3">
              <Button type="primary" onClick={onSubmit}>
                {status.match("draft") ? t("Save Draft") : t("Publish")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Publish;
