import { HttpClient } from "@/lib/HttpClient";

const API_PREFIX_BLOCK_TEMPLATE_PATH = "/block-templates";
const API_PREFIX_EVENT_TEMPLATE_PATH = "/event-templates";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5003";

const http = new HttpClient(BASE_URL);

const user = JSON.parse(
  (typeof window !== "undefined" && localStorage.getItem("user")) || "{}"
);

export const getEventTemplates = async () => {
  const response = await http.get(`${API_PREFIX_EVENT_TEMPLATE_PATH}/search`);
  return response;
};

export const createEventTemplate = (data: any) =>
  http.post(`${API_PREFIX_EVENT_TEMPLATE_PATH}`, data);

export const getEventTemplateById = (id: string) =>
  http.get(`${API_PREFIX_EVENT_TEMPLATE_PATH}/${id}`);

export const updateEventTemplate = (id: string, data: any) =>
  http.patch(`${API_PREFIX_EVENT_TEMPLATE_PATH}/${id}`, data);

export const deleteEventTemplate = (id: string) =>
  http.delete(`${API_PREFIX_EVENT_TEMPLATE_PATH}/${id}`);

export const getBlockTemplates = async () => {
  const response = await http.get(`${API_PREFIX_BLOCK_TEMPLATE_PATH}/search`);
  return response;
};

export const createBlockTemplate = (data: any) =>
  http.post(`${API_PREFIX_BLOCK_TEMPLATE_PATH}`, data);

export const getBlockTemplateById = (id: string) =>
  http.get(`${API_PREFIX_BLOCK_TEMPLATE_PATH}/${id}`);

export const updateBlockTemplate = (id: string, data: any) =>
  http.patch(`${API_PREFIX_BLOCK_TEMPLATE_PATH}/${id}`, data);

export const deleteBlockTemplate = (id: string) =>
  http.delete(`${API_PREFIX_BLOCK_TEMPLATE_PATH}/${id}`);
