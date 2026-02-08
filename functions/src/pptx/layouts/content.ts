import type PptxGenJS from "pptxgenjs";
import type { ContentSlideData, ResolvedTheme } from "../types";
import { toTextProps } from "../utils/text";

export function addContentSlide(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  data: ContentSlideData,
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

  let bodyY = 1.4;
  if (data.subtitle) {
    slide.addText(data.subtitle, {
      x: 0.6,
      y: bodyY,
      w: 8.8,
      h: 0.5,
      fontSize: theme.baseSize,
      fontFace: theme.fontFamily,
      color: theme.accent,
      bold: true,
    });
    bodyY += 0.6;
  }

  const textProps = toTextProps(data.body, {
    fontSize: theme.baseSize,
    color: theme.text,
    fontFace: theme.fontFamily,
  });

  slide.addText(textProps as PptxGenJS.TextProps[], {
    x: 0.6,
    y: bodyY,
    w: 8.8,
    h: 7.5 - bodyY - 0.5,
    fontSize: theme.baseSize,
    fontFace: theme.fontFamily,
    color: theme.text,
    valign: "top",
    paraSpaceAfter: 6,
  });

  if (data.notes) {
    slide.addNotes(data.notes);
  }
}
