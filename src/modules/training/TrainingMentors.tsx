"use client";

import {
  PlusOutlined,
  DeleteOutlined,
  CaretDownOutlined,
  CaretUpOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { Button, Modal, Typography, message, Table, Row, Col } from "antd";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getUser } from "../services/userService";
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

  // ✅ Lấy danh sách member (lọc bỏ mentor)
  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);
      const res = await getUser({ keyword: "" });
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

  // ✅ Mỗi khi danh sách mentor thay đổi, cập nhật lại list member
  useEffect(() => {
    if (isModalOpen) {
      fetchMembers();
    }
  }, [mentors, isModalOpen]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    fetchMembers();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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

    // ✅ Thêm lại người bị xóa vào danh sách member
    if (removed) {
      setMembers((prev) => [...prev, removed]);
    }
  };

  // ✅ Gọi API cập nhật (nếu có trainingId)
  const updateMentors = () => {
    const payload = mentors.map((m) => ({ id: m.id }));
    modifyTrainingMembers(trainingId!, { mentors: payload })
      .then(() => {
        message.success(t("Mentors updated successfully"));
        handleCloseModal();
      })
      .catch(() => {
        message.error(t("Failed to update mentors"));
      });
  };

  // 🔹 Cột member (bên trái)
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

  // 🔹 Cột mentor (bên phải) — ✅ có header
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

  // 🔹 Cột mentor hiển thị ngoài card
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
          {/* LEFT: List Member */}
          <Col span={12}>
            <Title level={5}>{t("Select a Member")}</Title>
            <Table
              rowKey="id"
              columns={memberColumns}
              dataSource={members}
              loading={loadingMembers}
              pagination={{ pageSize: 5 }}
              showHeader={true}
            />
          </Col>

          {/* RIGHT: Current Mentors */}
          <Col span={12}>
            <Title level={5}>{t("Current Mentors")}</Title>
            <Table
              rowKey="id"
              columns={mentorColumnsModal}
              dataSource={mentors}
              showHeader={true} // ✅ hiển thị header
              pagination={false}
            />
          </Col>
        </Row>
      </Modal>
    </div>
  );
};

export default TrainingMentors;
