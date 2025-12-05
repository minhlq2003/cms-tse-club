// UpdateUserInfoModal.tsx

import React from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Checkbox,
} from "antd";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { USER_TYPE_OPTIONS, USER_TYPES } from "../services/userService";

// Giả định Member Interface được import/định nghĩa lại
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

interface UserTypeOption {
    label: string;
    value: number;
}

interface UpdateUserInfoModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  // Hàm này sẽ được gọi khi form submit thành công, truyền data form về ListMember
  onFinish: (values: any) => void;
}

const UpdateUserInfoModal: React.FC<UpdateUserInfoModalProps> = ({
  member,
  isOpen,
  onClose,
  onFinish,
}) => {
  const { t } = useTranslation("common");
  const [form] = Form.useForm();
  
  // Sử dụng useEffect để cập nhật form khi member thay đổi (mở modal)
  React.useEffect(() => {
    if (member) {
      // Chuyển đổi chuỗi ngày tháng sang đối tượng dayjs, kiểm tra tính hợp lệ
      const dob = (member.dateOfBirth && dayjs(member.dateOfBirth).isValid())
        ? dayjs(member.dateOfBirth)
        : null;
        
      const decodedTypes = decodeBitwiseType(member.type);

      form.setFieldsValue({
        fullName: member.fullName,
        email: member.email,
        dateOfBirth: dob, 
        nickname: member.nickname,
        studentId: member.studentId,
        type: decodedTypes, // Gán mảng các giá trị bit đã chọn
      });
    }
  }, [member, form]); // Thêm decodeBitwiseType vào dependencies nếu nó là hàm không ổn định

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onFinish(values); // Truyền dữ liệu form đã validate về component cha
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const decodeBitwiseType = (bitwiseValue?: number): number[] => {
      if (!bitwiseValue || bitwiseValue === 0) return [];
      
      const selectedValues: number[] = [];
      
      for (const [_, value] of Object.entries(USER_TYPES)) {
        if ((bitwiseValue & value) === value) {
          selectedValues.push(value);
        }
      }
      
      return selectedValues;
    };

  
  if (!member) return null;

  return (
    <Modal
      title={
        <p>
          {t("Update User Info for ")}
          {`${member.username}`}
        </p>
      }
      open={isOpen}
      onCancel={onClose}
      okText={t("Save changes")}
      cancelText={t("Cancel")}
      onOk={handleOk}
    >
      <Form
        form={form}
        layout="vertical"
        name="user_info_form"
        // Loại bỏ initialValues tĩnh để chỉ dựa vào form.setFieldsValue trong useEffect
      >
        {/* Full Name */}
        <Form.Item
          name="fullName"
          label={t("Full Name")}
          rules={[{ required: true, message: t("Please input the full name!") }]}
        >
          <Input />
        </Form.Item>

        {/* Email */}
        <Form.Item
          name="email"
          label={t("Email")}
          rules={[
            { required: true, message: t("Please input the email!") },
            { type: "email", message: t("The input is not valid E-mail!") },
          ]}
        >
          <Input />
        </Form.Item>

        {/* Date of Birth */}
        <Form.Item
          name="dateOfBirth"
          label={t("Date of Birth")}
          rules={[
            { required: true, message: t("Please input the date of birth!") },
          ]}
        >
          <DatePicker className="w-full" format="YYYY-MM-DD" />
        </Form.Item>

        {/* Nickname */}
        <Form.Item name="nickname" label={t("Nickname")}>
          <Input className="w-full" />
        </Form.Item>
        
        {/* Student ID */}
        <Form.Item name="studentId" label={t("Student ID")}>
          <Input className="w-full" />
        </Form.Item>
        
        {/* Bitwise Type */}
        <Form.Item
          name="type"
          label={t("User type ")}
          tooltip={t(
            "Selected values are summed using Bitwise OR (|) for saving."
          )}
        >
          <Checkbox.Group
            options={USER_TYPE_OPTIONS.map((option) => ({
              label: option.label,
              value: option.value,
            }))}
            className="flex flex-col"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateUserInfoModal;