import { Post, PostListResponse, PostResponse } from "@/constant/types";
import { HttpClient } from "@/lib/HttpClient";

const API_PREFIX_POST_PATH = "/posts";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5003";

const http = new HttpClient(BASE_URL);

const user = JSON.parse(
  (typeof window !== "undefined" && localStorage.getItem("user")) || "{}"
);

export const getPosts = async (params?: {
  page?: number;
  size?: number;
  sort?: string;
  title?: string;
  status?: string;
}) => {
  const response = await http.get(`${API_PREFIX_POST_PATH}/me/search`, {
    params,
  });
  return response;
};

export const getPostsByCategory = async (
  categorySlug?: string,
  params?: { page?: number; limit?: number }
) => {
  const response = await http.get<PostListResponse>(
    `${API_PREFIX_POST_PATH}/category/${categorySlug}`,
    { params }
  );
  return response;
};

export const getPostById = (id: string) =>
  http.get<PostResponse>(`${API_PREFIX_POST_PATH}/postdetails?id=${id}`);

export const getPostBySlug = (slug: string) =>
  http.get<PostResponse>(`${API_PREFIX_POST_PATH}/postdetails?slug=${slug}`);

export const createPost = (data: any) =>
  http.post<PostResponse>(`${API_PREFIX_POST_PATH}`, data);

export const updatePost = (id: string, data: Partial<Post>) =>
  http.post<PostResponse>(`${API_PREFIX_POST_PATH}/updatepost/${id}`, data);

export const deletePost = (id: string) =>
  http.post<PostResponse>(`${API_PREFIX_POST_PATH}/deletepost/${id}`);
