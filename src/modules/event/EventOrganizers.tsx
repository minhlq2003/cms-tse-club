"use client";

import {
  PlusOutlined,
  DeleteOutlined,
  CaretDownOutlined,
  CaretUpOutlined,
  EditOutlined,
  EyeOutlined,
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
import React, { useEffect, useState } from "react";
import { Member, Organizer } from "@/constant/types";
import { useTranslation } from "react-i18next";
import { getUser } from "../services/userService";
import { modifyOrganizers } from "../services/eventService";

const { Title } = Typography;

interface EventOrganizersProps {
  organizers: Organizer[];
  onChangeOrganizers: (organizers: Organizer[]) => void;
  eventId?: string;
  isView?: boolean; // 👈 thêm prop
}

const EventOrganizers: React.FC<EventOrganizersProps> = ({
  organizers,
  onChangeOrganizers,
  eventId,
  isView = false,
}) => {
  const { t } = useTranslation("common");
  const [isPublishListVisible, setPublishListVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [form] = Form.useForm();

  // 🧠 Lấy danh sách thành viên
  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);
      const res = await getUser({ keyword: "" });
      if (Array.isArray(res._embedded.userShortInfoResponseDtoList)) {
        const allMembers = res._embedded.userShortInfoResponseDtoList;
        const filteredMembers = allMembers.filter(
          (m: Member) => !organizers.some((o) => o.organizerId === m.id)
        );
        setMembers(filteredMembers);
      }
    } catch {
      message.error(t("Failed to fetch members"));
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [organizers]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    if (!isView) {
      setSelectedMember(null);
      form.resetFields();
      fetchMembers();
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddOrganizer = () => {
    form
      .validateFields()
      .then((values) => {
        if (!selectedMember) {
          message.error(t("Please select a member"));
          return;
        }

        const newOrganizer: Organizer = {
          organizerId: selectedMember.id,
          fullName: selectedMember.fullName,
          username: selectedMember.username,
          email: selectedMember.email,
          roleContent: values.roleContent,
          roles: values.roles || [],
        };

        if (organizers.some((o) => o.organizerId === selectedMember.id)) {
          message.warning(t("This member is already an organizer"));
          return;
        }

        onChangeOrganizers([...organizers, newOrganizer]);
        setMembers((prev) => prev.filter((m) => m.id !== selectedMember.id));
        message.success(t("Organizer added successfully"));
        form.resetFields();
        setSelectedMember(null);
      })
      .catch(() => {
        message.error(t("Please fill all required fields"));
      });
  };

  const handleDelete = async (id: string) => {
    const removed = organizers.find((o) => o.organizerId === id);
    onChangeOrganizers(organizers.filter((o) => o.organizerId !== id));
    message.success(t("Organizer removed"));

    if (removed) {
      await fetchMembers();
    }
    console.log("member:", members);
  };

  const updateOrganizer = () => {
    const payloadupdate = organizers.map((org) => ({
      organizerId: org.organizerId,
      roles: org.roles,
      roleContent: org.roleContent,
      removed: false,
    }));
    modifyOrganizers(eventId!, payloadupdate)
      .then(() => {
        message.success(t("Organizers updated successfully"));
        handleCloseModal();
      })
      .catch(() => {
        message.error(t("Failed to update organizers"));
      });
  };

  // 🧩 Cột bảng
  const memberColumns = [
    {
      title: t("Full Name"),
      dataIndex: "fullName",
      key: "fullName",
      render: (text: string) => <span className="font-semibold">{text}</span>,
    },
    { title: t("Username"), dataIndex: "username", key: "username" },
    { title: t("Email"), dataIndex: "email", key: "email" },
    {
      title: "",
      key: "action",
      render: (_: any, record: Member) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedMember(record);
            form.setFieldsValue(record);
          }}
        >
          {t("Select")}
        </Button>
      ),
    },
  ];

  const organizerColumnsModal = [
    {
      dataIndex: "fullName",
      key: "fullName",
      render: (text: string) => <span className="font-semibold">{text}</span>,
    },
    { dataIndex: "username", key: "username" },
    { dataIndex: "email", key: "email" },
    { dataIndex: "roleContent", key: "roleContent" },
    {
      dataIndex: "roles",
      key: "roles",
      render: (roles: string[]) => (
        <span>{roles.map((role) => t(role)).join(", ")}</span>
      ),
    },
    !isView
      ? {
          key: "actions",
          render: (_: any, record: Organizer) => (
            <Button
              type="link"
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(record.organizerId)}
            >
              {t("Delete")}
            </Button>
          ),
        }
      : {},
  ].filter(Boolean);

  const organizerColumns = [
    {
      dataIndex: "fullName",
      key: "fullName",
      render: (text: string) => <span className="font-semibold">{text}</span>,
    },
    {
      dataIndex: "roles",
      key: "roles",
      render: (roles: string[]) => (
        <span>{roles.map((role) => t(role)).join(", ")}</span>
      ),
    },
  ];

  return (
    <div className="event-organizers border border-gray-300 rounded-[10px] mb-5">
      <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300">
        <Title level={4} className="!m-0">
          {t("Organizers")}
        </Title>
        <Button
          onClick={() => setPublishListVisible(!isPublishListVisible)}
          className="flex items-center"
          icon={
            isPublishListVisible ? <CaretDownOutlined /> : <CaretUpOutlined />
          }
          type="text"
        />
      </div>

      {/* List hiển thị */}
      {isPublishListVisible && (
        <div>
          <Table
            className="p-2"
            rowKey="organizerId"
            columns={organizerColumns}
            dataSource={organizers}
            showHeader={false}
            pagination={false}
            scroll={{ x: true }}
          />

          <div className="flex justify-end border-t bg-[#f6f7f7] border-gray-300 rounded-b-[10px] p-4">
            <Button
              onClick={handleOpenModal}
              className="flex items-center"
              icon={
                isView ? (
                  <EyeOutlined />
                ) : organizers.length === 0 ? (
                  <PlusOutlined />
                ) : (
                  <EditOutlined />
                )
              }
              type="primary"
            >
              {isView
                ? t("View Full")
                : organizers.length === 0
                ? t("Add Organizer")
                : t("Edit Organizers")}
            </Button>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        title={<p className="pb-2 text-2xl">{t("Event Organizers")}</p>}
        open={isModalOpen}
        onCancel={handleCloseModal}
        width="90%"
        style={{ top: 20 }}
        footer={
          !isView && eventId ? (
            <div>
              <Button type="primary" onClick={updateOrganizer}>
                {t("Update Organizers")}
              </Button>
            </div>
          ) : null
        }
      >
        {isView ? (
          // 👁️ View mode — chỉ hiển thị danh sách Organizer
          <Table
            rowKey="organizerId"
            columns={organizerColumnsModal}
            dataSource={organizers}
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
          />
        ) : (
          // ✏️ Edit mode
          <Row gutter={[16, 16]} className="flex flex-col md:flex-row">
            {/* LEFT: List Member */}
            <Col xs={24} md={12}>
              <Title level={5}>{t("Select a Member")}</Title>
              <Table
                rowKey="id"
                columns={memberColumns}
                dataSource={members}
                loading={loadingMembers}
                pagination={{ pageSize: 5 }}
                scroll={{ x: true }}
              />
            </Col>

            {/* RIGHT: Form + List Organizer */}
            <Col xs={24} md={12}>
              <Title level={5}>{t("Organizer Info")}</Title>
              <Form form={form} layout="vertical" className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      {
                        required: true,
                        message: t("Please enter role content"),
                      },
                    ]}
                  >
                    <Input placeholder={t("Enter role content")} />
                  </Form.Item>
                </div>

                <Form.Item name="roles" label={t("Roles")}>
                  <Checkbox.Group className="flex flex-wrap gap-2">
                    <Checkbox value="MODIFY">{t("Modify")}</Checkbox>
                    <Checkbox value="CHECK_IN">{t("Check In")}</Checkbox>
                    <Checkbox value="REGISTER">{t("Register")}</Checkbox>
                    <Checkbox value="BAN">{t("Ban")}</Checkbox>
                  </Checkbox.Group>
                </Form.Item>

                <div className="flex justify-end">
                  <Button type="primary" onClick={handleAddOrganizer}>
                    {t("Add to Organizer")}
                  </Button>
                </div>
              </Form>

              <Title level={5}>{t("Current Organizers")}</Title>
              <Table
                rowKey="organizerId"
                columns={organizerColumnsModal}
                dataSource={organizers}
                showHeader={false}
                pagination={false}
                scroll={{ x: true }}
              />
            </Col>
          </Row>
        )}
      </Modal>
    </div>
  );
};

export default EventOrganizers;
