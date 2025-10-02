import { HttpClient } from "@/lib/HttpClient";

const API_PREFIX_TRAINING_PATH = "/trainings";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

const http = new HttpClient(BASE_URL);

// Tạo mới một training
export const createTraining = (data: any) =>
  http.post<any>(`${API_PREFIX_TRAINING_PATH}`, data);

// Đăng ký tham gia một training (self trigger)
export const selfTriggerRegister = (trainingId: string, data: any) =>
  http.post<any>(
    `${API_PREFIX_TRAINING_PATH}/${trainingId}/self-trigger-register`,
    data
  );

// Đăng ký tham gia training cho một hoặc nhiều người dùng (manual trigger)
export const manualTriggerRegister = (trainingId: string, data: any) =>
  http.post<any>(
    `${API_PREFIX_TRAINING_PATH}/${trainingId}/manual-trigger-register`,
    data
  );

// Chèn thêm các sự kiện vào một training
export const addTrainingEvents = (trainingId: string, data: any) =>
  http.post<any>(`${API_PREFIX_TRAINING_PATH}/${trainingId}/events`, data);

// Thêm hoặc bớt thành viên (mentor, participant) cho một training
export const modifyTrainingMembers = (trainingId: string, data: any) =>
  http.put<any>(`${API_PREFIX_TRAINING_PATH}/${trainingId}/members`, data);

// Lấy chi tiết một training
export const getTrainingById = (trainingId: string) =>
  http.get<any>(`${API_PREFIX_TRAINING_PATH}/${trainingId}`);

// Cập nhật thông tin một training
export const updateTraining = (trainingId: string, data: any) =>
  http.patch<any>(`${API_PREFIX_TRAINING_PATH}/${trainingId}`, data);

// Tìm kiếm training của tôi (base theo creator hoặc mentor)
export const searchMyTrainings = (params?: {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: string;
}) =>
  http
    .get(`${API_PREFIX_TRAINING_PATH}/me/search`, {
      params,
    })
    .then((res) => res._embedded?.trainingWrapperDtoList ?? []);
