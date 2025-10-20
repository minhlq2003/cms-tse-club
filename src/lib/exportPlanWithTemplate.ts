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
  Numbering,
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

  // Giảm độ rộng cột tổng thể xuống còn ~90%
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
                  children: [new TextRun({ text: h, bold: true, size: 24 })],
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

function makeParagraph(text: string, opts: any = {}) {
  return new Paragraph({
    spacing: { before: 100, after: 100, line: 300 },
    alignment: opts.align || AlignmentType.JUSTIFIED,
    indent: {
      left: 720, // 0.5 inch
      right: 720,
      hanging: 360,
    },
    children: [new TextRun({ text, bold: opts.bold || false, size: 24 })],
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

export async function exportPlanWithTemplate(
  planData: Record<string, any>,
  eventTitle: string
) {
  const children: any[] = [];

  // ===== HEADER =====
  const noBorder = {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE },
  };

  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorder,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: noBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TP. HCM",
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "KHOA CÔNG NGHỆ THÔNG TIN",
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "BỘ MÔN KỸ THUẬT PHẦN MỀM",
                    bold: true,
                    size: 24,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: noBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
                    bold: true,
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Độc lập - Tự do - Hạnh phúc",
                    italics: true,
                    size: 24,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  children.push(headerTable);
  children.push(new Paragraph({ spacing: { after: 200 } }));

  // ===== TIÊU ĐỀ =====
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
        }),
      ],
    })
  );
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300 },
      children: [new TextRun({ text: "KẾ HOẠCH", bold: true, size: 32 })],
    })
  );
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({ text: `V/v: ${eventTitle}`, bold: true, size: 24 }),
      ],
    })
  );

  const numbering = {
    config: [
      {
        reference: "main-numbering",
        levels: [
          {
            level: 0,
            bold: true,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: 720, hanging: 360 },
                spacing: { before: 100, after: 100, line: 300 },
              },
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
            text: "-",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: 920, hanging: 360 },
                spacing: { before: 100, after: 100, line: 300 },
              },
            },
          },
        ],
      },
    ],
  };

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

  for (let i = 0; i < order.length; i++) {
    const category = order[i];
    if (!planData[category]) continue;

    // numbering list
    children.push(
      new Paragraph({
        numbering: { reference: "main-numbering", level: 0 },
        children: [new TextRun({ text: category, bold: true, size: 24 })],
      })
    );

    // Nội dung chi tiết
    if (category === "Mục đích") {
      children.push(makeParagraph(planData[category]?.["Nội dung"] || ""));
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
            }),
          ],
        })
      );
      children.push(
        new Paragraph({
          numbering: { reference: "bullet-list", level: 0 },
          children: [new TextRun({ text: `Địa điểm: ${dd}`, size: 24 })],
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
              children: [new TextRun({ text: `${k}: ${v}`, size: 24 })],
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

  // ===== FOOTER =====
  children.push(new Paragraph({ spacing: { before: 400 } }));
  children.push(createFooter());

  // ===== TẠO FILE =====
  const doc = new Document({
    numbering,
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              bottom: 720,
              left: 900,
              right: 720,
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `KeHoach_${eventTitle}.docx`);
}

// ===== FOOTER =====
function createFooter() {
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
                  new TextRun({ text: "Khoa CNTT ", bold: true }),
                  new TextRun({ text: "(duyệt)", italics: true, size: 24 }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: noBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Người lập kế hoạch",
                    bold: true,
                    size: 24,
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
                  new TextRun({ text: "Nơi nhận:", bold: true, size: 24 }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Ban lãnh đạo Khoa", size: 24 }),
                ],
              }),
              new Paragraph({
                children: [new TextRun({ text: "BCH Khoa", size: 24 })],
              }),
              new Paragraph({
                children: [new TextRun({ text: "Lưu VT", size: 24 })],
              }),
            ],
          }),
          new TableCell({
            borders: noBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 400 },
                children: [
                  new TextRun({
                    text: "Nguyễn Thị Hạnh",
                    bold: true,
                    size: 24,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
