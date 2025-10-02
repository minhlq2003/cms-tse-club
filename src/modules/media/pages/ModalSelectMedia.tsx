"use client";

import AddNewMedia from "@/modules/media/pages/AddNewMedia";
import Media from "@/modules/media/pages/Media";
import { Button, Modal } from "antd";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface ModalSelectMediaProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (media: string) => void;
}

const ModalSelectMedia: React.FC<ModalSelectMediaProps> = ({
  isOpen,
  onClose,
  onSelectMedia,
}) => {
  const { t } = useTranslation("common");
  const [isChooseMedia, setIsChooseMedia] = useState(true);

  return (
    <Modal
      open={isOpen}
      title={<span className="ml-4">{t("Select Media")}</span>}
      onCancel={onClose}
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
          <Media isOpenModal={true} onSelectMedia={onSelectMedia} />
        ) : (
          <AddNewMedia isOpenModal={true} setChooseMedia={setIsChooseMedia} />
        )}
      </div>
    </Modal>
  );
};

export default ModalSelectMedia;
