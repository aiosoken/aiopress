import type PptxGenJS from "pptxgenjs";
import type { TableSlideData, TableConfig, ResolvedTheme } from "../types";
import { lighten } from "../utils/color";

export function addTableSlide(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  data: TableSlideData,
  theme: ResolvedTheme
): void {
  slide.background = { color: theme.background };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: 1.1,
    fill: { color: theme.primary },
  });

  slide.addText(data.title, {
    x: 0.6,
    y: 0.15,
    w: 8.8,
    h: 0.8,
    fontSize: theme.headingSize,
    fontFace: theme.fontFamily,
    color: theme.lightText,
    bold: true,
    align: "left",
    valign: "middle",
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 1.1,
    w: "100%",
    h: 0.04,
    fill: { color: theme.accent },
  });

  let currentY = 1.3;
  if (data.subtitle) {
    slide.addText(data.subtitle, {
      x: 0.6,
      y: currentY,
      w: 8.8,
      h: 0.4,
      fontSize: theme.baseSize,
      fontFace: theme.fontFamily,
      color: theme.accent,
      bold: true,
    });
    currentY += 0.5;
  }

  const tableCount = data.tables.length;
  const availableH = 7.5 - currentY - 0.3;
  const tableHeight = availableH / tableCount - 0.2;

  for (const table of data.tables) {
    if (table.label) {
      slide.addText(table.label, {
        x: 0.6,
        y: currentY,
        w: 8.8,
        h: 0.35,
        fontSize: theme.baseSize - 1,
        fontFace: theme.fontFamily,
        color: theme.text,
        bold: true,
      });
      currentY += 0.35;
    }

    const rows = buildTableRows(table, theme);
    const rowH = Math.min(0.4, (tableHeight - (table.label ? 0.35 : 0)) / rows.length);

    slide.addTable(rows, {
      x: 0.6,
      y: currentY,
      w: 8.8,
      colW: table.columnWidths,
      rowH,
      fontSize: theme.baseSize - 2,
      fontFace: theme.fontFamily,
      border: { type: "solid", pt: 0.5, color: lighten(theme.primary, 0.7) },
      valign: "middle",
    });

    currentY += rowH * rows.length + 0.3;
  }
}

function buildTableRows(
  table: TableConfig,
  theme: ResolvedTheme
): PptxGenJS.TableRow[] {
  const headerRow: PptxGenJS.TableRow = table.headers.map((h) => ({
    text: h,
    options: {
      bold: true,
      color: theme.lightText,
      fill: { color: theme.primary },
      align: "center" as const,
      fontSize: theme.baseSize - 2,
    },
  }));

  const dataRows: PptxGenJS.TableRow[] = table.rows.map((row, rowIdx) => {
    const stripeBg = rowIdx % 2 === 0 ? theme.background : lighten(theme.primary, 0.9);
    return row.cells.map((cell) => ({
      text: cell.text,
      options: {
        color: cell.color ?? theme.text,
        bold: cell.bold ?? false,
        fill: { color: stripeBg },
        align: "center" as const,
        fontSize: theme.baseSize - 2,
      },
    }));
  });

  return [headerRow, ...dataRows];
}
