import type PptxGenJS from "pptxgenjs";
import type { TitleSlideData, ResolvedTheme } from "../types";
import { formatDate } from "../utils/text";

export function addTitleSlide(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  data: TitleSlideData,
  theme: ResolvedTheme
): void {
  slide.background = { color: theme.primary };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: 0.08,
    fill: { color: theme.accent },
  });

  slide.addText(data.title, {
    x: 0.8,
    y: 1.8,
    w: 8.4,
    h: 1.6,
    fontSize: theme.titleSize + 4,
    fontFace: theme.fontFamily,
    color: theme.lightText,
    bold: true,
    align: "left",
    valign: "bottom",
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 3.55,
    w: 2.0,
    h: 0.04,
    fill: { color: theme.accent },
  });

  if (data.subtitle) {
    slide.addText(data.subtitle, {
      x: 0.8,
      y: 3.8,
      w: 8.4,
      h: 0.8,
      fontSize: theme.headingSize,
      fontFace: theme.fontFamily,
      color: theme.lightText,
      align: "left",
    });
  }

  const bottomText = [
    data.author,
    formatDate(data.date),
  ].filter(Boolean).join("  |  ");

  if (bottomText) {
    slide.addText(bottomText, {
      x: 0.8,
      y: 6.5,
      w: 8.4,
      h: 0.5,
      fontSize: theme.baseSize - 2,
      fontFace: theme.fontFamily,
      color: theme.lightText,
      align: "left",
    });
  }
}
