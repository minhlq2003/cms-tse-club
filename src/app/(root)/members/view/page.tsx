"use client";

import { useEffect, useState } from "react";
import { Card, Table, message, Spin } from "antd";
import {
  getDetailUser,
  USER_TYPES,
  USER_TYPE_OPTIONS,
} from "@/modules/services/userService";
import { useTranslation } from "react-i18next";
import { Event, UserShortInfoResponseDto } from "@/constant/types";
import { formatDate } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { Images } from "@/constant/image";
import Image from "next/image";

export default function UserDetailPage() {
  const { t } = useTranslation("common");
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const router = useRouter();

  const [userInfo, setUserInfo] = useState<UserShortInfoResponseDto | null>(
    null
  );
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentEventPage, setCurrentEventPage] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const info = await getDetailUser(userId!);
      setUserInfo(info);
    } catch (err) {
      message.error(t("Failed to fetch user information"));
    } finally {
      setLoading(false);
    }
  };

  const eventInfoColumns = [
    {
      title: "Tên sự kiện",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: Event) => (
        <a
          onClick={() => router.push(`/events/view?id=${record.id}`)}
          className="text-blue-600 cursor-pointer hover:underline"
        >
          {text}
        </a>
      ),
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "location.startTime",
      key: "startTime",
      render: (_: any, record: Event) => (
        <p>
          {formatDate(record.location.startTime)?.formattedTime} -{" "}
          {formatDate(record.location.startTime)?.formattedDate}
        </p>
      ),
    },
    {
      title: "Địa điểm",
      dataIndex: ["location", "destination"],
      key: "destination",
    },
  ];

  const decodeBitwiseType = (value?: number): number[] => {
    if (!value || value === 0) return [];

    const selectedValues: number[] = [];

    for (const [_, val] of Object.entries(USER_TYPES)) {
      if ((value & val) === val) {
        selectedValues.push(val);
      }
    }

    return selectedValues;
  };

  const generateUserTypes = (values?: number) => {
    const selectedTypes = decodeBitwiseType(values);
    return selectedTypes
      .map((type) => {
        const option = USER_TYPE_OPTIONS.find((opt) => opt.value === type);
        return option ? option.label : "";
      })
      .filter((type) => type !== "")
      .join(", ");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="p-6">
        <Card className="shadow rounded-2xl">
          <p className="text-center text-gray-500">{t("User not found")}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3">
        <Card className="shadow rounded-2xl">
          <div className="flex flex-col md:flex-row items-start w-full md:items-center space-y-3 md:space-y-0 md:space-x-4">
            <Image
              src={Images.avtDefault.src}
              alt="avatar"
              width={128}
              height={128}
            />
            <div className="pl-0 md:pl-10 w-full">
              <h2 className="font-bold text-blue-900 mb-2 text-xl">
                {t("THÔNG TIN NGƯỜI DÙNG")}
              </h2>
              <div className="flex flex-col md:flex-row justify-between w-full gap-4">
                <div className="w-full md:w-1/2">
                  <p>
                    <b>UID:</b> {userInfo.id}
                  </p>
                  <p>
                    <b>Username:</b> {userInfo.username}
                  </p>
                  <p>
                    <b>Email:</b> {userInfo.email}
                  </p>
                  <p>
                    <b>Nickname:</b> {userInfo.nickname || "—"}
                  </p>
                  <p>
                    <b>{t("Date of birth")}:</b>{" "}
                    {formatDate(userInfo.dateOfBirth || "")?.formattedDate ||
                      "—"}
                  </p>
                </div>
                <div className="w-full md:w-1/2 flex flex-col justify-end mt-4 md:mt-0">
                  <p>
                    <b>{t("Full Name")}:</b> {userInfo.fullName || "—"}
                  </p>
                  <p>
                    <b>Student ID:</b> {userInfo.studentId || "—"}
                  </p>
                  <p>
                    <b>{t("Role")}:</b> {userInfo.role}
                  </p>
                  <p>
                    <b>{t("Attendance Point")}:</b> {userInfo.attendancePoint}
                  </p>
                  <p>
                    <b>{t("Contribution Point")}:</b>{" "}
                    {userInfo.contributionPoint}
                  </p>
                  <p>
                    <b>{t("Nhóm người dùng")}:</b>{" "}
                    {generateUserTypes(userInfo.type)}
                  </p>
                  <p>
                    <b>Trạng thái:</b>{" "}
                    <span
                      className={
                        userInfo.disabled ? "text-red-600" : "text-green-600"
                      }
                    >
                      {userInfo.disabled ? "Đã vô hiệu hóa" : "Đang hoạt động"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* <Card className="shadow rounded-2xl">
          <h3 className="font-bold text-blue-900 mb-4 text-xl">
            {t("Events Hosted by This User")}
          </h3>
          <Table
            columns={eventInfoColumns}
            dataSource={events}
            rowKey="id"
            pagination={{
              pageSize: 5,
              current: currentEventPage,
              total: totalEvents,
              onChange: setCurrentEventPage,
            }}
            loading={loadingEvents}
          />
        </Card> */}
      </div>
    </div>
  );
}
