"use client";

import {
  PlusOutlined,
  DeleteOutlined,
  CaretDownOutlined,
  CaretUpOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
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
  isView?: boolean;
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
  const [searchText, setSearchText] = useState("");
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberPagination, setMemberPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [form] = Form.useForm();

  const fetchMembers = async (keyword: string = "", page: number = 1, size: number = 5) => {
    try {
      setLoadingMembers(true);

      let searchs = [];
      let searchValues = [];

      for (const org of organizers) {
        searchs.push( "id");
        searchValues.push("!" + org.organizerId);
      }

      const res = await getUser({ keyword, page: page - 1, size, searchs, searchValues });
      if (Array.isArray(res._embedded.userShortInfoResponseDtoList)) {
        setMembers(res._embedded.userShortInfoResponseDtoList);
        setMemberPagination(prev => ({
          ...prev,
          total: res.page.totalElements,
        }));
      }
    } catch {
      message.error(t("Failed to fetch members"));
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      fetchMembers(searchText, memberPagination.current, memberPagination.pageSize);
    }
  }, [organizers, isModalOpen, memberPagination.current, memberPagination.pageSize]);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    if (!isModalOpen) return;

    const timeoutId = setTimeout(() => {
      fetchMembers(searchText, 1, memberPagination.pageSize);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchText, isModalOpen]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    if (!isView) {
      setSelectedMember(null);
      form.resetFields();
      setSearchText("");
      fetchMembers("", 1, 5);
    }
  };

  const handleMemberTableChange = (pagination: any) => {
    setMemberPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: pagination.total,
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSearchText("");
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
      fetchMembers(searchText);
    }
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
          <Table
            rowKey="organizerId"
            columns={organizerColumnsModal}
            dataSource={organizers}
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
          />
        ) : (
          <Row gutter={[16, 16]} className="flex flex-col md:flex-row">
            <Col xs={24} md={12}>
              <div className="flex items-center justify-between mb-4">
                <Title level={5} className="!mb-0">
                  {t("Select a Member")}
                </Title>
              </div>

              <Input
                prefix={<SearchOutlined />}
                placeholder={t("Search by name, username or email")}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="mb-4"
                allowClear
              />

              <Table
                rowKey="id"
                columns={memberColumns}
                dataSource={members}
                loading={loadingMembers}
                pagination={memberPagination}
                onChange={handleMemberTableChange}
                scroll={{ x: true }}
              />
            </Col>

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
                    <Checkbox value="POST">{t("Post")}</Checkbox>
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
