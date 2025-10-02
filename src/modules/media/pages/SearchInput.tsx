import { InputSearchProps } from "@/constant/types";
import { SearchOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";

const SearchInput: React.FC<InputSearchProps> = ({ handleSearchChange }) => {
  const { t } = useTranslation("common");
  return (
    <div className="h-full flex flex-row gap-4">
      <Input
        type="search"
        className="custom-input"
        onChange={handleSearchChange}
      />
      <Button
        className="border-[1px] outline-none px-3 duration-300"
        icon={<SearchOutlined />}
      >
        {t("Search Media")}
      </Button>
    </div>
  );
};

export default SearchInput;
