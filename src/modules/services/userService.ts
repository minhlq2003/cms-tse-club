import { Event, MediaData, MediaResponse } from "@/constant/types";
import { UserUpdateDto } from "@/global/interfaces/userInterface";
import { HttpClient } from "@/lib/HttpClient";
import { AxiosRequestHeaders } from "axios";

const API_PREFIX_PATH = "/users";
const API_PREFIX_LEADER_PATH = "/leader/users";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

const http = new HttpClient(BASE_URL);

export const USER_TYPES = {
  STUDENT: 1 << 0, // 1 (001)
  MEMBER: 1 << 1, // 2 (010)
  LECTURER: 1 << 2, // 4 (100)
  POST_STUDENT: 1 << 3, // 8 (1000)
};

// Mảng cho Checkbox Group
export const USER_TYPE_OPTIONS = [
  { label: "Sinh viên", value: USER_TYPES.STUDENT },
  { label: "Hội viên", value: USER_TYPES.MEMBER },
  { label: "Giảng viên", value: USER_TYPES.LECTURER },
  { label: "Nghiên cứu sinh", value: USER_TYPES.POST_STUDENT },
];


interface SearchDto{
  page?: number;
  size?: number;
  sort?: string;
  searchs?: string[];
  searchValues?: string[];
}

export const getUser = (params?: SearchDto & {
  keyword?: string;
  role?: string;
}) => {
  const response = http.get(`${API_PREFIX_PATH}/search`, {
    params,
  });
  return response.then((res) => res);
};

export const getMyInfoUser = () => {
  const response = http.get(`${API_PREFIX_PATH}/me`);
  return response.then((res) => res);
};

export const getUserInfo = (userId: string) => {
  const response = http.get(`${API_PREFIX_LEADER_PATH}/${userId}`);
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
    `${API_PREFIX_LEADER_PATH}/${userId}/reset-password`,
    { newPassword: newPassword }
  );
  return response.then((res) => res);
};

export const changeRole = (userId: string, role: string) => {
  const response = http.put(`${API_PREFIX_LEADER_PATH}/${userId}/change-role`, {
    newRole: role,
    accepted: true,
  });
  return response;
};

export const updateUserInfoByLeader = (userId: string, data: UserUpdateDto) => {
  const response = http.put(`${API_PREFIX_LEADER_PATH}/${userId}`, data);
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
