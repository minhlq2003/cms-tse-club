/* -------- categoryService.ts -------- */

import {
  Category,
  CategoriesResponse,
  CategoryResponse,
} from "@/constant/types";
import { HttpClient } from "@/lib/HttpClient";

const API_PREFIX_BOOK_PATH = "/book";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

const http = new HttpClient(BASE_URL);

export const getCategories = async (params?: {
  page?: number;
  limit?: number;
}) => {
  const response = await http.get<CategoriesResponse>(
    `${API_PREFIX_BOOK_PATH}/allcategory`,
    { params }
  );
  return response;
};

export const getCategoryById = (id: string) =>
  http.get<CategoryResponse>(
    `${API_PREFIX_BOOK_PATH}/category/categoryinfo/${id}`
  );

export const createCategory = (data: Partial<Category>) =>
  http.post<CategoryResponse>(`${API_PREFIX_BOOK_PATH}/createcategory`, data);

export const updateCategory = (id: string, data: Partial<Category>) =>
  http.post<CategoryResponse>(
    `${API_PREFIX_BOOK_PATH}/updatecategory/${id}`,
    data
  );

export const deleteCategory = (id: string) =>
  http.delete<void>(`${API_PREFIX_BOOK_PATH}/${id}`);
