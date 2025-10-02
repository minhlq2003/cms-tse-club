import { Event, MediaData, MediaResponse } from "@/constant/types";
import { HttpClient } from "@/lib/HttpClient";
import { AxiosRequestHeaders } from "axios";

const API_PREFIX_PATH = "/users";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

const http = new HttpClient(BASE_URL);

export const getUser = (params?: {
  page?: number;
  size?: number;
  keyword?: string;
  sort?: string;
}) => {
  const response = http.get(`${API_PREFIX_PATH}/search`, {
    params,
  });
  return response.then((res) => res._embedded.userShortInfoResponseDtoList);
};
