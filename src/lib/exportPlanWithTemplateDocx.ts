import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ImageRun,
  HeadingLevel,
  PageOrientation,
} from "docx";
import { saveAs } from "file-saver";

// 🧩 Hàm tạo bảng thật (Insert Table)
function makeRealTable(headers: string[], rows: any[][]) {
  const border = {
    top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: headers.map(
          (h) =>
            new TableCell({
              borders: border,
              children: [
                new Paragraph({
                  children: [new TextRun({ text: h, bold: true })],
                }),
              ],
            })
        ),
      }),
      ...rows.map(
        (r) =>
          new TableRow({
            children: r.map(
              (c) =>
                new TableCell({
                  borders: border,
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: String(c || ""), size: 24 }),
                      ],
                    }),
                  ],
                })
            ),
          })
      ),
    ],
  });
}

// 🧩 Hàm format ngày/giờ
function formatTimeRange(start?: string, end?: string) {
  if (!start || !end) return "";
  const s = new Date(start);
  const e = new Date(end);

  const sameDay =
    s.getFullYear() === e.getFullYear() &&
    s.getMonth() === e.getMonth() &&
    s.getDate() === e.getDate();

  const pad = (n: number) => String(n).padStart(2, "0");

  if (sameDay)
    return `${pad(s.getHours())}:${pad(s.getMinutes())} – ${pad(
      e.getHours()
    )}:${pad(e.getMinutes())}, ngày ${s.getDate()} tháng ${
      s.getMonth() + 1
    } năm ${s.getFullYear()}`;
  else
    return `${pad(s.getHours())}:${pad(s.getMinutes())} ${pad(
      s.getDate()
    )}/${pad(s.getMonth() + 1)}/${s.getFullYear()} – ${pad(e.getHours())}:${pad(
      e.getMinutes()
    )} ${pad(e.getDate())}/${pad(e.getMonth() + 1)}/${e.getFullYear()}`;
}

// 🧩 Hàm tạo đoạn văn bản chuẩn format
function makeParagraph(text: string, options: any = {}) {
  return new Paragraph({
    spacing: { after: 100, line: 300 },
    alignment: options.align || AlignmentType.JUSTIFIED,
    children: [new TextRun({ text, bold: !!options.bold, size: 24 })],
  });
}

// 🧩 Hàm chính
export async function exportPlanWithTemplate(
  planData: any,
  eventTitle: string
) {
  const sections: any[] = [];

  // 🏫 Thêm logo & tiêu đề
  const logoResponse = await fetch("/images/logo_fit_iuh.png");
  const logoBuffer = await logoResponse.arrayBuffer();

  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new ImageRun({
          data: logoBuffer,
          transformation: { width: 120, height: 120 },
          type: "png",
        }),
      ],
    })
  );

  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "KẾ HOẠCH TỔ CHỨC CHƯƠNG TRÌNH",
          bold: true,
          size: 32,
        }),
      ],
    })
  );

  sections.push(new Paragraph(""));

  // 🧾 Duyệt qua thứ tự danh mục
  const order = [
    "Mục đích",
    "Thời gian & địa điểm",
    "Kế hoạch di chuyển",
    "Nội dung chương trình",
    "Ban tổ chức chương trình",
    "Tiến độ thực hiện chương trình",
    "Kinh phí thực hiện",
    "Thành phần tham dự",
  ];

  let index = 1;
  for (const category of order) {
    if (!planData[category]) continue;

    // Tiêu đề mục
    sections.push(
      new Paragraph({
        spacing: { after: 200, before: 200 },
        children: [
          new TextRun({
            text: `${index}. ${category.toUpperCase()}`,
            bold: true,
            size: 26,
          }),
        ],
      })
    );

    // Nội dung từng mục
    if (category === "Mục đích") {
      sections.push(makeParagraph(planData[category]?.["Nội dung"] || ""));
    }

    if (category === "Thời gian & địa điểm") {
      const timeRange = formatTimeRange(
        planData[category]?.["Thời gian"]?.[0],
        planData[category]?.["Thời gian"]?.[1]
      );
      const diaDiem = planData[category]?.["Địa điểm"] || "";
      sections.push(makeParagraph(`- Thời gian: ${timeRange}`));
      sections.push(makeParagraph(`- Địa điểm: ${diaDiem}`));
    }

    if (category === "Kế hoạch di chuyển") {
      sections.push(
        makeParagraph(
          `- Phương tiện: ${planData[category]?.["Phương tiện"] || ""}`
        )
      );
      sections.push(
        makeParagraph(
          `- Giờ khởi hành: ${planData[category]?.["Giờ khởi hành"] || ""}`
        )
      );
      sections.push(
        makeParagraph(
          `- Địa điểm tập trung: ${
            planData[category]?.["Địa điểm tập trung"] || ""
          }`
        )
      );
    }

    if (category === "Nội dung chương trình") {
      const ct = planData[category]?.["Chương trình"] || [];
      ct.forEach((item: any) => {
        sections.push(
          makeParagraph(`- ${item.Thời_gian || ""} – ${item.Hoạt_động || ""}`)
        );
      });
    }

    if (category === "Ban tổ chức chương trình") {
      const list = planData[category]?.["Ban tổ chức"] || [];
      const rows = list.map((o: any, i: number) => [
        o.roleContent || "",
        o.fullName || "",
        o.title || "",
      ]);
      sections.push(makeRealTable(["Vai trò", "Họ và tên", "Chức vụ"], rows));
    }

    if (category === "Tiến độ thực hiện chương trình") {
      const td = planData[category]?.["Tiến độ"] || [];
      const rows = td.map((t: any) => [
        t.Thời_gian || "",
        t.Nội_dung || "",
        t.Người_thực_hiện || "",
      ]);
      sections.push(
        makeRealTable(["Thời gian", "Nội dung", "Người thực hiện"], rows)
      );
    }

    if (category === "Kinh phí thực hiện") {
      const kp = planData[category]?.["Kinh phí"] || [];
      const rows = kp.map((k: any, i: number) => [
        (i + 1).toString(),
        k.Nội_dung || "",
        k.Đơn_vị || "",
        k.Thành_tiền || "",
      ]);
      sections.push(
        makeRealTable(["STT", "Nội dung", "Đơn vị", "Thành tiền"], rows)
      );
    }

    if (category === "Thành phần tham dự") {
      sections.push(makeParagraph(planData[category]?.["Danh sách"] || ""));
    }

    index++;
  }

  // 📄 Tạo file Word
  const doc = new Document({
    sections: [{ properties: {}, children: sections }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `KeHoach_${eventTitle}.docx`);
}
