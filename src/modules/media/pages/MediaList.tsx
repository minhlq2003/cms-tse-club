"use client";

import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import type { TableColumnsType, TablePaginationConfig, TableProps } from "antd";
import { Button, Col, Image, message, Modal, Row, Space, Table } from "antd";
import Title from "antd/es/typography/Title";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { formatDate } from "../../../lib/utils";
import MediaModalBodyEdit from "./MediaModalEditBody";
import {
  FileUpdate,
  FormValuesMedia,
  MediaData,
  Pagination,
} from "@/constant/types";
import { useTranslation } from "react-i18next";
import {
  deleteMedia,
  getMedia,
  updateMedia,
} from "@/modules/services/mediaService";

interface MediaListProps {
  searchTerm?: string;
  isView?: boolean;
  isOpenModal?: boolean;
  onSelectMedia?: (media: string) => void;
}

const MediaList = ({
  searchTerm,
  isView,
  isOpenModal,
  onSelectMedia,
}: MediaListProps) => {
  const { control, setValue } = useForm<FormValuesMedia>({
    defaultValues: {
      pagination: {
        page: 1,
        pageSize: 20,
        current: 1,
        total: 0,
      },
    },
  });
  const { t } = useTranslation("common");
  const dataItem = useWatch({ control, name: "dataItem" });
  const loading = useWatch({ control, name: "loading" });
  const pagination = useWatch({ control, name: "pagination" });
  const router = useRouter();
  const [selectedMedia, setSelectedMedia] = useState<null | number>(null);

  const fetchMediaData = async () => {
    const response = await getMedia();
    return response.attachments;
  };

  const handleFetchData = useCallback(
    async (paginate?: typeof pagination) => {
      setValue("loading", true);
      try {
        const response = await fetchMediaData();
        setValue("dataItem", response.length ? response : []);
        setValue("pagination", {
          ...pagination,
          total: response?.pagination.total ?? 0,
          current: response?.pagination.page ?? 1,
        });
        setValue("error", null);
      } catch (err) {
        setValue("error", err as string);
      } finally {
        setValue("loading", false);
      }
    },
    [setValue, searchTerm]
  );

  const handleSeeMore = async () => {
    const newPage = (pagination.page ?? 0) + 1;
    const newPagination: Pagination = {
      current: newPage,
      pageSize: 40,
      total: pagination.total,
      page: newPage,
    };
    setValue("pagination", newPagination);
    await handleFetchData(newPagination);
  };

  const onChange: TableProps<MediaData>["onChange"] = (
    pagination: TablePaginationConfig
  ) => {
    const newPagination: Pagination = {
      current: pagination.current || 1,
      pageSize: pagination.pageSize || 5,
      total: pagination.total || 0,
      page: pagination.current || 1,
    };
    setValue("pagination", newPagination);
    handleFetchData(newPagination);
  };

  const handleEdit = (id: number) => {
    router.push(`/admin/media/edit?id=${id}`);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: t("Confirm Delete"),
      content: t("Are you sure you want to delete this media file?"),
      okText: t("Delete"),
      cancelText: t("Cancel"),
      onOk: async () => {
        try {
          setValue("loading", true);
          await deleteMedia(id);
          setValue(
            "dataItem",
            dataItem.filter((media) => media.id !== id)
          );
          handleFetchData();
          message.success(t("Media file deleted successfully!"));
        } catch (error) {
          console.error("Handle Delete Error:", error);
          message.error(t("Failed to delete media file."));
        } finally {
          setValue("loading", false);
        }
      },
    });
  };

  const showModal = (index: number) => {
    setSelectedMedia(index);
  };

  const handleCancel = () => {
    setSelectedMedia(null);
  };

  const handleFormSubmit = async (
    value: {
      title: string;
      alternativeText: string;
      caption: string;
      width?: number;
      height?: number;
    },
    file?: File
  ) => {
    try {
      const media = dataItem[selectedMedia || 0];
      const formData = new FormData();

      const data: FileUpdate = {
        fileInfo: {
          name: value.title,
          alternativeText: value.alternativeText,
          caption: value.caption,
        },
        file: file,
      };

      formData.append("fileInfo", JSON.stringify(data.fileInfo));
      formData.append("files", data.file as Blob);

      await updateMedia(media.id, formData);
      await handleFetchData();
    } catch {
      message.error(t("Failed to update media information."));
    }
  };

  const handleSelectMedia = (media: MediaData) => {
    if (onSelectMedia) {
      onSelectMedia(media.url);
    }
    setSelectedMedia(null);
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  const columns: TableColumnsType<MediaData> = [
    {
      title: "Thumbnail",
      dataIndex: ["formats"],
      key: "url",
      width: 60,
      render: (formats: string, record: MediaData) => (
        <Image
          src={`${formats || record.url}`}
          height={40}
          width={40}
          className="object-contain"
          preview={false}
        />
      ),
    },
    {
      title: t("Name"),
      dataIndex: ["name"],
      key: "name",
      width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: t("Published"),
      dataIndex: ["created_at"],
      key: "createdAt",
      width: 100,
      render: (createdAt: string) => {
        const dateResult = formatDate(createdAt);
        return (
          <span className="font-normal">
            <span className="text-black-600">{dateResult.formattedTime}</span>
            {"  "}
            {dateResult.formattedDate}
          </span>
        );
      },
      sorter: (a, b) => a.created_at.localeCompare(b.created_at),
    },
    {
      title: t("Last Updated"),
      dataIndex: ["created_at"],
      key: "updatedAt",
      width: 100,
      render: (updatedAt: string) => {
        const dateResult = formatDate(updatedAt);
        return (
          <span className="font-normal">
            <span className="text-black-600">{dateResult.formattedTime}</span>
            {"  "}
            {dateResult.formattedDate}
          </span>
        );
      },
      sorter: (a, b) => a.created_at.localeCompare(b.created_at),
    },
    {
      title: t("Action"),
      key: "action",
      width: 100,
      render: (_, record) => (
        <Space size="middle" className="justify-center items-center">
          <Button
            type="primary"
            icon={<EditOutlined />}
            className="bg-blue-500 px-4 py-2 rounded"
            onClick={() => handleEdit(record.id)}
          >
            {t("Edit")}
          </Button>
          <Button
            danger
            type="primary"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            <span>{t("Delete")}</span>
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        height: isOpenModal ? "600px" : "auto",
        overflowY: isOpenModal ? "scroll" : "visible",
        marginTop: isOpenModal ? "50px" : "0px",
      }}
    >
      {isView ? (
        <Table
          className="mt-3 border border-gray-300 custom-table overflow-hidden"
          rowKey="id"
          columns={columns}
          loading={loading}
          dataSource={dataItem || []}
          onChange={onChange}
          pagination={false}
          scroll={{ x: 1200, y: 600 }}
          style={{ border: "1px solid #e8e8e8" }}
          rowClassName={(record, index) =>
            index % 2 === 0 ? "bg-[#f6f7f7]" : "bg-white"
          }
        />
      ) : (
        <>
          <Row gutter={16}>
            {dataItem?.map((media, index) => (
              <Col span={3} key={index} className="py-2">
                <Image
                  src={`${media.url}`}
                  height={150}
                  width="100%"
                  className="object-cover cursor-pointer"
                  preview={false}
                  onClick={() => {
                    if (isOpenModal) {
                      handleSelectMedia(media);
                    } else {
                      showModal(index);
                    }
                  }}
                />
                <Modal
                  open={selectedMedia === index}
                  style={{ top: 65 }}
                  width="95%"
                  closable={false}
                  footer={null}
                  title={
                    <div className="flex justify-between text-center">
                      <Title level={2} className="m-0">
                        {t("Attachment details")}
                      </Title>
                      <Space>
                        <Button type="text">
                          <LeftOutlined
                            onClick={() => {
                              setSelectedMedia((prev) => (prev || 0) - 1);
                            }}
                          />
                        </Button>
                        <Button type="text">
                          <RightOutlined
                            onClick={() => {
                              setSelectedMedia((prev) => (prev || 0) + 1);
                            }}
                          />
                        </Button>
                        <Button
                          type="text"
                          onClick={handleCancel}
                          className="close-icon"
                        >
                          <CloseOutlined />
                        </Button>
                      </Space>
                    </div>
                  }
                >
                  <MediaModalBodyEdit
                    media={media}
                    loading={loading}
                    handleFormSubmit={handleFormSubmit}
                    refreshMediaList={handleFetchData}
                    setIsView={(value) => (isView = value)}
                  />
                </Modal>
              </Col>
            ))}
          </Row>
          {dataItem?.length < (pagination.total ?? 0) && (
            <div className="text-center my-4">
              <Button type="primary" onClick={handleSeeMore}>
                {t("See More")} ({dataItem?.length}/{pagination.total})
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MediaList;
