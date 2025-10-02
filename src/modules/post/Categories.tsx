"use client";
import {
  CaretDownOutlined,
  CaretUpOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Input, List, message, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { createCategory, getCategories } from "../services/categoryService";
import { Category, CategoryOption } from "@/constant/types";
import { useTranslation } from "react-i18next";

const { Title, Link } = Typography;

interface CategoriesProps {
  selectedCategories: string[];
  onChangeCategories: (checkedValues: string[]) => void;
}
const Categories: React.FC<CategoriesProps> = ({
  selectedCategories,
  onChangeCategories,
}) => {
  const { t } = useTranslation("common");
  const [isCategoryListVisible, setCategoryListVisible] = useState(true);
  const [categories, setCategories] = useState<CategoryOption[] | null>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedPermissions = JSON.parse(
        localStorage.getItem("permissions") || "{}"
      );
      setPermissions(storedPermissions);
    }
  }, []);
  const handleFetchCategories = async () => {
    try {
      const response = await getCategories();
      const categoriesData = response?.data;
      if (Array.isArray(categoriesData)) {
        const categoryOptions = categoriesData.map((category) => ({
          id: category.id,
          label: category.name,
          value: category.name,
          disabled: false,
        }));
        setCategories(categoryOptions);
      }
    } catch {
      message.error(t("Error fetching categories"));
    }
  };

  const handleAddCategory = async () => {
    if (newCategoryName) {
      if (newCategoryName.length < 3) {
        return message.error(t("Name phải có ít nhất 3 ký tự"));
      }
      try {
        const slug = newCategoryName
          ?.normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        const data = {
          name: newCategoryName,
          slug: slug,
          description: "",
        };

        const response = await createCategory(data);

        await handleFetchCategories();

        setNewCategoryName("");
        setIsAddingCategory(false);
        message.success(t(`Added new category: ${newCategoryName}`));
      } catch {
        message.error(t("Error adding category"));
      }
    } else {
      message.error(t("Please enter a category name"));
    }
  };

  useEffect(() => {
    handleFetchCategories();
  }, []);

  return (
    <div className="categories border border-gray-300 rounded-[10px] mb-5">
      <div className="flex justify-between items-center px-4 py-2 border-gray-300 border-b">
        <Title level={4} className="!m-0">
          {t("Categories")}
        </Title>
        <Button
          onClick={() => setCategoryListVisible(!isCategoryListVisible)}
          className="flex items-center"
          icon={
            isCategoryListVisible ? <CaretDownOutlined /> : <CaretUpOutlined />
          }
          type="text"
        />
      </div>

      {isCategoryListVisible && (
        <div className="py-2">
          <Checkbox.Group
            onChange={onChangeCategories}
            value={selectedCategories}
            className="w-[100%] pt-2"
          >
            <List
              className="w-[100%]"
              size="small"
              dataSource={categories ?? []}
              renderItem={(item) => (
                <List.Item>
                  <Checkbox key={item.value} value={item.value}>
                    {t(`${item.label}`)}
                  </Checkbox>
                </List.Item>
              )}
            />
          </Checkbox.Group>
          <div className="px-4 mb-3">
            <div className="mt-4">
              <Button
                color="primary"
                variant="outlined"
                onClick={() => setIsAddingCategory(!isAddingCategory)}
                icon={<PlusOutlined />}
              >
                <span> {t("Add New Category")}</span>
              </Button>
            </div>
            {isAddingCategory && (
              <div className="mt-4 flex">
                <Input
                  placeholder={t("Enter category name")}
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  style={{ marginRight: "8px" }}
                />
                <Button type="primary" onClick={handleAddCategory}>
                  {t("Add")}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
