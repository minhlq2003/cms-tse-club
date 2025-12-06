import { GlobalConfigurationDto } from "@/lib/interfaces/commons";
import { Post, PostListResponse, PostResponse } from "@/constant/types";
import { HttpClient } from "@/lib/HttpClient";

const API_PREFIX_COMMON_PATH = "/common";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

const http = new HttpClient(BASE_URL);

// const user = JSON.parse(
//   (typeof window !== "undefined" && localStorage.getItem("user")) || "{}"
// );

export const getGlobalConfigByKey = (key: string) => {
  const response = http.get<GlobalConfigurationDto>(
    `${API_PREFIX_COMMON_PATH}/global-configurations/${key}`
  );
  return response;
}