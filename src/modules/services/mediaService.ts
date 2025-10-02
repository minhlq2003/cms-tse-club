import { MediaData, MediaResponse } from "@/constant/types";
import { HttpClient } from "@/lib/HttpClient";
import { AxiosRequestHeaders } from "axios";

const API_PREFIX_PATH = "/attachments";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

const http = new HttpClient(BASE_URL);

export const getMedia = async () => {
  const response = await http.get<any>(`${API_PREFIX_PATH}/me`);
  return response;
};

export const uploadMedia = (data: FormData, id: number) =>
  http.post<MediaData>(`${API_PREFIX_PATH}`, data);

export const deleteMedia = (id: number) => {
  http.delete(`${API_PREFIX_PATH}/upload/delete/${id}`);
};

export const updateMedia = (id: number, data: FormData) => {
  http.post(`${API_PREFIX_PATH}/upload/${id}`, data);
};
