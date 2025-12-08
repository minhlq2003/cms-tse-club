import { Event, EventSearchRequestDto, FunctionStatus, SearchDto, UserSearchRequestDto } from "@/constant/types";
import { HttpClient } from "@/lib/HttpClient";

const API_PREFIX_EVENT_PATH = "/events";
const API_PREFIX_LEADER_EVENT_PATH = "/leader/events";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

const http = new HttpClient(BASE_URL);

export const createEvent = (data: Event) =>
  http.post<Event>(`${API_PREFIX_EVENT_PATH}`, data);


export const getEvents = (params?: EventSearchRequestDto & {
  status?: FunctionStatus;
  isHost?: boolean;
}) => {
  const response = http.get(`${API_PREFIX_EVENT_PATH}/me/search`, {
    params,
  });
  return response.then((res) => res);
};

export const getEventByLeader = (params?: EventSearchRequestDto & {
  status?: FunctionStatus;
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
  http.delete<{ message: string }>(`${API_PREFIX_LEADER_EVENT_PATH}/${id}`);

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
  params?: {
    page?: number;
    size?: number;
    searchs?: string[];
    searchValues?: string[];
    status?: string;
  }
) => {
  const response = http.get(`${API_PREFIX_EVENT_PATH}/${id}/attendees`, {
    params,
  });
  return response.then((res) => res);
};

export const manualCheckIn = (eventId: string, data: string[]) =>{
   return http.post<any>(`${API_PREFIX_EVENT_PATH}/${eventId}/manual-check-in`, {
    attendeeIds: data,
  });
}

export const exportEventAttendees = (eventId: string) =>
  http.get(`${API_PREFIX_EVENT_PATH}/${eventId}/attendees/export`, {
    responseType: "blob",
  });

export const recoverEventFromTrash = (id: string) =>
  http.post<{ message: string }>(
    `${API_PREFIX_LEADER_EVENT_PATH}/${id}/recover`
  );

export const moveEventToTrash = (id: string) =>
  http.post<{ message: string; status: number }>(
    `${API_PREFIX_EVENT_PATH}/${id}/delete-event`
  );

export const updateContestResults = (eventId: string, data: any) =>
  http.put<any>(
    `${API_PREFIX_EVENT_PATH}/contest/${eventId}/update-standing`,
    data
  );

export const getSeminarReview = (eventId: string) =>
  http.get(`${API_PREFIX_EVENT_PATH}/seminar/${eventId}/get-review`);

export const getCodeCheckIn = (
  eventId: string,
  endTime: string,
  forceNew: boolean
) =>
  http.get<{ code: string }>(
    `${API_PREFIX_EVENT_PATH}/${eventId}/code?endTime=${endTime}&forceNew=${forceNew}`
  );

export const triggerEventDone = (eventId: string) =>
  http.patch<{ message: string; code: string; status: number; response: any }>(
    `${API_PREFIX_LEADER_EVENT_PATH}/${eventId}/trigger-done`,
    {}
  );

export const addAttendees = (eventId: string, attendeeIds: string[]) =>
  http.post<Event>(`${API_PREFIX_EVENT_PATH}/${eventId}/manual-user-register`, {
    userIds: [...attendeeIds],
  });

export const removeAttendees = (eventId: string, attendeeIds: string[]) =>
  http.post<Event>(
    `${API_PREFIX_EVENT_PATH}/${eventId}/manual-remove-attendees`,
    {
      attendeeIds: [...attendeeIds],
    }
  );


export const getAvailableUsersToBecomeAttendee = (eventId: string, params?: SearchDto) => {
  const response = http.get(`${API_PREFIX_EVENT_PATH}/${eventId}/search/available-attendees`, {
    params,
  });
  return response.then((res) => res);
}

export const getContestExamResults = (eventId: string, params?: SearchDto) => {
  const response = http.get(`${API_PREFIX_EVENT_PATH}/contest/${eventId}/exam-results`, {
    params,
  });
  return response.then((res) => res);
}

export const searchAvailableUsersToBecomeOrganizer = (eventId: string, params?: UserSearchRequestDto) => {
  const response = http.get(`${API_PREFIX_EVENT_PATH}/${eventId}/search/available-organizers`, {
    params,
  });
  return response;
}