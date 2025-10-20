"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Button, Spin, Tag } from "antd";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { getEventById } from "@/modules/services/eventService";
import { Event, Organizer } from "@/constant/types";
import EventOrganizers from "@/modules/event/EventOrganizers";
import EventAttendees from "@/modules/event/Attendee";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { getUser } from "@/lib/utils";

const ViewEvent = () => {
  const { t } = useTranslation("common");
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState<Event | null>(null);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [userRole, setUserRole] = useState<string>("");

  const fetchEvent = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const res = await getEventById(id);
        const data = res;

        if (data) {
          setEventData(data);
          setOrganizers(
            Array.isArray(data.organizers)
              ? data.organizers.map((org: any) => ({
                  organizerId: org.organizer.id,
                  fullName: org.organizer.fullName,
                  email: org.organizer.email,
                  username: org.organizer.username,
                  roles: org.roles,
                  roleContent: org.roleContent,
                }))
              : []
          );

          // ✅ Lấy ID người dùng hiện tại
          const currentUser = getUser();
          const currentId = currentUser?.id;

          // ✅ Xác định vai trò người dùng trong sự kiện
          let role = "VIEWER";
          if (data.host?.id === currentId) {
            role = "HOST";
          } else if (
            data.organizers?.some(
              (org: any) =>
                org.organizer.id === currentId &&
                org.roles?.some((r: string) => r === "CHECKER")
            )
          ) {
            role = "CHECKER";
          }
          setUserRole(role);
        } else {
          toast.error(t("Event not found"));
        }
      } catch {
        toast.error(t("Failed to fetch event."));
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    if (id) fetchEvent(id);
  }, [id, fetchEvent]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Spin size="large" />
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="p-10 text-center">
        <p>{t("No event data available")}</p>
        <Button type="primary" onClick={() => router.push("/events")}>
          {t("Back to events")}
        </Button>
      </div>
    );
  }

  const { title, description, category, multiple, location, status, host } =
    eventData;

  return (
    <div className="min-h-[85vh] bg-white flex flex-col items-center justify-start rounded-lg gap-4 px-4 pt-10 mb-5">
      <div className="w-full">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/events")}
          className="mb-4"
        >
          {t("Back")}
        </Button>

        <h1 className="ml-[10px] text-3xl font-bold pb-3 md:pb-6">{title}</h1>

        <div className="flex flex-col md:flex-row justify-between w-full ">
          <div className="w-full md:w-[78%] p-4 bg-gray-200 rounded-3xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Tag color="blue">{t(category || "Event")}</Tag>
              <Tag
                color={
                  status === "PENDING"
                    ? "orange"
                    : status === "ACCEPTED"
                    ? "green"
                    : "red"
                }
              >
                {t(status || "PENDING")}
              </Tag>
              <Tag color="purple">
                {t("Limit")}: {multiple || 0}
              </Tag>
            </div>

            <div className="space-y-2 text-gray-600 text-md">
              <p className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <span>
                  <strong>{t("START")}:</strong>{" "}
                  {new Date(location.startTime).toLocaleString()}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <span>
                  <strong>{t("END")}:</strong>{" "}
                  {new Date(location.endTime).toLocaleString()}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>
                  <strong>{t("LOCATION")}:</strong> {location?.destination}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>
                  <strong>{t("HOST")}:</strong> {host?.fullName}
                </span>
              </p>
            </div>

            <div className="w-full flex flex-col justify-between">
              <div
                dangerouslySetInnerHTML={{ __html: description || "" }}
                className="text-md text-gray-700 my-6"
              />
            </div>
          </div>

          <div className="md:w-[22%] w-full pl-0 md:pl-5">
            <EventOrganizers
              organizers={organizers}
              onChangeOrganizers={setOrganizers}
              eventId={id || ""}
              isView={true}
            />
            <EventAttendees
              startTime={location.startTime}
              endTime={location.endTime}
              eventId={id || ""}
              userRole={userRole}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEvent;
