import { Button, Form, Image, Input, message, Modal, Spin } from "antd";
import React, { useEffect, useState } from "react";
import {
  deleteMedia,
  fetchMediaId,
  updateMedia,
} from "../services/apiServices";

import Title from "antd/es/typography/Title";
import { useRouter, useSearchParams } from "next/navigation";
import ImageEditor from "./ImageEditor";
import { useTranslation } from "react-i18next";
import { FileUpdate, MediaData } from "@/constant/types";

const EditMedia: React.FC = () => {
  const { t } = useTranslation("common");
  const searchparams = useSearchParams();
  const id = searchparams.get("id");
  const [loading, setLoading] = useState(false);
  const [mediaData, setMediaData] = useState<MediaData>();
  const [form] = Form.useForm();
  const [isEditingImage, setIsEditingImage] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchMediaData();
  }, [id, isEditingImage]);

  const fetchMediaData = async () => {
    setLoading(true);
    try {
      const media = await fetchMediaId(Number(id));
      setMediaData(media);
      form.setFieldsValue({
        name: media?.name ?? "",
        alternativeText: media?.alternativeText ?? "",
        caption: media?.caption ?? "",
      });
    } catch {
      message.error(t("Failed to fetch media data"));
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (
    values: {
      title: string;
      alternativeText: string;
      caption: string;
      width?: number;
      height?: number;
    },
    file?: File
  ) => {
    setLoading(true);
    try {
      const updatedData = new FormData();
      const data: FileUpdate = {
        fileInfo: {
          name: values.title,
          alternativeText: values.alternativeText,
          caption: values.caption,
        },
        file: file,
      };
      updatedData.append("fileInfo", JSON.stringify(data.fileInfo));
      if (file) updatedData.append("files", file as Blob);

      await updateMedia(Number(id), updatedData);
      message.success(t("Media updated successfully"));
      if (!isEditingImage) router.push(`/admin/media`);
      else {
        await fetchMediaData();
        setIsEditingImage(false);
      }
    } catch {
      message.error(t("Failed to update media"));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = () => {
    if (mediaData && mediaData.file_url) {
      navigator.clipboard
        .writeText(`$${mediaData.file_url}`)
        .then(() => message.success(t("URL copied to clipboard!")))
        .catch(() => message.error(t("Failed to copy URL")));
    }
  };

  const handleDownloadFile = (e: React.MouseEvent) => {
    e.preventDefault();
    if (mediaData) {
      fetch(`${mediaData.file_url}`, {
        method: "GET",
        headers: {
          "Content-Type": mediaData.mime,
        },
      })
        .then((res) => res.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", mediaData.name);
          link.click();
        });
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: t("Are you sure you want to delete this media?"),
      content: t("This action cannot be undone."),
      okText: t("Yes, Delete"),
      okType: "danger",
      cancelText: t("No"),
      onOk: async () => {
        setLoading(true);
        try {
          await deleteMedia(Number(id));
          message.success(t("Media deleted successfully"));
          router.push(`admin/media`);
        } catch {
          message.error(t("Failed to delete media"));
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <div className="ml-6">
      <div className="mt-5 flex">
        <Title className="mr-5" level={2}>
          {t("Edit Media File")}
        </Title>
        <Button
          onClick={() => router.push(`/admin/media`)}
          className="mt-1 bg-white text-blue-700 px-3 py-1 border-[1px] border-blue-700 rounded-[3px] hover:bg-blue-800 hover:text-white duration-300"
        >
          {t("Add New Media File")}
        </Button>
      </div>
      <div
        className="edit-media-container mt-5"
        style={{ display: "flex", gap: "20px" }}
      >
        <div className="left-section" style={{ flex: 3 }}>
          {loading ? (
            <Spin />
          ) : (
            <>
              {isEditingImage ? (
                <div>
                  <ImageEditor
                    media={mediaData as MediaData}
                    isEditingImage={isEditingImage}
                    setIsEditingImage={setIsEditingImage}
                    handleFormSubmit={handleFormSubmit}
                    editDetail={true}
                  />
                </div>
              ) : (
                <div>
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                  >
                    <Form.Item
                      label={
                        <span className="text-base font-medium">
                          {t("Name")}
                        </span>
                      }
                      name="name"
                    >
                      <Input
                        className="mb-4 mt-2"
                        placeholder={t("Enter name")}
                      />
                    </Form.Item>
                    <Form.Item name="image">
                      <div
                        className="flex flex-col"
                        style={{ alignItems: "flex-start" }}
                      >
                        <Image
                          src={`${mediaData?.file_url}`}
                          alt={mediaData?.name}
                          height={350}
                        />
                        <Button
                          className="mt-4 mb-2"
                          onClick={() => setIsEditingImage(true)}
                        >
                          {t("Edit Image")}
                        </Button>
                      </div>
                    </Form.Item>
                    <Form.Item
                      label={
                        <span className="text-base font-medium">
                          {t("Alternative Text")}
                        </span>
                      }
                      name="alternativeText"
                    >
                      <Input
                        className="mt-2 mb-2"
                        placeholder={t("Enter alternative text")}
                      />
                    </Form.Item>
                    <Form.Item
                      label={
                        <span className="text-base font-medium">
                          {t("Caption")}
                        </span>
                      }
                      name="caption"
                    >
                      <Input
                        className="mt-2 mb-4"
                        placeholder={t("Enter caption")}
                      />
                    </Form.Item>
                    <Button className="mr-3" type="primary" htmlType="submit">
                      {t("Save Edits")}
                    </Button>
                    <Button onClick={() => router.push(`/admin/media`)}>
                      {t("Cancel")}
                    </Button>
                  </Form>
                </div>
              )}
            </>
          )}
        </div>

        <div className="right-section flex-1 flex-col bg-gray-50 pt-5 pl-5 h-[300px] ml-10">
          <div className="mb-5 border-b-2 pb-3">
            <p>
              <strong>{t("Created at:")}</strong> {mediaData?.createdAt}
            </p>
            <p>
              <strong>{t("Last updated:")}</strong> {mediaData?.updatedAt}
            </p>
            <p>
              <strong>{t("File URL:")}</strong>{" "}
              <a href={mediaData?.file_url}>{mediaData?.file_url}</a>
            </p>
            <p>
              <strong>{t("File size:")}</strong> {mediaData?.size}
            </p>
            <p>
              <strong>{t("Dimensions:")}</strong> {mediaData?.height} x{" "}
              {mediaData?.width}
            </p>
          </div>

          <div className="">
            <Button className="mb-2 w-[200px]" onClick={handleCopyUrl}>
              {t("Copy URL to Clipboard")}
            </Button>
            <br />
            <Button className="mb-2 w-[200px]" onClick={handleDownloadFile}>
              {t("Download File")}
            </Button>
            <br />
            <Button
              className="w-[200px]"
              type="default"
              danger
              onClick={handleDelete}
            >
              {t("Delete Permanently")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMedia;
