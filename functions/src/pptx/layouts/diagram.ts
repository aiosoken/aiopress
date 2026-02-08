import type PptxGenJS from "pptxgenjs";
import type { DiagramSlideData, ResolvedTheme } from "../types";
import { addShapesToSlide, addConnectorToSlide } from "../utils/shape";

/**
 * ダイアグラムスライドを追加
 */
export function addDiagramSlide(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  data: DiagramSlideData,
  theme: ResolvedTheme
): void {
  slide.background = { color: theme.background };

  // ヘッダー
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

  let contentStartY = 1.4;

  // サブタイトルがある場合
  if (data.subtitle) {
    slide.addText(data.subtitle, {
      x: 0.6,
      y: contentStartY,
      w: 8.8,
      h: 0.4,
      fontSize: theme.baseSize,
      fontFace: theme.fontFamily,
      color: theme.accent,
      bold: true,
    });
    contentStartY += 0.6;
  }

  // コネクタを先に描画（図形の下に配置）
  if (data.connectors && data.connectors.length > 0) {
    data.connectors.forEach((connector) => {
      addConnectorToSlide(pptx, slide, connector);
    });
  }

  // 図形を描画
  addShapesToSlide(pptx, slide, data.shapes);

  // ラベルを描画（図形の上に配置）
  if (data.labels && data.labels.length > 0) {
    data.labels.forEach((label) => {
      slide.addText(label.text, {
        x: label.x,
        y: label.y,
        w: label.w || 2,
        h: label.h || 0.5,
        fontSize: label.fontSize || theme.baseSize,
        fontFace: theme.fontFamily,
        color: label.color || theme.text,
        bold: label.bold || false,
        align: label.align || "center",
        valign: "middle",
      });
    });
  }
}
