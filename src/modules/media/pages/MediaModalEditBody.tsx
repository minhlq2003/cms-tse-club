import {
  CheckCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { Button, Flex, Form, Image, Input, Modal, Space, message } from "antd";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import ImageEditor from "./ImageEditor";
import { MediaData } from "@/constant/types";
import { useTranslation } from "react-i18next";
import { deleteMedia } from "@/modules/services/mediaService";

interface MediaModalBodyProps {
  media: MediaData;
  loading: boolean;
  handleFormSubmit: (
    value: { title: string; alternativeText: string; caption: string },
    file?: File
  ) => Promise<void>;
  refreshMediaList?: () => void;
  setIsView: (value: boolean) => void;
}

const MediaModalEditBody: React.FC<MediaModalBodyProps> = ({
  media,
  loading,
  handleFormSubmit,
  refreshMediaList,
  setIsView,
}) => {
  const { t } = useTranslation("common");
  const [mediaWidth, mediaHeight] =
    media.height >= 650
      ? [media.width * 0.3, media.height * 0.3]
      : media.height >= 350
      ? [media.width * 0.6, media.height * 0.6]
      : [media.width, media.height];
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const router = useRouter();

  const handleEditMoreDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/admin/media/${media.id}`);
  };

  useEffect(() => {
    const image = document.getElementById("Image") as HTMLFormElement;
    image?.reset();
  }, [media, handleFormSubmit]);

  useEffect(() => {
    if (editedImageUrl) {
      const imageElement = document.getElementById("Image") as HTMLImageElement;
      if (imageElement) {
        imageElement.src = editedImageUrl;
      }
    }
  }, [editedImageUrl]);

  const handleDownloadFile = (e: React.MouseEvent) => {
    e.preventDefault();
    fetch(`${media.file_url}`, {
      method: "GET",
      headers: {
        "Content-Type": media.mime,
      },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", media.name);
        link.click();
      });
  };

  const handleDeletePermanently = (e: React.MouseEvent) => {
    e.preventDefault();
    Modal.confirm({
      title: t("Confirm Delete"),
      content: t("Are you sure you want to delete this media file?"),
      okText: t("Delete"),
      cancelText: t("Cancel"),
      onOk: async () => {
        try {
          await deleteMedia(media.id);
          message.success(t("Media file deleted successfully!"));
          if (refreshMediaList) {
            refreshMediaList();
          }
          setIsView(false);
        } catch (error) {
          message.error(t("Failed to delete media file."));
        }
      },
    });
  };

  return (
    <div style={{ height: "80vh" }}>
      {isEditingImage ? (
        <ImageEditor
          media={media}
          isEditingImage={isEditingImage}
          setIsEditingImage={setIsEditingImage}
          handleFormSubmit={handleFormSubmit}
        />
      ) : (
        <div style={{ display: "flex" }}>
          <Space
            align="center"
            style={{ display: "grid", justifyContent: "space-around" }}
            className="w-[65%] mt-5"
          >
            <div style={{ display: "grid", justifyItems: "center" }}>
              <Image
                color="white"
                src={`${media.file_url}`}
                width={mediaWidth}
                height={mediaHeight}
                className="object-cover"
              />
              <Button className="mt-10" onClick={() => setIsEditingImage(true)}>
                {t("Edit Image")}
              </Button>
            </div>
          </Space>

          <Space className="w-[30%] h-[80%] ml-5 pr-0 block">
            <Flex className="flex-col bg-[#f6f7f7] p-[10px_10px_15px_20px] h-[100%]">
              <div className="text-xs border-b border-black pb-1.5 h-[100%]">
                <p>
                  <strong>{t("Uploaded on:")}</strong> {media.createdAt}
                </p>
                <p>
                  <strong>{t("File name:")}</strong> {media.name}
                </p>
                <p>
                  <strong>{t("File type:")}</strong> {media.mime}
                </p>
                <p>
                  <strong>{t("File size:")}</strong> {media.size} KB
                </p>
                <p>
                  <strong>{t("Dimensions:")}</strong> {media.width} x{" "}
                  {media.height} pixels
                </p>
              </div>

              <Form
                id="form"
                className="mt-5 mb-6"
                size="large"
                labelAlign="left"
                labelCol={{ span: 10 }}
                name="editMedia"
                initialValues={{
                  alternativeText: media.alternativeText,
                  title: media.name,
                  caption: media.caption,
                }}
                onFinish={(values) => handleFormSubmit(values)}
              >
                <Form.Item label={t("Alternative text")} name="alternativeText">
                  <Input
                    className="mb-4"
                    placeholder={t("Enter alternative text")}
                  />
                </Form.Item>

                <Form.Item label={t("Title")} name="title">
                  <Input className="mb-4" placeholder={t("Enter title")} />
                </Form.Item>

                <Form.Item label={t("Caption")} name="caption">
                  <Input className="mb-6" placeholder={t("Enter caption")} />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<CheckCircleOutlined />}
                  >
                    {t("Save Changes")}
                  </Button>
                </Form.Item>
              </Form>
              <div className="text-blue-600 text-xs border-t border-black pt-2.5 h-[30vh]">
                <Button
                  className="mr-3 mt-3"
                  onClick={handleEditMoreDetails}
                  icon={<EditOutlined />}
                >
                  {t("Edit more details")}
                </Button>
                <Button
                  className="mr-3 mt-3"
                  onClick={handleDownloadFile}
                  icon={<DownloadOutlined />}
                >
                  {t("Download file")}
                </Button>
                <Button
                  className="mt-3"
                  danger
                  onClick={handleDeletePermanently}
                  icon={<DeleteOutlined />}
                >
                  {t("Delete permanently")}
                </Button>
              </div>
            </Flex>
          </Space>
        </div>
      )}
    </div>
  );
};

export default MediaModalEditBody;
