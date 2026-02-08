import type PptxGenJS from "pptxgenjs";
import type { TwoColumnSlideData, ResolvedTheme, ColumnContent } from "../types";
import { toTextProps } from "../utils/text";
import { stripHash, lighten } from "../utils/color";
import { addImagesToSlide } from "../utils/image";
import { addShapesToSlide } from "../utils/shape";

export function addTwoColumnSlide(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  data: TwoColumnSlideData,
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

  const colW = 4.15;
  const colGap = 0.3;
  const colY = 1.5;
  const colH = 5.5;

  renderColumn(pptx, slide, data.left, 0.6, colY, colW, colH, theme);

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.6 + colW + colGap / 2 - 0.01,
    y: colY,
    w: 0.02,
    h: colH,
    fill: { color: lighten(theme.primary, 0.7) },
  });

  renderColumn(pptx, slide, data.right, 0.6 + colW + colGap, colY, colW, colH, theme);

  // 左側の画像を追加
  if (data.left.images && data.left.images.length > 0) {
    addImagesToSlide(slide, data.left.images);
  }

  // 左側の図形を追加
  if (data.left.shapes && data.left.shapes.length > 0) {
    addShapesToSlide(pptx, slide, data.left.shapes);
  }

  // 右側の画像を追加
  if (data.right.images && data.right.images.length > 0) {
    addImagesToSlide(slide, data.right.images);
  }

  // 右側の図形を追加
  if (data.right.shapes && data.right.shapes.length > 0) {
    addShapesToSlide(pptx, slide, data.right.shapes);
  }
}

function renderColumn(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  col: ColumnContent,
  x: number,
  y: number,
  w: number,
  h: number,
  theme: ResolvedTheme
): void {
  const accent = col.accentColor ? stripHash(col.accentColor) : theme.accent;

  slide.addShape(pptx.ShapeType.rect, {
    x,
    y,
    w: 0.06,
    h: 0.5,
    fill: { color: accent },
  });

  slide.addText(col.title, {
    x: x + 0.15,
    y,
    w: w - 0.15,
    h: 0.5,
    fontSize: theme.baseSize + 1,
    fontFace: theme.fontFamily,
    color: theme.primary,
    bold: true,
    valign: "middle",
  });

  const textProps = toTextProps(col.body, {
    fontSize: theme.baseSize - 1,
    color: theme.text,
    fontFace: theme.fontFamily,
  });

  slide.addText(textProps as PptxGenJS.TextProps[], {
    x,
    y: y + 0.65,
    w,
    h: h - 0.65,
    fontSize: theme.baseSize - 1,
    fontFace: theme.fontFamily,
    color: theme.text,
    valign: "top",
    paraSpaceAfter: 6,
  });
}
