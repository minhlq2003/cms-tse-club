import { MediaData } from "@/constant/types";
import { RedoOutlined, UndoOutlined } from "@ant-design/icons";
import { Button, Select, Slider, message } from "antd";
import { debounce } from "lodash";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { useTranslation } from "react-i18next";

interface ImageEditorProps {
  media: MediaData;
  isEditingImage: boolean;
  setIsEditingImage: (value: boolean) => void;
  handleFormSubmit: (
    value: {
      title: string;
      alternativeText: string;
      caption: string;
      width?: number;
      height?: number;
    },
    file?: File
  ) => Promise<void>;
  editDetail?: boolean;
}

const ImageEditor: React.FC<ImageEditorProps> = ({
  media,
  isEditingImage,
  setIsEditingImage,
  handleFormSubmit,
  editDetail,
}) => {
  let [mediaWidth, mediaHeight] =
    media.height >= 650
      ? [media.width * 0.3, media.height * 0.3]
      : media.height >= 350
      ? [media.width * 0.6, media.height * 0.6]
      : [media.width, media.height];
  if (editDetail) {
    [mediaWidth, mediaHeight] =
      media.height >= 500
        ? [media.width * 0.4, media.height * 0.4]
        : [media.width, media.height];
  }
  const { t } = useTranslation("common");
  const [rotation, setRotation] = useState(0);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [sliderValue, setSliderValue] = useState(1);
  const [cropSize, setCropSize] = useState({
    width: mediaWidth,
    height: mediaHeight,
  });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [undoStack, setUndoStack] = useState<
    {
      crop: { x: number; y: number };
      rotation: number;
      zoom: number;
      sliderValue: number;
    }[]
  >([]);
  const [redoStack, setRedoStack] = useState<
    {
      crop: { x: number; y: number };
      rotation: number;
      zoom: number;
      sliderValue: number;
    }[]
  >([]);
  const undoStackRef = useRef<
    {
      crop: { x: number; y: number };
      rotation: number;
      zoom: number;
      sliderValue: number;
    }[]
  >([]);

  const debouncedSaveToUndoStack = useCallback(
    debounce(
      (cropValue, rotationValue: number, zoomValue: number, slider: number) => {
        setUndoStack((prevStack) => {
          const lastState =
            undoStackRef.current[undoStackRef.current.length - 1];

          if (
            lastState === undefined ||
            lastState.crop.x !== cropValue.x ||
            lastState.crop.y !== cropValue.y ||
            lastState.rotation !== rotationValue ||
            lastState.zoom !== zoomValue ||
            lastState.sliderValue !== slider
          ) {
            return [
              ...prevStack,
              {
                crop: cropValue,
                rotation: rotationValue,
                zoom: zoomValue,
                sliderValue: slider,
              },
            ];
          }
          return prevStack;
        });
      },
      500
    ),
    []
  );

  const updateCropSizeForRotation = (
    rotation: number,
    width: number,
    height: number
  ) => {
    if (rotation === 90 || rotation === -90) {
      return { width: height, height: width };
    }
    return { width, height };
  };

  const getAspectRatio = (rotation: number, width: number, height: number) => {
    if (rotation === 90 || rotation === -90) {
      return height / width;
    } else {
      return width / height;
    }
  };

  const handleRotationChange = (value: string) => {
    const newRotation =
      value === "Rotate 90 left"
        ? -90
        : value === "Rotate 90 right"
        ? 90
        : value === "Rotate 180"
        ? 180
        : 0;

    setUndoStack((prevStack) => [
      ...prevStack,
      { crop, rotation: newRotation, zoom, sliderValue: zoom },
    ]);
    setRedoStack([]);

    setRotation(newRotation);
    debouncedSaveToUndoStack(crop, newRotation, zoom, zoom);
  };

  useEffect(() => {
    const newCropSize = updateCropSizeForRotation(
      rotation,
      media.width,
      media.height
    );
    setCropSize(newCropSize);
  }, [rotation, media.width, media.height]);

  useEffect(() => {
    undoStackRef.current = undoStack;
  }, [undoStack]);

  useEffect(() => {
    debouncedSaveToUndoStack(crop, rotation, zoom, sliderValue);
  }, [crop, rotation, zoom, sliderValue]);

  const handleUndo = () => {
    if (undoStack.length > 1) {
      const lastState = undoStack[undoStack.length - 2];
      setUndoStack((prevStack) => prevStack.slice(0, -2));
      setRedoStack((prevStack) => [
        ...prevStack,
        { crop, rotation, zoom, sliderValue },
      ]);
      setCrop(lastState.crop);
      setRotation(lastState.rotation);
      setZoom(lastState.zoom);
      setSliderValue(lastState.sliderValue);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setRedoStack((prevStack) => prevStack.slice(0, -1));
      setUndoStack((prevStack) => [
        ...prevStack,
        { crop, rotation, zoom, sliderValue },
      ]);
      setCrop(nextState.crop);
      setRotation(nextState.rotation);
      setZoom(nextState.zoom);
      setSliderValue(nextState.sliderValue);
      updateImage(nextState);
    }
  };

  const createImage = (url: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new window.Image();
      image.crossOrigin = "anonymous";
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  async function getCroppedImg(
    imageSrc: string,
    crop: { width: number; height: number },
    rotation = 0
  ) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const safeArea = Math.max(image.width, image.height) * 2;
    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx!.translate(safeArea / 2, safeArea / 2);
    ctx!.rotate((rotation * Math.PI) / 180);
    ctx!.translate(-safeArea / 2, -safeArea / 2);

    ctx!.drawImage(
      image,
      safeArea / 2 - image.width / 2,
      safeArea / 2 - image.height / 2
    );

    const data = ctx!.getImageData(
      safeArea / 2 - crop.width / 2,
      safeArea / 2 - crop.height / 2,
      crop.width,
      crop.height
    );

    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx!.putImageData(data, 0, 0);

    return new Promise<string>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        const fileUrl = window.URL.createObjectURL(blob);
        resolve(fileUrl);
      }, "image/jpeg");
    });
  }

  const updateImage = (state: {
    crop: { x: number; y: number };
    rotation: number;
    zoom: number;
    sliderValue: number;
  }) => {
    setCrop(state.crop);
    setRotation(state.rotation);
    setZoom(state.zoom);
    setSliderValue(state.sliderValue);
  };

  async function handleSaveEdits() {
    try {
      const croppedImageUrl: string = await getCroppedImg(
        `${media.file_url}`,
        croppedAreaPixels,
        rotation
      );
      const croppedImageFile: File = await fetch(croppedImageUrl.toString())
        .then((res) => res.blob())
        .then(
          (blob) => new File([blob], "croppedImage.jpg", { type: "image/jpeg" })
        );
      setUndoStack([]);
      setRedoStack([]);
      setIsEditingImage(false);

      handleFormSubmit(
        {
          title: media.name,
          alternativeText: media.alternativeText,
          caption: media.caption,
        },
        croppedImageFile
      );
      if (!editDetail) {
        message.success(t("Image cropped successfully"));
      }
    } catch {
      message.error(t("Failed to crop image"));
    }
  }

  const handleCancelEditing = () => {
    setRotation(0);
    setUndoStack([]);
    setRedoStack([]);
    setIsEditingImage(false);
  };

  return (
    <div>
      {isEditingImage ? (
        <div>
          <div className="inline-block justify-start mt-5 mb-20">
            <Button
              className="mr-2.5"
              onClick={handleUndo}
              icon={<UndoOutlined />}
            >
              {t("Undo")}
            </Button>
            <Button
              className="mr-2.5"
              onClick={handleRedo}
              icon={<RedoOutlined />}
            >
              {t("Redo")}
            </Button>
            <Select
              defaultValue="Image Rotation"
              className="mr-2.5 w-[150px]"
              onChange={handleRotationChange}
            >
              <Select.Option value="Rotate 0">{t("Origin")}</Select.Option>
              <Select.Option value="Rotate 90 left">
                {t("Rotate 90° left")}
              </Select.Option>
              <Select.Option value="Rotate 90 right">
                {t("Rotate 90° right")}
              </Select.Option>
              <Select.Option value="Rotate 180">
                {t("Rotate 180°")}
              </Select.Option>
            </Select>
            <Button className="mr-2.5" onClick={handleSaveEdits}>
              {t("Save Edits")}
            </Button>
            <Button onClick={handleCancelEditing}>{t("Cancel Editing")}</Button>
          </div>

          <div className="flex justify-start ml-[30vh] w-[70%] h-[40%]">
            <div
              className="relative bg-white"
              style={{ width: mediaWidth, height: mediaHeight }}
            >
              <Cropper
                image={`${media.file_url}`}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                cropSize={cropSize}
                aspect={getAspectRatio(
                  rotation,
                  cropSize.width,
                  cropSize.height
                )}
                onCropChange={(newCrop) => {
                  setCrop(newCrop);
                  debouncedSaveToUndoStack(newCrop, rotation, zoom, zoom);
                }}
                onZoomChange={(newZoom) => {
                  setZoom(newZoom);
                  debouncedSaveToUndoStack(crop, rotation, newZoom, newZoom);
                }}
                onCropComplete={(croppedArea, croppedAreaPixels) => {
                  setCropSize({ width: mediaWidth, height: mediaHeight });
                  setCroppedAreaPixels({
                    x: croppedAreaPixels.x,
                    y: croppedAreaPixels.y,
                    width: croppedAreaPixels.width,
                    height: croppedAreaPixels.height,
                  });
                  debouncedSaveToUndoStack(
                    croppedAreaPixels,
                    rotation,
                    zoom,
                    zoom
                  );
                }}
              />
            </div>

            <Slider
              min={1}
              max={2}
              step={0.01}
              value={sliderValue}
              onChange={(newZoom) => {
                setZoom(newZoom);
                setSliderValue(newZoom);
                debouncedSaveToUndoStack(crop, rotation, newZoom, sliderValue);
              }}
              className="w-[200px] ml-10"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ImageEditor;
