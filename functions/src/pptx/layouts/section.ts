import type PptxGenJS from "pptxgenjs";
import type { SectionSlideData, ResolvedTheme } from "../types";

export function addSectionSlide(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  data: SectionSlideData,
  theme: ResolvedTheme
): void {
  slide.background = { color: theme.secondary };

  slide.addText(data.number, {
    x: 0.8,
    y: 1.5,
    w: 3,
    h: 1.5,
    fontSize: 72,
    fontFace: theme.fontFamily,
    color: theme.accent,
    bold: true,
    align: "left",
    valign: "bottom",
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 3.2,
    w: 1.5,
    h: 0.04,
    fill: { color: theme.accent },
  });

  slide.addText(data.title, {
    x: 0.8,
    y: 3.5,
    w: 8.4,
    h: 1.2,
    fontSize: theme.titleSize,
    fontFace: theme.fontFamily,
    color: theme.lightText,
    bold: true,
    align: "left",
  });
}
