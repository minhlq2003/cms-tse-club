"use client";

import {
  PlusOutlined,
  DeleteOutlined,
  CaretDownOutlined,
  CaretUpOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  Button,
  Modal,
  Input,
  Typography,
  Form,
  message,
  Table,
  Row,
  Col,
  Checkbox,
} from "antd";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { getUser } from "../services/userService"; // API lấy danh sách member
import { modifyTrainingMembers } from "../services/trainingService";
import { Member } from "@/constant/types";

const { Title } = Typography;

interface TrainingMentorsProps {
  mentors: Member[];
  onChangeMentors: (mentors: Member[]) => void;
  trainingId?: string;
}

const TrainingMentors: React.FC<TrainingMentorsProps> = ({
  mentors,
  onChangeMentors,
  trainingId,
}) => {
  const { t } = useTranslation("common");
  const [isListVisible, setIsListVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [form] = Form.useForm();

  // Lấy danh sách member
  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);
      const res = await getUser({ keyword: "" });
      if (Array.isArray(res)) setMembers(res);
    } catch {
      message.error(t("Failed to fetch members"));
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setSelectedMember(null);
    form.resetFields();
    fetchMembers();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddMentor = () => {
    form
      .validateFields()
      .then((values) => {
        if (!selectedMember) {
          message.error(t("Please select a member"));
          return;
        }

        const newMentor: Member = {
          id: selectedMember.id,
          fullName: selectedMember.fullName,
          username: selectedMember.username,
          email: selectedMember.email,
        };

        if (mentors.some((m) => m.id === selectedMember.id)) {
          message.warning(t("This member is already a mentor"));
          return;
        }

        onChangeMentors([...mentors, newMentor]);
        message.success(t("Mentor added successfully"));
        form.resetFields();
        setSelectedMember(null);
      })
      .catch(() => {
        message.error(t("Please fill all required fields"));
      });
  };

  const handleDelete = (id: string) => {
    onChangeMentors(mentors.filter((m) => m.id !== id));
    message.success(t("Mentor removed"));
  };

  const updateMentors = () => {
    const payload = mentors.map((m) => ({}));
    modifyTrainingMembers(trainingId!, { mentors: payload })
      .then(() => {
        message.success(t("Mentors updated successfully"));
        handleCloseModal();
      })
      .catch(() => {
        message.error(t("Failed to update mentors"));
      });
  };

  // Table member (bên trái)
  const memberColumns = [
    {
      title: t("Full Name"),
      dataIndex: "fullName",
      key: "fullName",
      render: (text: string) => <span className="font-semibold">{text}</span>,
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
    {
      title: "",
      key: "action",
      render: (_: any, record: Member) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedMember(record);
            form.setFieldsValue({
              fullName: record.fullName,
              username: record.username,
              email: record.email,
            });
          }}
        >
          {t("Select")}
        </Button>
      ),
    },
  ];

  // Table mentor (bên phải, không header)
  const mentorColumnsModal = [
    {
      dataIndex: "fullName",
      key: "fullName",
      render: (text: string) => <span className="font-semibold">{text}</span>,
    },
    {
      dataIndex: "username",
      key: "username",
    },
    {
      dataIndex: "email",
      key: "email",
    },
    {
      dataIndex: "roleContent",
      key: "roleContent",
    },
    {
      dataIndex: "roles",
      key: "roles",
      render: (roles: string[]) => (
        <span>{roles.map((r) => t(r)).join(", ")}</span>
      ),
    },
    {
      key: "actions",
      render: (_: any, record: Member) => (
        <Button
          type="link"
          icon={<DeleteOutlined />}
          danger
          onClick={() => handleDelete(record.id)}
        >
          {t("Delete")}
        </Button>
      ),
    },
  ];

  const mentorColumns = [
    {
      dataIndex: "fullName",
      key: "fullName",
      render: (text: string) => <span className="font-semibold">{text}</span>,
    },
    {
      dataIndex: "roles",
      key: "roles",
      render: (roles: string[]) => (
        <span>{roles.map((r) => t(r)).join(", ")}</span>
      ),
    },
  ];

  return (
    <div className="training-mentors border border-gray-300 rounded-[10px] mb-5">
      <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300">
        <Title level={4} className="!m-0">
          {t("Mentors")}
        </Title>
        <Button
          onClick={() => setIsListVisible(!isListVisible)}
          className="flex items-center"
          icon={isListVisible ? <CaretDownOutlined /> : <CaretUpOutlined />}
          type="text"
        />
      </div>

      {isListVisible && (
        <div>
          <Table
            className="p-4"
            rowKey="id"
            columns={mentorColumns}
            dataSource={mentors}
            showHeader={false}
            pagination={false}
          />

          <div className="flex justify-end border-t bg-[#f6f7f7] border-gray-300 rounded-b-[10px] p-4">
            <Button
              onClick={handleOpenModal}
              className="flex items-center"
              icon={mentors.length === 0 ? <PlusOutlined /> : <EditOutlined />}
              type="primary"
            >
              {mentors.length === 0 ? t("Add Mentor") : t("Edit Mentors")}
            </Button>
          </div>
        </div>
      )}

      {/* Modal thêm mentor */}
      <Modal
        title={<p className="pb-4 text-2xl">{t("Training Mentors")}</p>}
        open={isModalOpen}
        onCancel={handleCloseModal}
        width={1400}
        footer={
          trainingId && (
            <Button type="primary" onClick={updateMentors}>
              {t("Update Mentors")}
            </Button>
          )
        }
      >
        <Row gutter={24}>
          {/* LEFT: List Member */}
          <Col span={12}>
            <Title level={5}>{t("Select a Member")}</Title>
            <Table
              rowKey="id"
              columns={memberColumns}
              dataSource={members}
              loading={loadingMembers}
              pagination={{ pageSize: 5 }}
            />
          </Col>

          {/* RIGHT: Form + List Mentor */}
          <Col span={12}>
            <Title level={5}>{t("Mentor Info")}</Title>
            <Form form={form} layout="vertical" className="mb-6">
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="fullName"
                  label={t("Full Name")}
                  rules={[
                    { required: true, message: t("Please select a member") },
                  ]}
                >
                  <Input disabled />
                </Form.Item>
                <Form.Item
                  name="username"
                  label={t("Username")}
                  rules={[
                    { required: true, message: t("Please select a member") },
                  ]}
                >
                  <Input disabled />
                </Form.Item>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="email"
                  label={t("Email")}
                  rules={[
                    { required: true, message: t("Please select a member") },
                  ]}
                >
                  <Input disabled />
                </Form.Item>
                <Form.Item
                  name="roleContent"
                  label={t("Role Content")}
                  rules={[
                    { required: true, message: t("Please enter role content") },
                  ]}
                >
                  <Input placeholder={t("Enter role content")} />
                </Form.Item>
              </div>

              <Form.Item name="roles" label={t("Roles")}>
                <Checkbox.Group>
                  <Checkbox value="MODIFY">{t("Modify")}</Checkbox>
                  <Checkbox value="CHECK_IN">{t("Check In")}</Checkbox>
                  <Checkbox value="REGISTER">{t("Register")}</Checkbox>
                  <Checkbox value="BAN">{t("Ban")}</Checkbox>
                </Checkbox.Group>
              </Form.Item>

              <div className="flex justify-end">
                <Button type="primary" onClick={handleAddMentor}>
                  {t("Add to Mentor")}
                </Button>
              </div>
            </Form>

            <Title level={5}>{t("Current Mentors")}</Title>
            <Table
              rowKey="id"
              columns={mentorColumnsModal}
              dataSource={mentors}
              showHeader={false}
              pagination={false}
            />
          </Col>
        </Row>
      </Modal>
    </div>
  );
};

export default TrainingMentors;
