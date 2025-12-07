"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Popconfirm,
  Table,
  Modal,
  Select,
  Form,
  Alert,
  Input, // Thêm Input cho form
  InputNumber,
  DatePicker,
  Checkbox, // Thêm InputNumber cho điểm
} from "antd";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  changeRole,
  getUser,
  getUserInfo,
  resetPassword,
  updateUserInfoByLeader,
  USER_TYPE_OPTIONS,
  USER_TYPES, // Đã được import
} from "../services/userService";
import { getRoleUser, isLeader } from "@/lib/utils";
import { toast } from "sonner";
import dayjs from "dayjs"; // Sử dụng dayjs
import UpdateUserInfoModal from "./UpdateUserInfoModal";
import { AxiosError, AxiosResponse } from "axios";

interface Member {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  attendancePoint?: number;
  contributionPoint?: number;
  dateOfBirth?: string;
  nickname?: string;
  studentId?: string;
  type?: number;
}

export default function ListMember({
  searchTerm,
}: {
  searchTerm: string | undefined;
}) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const leader = isLeader();
  const currentUserRole = getRoleUser();

  const [isModalOpen, setIsModalOpen] = useState(false); // Modal đổi role
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const [showConfirmTransfer, setShowConfirmTransfer] = useState(false);

  // --- Bổ sung cho Modal cập nhật thông tin người dùng ---
  const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false); // Modal cập nhật thông tin
  const [userInfoForm] = Form.useForm(); // Hook form của Ant Design

