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

function formatDateTime(str: string): string {
  if (!str) return "";
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  const datePart = `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
  const timePart =
    d.getHours() || d.getMinutes()
      ? ` ${String(d.getHours()).padStart(2, "0")}:${String(
          d.getMinutes()
        ).padStart(2, "0")}`
      : "";
  return `${datePart}${timePart}`;
}

function makeRealTable(headers: string[], rows: any[][]) {
  const border = {
    top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  };

  return new Table({
    width: { size: 90, type: WidthType.PERCENTAGE },
    indent: { size: 720, type: WidthType.DXA },
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
    width: { size: 90, type: WidthType.PERCENTAGE },
    indent: { size: 720, type: WidthType.DXA },
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
                    text: "Chủ nhiệm CLB",
                    bold: true,
                    font: "Times New Roman",
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.LEFT,

                children: [
                  new TextRun({
                    text: "   (duyệt)",
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
// ===== 🧩 Xuất Word (updated) =====
export async function exportPlanWithTemplate(
  planData: Record<string, any>,
  eventTitle: string,
  orderCategory: string[],
  author: string,
  blocksMeta: any[]
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
            text: "–",
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

  // ===== Header =====
  children.push(createHeader());
  children.push(new Paragraph({ spacing: { after: 200 } }));

  // ===== Tiêu đề & ngày tháng =====
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

  children.push(makeCenteredBold("KẾ HOẠCH", 32));
  children.push(new Paragraph({ spacing: { after: 30 } }));

  children.push(makeCenteredBold(`V/v: ${eventTitle}`, 26));
  children.push(new Paragraph({ spacing: { after: 30 } }));

  // ===== Nội dung động theo orderCategory =====
  for (const category of orderCategory) {
    const blockData = planData[category];
    if (!blockData) continue;

    // tìm metadata block theo id
    const meta = (blocksMeta || []).find(
      (b: any) => b.id === category || b.key === category
    );
    const blockTitle = meta?.title || category;

    console.log("category:", category);
    console.log("blockData:", blockData);
    console.log("meta:", meta);

    // Tiêu đề block (dùng title)
    children.push(
      new Paragraph({
        numbering: { reference: "main-numbering", level: 0 },
        children: [
          new TextRun({
            text: blockTitle,
            bold: true,
            size: 24,
            font: "Times New Roman",
          }),
        ],
      })
    );

    if (category === "basic_thoi_gian") {
      const thoiGian = blockData?.["Thời gian"];
      const diaDiem = blockData?.["Địa điểm"];

      const bullets: string[] = [];

      if (Array.isArray(thoiGian) && thoiGian.length === 2) {
        const [start, end] = thoiGian;
        const startDate = new Date(start);
        const endDate = new Date(end);
        const timeString = `${startDate.toLocaleString(
          "vi-VN"
        )} - ${endDate.toLocaleString("vi-VN")}`;
        bullets.push(`Thời gian: ${timeString}`);
      }

      if (diaDiem) {
        bullets.push(`Địa điểm: ${diaDiem}`);
      }

      if (bullets.length > 0) {
        for (const b of bullets) {
          children.push(
            new Paragraph({
              numbering: { reference: "bullet-list", level: 0 },
              children: [
                new TextRun({
                  text: b,
                  size: 24,
                  font: "Times New Roman",
                }),
              ],
            })
          );
        }
      } else {
        children.push(makeParagraph("Không có dữ liệu thời gian & địa điểm."));
      }

      continue; // bỏ qua các xử lý mặc định khác
    }

    if (category === "basic_ban_to_chuc") {
      const list = Array.isArray(blockData?.["Ban tổ chức"])
        ? blockData["Ban tổ chức"]
        : [];

      if (list.length > 0) {
        const headers = ["Vai trò", "Họ và tên", "Chức vụ"];
        const rows = list.map((item: any) => [
          item.roleContent || "",
          item.fullName || "",
          item.title || "",
        ]);
        children.push(makeRealTable(headers, rows));
      } else {
        children.push(makeParagraph("Không có dữ liệu ban tổ chức."));
      }
      continue; // bỏ qua các xử lý mặc định khác
    }

    let parsedFields: any[] = [];
    try {
      if (meta?.block) {
        parsedFields = JSON.parse(meta.block || "[]");
      }
    } catch {
      parsedFields = [];
    }
    if (parsedFields.length > 0) {
      for (const fieldDef of parsedFields) {
        const fieldKey = fieldDef.label || fieldDef.id;
        const value = blockData[fieldKey];

        if (value === undefined || value === null) continue;

        // ===== Table field =====
        if (fieldDef.type === "Table") {
          // columns từ fieldDef.columns -> tên hiển thị = name (DynamicTable dùng col.name làm key)
          const cols = fieldDef.columns || [];
          const headers = cols.map((c: any) => c.name || c.label || c.id || "");
          // rows: blockData[fieldKey] là mảng object; ta lấy value theo header key (c.name)
          const rows = (value || []).map((r: any) =>
            cols.map((c: any) => {
              let v = r[c.name];
              if (c.type?.includes("Date")) v = formatDateTime(v);
              return v ?? "";
            })
          );
          if (rows.length > 0) children.push(makeRealTable(headers, rows));
          // next field
          continue;
        }

        // ===== RangeDate/RangeDateTime (mảng ISO 2 phần tử) =====
        if (
          Array.isArray(value) &&
          value.length === 2 &&
          typeof value[0] === "string" &&
          value[0].includes("T")
        ) {
          children.push(
            makeParagraph(`${fieldKey}: ${formatTimeRange(value[0], value[1])}`)
          );
          continue;
        }

        // ===== String -> có thể nhiều dòng -> bullet list từng dòng =====
        if (typeof value === "string") {
          const lines = value
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean);
          if (lines.length === 0) continue;

          // nếu nhiều dòng -> mỗi dòng thành bullet
          if (lines.length > 1) {
            for (const line of lines) {
              // loại bỏ kí tự - đầu dòng nếu có
              const cleaned = line.replace(/^[-–•]\s*/, "");
              children.push(
                new Paragraph({
                  numbering: { reference: "bullet-list", level: 0 },
                  children: [
                    new TextRun({
                      text: cleaned,
                      size: 24,
                      font: "Times New Roman",
                    }),
                  ],
                })
              );
            }
          } else {
            // 1 dòng -> in theo dạng "Label: value" (hoặc nếu label = 'Nội dung' mà bạn muốn dạng text, vẫn in đầy đủ)
            children.push(makeParagraph(`${value}`));
          }
          continue;
        }

        // ===== Array of primitives (ví dụ list of strings) => bullet per item =====
        if (
          Array.isArray(value) &&
          value.length > 0 &&
          typeof value[0] !== "object"
        ) {
          for (const it of value) {
            children.push(
              new Paragraph({
                numbering: { reference: "bullet-list", level: 0 },
                children: [
                  new TextRun({
                    text: String(it),
                    size: 24,
                    font: "Times New Roman",
                  }),
                ],
              })
            );
          }
          continue;
        }

        // ===== Object (single) =====
        if (typeof value === "object" && !Array.isArray(value)) {
          const text = Object.entries(value)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ");
          children.push(makeParagraph(`${fieldKey}: ${text}`));
          continue;
        }
      }
      // done parsed fields
      continue;
    }

    // Nếu không có parsedFields (ví dụ basic_ban_to_chuc trước đây block="") -> fallback: iterate keys from blockData
    for (const fieldName of Object.keys(blockData)) {
      const value = blockData[fieldName];
      if (value === undefined || value === null) continue;

      // String => multiline => bullets
      if (typeof value === "string") {
        const lines = value
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);
        if (lines.length > 1) {
          for (const line of lines) {
            const cleaned = line.replace(/^[-–•]\s*/, "");
            children.push(
              new Paragraph({
                numbering: { reference: "bullet-list", level: 0 },
                children: [
                  new TextRun({
                    text: cleaned,
                    size: 24,
                    font: "Times New Roman",
                  }),
                ],
              })
            );
          }
        } else {
          children.push(makeParagraph(`${value}`));
        }
        continue;
      }

      // Range time
      if (
        Array.isArray(value) &&
        value.length === 2 &&
        typeof value[0] === "string" &&
        value[0].includes("T")
      ) {
        children.push(
          makeParagraph(`${fieldName}: ${formatTimeRange(value[0], value[1])}`)
        );
        continue;
      }

      // Table-like: array of objects -> build table with headers derived from first row keys
      if (
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === "object"
      ) {
        const headers = Object.keys(value[0]);
        const rows = value.map((r: any) => headers.map((h) => r[h] ?? ""));
        children.push(makeRealTable(headers, rows));
        continue;
      }

      // object fallback
      if (typeof value === "object") {
        const text = Object.entries(value)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
        children.push(makeParagraph(`${fieldName}: ${text}`));
      } else {
        children.push(makeParagraph(`${fieldName}: ${String(value)}`));
      }
    }
  }

  // ===== Footer =====
  children.push(new Paragraph({ spacing: { before: 400 } }));
  children.push(createFooter(author));

  // ===== Xuất Word =====
  const doc = new Document({
    numbering,
    sections: [
      {
        properties: {
          page: { margin: { top: 720, bottom: 720, left: 900, right: 720 } },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `KeHoach_${eventTitle}.docx`);
}
