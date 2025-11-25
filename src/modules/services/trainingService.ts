import { HttpClient } from "@/lib/HttpClient";

const API_PREFIX_TRAINING_PATH = "/trainings";
const API_PREFIX_LEADER_TRAINING_PATH = "/leader/trainings";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

const http = new HttpClient(BASE_URL);

export const createTraining = (data: any) =>
  http.post<any>(`${API_PREFIX_TRAINING_PATH}`, data);

export const selfTriggerRegister = (trainingId: string, data: any) =>
  http.post<any>(
    `${API_PREFIX_TRAINING_PATH}/${trainingId}/self-trigger-register`,
    data
  );

export const manualTriggerRegister = (trainingId: string, data: any) =>
  http.post<any>(
    `${API_PREFIX_TRAINING_PATH}/${trainingId}/manual-trigger-register`,
    data
  );

export const addTrainingEvents = (trainingId: string, data: any) =>
  http.post<any>(`${API_PREFIX_TRAINING_PATH}/${trainingId}/events`, data);

export const modifyTrainingMembers = (trainingId: string, data: any) =>
  http.put<any>(`${API_PREFIX_TRAINING_PATH}/${trainingId}/members`, data);

export const getTrainingById = (trainingId: string) =>
  http.get<any>(`${API_PREFIX_TRAINING_PATH}/${trainingId}`);

export const updateTraining = (trainingId: string, data: any) =>
  http.patch<any>(`${API_PREFIX_TRAINING_PATH}/${trainingId}`, data);

export const updateStatusTrainingByLeader = (
  trainingId: string,
  status: string
) =>
  http.patch<any>(`${API_PREFIX_LEADER_TRAINING_PATH}/${trainingId}/status`, {
    status,
  });

export const deleteTraining = (trainingId: string) =>
  http.delete<any>(`${API_PREFIX_LEADER_TRAINING_PATH}/${trainingId}`);

export const searchMyTrainings = (params?: {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: string;
  searchs?: string;
  searchValues?: string;
}) =>
  http
    .get(`${API_PREFIX_TRAINING_PATH}/me/search`, {
      params,
    })
    .then((res) => res._embedded?.trainingWrapperDtoList ?? []);

export const searchTrainingsByLeader = (params?: {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: string;
  deleted?: boolean;
  searchs?: string;
  searchValues?: string;
}) =>
  http
    .get(`${API_PREFIX_LEADER_TRAINING_PATH}/search`, {
      params,
    })
    .then((res) => res._embedded?.trainingWrapperDtoList ?? []);

export const recoverTrainingFromTrash = (trainingId: string) =>
  http.post<any>(`${API_PREFIX_LEADER_TRAINING_PATH}/${trainingId}/recover`);

export const moveTrainingToTrash = (trainingId: string) =>
  http.post<any>(`${API_PREFIX_TRAINING_PATH}/${trainingId}/delete`);
