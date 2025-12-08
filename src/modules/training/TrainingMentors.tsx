"use client";

import {
  PlusOutlined,
  DeleteOutlined,
  CaretDownOutlined,
  CaretUpOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Modal,
  Typography,
  message,
  Table,
  Row,
  Col,
  Input,
} from "antd";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getUser } from "../services/userService";
import { modifyTrainingMembers, modifyTrainingMentors } from "../services/trainingService";
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
  const [searchText, setSearchText] = useState("");
  const [loadingMembers, setLoadingMembers] = useState(false);

  const fetchMembers = async (keyword: string = "") => {
    try {
      setLoadingMembers(true);
      const res = await getUser({ keyword, page: 0, size: 100 });
      if (Array.isArray(res._embedded.userShortInfoResponseDtoList)) {
        const filtered = res._embedded.userShortInfoResponseDtoList.filter(
          (m: Member) => !mentors.some((mt) => mt.id === m.id)
        );
        setMembers(filtered);
      }
    } catch {
      message.error(t("Failed to fetch members"));
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      fetchMembers(searchText);
    }
  }, [mentors, isModalOpen]);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    if (!isModalOpen) return;

    const timeoutId = setTimeout(() => {
      fetchMembers(searchText);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchText, isModalOpen]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setSearchText("");
    fetchMembers("");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSearchText("");
  };

  const handleSelectMentor = (member: Member) => {
    if (mentors.some((m) => m.id === member.id)) {
      message.warning(t("This member is already a mentor"));
      return;
    }

    const newMentors = [...mentors, member];
    onChangeMentors(newMentors);
    message.success(t("Mentor added successfully"));
  };

  const handleDelete = (id: string) => {
    const removed = mentors.find((m) => m.id === id);
    const updated = mentors.filter((m) => m.id !== id);
    onChangeMentors(updated);
    message.success(t("Mentor removed"));

    // Refresh members list
    if (removed) {
      fetchMembers(searchText);
    }
  };

  const updateMentors = () => {
    const payload : string[]= mentors.map((m) => m.id);
    
    console.log("Updating mentors with payload:", payload);

    modifyTrainingMentors(trainingId!, { mentorIds: payload })
      .then(() => {
        message.success(t("Mentors updated successfully"));
        handleCloseModal();
      })
      .catch(() => {
        message.error(t("Failed to update mentors"));
      });
  };

  

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
        <Button type="link" onClick={() => handleSelectMentor(record)}>
          {t("Select")}
        </Button>
      ),
    },
  ];

  const mentorColumnsModal = [
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
      title: t("Action"),
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
      dataIndex: "email",
      key: "email",
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

      <Modal
        title={<p className="pb-4 text-2xl">{t("Training Mentors")}</p>}
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={handleCloseModal}
        width={1300}
        footer={
          trainingId && (
            <Button type="primary" onClick={updateMentors}>
              {t("Update Mentors")}
            </Button>
          )
        }
      >
        <Row gutter={24}>
          <Col span={12}>
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
              pagination={{ pageSize: 5 }}
              showHeader={true}
            />
          </Col>

          <Col span={12}>
            <Title level={5}>{t("Current Mentors")}</Title>
            <Table
              rowKey="id"
              columns={mentorColumnsModal}
              dataSource={mentors}
              showHeader={true}
              pagination={false}
            />
          </Col>
        </Row>
      </Modal>
    </div>
  );
};

export default TrainingMentors;
