import { Event, MediaData, MediaResponse } from "@/constant/types";
import { HttpClient } from "@/lib/HttpClient";
import { AxiosRequestHeaders } from "axios";

const API_PREFIX_PATH = "/users";
const API_PREFIX_LEADER_PATH = "/leader/users";

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
  return response.then((res) => res);
};

export const getInfoUser = () => {
  const response = http.get(`${API_PREFIX_PATH}/me`);
  return response.then((res) => res);
};

export const resetContributionPoint = () => {
  const response = http.post(
    `${API_PREFIX_LEADER_PATH}/reset-contribution-point`
  );
  return response.then((res) => res);
};

export const resetAttendancePoint = () => {
  const response = http.post(
    `${API_PREFIX_LEADER_PATH}/reset-attendance-point`
  );
  return response.then((res) => res);
};

export const resetPassword = (userId: string, newPassword: string) => {
  const response = http.put(
    `${API_PREFIX_LEADER_PATH}/reset-password/${userId}`,
    { newPassword: newPassword }
  );
  return response.then((res) => res);
};

export const changeRole = (userId: string, role: string) => {
  const response = http.put(`${API_PREFIX_LEADER_PATH}/${userId}/change-role`, {
    newRole: role,
    accepted: true,
  });
  return response.then((res) => res);
};

export const updateUserInfo = (data: any) => {
  const response = http.put(`${API_PREFIX_PATH}/update-my-info`, data);
  return response.then((res) => res);
};

export const changePassword = (data: {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}) => {
  const response = http.put(`${API_PREFIX_PATH}/update-my-password`, data);
  return response.then((res) => res);
};
