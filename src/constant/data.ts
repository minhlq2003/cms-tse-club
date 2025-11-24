import { BlockTemplate } from "./types";

export const eventUpcomming = [
  {
    id: 1,
    title: "Hội thảo về Công nghệ Mới",
    date: "2025-09-15",
    description:
      "Tham gia hội thảo để tìm hiểu về các công nghệ mới nhất trong ngành.",
  },
  {
    id: 2,
    title: "Workshop Lập trình Web",
    date: "2025-09-20",
    description:
      "Học cách xây dựng các ứng dụng web hiện đại với các chuyên gia trong lĩnh vực.",
  },
  {
    id: 3,
    title: "Cuộc thi Hackathon",
    date: "2025-08-05",
    description:
      "Tham gia cuộc thi hackathon để thử thách kỹ năng lập trình và sáng tạo của bạn.",
  },
];

export const BasicBlocks: BlockTemplate[] = [
  {
    id: "basic_mentor",
    title: "Mentors",
    block: "",
    type: "basic",
  },
  {
    id: "basic_muc_dich",
    title: "Mục đích",
    type: "basic",
    block: JSON.stringify([
      { id: "noi_dung", placeholder: "Nội dung", type: "TextArea" },
    ]),
  },
  {
    id: "basic_ban_to_chuc",
    title: "Ban tổ chức",
    type: "basic",
    block: "",
  },
  {
    id: "basic_thoi_gian",
    title: "Thời gian & địa điểm",
    type: "basic",
    block: JSON.stringify([
      { id: "thoi_gian", label: "Thời gian", type: "RangeDateTime" },
      { id: "dia_diem", label: "Địa điểm", type: "Text" },
    ]),
  },
  {
    id: "basic_noi_dung",
    title: "Nội dung chương trình",
    type: "basic",
    block: JSON.stringify([
      {
        id: "chuong_trinh",
        label: "Chương trình",
        type: "Table",
        columns: [
          { id: "c1", name: "Thời gian", type: "DateTime" },
          { id: "c2", name: "Hoạt động", type: "Text" },
        ],
      },
    ]),
  },
  {
    id: "basic_tien_do",
    title: "Tiến độ thực hiện chương trình",
    type: "basic",
    block: JSON.stringify([
      {
        id: "tiendo",
        label: "Tiến độ",
        type: "Table",
        columns: [
          { id: "d1", name: "Thời gian", type: "Date" },
          { id: "d2", name: "Nội dung", type: "Text" },
          { id: "d3", name: "Người thực hiện", type: "Text" },
        ],
      },
    ]),
  },
];