const fetchMembers = async () => { 
    const fetchMembersAsync = async () => {
        try {
            setLoading(true);
            const res = await getUser({
                keyword: searchTerm,
                page: currentPage - 1,
            });
            if (res._embedded == undefined){
                setMembers([]);
                setCurrentPage(1);
                setTotal(0);
            }
            else if (Array.isArray(res._embedded.userShortInfoResponseDtoList)) {
                setMembers(res._embedded.userShortInfoResponseDtoList);
                setCurrentPage(res.page.number + 1);
                setTotal(res.page.totalElements);
            }
        } catch {
            toast.error(t("Failed to fetch members"));
        } finally {
            setLoading(false);
        }
    };
    
    // *** Thêm setTimeout ở đây ***
    setTimeout(() => {
        fetchMembersAsync();
    }, 500); // 500 milliseconds = 0.5 giây  
  };

  useEffect(() => {
    fetchMembers();
  }, [searchTerm, currentPage]);

  const handleResetPassword = async (userId: string) => {
    try {
      const newPassword = prompt(t("Enter new password:"));
      if (!newPassword) return;
      const res = await resetPassword(userId, newPassword);
      console.log("Reset password response:", res);
      if (res.status / 100 !== 2) {
        toast.error(res.response?.data?.errors?.newPassword || res.response?.data?.detail || t("Failed to reset password"));
        return;
      }
      toast.success(t("Password reset successfully"));
    } catch {
      toast.error(t("Failed to reset password"));
    }
  };

  // --- Hàm mở Modal đổi role ---
  const openChangeRoleModal = (member: Member) => {
    setSelectedMember(member);
    setSelectedRole(member.role);
    setShowConfirmTransfer(false);
    setIsModalOpen(true);
  };

  // --- Hàm xử lý đổi role ---
  const handleConfirmChangeRole = async () => {
    if (!selectedMember) return;

    const currentRole = selectedMember.role;
    const newRole = selectedRole;

    // Nếu LEADER chuyển quyền cho MEMBER
    if (
      currentUserRole === "LEADER" &&
      currentRole === "MEMBER" &&
      newRole === "LEADER" &&
      !showConfirmTransfer
    ) {
      // Hiển thị cảnh báo trong modal
      setShowConfirmTransfer(true);
      return;
    }

    try {
    // 1. Thực hiện gọi API.
    // Nếu thành công (status 2xx), kết quả được gán vào `response`.
    const response = await changeRole(selectedMember.id, newRole);

    if (response.status !=null && response.status / 100 !== 2) {
      throw new Error(response.response?.data?.detail || "Failed to change role");
    }
    // 2. Xử lý THÀNH CÔNG:
    toast.success(`${t("Changed role to")} ${newRole}`);
    
    // Gọi hàm fetchMembers để cập nhật danh sách sau khi thay đổi thành công
    fetchMembers(); 

  } catch (error) {
    
    // console.log("Error changing role:", error);
    toast.error(error instanceof Error ? error.message : t("Failed to change role"));
  }
 finally {
      setIsModalOpen(false);
    }
  };



  const openChangeUserInfo = (member: Member) => {
    setSelectedMember(member);
    setIsUserInfoModalOpen(true);
    // Thiết lập giá trị ban đầu cho form
    userInfoForm.setFieldsValue({
      fullName: member.fullName,
      email: member.email,
      dateOfBirth: dayjs(member.dateOfBirth),
      nickname: member.nickname,
      studentId: member.studentId,
    });
    console.log("Opening user info modal for:", member);
  };

  const encodeBitwiseType = (selectedValues: number[]): number => {
      return selectedValues.reduce((acc, current) => acc | current, 0);
  };

  // --- Bổ sung: Hàm xử lý cập nhật thông tin người dùng ---
  const handleUpdateUserInfo = async (values: any) => {
    if (!selectedMember) return;

    console.log("Updating user info with values:", values);

    try {
      // API có thể cần user ID và data
      await updateUserInfoByLeader(selectedMember.id, {
        fullName: values.fullName,
        email: values.email,
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.format("YYYY-MM-DD")
          : undefined,
        nickname: values.nickname,
        studentId: values.studentId,
        type: encodeBitwiseType(values.type), // Mã hóa lại thành bitwise
      });
      toast.success(t("User information updated successfully"));
      fetchMembers(); // Lấy lại danh sách để cập nhật dữ liệu
    } catch (error) {
      toast.error(t("Failed to update user information"));
    } finally {
      setIsUserInfoModalOpen(false);
      userInfoForm.resetFields();
    }
  };

  const columns: any[] = [
    {
      title: t("Full Name"),
      dataIndex: "fullName",
      key: "fullName",
      render: (text: string) => <span className="font-semibold">{text}</span>,
    },
    { title: t("Username"), dataIndex: "username", key: "username" },
    { title: t("Email"), dataIndex: "email", key: "email" },
    { title: t("Role"), dataIndex: "role", key: "role" },
    {
      title: t("Attendance Point"),
      dataIndex: "attendancePoint",
      key: "attendancePoint",
    },
    {
      title: t("Contribution Point"),
      dataIndex: "contributionPoint",
      key: "contributionPoint",
    },
  ];

  if (leader) {
    columns.push({
      title: t("Actions"),
      key: "actions",
      render: (_: any, record: Member) =>
        record.role !== "ADMIN" &&
        (record.role !== "LEADER" || currentUserRole === "ADMIN") && (
          <div className="flex gap-2">
            <Popconfirm
              title={t("Are you sure you want to reset this user's password?")}
              onConfirm={() => handleResetPassword(record.id)}
              okText={t("Yes")}
              cancelText={t("No")}
            >
              <Button type="link">{t("Reset password")}</Button>
            </Popconfirm>

            <Button type="link" onClick={() => openChangeRoleModal(record)}>
              {t("Change role")}
            </Button>
            <Button type="link" onClick={() => openChangeUserInfo(record)}>
              {t("Change user info")}
            </Button>
          </div>
        ),
    });
  }

  return (
    <div className="w-full mt-5 overflow-x-auto">
      <Table
        rowKey="id"
        columns={columns}
        dataSource={members}
        loading={loading}
        pagination={{
          pageSize: 10,
          total,
          current: currentPage,
          onChange: setCurrentPage,
          showSizeChanger: false,
        }}
        scroll={{ x: 800 }}
        className="min-w-full"
      />

      {/* Modal chọn role */}
      <Modal
        title={
          <p>
            {t("Change Role for ")}
            {`${selectedMember?.username}`}
          </p>
        }
        open={isModalOpen}
        onOk={handleConfirmChangeRole}
        onCancel={() => setIsModalOpen(false)}
        okText={showConfirmTransfer ? t("Confirm Transfer") : t("Confirm")}
        cancelText={t("Cancel")}
      >
        <Form layout="vertical">
          <Form.Item label={t("Select new role")}>
            <Select
              value={selectedRole}
              onChange={setSelectedRole}
              options={[
                { label: "NONE", value: "NONE" },
                { label: "MEMBER", value: "MEMBER" },
                { label: "LEADER", value: "LEADER" },
              ]}
            />
          </Form.Item>

          {showConfirmTransfer && (
            <Alert
              type="warning"
              showIcon
              message={t("Transfer leadership")}
              description={t(
                "Are you sure you want to transfer leadership to this member? You will be downgraded to MEMBER."
              )}
            />
          )}
        </Form>
      </Modal>

      {/* --- Bổ sung: Modal Cập nhật thông tin người dùng --- */}
      <UpdateUserInfoModal
        member={selectedMember}
        isOpen={isUserInfoModalOpen}
        onClose={() => setIsUserInfoModalOpen(false)}
        onFinish={handleUpdateUserInfo} // Hàm xử lý submit form
        // Truyền các options và logic decode bitwise vào Modal
      />
    </div>
  );
}