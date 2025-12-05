"use client";

import { useEffect, useState } from "react";
import { Card, Avatar, Button, Form, Input, Modal, Table, message } from "antd";
import {
  getMyInfoUser,
  updateUserInfo,
  changePassword,
} from "@/modules/services/userService";
import {
  getEvents,
  getRegisteredEvents,
} from "@/modules/services/eventService";
import { useTranslation } from "react-i18next";
import { Event } from "@/constant/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CopyIcon } from "lucide-react";

export default function ProfilePage() {
  const { t } = useTranslation("common");
  const [userInfo, setUserInfo] = useState<any>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
    fetchData();
    fetchEvents();
  }, []);

  const fetchData = async () => {
    try {
      const info = await getMyInfoUser();
      setUserInfo(info);

      form.setFieldsValue(info);
    } catch (err) {}
  };

  const fetchEvents = async () => {
    try {
      const res = await getEvents({
        page: 0,
        size: 5,
        isHost: true,
      });
      console.log("Event: ", res._embedded?.eventWrapperDtoList);
      setEvents(res._embedded?.eventWrapperDtoList || []);
    } catch (err) {}
  };

  const handleUpdateInfo = async () => {
    try {
      const values = await form.validateFields();
      await updateUserInfo(values);
      message.success("Cập nhật thông tin thành công!");
      setIsEditModalOpen(false);
      fetchData();
    } catch (err) {
      message.error("Cập nhật thất bại!");
    }
  };

  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      await changePassword(values);
      message.success("Đổi mật khẩu thành công!");
      setIsPasswordModalOpen(false);
      passwordForm.resetFields();
    } catch (err) {
      message.error("Đổi mật khẩu thất bại!");
    }
  };

  const columns = [
    {
      title: "Tên sự kiện",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: Event) => (
        <a
          onClick={() => router.push(`/events/view?id=${record.id}`)}
          className="text-blue-600"
        >
          {text}
        </a>
      ),
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "location.startTime",
      key: "startTime",
      render: (_: any, record: Event) =>
        formatDate(record.location.startTime)?.formattedDate,
    },
    {
      title: "Địa điểm",
      dataIndex: "location.destination",
      key: "destination",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <Card className="shadow rounded-2xl">
        <div className="flex flex-col md:flex-row items-start w-full md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <Avatar
            size={128}
            icon={<i className="fas fa-user"></i>}
            src="/images/usrLogo.png"
          />
          <div className="pl-0 md:pl-10 w-full">
            <h2 className="font-bold text-blue-900 mb-2 text-xl">
              {t("THÔNG TIN CÁ NHÂN")}
            </h2>
            <div className="flex justify-between w-full">
              <div className="w-full md:w-1/2">
                <p className="flex items-center gap-2">
                  <b>UID:</b> {userInfo?.id}
                  <Button
                    size="small"
                    icon={<CopyIcon size={14} />}
                    onClick={() => {
                      navigator.clipboard.writeText(userInfo?.id || "");
                      toast.success("Copied UID!");
                    }}
                  ></Button>
                </p>
                <p>
                  <b>Username:</b> {userInfo?.username}
                </p>
                <p>
                  <b>Email:</b> {userInfo?.email}
                </p>
                <p>
                  <b>Nickname:</b> {userInfo?.nickname || "—"}
                </p>
                <p>
                  <b>{t("Date of birth")}:</b>{" "}
                  {formatDate(userInfo?.dateOfBirth || "")?.formattedDate ||
                    "—"}
                </p>
              </div>
              <div className="w-full md:w-1/2 flex flex-col justify-end mt-4 md:mt-0">
                <p>
                  <b>{t("Full Name")}:</b> {userInfo?.fullName}
                </p>
                <p>
                  <b>{t("Role")}:</b> {userInfo?.role}
                </p>
                <p>
                  <b>{t("Attendance Point")}:</b> {userInfo?.attendancePoint}
                </p>
                <p>
                  <b>{t("Contribution Point")}:</b>{" "}
                  {userInfo?.contributionPoint}
                </p>
                <p>
                  <b>{t("Nhóm người dùng")}:</b>{" "}
                  {userInfo?.type == 2 ? "Giảng viên" : "Sinh viên"}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button type="primary" onClick={() => setIsEditModalOpen(true)}>
                Chỉnh sửa thông tin
              </Button>
              <Button onClick={() => setIsPasswordModalOpen(true)}>
                Đổi mật khẩu
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="shadow rounded-2xl">
        <h3 className="font-bold text-blue-900 mb-4 text-xl">
          {t("Events You Are Hosting")}
        </h3>
        <Table
          columns={columns}
          dataSource={events}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Modal
        title="Cập nhật thông tin"
        open={isEditModalOpen}
        onOk={handleUpdateInfo}
        onCancel={() => setIsEditModalOpen(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="fullName" label={t("Full Name")}>
            <Input />
          </Form.Item>
          <Form.Item name="nickname" label={t("Nickname")}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label={t("Email")}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="dateOfBirth" label={t("Date of Birth")}>
            <Input type="date" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Đổi mật khẩu"
        open={isPasswordModalOpen}
        onOk={handleChangePassword}
        onCancel={() => setIsPasswordModalOpen(false)}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Form layout="vertical" form={passwordForm}>
          <Form.Item
            name="oldPassword"
            label="Mật khẩu cũ"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmNewPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp!")
                  );
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
