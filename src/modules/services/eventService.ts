import { Event } from "@/constant/types";
import { HttpClient } from "@/lib/HttpClient";

const API_PREFIX_BOOK_PATH = "/events";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

const http = new HttpClient(BASE_URL);

export const createEvent = (data: Event) =>
  http.post<Event>(`${API_PREFIX_BOOK_PATH}`, data);

export const getEvents = (params?: {
  page?: number;
  limit?: number;
  eventType?: string;
  isDone?: boolean;
  keyword?: string;
  category?: string;
  status?: string;
}) => {
  const response = http.get(`${API_PREFIX_BOOK_PATH}/me/search`, {
    params,
  });
  return response.then((res) => res._embedded.eventWrapperDtoList);
};

export const getEventById = (id: string) =>
  http.get(`${API_PREFIX_BOOK_PATH}/${id}`);

export const updateEvent = (id: string, data: Event) =>
  http.put<Event>(`${API_PREFIX_BOOK_PATH}/${id}`, data);

export const deleteEvent = (id: string) =>
  http.delete<{ message: string }>(`${API_PREFIX_BOOK_PATH}/${id}`);

export const modifyOrganizers = (id: string, organizers: any[]) =>
  http.put<Event>(`${API_PREFIX_BOOK_PATH}/${id}/modify-organizers`, {
    organizers,
  });

export const banUserFromEvent = (eventId: string, userId: string[]) =>
  http.put<Event>(`${API_PREFIX_BOOK_PATH}/${eventId}/trigger-ban-user`, {
    attendeeIds: userId,
  });
