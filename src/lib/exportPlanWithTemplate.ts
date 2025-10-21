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
  LevelFormat,
} from "docx";
import { saveAs } from "file-saver";

// ===== 🧩 Bảng =====
function makeRealTable(headers: string[], rows: any[][]) {
  const border = {
    top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  };

  return new Table({
    width: { size: 90, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: headers.map(
          (h) =>
            new TableCell({
              borders: border,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: h,
                      bold: true,
                      size: 24,
                      font: "Times New Roman",
                    }),
                  ],
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
                      spacing: { line: 240 },
                      children: [
                        new TextRun({
                          text: String(c || ""),
                          size: 24,
                          font: "Times New Roman",
                        }),
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

// ===== 🧩 Paragraph chuẩn =====
function makeParagraph(text: string, opts: any = {}) {
  return new Paragraph({
    spacing: { before: 100, after: 100, line: 300 },
    alignment: opts.align || AlignmentType.JUSTIFIED,
    indent: { left: 720, right: 720 },
    children: [
      new TextRun({
        text,
        bold: opts.bold || false,
        size: 24,
        font: "Times New Roman",
      }),
    ],
  });
}

// ===== 🧩 Format thời gian =====
function formatTimeRange(start?: string, end?: string) {
  if (!start || !end) return "";
  const s = new Date(start);
  const e = new Date(end);
  const pad = (n: number) => String(n).padStart(2, "0");

  const sameDay =
    s.getDate() === e.getDate() &&
    s.getMonth() === e.getMonth() &&
    s.getFullYear() === e.getFullYear();

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

// ===== 🧩 Header =====
function createHeader() {
  const noBorder = {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorder,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: noBorder,
            children: [
              makeCentered("TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TP. HCM", 22),
              makeCentered("KHOA CÔNG NGHỆ THÔNG TIN", 22),
              makeCenteredBold("CÂU LẠC BỘ TSE CLUB", 22),
            ],
          }),
          new TableCell({
            borders: noBorder,
            children: [
              makeCenteredBold("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", 22),
              makeCenteredItalic("Độc lập - Tự do - Hạnh phúc", 22),
            ],
          }),
        ],
      }),
    ],
  });
}

function makeCentered(text: string, size: number) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, size, font: "Times New Roman" })],
  });
}
function makeCenteredBold(text: string, size: number) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ text, bold: true, size, font: "Times New Roman" }),
    ],
  });
}
function makeCenteredItalic(text: string, size: number) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ text, italics: true, size, font: "Times New Roman" }),
    ],
  });
}

// ===== 🧩 Footer =====
function createFooter(author: string) {
  const noBorder = {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorder,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: noBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: "Khoa CNTT ",
                    bold: true,
                    font: "Times New Roman",
                  }),
                  new TextRun({
                    text: "(duyệt)",
                    italics: true,
                    size: 24,
                    font: "Times New Roman",
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: noBorder,
            children: [
              makeCenteredBold("Người lập kế hoạch", 24),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 400 },
                children: [
                  new TextRun({
                    text: author || "",
                    bold: true,
                    size: 24,
                    font: "Times New Roman",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: noBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: "Nơi nhận:",
                    bold: true,
                    size: 24,
                    font: "Times New Roman",
                  }),
                ],
              }),
              makeParagraph("Ban lãnh đạo Khoa"),
              makeParagraph("BCN CLB"),
              makeParagraph("Lưu VT"),
            ],
          }),
          new TableCell({ borders: noBorder, children: [] }),
        ],
      }),
    ],
  });
}

