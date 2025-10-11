"use client";

import { Card, Avatar, Button, Select } from "antd";
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getInfoUser } from "@/modules/services/userService";
import { getRegisteredEvents } from "@/modules/services/eventService";
import { set } from "lodash";
import { Event } from "@/constant/types";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/lib/utils";

export default function Dashboard() {
  const { t } = useTranslation("common");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  interface UserInfo {
    username: string;
    email: string;
    nickname?: string;
    dateOfBirth?: string;
    role: string;
    attendancePoint: number;
    contributionPoint: number;
  }

  const [info, setInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    getInfoUser()
      .then((res) => {
        setInfo(res);
      })
      .catch((error) => {
        console.error("Failed to fetch user info:", error);
      });

    getRegisteredEvents()
      .then((res) => {
        setRegisteredEvents(res);
      })
      .catch((error) => {
        console.error("Failed to fetch registered events:", error);
      });
  }, []);

  const prevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const prevYear = () => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(newDate.getFullYear() - 1);
    setCurrentDate(newDate);
  };

  const nextYear = () => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(newDate.getFullYear() + 1);
    setCurrentDate(newDate);
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Dữ liệu cho Select tháng và năm
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: `Tháng ${i + 1}`,
  }));

  const years = Array.from({ length: 20 }, (_, i) => {
    const year = new Date().getFullYear() - 10 + i;
    return { value: year, label: year };
  });

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = new Date(year, month, 1).getDay();

    const eventsInMonth = registeredEvents.filter((event) => {
      const eventDate = new Date(event.location.startTime);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });

    const weeks = [];
    let day = 1;
    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (
          (i === 0 && j < (firstDay === 0 ? 6 : firstDay - 1)) ||
          day > daysInMonth
        ) {
          week.push(<td key={`${i}-${j}`} className="h-20 border"></td>);
        } else {
          const eventsForDay = eventsInMonth.filter(
            (event) => new Date(event.location.startTime).getDate() === day
          );

          week.push(
            <td
              key={`${i}-${j}`}
              className="h-20 border text-right align-top p-1"
            >
              <div className="font-medium">{day}</div>
              <div className="text-xs text-left space-y-1">
                {eventsForDay.map((event) => (
                  <div
                    key={event.id}
                    className="bg-blue-100 text-blue-800 rounded p-1"
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </td>
          );
          day++;
        }
      }
      weeks.push(<tr key={i}>{week}</tr>);
    }
    return weeks;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow md:col-span-2 rounded-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-4">
            <Avatar
              size={64}
              icon={<i className="fas fa-user-graduate"></i>}
              className=" !md:mb-0 !mb-[10px]"
            />
            <div className="pl-0 md:pl-3 w-full">
              <h3 className="font-bold text-blue-900 mb-2">
                {t("THÔNG TIN CÁ NHÂN")}
              </h3>
              <div className="flex flex-col md:flex-row justify-between gap-3">
                <div>
                  <p>
                    Username: <b>{info?.username}</b>
                  </p>
                  <p>
                    Nickname: <b>{info?.nickname}</b>
                  </p>
                  <p>
                    {t("Date of birth")}:{" "}
                    {formatDate(info?.dateOfBirth || "")?.formattedDate || ""}
                  </p>
                </div>
                <div>
                  <p>
                    {t("Attendance Point")}: <b>{info?.attendancePoint}</b>
                  </p>
                  <p>
                    {t("Contribution Point")}: <b>{info?.contributionPoint}</b>
                  </p>
                  <p>
                    {t("Role")}: {info?.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="shadow rounded-2xl">
          <h3 className="font-bold text-blue-900">{t("EVENT THIS WEEK")}</h3>
          <p className="text-gray-500">{t("Updating...")}</p>
          <a href="#" className="text-blue-600 text-sm">
            {t("View all events")}
          </a>
        </Card>
      </div>

      {/* Quản lý sự kiện */}
      <Card className="shadow rounded-2xl">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 gap-3">
          <h3 className="font-bold text-blue-900">QUẢN LÝ SỰ KIỆN</h3>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={currentDate.getMonth()}
              onChange={(val) =>
                setCurrentDate(new Date(currentDate.getFullYear(), val, 1))
              }
              options={months}
              style={{ width: 100 }}
            />
            <Select
              value={currentDate.getFullYear()}
              onChange={(val) =>
                setCurrentDate(new Date(val, currentDate.getMonth(), 1))
              }
              options={years}
              style={{ width: 100 }}
            />
            <Button onClick={prevYear} icon={<DoubleLeftOutlined />}></Button>
            <Button onClick={prevMonth} icon={<LeftOutlined />} />
            <Button onClick={nextMonth} icon={<RightOutlined />} />
            <Button onClick={nextYear} icon={<DoubleRightOutlined />}></Button>
            <Button type="default" onClick={goToday}>
              Hôm nay
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Th 2</th>
                <th className="border p-2">Th 3</th>
                <th className="border p-2">Th 4</th>
                <th className="border p-2">Th 5</th>
                <th className="border p-2">Th 6</th>
                <th className="border p-2">Th 7</th>
                <th className="border p-2">CN</th>
              </tr>
            </thead>
            <tbody>{renderCalendar()}</tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
