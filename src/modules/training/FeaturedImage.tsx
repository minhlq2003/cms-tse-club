"use client";

import { Images } from "@/constant/image";
import AddNewMedia from "@/modules/media/pages/AddNewMedia";
import Media from "@/modules/media/pages/Media";
import {
  CaretDownOutlined,
  CaretUpOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Modal } from "antd";
import Title from "antd/es/typography/Title";
import Image from "next/image";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface FeaturedImageProps {
  selectedMedia: string | "";
  setSelectedMedia: (media: string | "") => void;
}

const FeaturedImage: React.FC<FeaturedImageProps> = ({
  selectedMedia,
  setSelectedMedia,
}) => {
  const { t } = useTranslation("common");
  const [isImageVisible, setImageVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChooseMedia, setIsChooseMedia] = useState(true);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSelectMedia = (media: string) => {
    setSelectedMedia(media);
    setIsModalOpen(false);
  };

  return (
    <div className="categories border border-gray-300 rounded-[10px] mb-5">
      <div className="flex justify-between items-center px-4 py-2 border-gray-300 border-b">
        <Title level={4} className="!m-0">
          {t("Featured Image")}
        </Title>
        <Button
          onClick={() => setImageVisible(!isImageVisible)}
          className="flex items-center"
          icon={isImageVisible ? <CaretDownOutlined /> : <CaretUpOutlined />}
          type="text"
        ></Button>
      </div>
      {!isImageVisible || (
        <div className="m-4">
          {selectedMedia === "" ? (
            <div className="flex flex-col gap-4 p-2">
              <Image
                src={Images.emptyImage.src}
                alt="featured"
                className="w-full cursor-pointer "
                onClick={handleOpenModal}
                width={100}
                height={100}
              />
              <Button
                variant="outlined"
                color="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenModal}
              >
                {t("Set Featured Image")}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-2">
              <Image
                onClick={handleOpenModal}
                src={selectedMedia}
                alt="featured"
                className="w-full cursor-pointer"
                width={100}
                height={100}
              />
              <Button
                color="danger"
                variant="outlined"
                onClick={() => setSelectedMedia("")}
              >
                {t("Remove Featured Image")}
              </Button>
            </div>
          )}
        </div>
      )}
      <Modal
        open={isModalOpen}
        title={<span className="ml-4">{t("Select Media")}</span>}
        onCancel={handleCloseModal}
        style={{ top: 20 }}
        width="95%"
        footer={null}
      >
        <div className="ml-4 mt-5">
          <Button
            onClick={() => setIsChooseMedia(true)}
            className="mr-2"
            style={{
              backgroundColor: isChooseMedia ? "blue" : "initial",
              color: isChooseMedia ? "white" : "initial",
            }}
          >
            {t("Select Media")}
          </Button>
          <Button
            onClick={() => setIsChooseMedia(false)}
            style={{
              backgroundColor: !isChooseMedia ? "blue" : "initial",
              color: !isChooseMedia ? "white" : "initial",
            }}
          >
            {t("Upload Media")}
          </Button>
        </div>
        <div>
          {isChooseMedia ? (
            <Media isOpenModal={true} onSelectMedia={handleSelectMedia} />
          ) : (
            <AddNewMedia isOpenModal={true} setChooseMedia={setIsChooseMedia} />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default FeaturedImage;
