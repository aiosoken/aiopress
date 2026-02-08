import type PptxGenJS from "pptxgenjs";
import type { EndSlideData, ResolvedTheme } from "../types";

export function addEndSlide(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  data: EndSlideData,
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

  slide.addText(data.message, {
    x: 1,
    y: 2.0,
    w: 8,
    h: 1.5,
    fontSize: theme.titleSize + 2,
    fontFace: theme.fontFamily,
    color: theme.lightText,
    bold: true,
    align: "center",
    valign: "middle",
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 3.5,
    y: 3.8,
    w: 3,
    h: 0.04,
    fill: { color: theme.accent },
  });

  if (data.organization) {
    slide.addText(data.organization, {
      x: 1,
      y: 4.1,
      w: 8,
      h: 0.6,
      fontSize: theme.headingSize,
      fontFace: theme.fontFamily,
      color: theme.lightText,
      align: "center",
    });
  }

  if (data.url) {
    slide.addText(data.url, {
      x: 1,
      y: 4.8,
      w: 8,
      h: 0.5,
      fontSize: theme.baseSize - 1,
      fontFace: theme.fontFamily,
      color: theme.accent,
      align: "center",
    });
  }

  if (data.copyright) {
    slide.addText(data.copyright, {
      x: 1,
      y: 6.5,
      w: 8,
      h: 0.4,
      fontSize: theme.baseSize - 3,
      fontFace: theme.fontFamily,
      color: theme.lightText,
      align: "center",
    });
  }
}
