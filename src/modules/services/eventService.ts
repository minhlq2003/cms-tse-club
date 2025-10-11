import { Event } from "@/constant/types";
import { HttpClient } from "@/lib/HttpClient";

const API_PREFIX_EVENT_PATH = "/events";
const API_PREFIX_LEADER_EVENT_PATH = "/leader/events";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

const http = new HttpClient(BASE_URL);

export const createEvent = (data: Event) =>
  http.post<Event>(`${API_PREFIX_EVENT_PATH}`, data);

export const getEvents = (params?: {
  page?: number;
  size?: number;
  eventType?: string;
  isDone?: boolean;
  keyword?: string;
  category?: string;
  status?: string;
}) => {
  const response = http.get(`${API_PREFIX_EVENT_PATH}/me/search`, {
    params,
  });
  return response.then((res) => res);
};

export const getEventByLeader = (params?: {
  page?: number;
  size?: number;
  eventType?: string;
  isDone?: boolean;
  keyword?: string;
  category?: string;
  status?: string;
}) => {
  const response = http.get(`${API_PREFIX_LEADER_EVENT_PATH}/search`, {
    params,
  });
  return response.then((res) => res);
};

export const getEventById = (id: string) =>
  http.get(`${API_PREFIX_EVENT_PATH}/${id}`);

export const updateEvent = (id: string, data: Event) =>
  http.patch<Event>(`${API_PREFIX_EVENT_PATH}/${id}/update-event`, data);

export const deleteEvent = (id: string) =>
  http.delete<{ message: string }>(`${API_PREFIX_EVENT_PATH}/${id}`);

export const modifyOrganizers = (id: string, organizers: any[]) =>
  http.put<Event>(`${API_PREFIX_EVENT_PATH}/${id}/modify-organizers`, {
    organizers,
  });

export const banUserFromEvent = (eventId: string, userId: string[]) =>
  http.put<Event>(`${API_PREFIX_EVENT_PATH}/${eventId}/trigger-ban-user`, {
    attendeeIds: userId,
  });

export const getRegisteredEvents = (params?: {
  page?: number;
  size?: number;
  keyword?: string;
  type?: string;
  isDone?: boolean;
  startTime?: string;
  endTime?: string;
  sort?: string;
}) => {
  const request = { request: params };
  const response = http.get(
    `${API_PREFIX_EVENT_PATH}/search/registered-events`,
    { params: request }
  );
  return response.then((res) => res._embedded.eventWrapperDtoList);
};

export const updateStatusEventByLeader = (id: string, status: string) =>
  http.patch<Event>(
    `${API_PREFIX_LEADER_EVENT_PATH}/${id}/status?eventId=${id}`,
    {
      status: status,
    }
  );

export const getEventAttendees = (
  id: string,
  params?: { page?: number; size?: number }
) => {
  const response = http.get(`${API_PREFIX_EVENT_PATH}/${id}/attendees`, {
    params,
  });
  return response.then((res) => res);
};

export const manualCheckIn = (eventId: string, data: string[]) =>
  http.post<any>(`${API_PREFIX_EVENT_PATH}/${eventId}/manual-check-in`, {
    attendeeIds: data,
  });
