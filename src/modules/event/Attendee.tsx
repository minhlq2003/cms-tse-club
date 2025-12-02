"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Table,
  Typography,
  message,
  Tag,
  Checkbox,
  Alert,
  Input,
  Select,
  Spin,
} from "antd";
import {
  CaretDownOutlined,
  CaretUpOutlined,
  EyeOutlined,
  TrophyOutlined,
  StarOutlined,
  QrcodeOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import {
  exportEventAttendees,
  getEventAttendees,
  manualCheckIn,
  getCodeCheckIn,
  addAttendees,
  removeAttendees,
  updateContestResults,
  getSeminarReview,
} from "../services/eventService";
import { getUser } from "../services/userService";
import { Member, ExamResult } from "@/constant/types";
import dayjs from "dayjs";
import ContestResultsModal from "./ContestResultModal";
import SeminarReviewsModal from "./SeminarReviewModal";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

export interface Attendee {
  id: string;
  user: Member;
  status: string;
  checkIn?: boolean;
  fullName?: string;
  nickname?: string;
  email?: string;
  dateOfBirth?: string;
}

interface EventAttendeesProps {
  eventId?: string;
  startTime?: string;
  endTime?: string;
  userRole?: string;
  eventCategory?: string;
  canCheckIn?: boolean;
  eventDone?: boolean;
  // 🆕 Props cho permission
  isHost?: boolean;
  userAsOrganizer?: { roles: string[] };
}

const EventAttendees: React.FC<EventAttendeesProps> = ({
  eventId,
  startTime,
  endTime,
  userRole,
  eventCategory,
  canCheckIn = false,
  eventDone = false,
  isHost = false,
  userAsOrganizer,
}) => {
  const { t } = useTranslation("common");
  const [isListVisible, setListVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
    total: 0,
  });

  const [contestResults, setContestResults] = useState<ExamResult[]>([]);
  const [isContestModalOpen, setIsContestModalOpen] = useState(false);

  const [seminarReviews, setSeminarReviews] = useState<any[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const [checkInModalVisible, setCheckInModalVisible] = useState(false);
  const [checkInCode, setCheckInCode] = useState("");
  const [loadingCode, setLoadingCode] = useState(false);

  // 🆕 States for adding participants
  const [addParticipantModalVisible, setAddParticipantModalVisible] =
    useState(false);
  const [availableUsers, setAvailableUsers] = useState<Member[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchUserKeyword, setSearchUserKeyword] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const now = new Date();
  const start = startTime ? new Date(startTime) : null;
  const end = endTime ? new Date(endTime) : null;
  const isDuringEvent = Boolean(start && now >= start);
  const isEventEnded = Boolean(end && now > end);

  // 🆕 Kiểm tra quyền REGISTER
  const canRegister = () => {
    if (isHost || userRole === "LEADER" || userRole === "ADMIN") return true;
    const roles = userAsOrganizer?.roles || [];
    return roles.includes("REGISTER");
  };

  const canUpdateContest =
    isEventEnded &&
    eventCategory === "CONTEST" &&
    ["MODIFY"].includes(userRole || "");
  const canViewReviews =
    isEventEnded &&
    eventCategory === "SEMINAR" &&
    ["LEADER"].includes(userRole || "");

  useEffect(() => {
    if (isModalOpen) {
      fetchAttendees(pagination.current, pagination.pageSize);
    }
  }, [eventId, keyword, statusFilter, isModalOpen, pagination.current, pagination.pageSize]);

  const fetchAttendees = async (page: number, size: number) => {
    if (!eventId) return;
    try {
      setLoading(true);
      const modifiedKeyWord = "*" + keyword.trim() + "*";
      const res = await getEventAttendees(eventId, {
        page: page - 1,
        size,
        searchs: ["fullName", "nickname", "email"],
        searchValues: [modifiedKeyWord, modifiedKeyWord, modifiedKeyWord],
        status: statusFilter,
      });
      const list = Array.isArray(res._embedded?.attendeeDtoList)
        ? res._embedded.attendeeDtoList
        : Array.isArray(res)
        ? res
        : [];
      setAttendees(
        list.map((a: any) => ({
          id: a.id,
          fullName: a.fullName,
          nickname: a.nickname,
          email: a.email,
          dateOfBirth: a.dateOfBirth,
          user: a.user || a.attendee || a.userDto || {},
          status: a.status || a.attendeeStatus || "UNKNOWN",
          checkIn: a.checkIn || false,
        }))
      );
      setPagination(prev => ({
        ...prev,
        total: res.page?.totalElements || 0,
      }));
    } catch (err) {
      message.error(t("Failed to fetch attendees"));
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Fetch available users for adding
  const fetchAvailableUsers = async (keyword: string = "") => {
    try {
      setLoadingUsers(true);
      const res = await getUser({ keyword, page: 0, size: 100 });
      if (Array.isArray(res._embedded?.userShortInfoResponseDtoList)) {
        const allUsers = res._embedded.userShortInfoResponseDtoList;
        // Lọc ra những user chưa là attendee
        const attendeeIds = attendees.map((a) => a.user.id);
        const filtered = allUsers.filter(
          (u: Member) => !attendeeIds.includes(u.id)
        );
        setAvailableUsers(filtered);
      }
    } catch (err) {
      message.error(t("Failed to fetch users"));
    } finally {
      setLoadingUsers(false);
    }
  };

  // 🆕 Open add participant modal
  const openAddParticipantModal = () => {
    setAddParticipantModalVisible(true);
    setSelectedUserIds([]);
    setSearchUserKeyword("");
    fetchAvailableUsers();
  };

  // 🆕 Handle add participants
  const handleAddParticipants = async () => {
    if (!eventId || selectedUserIds.length === 0) {
      message.warning(t("Vui lòng chọn ít nhất một người"));
      return;
    }

    try {
      setLoading(true);
      await addAttendees(eventId, selectedUserIds);
      message.success(t("Đã thêm người tham gia thành công"));
      setAddParticipantModalVisible(false);
      fetchAttendees();
    } catch (err) {
      message.error(t("Không thể thêm người tham gia"));
    } finally {
      setLoading(false);
    }
  };

  // Debounce search users
  useEffect(() => {
    if (!addParticipantModalVisible) return;

    const timeoutId = setTimeout(() => {
      fetchAvailableUsers(searchUserKeyword);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchUserKeyword, addParticipantModalVisible, attendees]);

  const handleGenerateCode = async (forceNew: boolean = false) => {
    if (!eventId || !endTime) return;

    setLoadingCode(true);
    try {
      const formattedEndTime = dayjs(endTime).format("YYYY-MM-DDTHH:mm:ss");
      const res = await getCodeCheckIn(eventId, formattedEndTime, forceNew);
      if (res?.code) {
        setCheckInCode(res.code);
        message.success(
          forceNew ? t("Đã tạo mã mới thành công") : t("Lấy mã thành công")
        );
      }
    } catch (error: any) {
      message.error(error?.message || t("Không thể tạo mã điểm danh"));
    } finally {
      setLoadingCode(false);
    }
  };

  const fetchContestResults = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const initialResults: ExamResult[] = attendees
        .filter((a) => a.status === "CHECKED")
        .map((a) => ({
          userId: a.user.id,
          student: a.user,
          rank: 0,
          point: 0,
        }));
      setContestResults(initialResults);
    } catch (err) {
      message.error(t("Failed to load contest results"));
    } finally {
      setLoading(false);
    }
  };

  const fetchSeminarReviews = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await getSeminarReview(eventId);
      const reviews = Array.isArray(res.reviews)
        ? res.reviews
        : Array.isArray(res)
        ? res
        : [];
      setSeminarReviews(reviews);
    } catch (err) {
      message.error(t("Không thể tải đánh giá"));
    } finally {
      setLoading(false);
    }
  };

  const openContestModal = () => {
    setIsContestModalOpen(true);
    fetchContestResults();
  };

  const openReviewModal = () => {
    setIsReviewModalOpen(true);
    fetchSeminarReviews();
  };

  const openCheckInCodeModal = () => {
    setCheckInModalVisible(true);
    handleGenerateCode(false);
  };

  const toggleCheckInLocal = (userId: string) => {
    setAttendees((prev) =>
      prev.map((a) => (a.id === userId ? { ...a, checkIn: !a.checkIn } : a))
    );
  };

  const handleCheckInAllLocal = () => {
    setAttendees((prev) => prev.map((a) => ({ ...a, checkIn: true })));
  };

  const handleCancelAllLocal = () => {
    setAttendees((prev) => prev.map((a) => ({ ...a, checkIn: false })));
  };

  const handleExportExcel = async () => {
    try {
      const res = await exportEventAttendees(eventId!);
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const disposition = res.headers["content-disposition"];
      const filenameMatch = disposition?.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch ? filenameMatch[1] : "attendees.xlsx";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = decodeURIComponent(filename);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const handleSave = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const checkedIds = attendees.filter((a) => a.checkIn).map((a) => a.id);
      const res = await manualCheckIn(eventId, checkedIds);
      if (res?.ok || res?.status === 200 || res === true) {
        message.success(t("Check-in data saved successfully!"));
        setIsModalOpen(false);
        fetchAttendees(pagination.current, pagination.pageSize);
      } else {
        message.error(
          `${t("Failed to save check-in")} ${
            res?.status ? `(status ${res.status})` : ""
          }`
        );
      }
    } catch (err) {
      message.error(t("Error occurred while saving check-in data"));
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination: any) => {
    setPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: pagination.total,
    });
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const attendeeColumns = [
    {
      title: t("ID"),
      key: "id",
      render: (_: any, record: Attendee) => record.id || record.user?.id || "-",
    },
    {
      title: t("Full Name"),
      key: "fullName",
      render: (_: any, record: Attendee) => (
        <span className="font-semibold">
          {record.fullName || record.user?.fullName}
        </span>
      ),
    },
    {
      title: t("Username / Nickname"),
      key: "username",
      render: (_: any, record: Attendee) =>
        record.nickname || record.user?.username || "-",
    },
    {
      title: t("Email"),
      key: "email",
      render: (_: any, record: Attendee) =>
        record.email || record.user?.email || "-",
    },
    {
      title: t("Status"),
      key: "status",
      render: (_: any, record: Attendee) => {
        const status = (record.status || "UNKNOWN").toUpperCase();
        let color = "default";
        if (status === "CHECKED") color = "green";
        else if (status === "REGISTERED") color = "blue";
        else if (status === "MISSED") color = "red";
        return <Tag color={color}>{t(status)}</Tag>;
      },
    },
    {
      title: t("Check in"),
      key: "checkin",
      render: (_: any, record: Attendee) => (
        <Checkbox
          checked={Boolean(record.checkIn)}
          onChange={() => toggleCheckInLocal(record.id)}
          disabled={!canCheckIn || eventDone}
        />
      ),
    },
  ];

  const userColumns = [
    {
      title: t("Full Name"),
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: t("Username"),
      dataIndex: "username",
      key: "username",
    },
    {
      title: t("Email"),
      dataIndex: "email",
      key: "email",
    },
  ];

  const shortColumns = [
    {
      key: "fullName",
      render: (_: any, record: Attendee) => (
        <span className="font-semibold">
          {record.fullName ||
            record.nickname ||
            record.user?.fullName ||
            record.user?.username}
        </span>
      ),
    },
    {
      key: "status",
      render: (_: any, record: Attendee) => {
        const s = (record.status || "UNKNOWN").toUpperCase();
        const cls =
          s === "CHECKED"
            ? "text-green-600"
            : s === "REGISTERED"
            ? "text-blue-600"
            : s === "MISSED"
            ? "text-red-600"
            : "text-gray-500";
        return <span className={cls}>{t(s)}</span>;
      },
    },
  ];

  return (
    <div className="event-attendees border border-gray-300 rounded-[10px] mb-5">
      <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300">
        <Title level={4} className="!m-0">
          {t("Attendees")}
        </Title>
        <Button
          onClick={() => setListVisible(!isListVisible)}
          className="flex items-center"
          icon={isListVisible ? <CaretDownOutlined /> : <CaretUpOutlined />}
          type="text"
        />
      </div>

      {isListVisible && (
        <div>
          <div className="block md:hidden">
            <Table
              rowKey={(record: Attendee) => record.id}
              columns={shortColumns}
              dataSource={attendees}
              loading={loading}
              showHeader={false}
              pagination={false}
              size="small"
            />
          </div>

          <div className="hidden md:block">
            <Table
              className="p-2"
              rowKey={(record: Attendee) => record.id}
              columns={shortColumns}
              dataSource={attendees}
              loading={loading}
              showHeader={false}
              pagination={false}
            />
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t bg-[#f6f7f7] border-gray-300 rounded-b-[10px] p-4">
            <Button
              onClick={openModal}
              className="flex items-center"
              icon={<EyeOutlined />}
              type="primary"
            >
              {t("View Full List")}
            </Button>

            {/* 🆕 Nút thêm người tham gia */}
            {canRegister() && !eventDone && (
              <Button
                onClick={openAddParticipantModal}
                icon={<UserAddOutlined />}
                type="default"
              >
                {t("Thêm người tham gia")}
              </Button>
            )}

            {canCheckIn && !eventDone && isDuringEvent && (
              <Button
                onClick={openCheckInCodeModal}
                icon={<QrcodeOutlined />}
                type="default"
              >
                {t("Mã điểm danh")}
              </Button>
            )}

            {canUpdateContest && (
              <Button
                onClick={openContestModal}
                icon={<TrophyOutlined />}
                type="default"
              >
                {t("Cập nhật kết quả thi")}
              </Button>
            )}

            {canViewReviews && (
              <Button
                onClick={openReviewModal}
                icon={<StarOutlined />}
                type="default"
              >
                {t("Xem đánh giá")}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Attendees Modal */}
      <Modal
        title={
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <p className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-0">
              {t("Attendee List")}
            </p>
            <div className="flex gap-2 sm:gap-4">
              <Button type="primary" onClick={handleExportExcel}>
                {t("Xuất Excel")}
              </Button>
              <Button
                onClick={handleCheckInAllLocal}
                disabled={!canCheckIn || eventDone}
              >
                {t("Check in All")}
              </Button>
              <Button
                onClick={handleCancelAllLocal}
                danger
                disabled={!canCheckIn || eventDone}
              >
                {t("Cancel All")}
              </Button>
            </div>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={
          <div className="flex flex-col items-end gap-2">
            {(!canCheckIn || eventDone || !isDuringEvent) && (
              <Alert
                type="warning"
                message={
                  eventDone
                    ? t("Sự kiện đã kết thúc, không thể điểm danh")
                    : !isDuringEvent
                    ? t("Sự kiện chưa bắt đầu, bạn không thể điểm danh")
                    : t("Bạn không có quyền điểm danh")
                }
                showIcon
              />
            )}
            <div className="flex gap-2">
              <Button onClick={() => setIsModalOpen(false)}>
                {t("Close")}
              </Button>
              <Button
                type="primary"
                onClick={handleSave}
                disabled={!canCheckIn || eventDone || !isDuringEvent}
              >
                {t("Save")}
              </Button>
            </div>
          </div>
        }
        width="90%"
        className="!max-w-[1100px]"
      >
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Search
            placeholder={t("Search attendee")}
            allowClear
            onChange={(e) => setKeyword(e.target.value)}
            style={{ maxWidth: 320 }}
            enterButton
          />
          <Select
            placeholder={t("Filter by status")}
            allowClear
            style={{ width: 200 }}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
          >
            <Option value="REGISTERED">{t("REGISTERED")}</Option>
            <Option value="CHECKED">{t("CHECKED")}</Option>
            <Option value="MISSED">{t("MISSED")}</Option>
          </Select>
        </div>

        <Table
          rowKey={(record: Attendee) => record.id}
          columns={attendeeColumns}
          dataSource={attendees}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Modal>

      {/* 🆕 Add Participant Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <UserAddOutlined style={{ fontSize: 24 }} />
            <span>{t("Thêm người tham gia")}</span>
          </div>
        }
        open={addParticipantModalVisible}
        onCancel={() => setAddParticipantModalVisible(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setAddParticipantModalVisible(false)}
          >
            {t("Hủy")}
          </Button>,
          <Button
            key="add"
            type="primary"
            onClick={handleAddParticipants}
            loading={loading}
            disabled={selectedUserIds.length === 0}
          >
            {t("Thêm")} ({selectedUserIds.length})
          </Button>,
        ]}
        width={700}
      >
        <div className="mb-4">
          <Search
            placeholder={t("Tìm kiếm theo tên, username hoặc email")}
            value={searchUserKeyword}
            onChange={(e) => setSearchUserKeyword(e.target.value)}
            allowClear
          />
        </div>

        <Table
          rowKey="id"
          columns={userColumns}
          dataSource={availableUsers}
          loading={loadingUsers}
          rowSelection={{
            selectedRowKeys: selectedUserIds,
            onChange: (keys) => setSelectedUserIds(keys as string[]),
          }}
          pagination={{ pageSize: 5 }}
        />
      </Modal>

      {/* Check-in Code Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <QrcodeOutlined style={{ fontSize: 24 }} />
            <span>{t("Mã điểm danh")}</span>
          </div>
        }
        open={checkInModalVisible}
        onCancel={() => setCheckInModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setCheckInModalVisible(false)}>
            {t("Đóng")}
          </Button>,
          <Button
            key="refresh"
            type="primary"
            loading={loadingCode}
            onClick={() => handleGenerateCode(true)}
          >
            {t("Tạo mã mới")}
          </Button>,
        ]}
        width={500}
      >
        <div className="py-4">
          {loadingCode ? (
            <div className="flex justify-center py-8">
              <Spin />
            </div>
          ) : checkInCode ? (
            <div className="text-center">
              <div className="mb-4">
                <Text type="secondary">{t("Mã điểm danh hiện tại")}:</Text>
              </div>
              <Input
                value={checkInCode}
                readOnly
                size="large"
                className="text-center font-mono text-2xl font-bold"
                style={{ fontSize: 28 }}
              />
              <div className="mt-4">
                <Text type="secondary" className="text-sm">
                  {t("Mã này sẽ hết hiệu lực sau 10 phút kể từ thời điểm tạo")}
                </Text>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Text type="secondary">{t("Không thể tải mã điểm danh")}</Text>
            </div>
          )}
        </div>
      </Modal>

      {/* Contest Results Modal */}
      {eventId && (
        <ContestResultsModal
          open={isContestModalOpen}
          onClose={() => setIsContestModalOpen(false)}
          eventId={eventId}
          attendees={attendees}
        />
      )}

      {/* Seminar Reviews Modal */}
      {eventId && (
        <SeminarReviewsModal
          open={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          eventId={eventId}
        />
      )}
    </div>
  );
};

export default EventAttendees;
