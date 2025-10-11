import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
import type { Event } from "@/constant/types";

interface ScheduleInput {
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
  timeSlots: string;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (createdAt: string | Date) => {
  const date = new Date(createdAt);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  const formattedTime = `${hours}:${minutes}:${seconds}`;
  const formattedDate = `${day}/${month}/${year}`;
  return { formattedDate, formattedTime };
};

export const getRoleUser = () => {
  const user = localStorage.getItem("user");
  if (user) {
    const parsedUser = JSON.parse(user);
    return parsedUser.role;
  }
};

export const isLeader = () => {
  const role = getRoleUser();
  return role === "LEADER" || role === "ADMIN";
};
export const getUser = () => {
  const user = localStorage.getItem("user");
  if (user) {
    return JSON.parse(user);
  }
  return null;
};

export function generateLessonFromSchedule(values: ScheduleInput): Event[] {
  const [startDate, endDate] = values.dateRange;
  const lessons: Event[] = [];

  const slotRegex = /([A-Za-z]{3})\s(\d{2}:\d{2})-(\d{2}:\d{2})/g;
  const slots: { day: number; start: string; end: string }[] = [];
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  let match;
  while ((match = slotRegex.exec(values.timeSlots)) !== null) {
    const [_, dayStr, start, end] = match;
    const weekday = dayMap[dayStr as keyof typeof dayMap];
    if (weekday !== undefined) {
      slots.push({ day: weekday, start, end });
    }
  }

  let current = startDate.startOf("day");
  while (current.isBefore(endDate.add(1, "day"), "day")) {
    slots.forEach((slot) => {
      if (current.day() === slot.day) {
        const startTime = current
          .hour(Number(slot.start.split(":")[0]))
          .minute(Number(slot.start.split(":")[1]));
        const endTime = current
          .hour(Number(slot.end.split(":")[0]))
          .minute(Number(slot.end.split(":")[1]));
        lessons.push({
          id: crypto.randomUUID(),
          title: `Lesson ${current.format("YYYY-MM-DD")} ${slot.start}`,
          location: {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            destination: "",
          },
        } as Event);
      }
    });
    current = current.add(1, "day");
  }

  return lessons;
}

interface JwtPayload {
  exp: number;
  iat?: number;
  [key: string]: any;
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded.exp) return true;
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}
