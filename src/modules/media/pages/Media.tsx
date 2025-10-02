"use client";

import { AppstoreOutlined, BarsOutlined } from "@ant-design/icons";
import { Button, Select, Space } from "antd";
import Title from "antd/es/typography/Title";
import { debounce } from "lodash";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import MediaList from "./MediaList";
import SearchInput from "./SearchInput";
import { useTranslation } from "react-i18next";

interface MediaProp {
  isOpenModal?: boolean;
  onSelectMedia?: (media: string) => void;
}

const Media = ({ isOpenModal, onSelectMedia }: MediaProp) => {
  const { t } = useTranslation("common");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [optionView, setOptionView] = useState(true);
  const [totalItems, setTotalItems] = useState<number>(0);
  const router = useRouter();

  const handleSearchChange = useCallback(
    debounce((e: React.ChangeEvent<HTMLInputElement>) => {
      const cleanedValue = e.target.value
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
      setSearchTerm(cleanedValue);
    }, 500),
    []
  );

  return (
    <div className="p-2 pt-6 bg-white">
      {!isOpenModal && (
        <div className="flex justify-between space-x-4 items-center mt-4">
          <h1 className="text-3xl font-bold">Thư viện</h1>
          <Button
            color="primary"
            variant="outlined"
            onClick={() => router.push("/media/create")}
            className="rounded-md"
          >
            {t("Add New Media File")}
          </Button>
        </div>
      )}
      <div className="flex justify-between align-middle mt-5 py-3 border-[0.5px] border-[#a5a1a18e] rounded-lg">
        <Space>
          {!isOpenModal && (
            <Space className="view">
              <Button
                color={`${optionView ? "primary" : "default"}`}
                variant={`${optionView ? "solid" : "outlined"}`}
                onClick={() => setOptionView(true)}
              >
                <BarsOutlined />
              </Button>
              <Button
                color={`${!optionView ? "primary" : "default"}`}
                variant={`${!optionView ? "solid" : "outlined"}`}
                onClick={() => setOptionView(false)}
              >
                <AppstoreOutlined />
              </Button>
            </Space>
          )}
          <Select
            defaultValue={t("All media items")}
            style={{ width: 150 }}
            options={[
              { value: "allMedia", label: t("All media items") },
              { value: "images", label: t("Images") },
              // { value: "unattached", label: t("Unattached") },
              // { value: "mine", label: t("Mine") },
            ]}
          />
          <Space className="flex space-x-3 items-center">
            <Select
              defaultValue={t("All Date")}
              style={{ width: 150 }}
              options={[
                { value: "all", label: t("All Date") },
                { value: "June 2024", label: t("June 2024") },
                { value: "July 2024", label: t("July 2024") },
              ]}
            />
            <Button>{t("Filter")}</Button>
          </Space>
        </Space>
        <SearchInput handleSearchChange={handleSearchChange} />
      </div>
      {/* {!isOpenModal && (
        <div className="flex justify-between items-center my-4">
          <Space className="space-x-5">
            <Space className="space-x-3">
              <Select
                defaultValue={t("Bulk Action")}
                style={{ width: 170 }}
                options={[{ value: "all", label: t("Bulk Action") }]}
              />
              <Button>{t("Apply")}</Button>
            </Space>
          </Space>
        </div>
      )} */}
      <MediaList
        searchTerm={searchTerm}
        isOpenModal={isOpenModal}
        isView={isOpenModal === true ? false : optionView}
        onSelectMedia={onSelectMedia}
      />
    </div>
  );
};

export default Media;