// ===== 🧩 Xuất Word =====
export async function exportPlanWithTemplate(
  planData: Record<string, any>,
  eventTitle: string,
  orderCategory: string[],
  author: string
) {
  const children: any[] = [];
  const numbering = {
    config: [
      {
        reference: "main-numbering",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: 720, hanging: 360 },
                spacing: { before: 100, after: 100, line: 300 },
              },
              run: { size: 24, font: "Times New Roman" },
            },
          },
        ],
      },
      {
        reference: "bullet-list",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: 1000, hanging: 360 },
                spacing: { before: 100, after: 100, line: 300 },
              },
              run: { size: 22, font: "Times New Roman" },
            },
          },
        ],
      },
    ],
  };

  // Header
  children.push(createHeader());
  children.push(new Paragraph({ spacing: { after: 200 } }));

  // Tiêu đề
  const today = new Date();
  children.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: `TP.HCM, ngày ${today.getDate()} tháng ${
            today.getMonth() + 1
          } năm ${today.getFullYear()}`,
          italics: true,
          size: 24,
          font: "Times New Roman",
        }),
      ],
    })
  );
  children.push(
    makeCenteredBold("KẾ HOẠCH", 32),
    makeCenteredBold(`V/v: ${eventTitle}`, 24)
  );

  // Nội dung theo orderCategory
  for (const category of orderCategory) {
    if (!planData[category]) continue;

    // Tiêu đề mục (numbering)
    children.push(
      new Paragraph({
        numbering: { reference: "main-numbering", level: 0 },
        children: [
          new TextRun({
            text: category,
            bold: true,
            size: 24,
            font: "Times New Roman",
          }),
        ],
      })
    );

    // Nội dung từng mục
    if (category === "Mục đích") {
      const content = planData[category]?.["Nội dung"] || "";
      const lines = content.split(/\r?\n/).filter((l: string) => l.trim());
      lines.forEach((line: string) => {
        if (line.trim().startsWith("-")) {
          children.push(
            new Paragraph({
              numbering: { reference: "bullet-list", level: 0 },
              children: [
                new TextRun({
                  text: line.replace(/^[-–•]\s*/, ""),
                  size: 24,
                  font: "Times New Roman",
                }),
              ],
            })
          );
        } else {
          children.push(makeParagraph(line));
        }
      });
    }

    if (category === "Thời gian & địa điểm") {
      const tg = planData[category]?.["Thời gian"] || [];
      const dd = planData[category]?.["Địa điểm"] || "";
      children.push(
        new Paragraph({
          numbering: { reference: "bullet-list", level: 0 },
          children: [
            new TextRun({
              text: `Thời gian: ${formatTimeRange(tg[0], tg[1])}`,
              size: 24,
              font: "Times New Roman",
            }),
          ],
        })
      );
      children.push(
        new Paragraph({
          numbering: { reference: "bullet-list", level: 0 },
          children: [
            new TextRun({
              text: `Địa điểm: ${dd}`,
              size: 24,
              font: "Times New Roman",
            }),
          ],
        })
      );
    }

    if (category === "Kế hoạch di chuyển") {
      ["Phương tiện", "Giờ khởi hành", "Địa điểm tập trung"].forEach((k) => {
        const v = planData[category]?.[k] || "";
        if (v)
          children.push(
            new Paragraph({
              numbering: { reference: "bullet-list", level: 0 },
              children: [
                new TextRun({
                  text: `${k}: ${v}`,
                  size: 24,
                  font: "Times New Roman",
                }),
              ],
            })
          );
      });
    }

    if (category === "Nội dung chương trình") {
      const ct = planData[category]?.["Chương trình"] || [];
      ct.forEach((c: any) =>
        children.push(
          new Paragraph({
            numbering: { reference: "bullet-list", level: 0 },
            children: [
              new TextRun({
                text: `${c.Thời_gian || ""} – ${c.Hoạt_động || ""}`,
                size: 24,
                font: "Times New Roman",
              }),
            ],
          })
        )
      );
    }

    if (category === "Ban tổ chức chương trình") {
      const list = planData[category]?.["Ban tổ chức"] || [];
      const rows = list.map((o: any) => [
        o.roleContent || "",
        o.fullName || "",
        o.title || "",
      ]);
      children.push(makeRealTable(["Vai trò", "Họ và tên", "Chức vụ"], rows));
    }

    if (category === "Tiến độ thực hiện chương trình") {
      const td = planData[category]?.["Tiến độ"] || [];
      const rows = td.map((t: any) => [
        t.Thời_gian || "",
        t.Nội_dung || "",
        t.Người_thực_hiện || "",
      ]);
      children.push(
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
      children.push(
        makeRealTable(["STT", "Nội dung", "Đơn vị", "Thành tiền"], rows)
      );
    }

    if (category === "Thành phần tham dự") {
      children.push(makeParagraph(planData[category]?.["Danh sách"] || ""));
    }
  }

  // Footer
  children.push(new Paragraph({ spacing: { before: 400 } }));
  children.push(createFooter(author));

  // Tạo file
  const doc = new Document({
    numbering,
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 900, right: 720 },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `KeHoach_${eventTitle}.docx`);
}
