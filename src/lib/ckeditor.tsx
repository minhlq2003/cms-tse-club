"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  Alignment,
  Bold,
  ClassicEditor,
  Code,
  Essentials,
  Font,
  Heading,
  Image,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Italic,
  Link,
  SimpleUploadAdapter,
  Strikethrough,
  Table,
  TableCellProperties,
  TableProperties,
  TableToolbar,
  Underline,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";

const LICENSE_KEY = "GPL";
const CKBOX_TOKEN_URL = "";

interface CKEditorProps {
  value: string;
  onChange: (data: string) => void;
}

const CKEditorComponent = ({ value, onChange }: CKEditorProps) => {
  return (
    <CKEditor
      editor={ClassicEditor}
      onChange={(event, editor: ClassicEditor) => {
        const data = editor.getData();
        onChange(data);
      }}
      data={value}
      config={{
        licenseKey: LICENSE_KEY,
        plugins: [
          Font,
          Heading,
          Alignment,
          Image,
          ImageResize,
          Bold,
          Code,
          Italic,
          ImageUpload,
          Strikethrough,
          Underline,
          Table,
          TableToolbar,
          TableProperties,
          TableCellProperties,
          SimpleUploadAdapter,
          ImageToolbar,
          ImageStyle,
          Link,
          Essentials,
          ...(CKBOX_TOKEN_URL ? ["CKBox"] : []),
          ...(LICENSE_KEY !== "GPL" ? ["SlashCommand"] : []),
        ],
        toolbar: [
          "heading",
          "bold",
          "italic",
          "underline",
          "strikethrough",
          "alignment",
          "insertTable",
          "Link",
          {
            label: "Fonts",
            icon: false,
            items: [
              "fontSize",
              "fontFamily",
              "fontColor",
              "fontBackgroundColor",
            ],
          },
        ],
        list: {},
        heading: {
          options: [
            {
              model: "paragraph",
              title: "Paragraph",
              class: "ck-heading_paragraph",
            },
            {
              model: "heading1",
              view: "h1",
              title: "Heading 1",
              class: "ck-heading_heading1",
            },
            {
              model: "heading2",
              view: "h2",
              title: "Heading 2",
              class: "ck-heading_heading2",
            },
            {
              model: "heading3",
              view: "h3",
              title: "Heading 3",
              class: "ck-heading_heading3",
            },
          ],
        },
        fontFamily: {
          options: [
            "default",
            "Arial, Helvetica, sans-serif",
            "Courier New, Courier, monospace",
            "Georgia, serif",
            "Lucida Sans Unicode, Lucida Grande, sans-serif",
            "Tahoma, Geneva, sans-serif",
            "Times New Roman, Times, serif",
            "Trebuchet MS, Helvetica, sans-serif",
            "Verdana, Geneva, sans-serif",
            "Amazone",
            "Open Sans, sans-serif",
          ],
        },
        fontSize: {
          options: [12, 14, 16, 18, 20, 22, 24, 28, 32, 36],
          supportAllValues: true,
        },
        alignment: {
          options: ["left", "center", "right", "justify"],
        },
        image: {
          styles: {
            options: [
              {
                name: "alignLeft",
                title: "Căn trái",
                icon: "left",
                className: "image-align-left",
                modelElements: ["imageBlock", "imageInline"],
              },
              {
                name: "alignCenter",
                title: "Căn giữa",
                icon: "center",
                className: "image-align-center",
                modelElements: ["imageBlock", "imageInline"],
              },
              {
                name: "alignRight",
                title: "Căn phải",
                icon: "right",
                className: "image-align-right",
                modelElements: ["imageBlock", "imageInline"],
              },
              "side",
            ],
          },
          toolbar: [
            "imageStyle:alignLeft",
            "imageStyle:alignCenter",
            "imageStyle:alignRight",
            "|",
            "toggleImageCaption",
            "linkImage",
          ],
        },

        table: {
          contentToolbar: [
            "tableColumn",
            "tableRow",
            "mergeTableCells",
            "tableProperties",
            "tableCellProperties",
          ],
        },
        link: {
          addTargetToExternalLinks: true,
          defaultProtocol: "https://",
        },
        ckbox: {
          tokenUrl: CKBOX_TOKEN_URL,
        },
      }}
    />
  );
};

export default CKEditorComponent;
