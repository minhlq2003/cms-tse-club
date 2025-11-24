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

  // ===== Debug logs =====
  console.log("🔍 Export Debug:");
  console.log("orderCategory:", orderCategory);
  console.log("planData keys:", Object.keys(planData));
  console.log("blocksMeta:", blocksMeta);

  // ===== Nội dung động theo orderCategory =====
  for (const category of orderCategory) {
    const blockData = planData[category];

    console.log(`\n📦 Processing category: ${category}`);
    console.log("blockData:", blockData);

    if (!blockData || Object.keys(blockData).length === 0) {
      console.log(`⚠️ No data for ${category}, skipping...`);
      continue;
    }

    // 🔧 FIX: Tìm metadata với nhiều cách so sánh hơn
    const meta = blocksMeta.find(
      (b: any) =>
        b.id === category || b.key === category || b.blockId === category // thêm trường hợp này cho custom blocks
    );

    const blockTitle = meta?.title || meta?.name || category;

    console.log("Found meta:", meta);
    console.log("Using title:", blockTitle);

    // Tiêu đề block
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

    // ===== Xử lý basic_thoi_gian =====
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
      }
      continue;
    }

    // ===== Xử lý basic_ban_to_chuc =====
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
      }
      continue;
    }

    // ===== Xử lý các block còn lại (bao gồm custom blocks) =====
    let parsedFields: any[] = [];

    // 🔧 FIX: Parse block definition từ meta
    try {
      if (meta?.block) {
        const blockStr =
          typeof meta.block === "string"
            ? meta.block
            : JSON.stringify(meta.block);
        parsedFields = JSON.parse(blockStr);
        console.log(`✅ Parsed ${parsedFields.length} fields from meta.block`);
      }
    } catch (err) {
      console.error(`❌ Error parsing meta.block for ${category}:`, err);
      parsedFields = [];
    }

    // Nếu có parsedFields từ metadata => render theo template
    if (parsedFields.length > 0) {
      console.log(`📋 Rendering ${parsedFields.length} fields for ${category}`);

      for (const fieldDef of parsedFields) {
        const fieldKey = fieldDef.label || fieldDef.id || fieldDef.name;
        const value = blockData[fieldKey];

        console.log(
          `  Field: ${fieldKey}, Type: ${fieldDef.type}, Value:`,
          value
        );

        if (value === undefined || value === null || value === "") {
          console.log(`  ⏭️ Skipping empty field: ${fieldKey}`);
          continue;
        }

        // ===== Table field =====
        if (
          fieldDef.type === "Table" &&
          Array.isArray(value) &&
          value.length > 0
        ) {
          const cols = fieldDef.columns || [];
          const headers = cols.map((c: any) => c.name || c.label || c.id || "");
          const rows = value.map((r: any) =>
            cols.map((c: any) => {
              let v = r[c.name] || r[c.id];
              if (c.type?.includes("Date") && v) v = formatDateTime(v);
              return v ?? "";
            })
          );
          children.push(makeRealTable(headers, rows));
          continue;
        }

        // ===== RangeDate/RangeDateTime =====
        if (
          (fieldDef.type === "RangeDate" ||
            fieldDef.type === "RangeDateTime") &&
          Array.isArray(value) &&
          value.length === 2
        ) {
          children.push(
            makeParagraph(`${fieldKey}: ${formatTimeRange(value[0], value[1])}`)
          );
          continue;
        }

        // ===== Date/DateTime =====
        if (
          (fieldDef.type === "Date" || fieldDef.type === "DateTime") &&
          typeof value === "string"
        ) {
          children.push(makeParagraph(`${fieldKey}: ${formatDateTime(value)}`));
          continue;
        }

        // ===== TextArea or Text with multiple lines =====
        if (typeof value === "string") {
          const lines = value
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean);

          if (lines.length > 1) {
            // Multiple lines => bullet list
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
            // Single line
            children.push(makeParagraph(value));
          }
          continue;
        }

        // ===== Array of primitives =====
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

        // ===== Single object =====
        if (typeof value === "object" && !Array.isArray(value)) {
          const text = Object.entries(value)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ");
          children.push(makeParagraph(text));
          continue;
        }

        // ===== Fallback =====
        children.push(makeParagraph(`${fieldKey}: ${String(value)}`));
      }
    } else {
      // 🔧 Không có parsedFields => fallback: iterate blockData keys
      console.log(`⚠️ No parsed fields for ${category}, using fallback...`);

      for (const fieldName of Object.keys(blockData)) {
        const value = blockData[fieldName];
        if (value === undefined || value === null || value === "") continue;

        console.log(`  Fallback field: ${fieldName}, Value:`, value);

        // String => multiline check
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
            children.push(makeParagraph(value));
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
            makeParagraph(
              `${fieldName}: ${formatTimeRange(value[0], value[1])}`
            )
          );
          continue;
        }

        // Table-like array of objects
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

        // Single object
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
  console.log("✅ Word document exported successfully!");
}
