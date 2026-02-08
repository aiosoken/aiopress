import type PptxGenJS from "pptxgenjs";
import type { ImageTextSlideData, ResolvedTheme } from "../types";
import { addImageToSlide } from "../utils/image";
import { toTextProps } from "../utils/text";

/**
 * 画像とテキストのスライドを追加
 */
export function addImageTextSlide(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  data: ImageTextSlideData,
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

  const contentHeight = 7.5 - contentStartY - 0.3;
  const contentWidth = 9;

  // 画像とテキストの配置
  switch (data.imagePosition) {
    case "left":
      // 画像を左側に配置
      addImageToSlide(slide, {
        ...data.image,
        x: 0.5,
        y: contentStartY,
        w: data.image.w || contentWidth * 0.45,
        h: data.image.h || contentHeight,
      });

      // テキストを右側に配置
      const textProps = toTextProps(data.body, {
        fontSize: theme.baseSize,
        color: theme.text,
        fontFace: theme.fontFamily,
      });

      slide.addText(textProps as PptxGenJS.TextProps[], {
        x: 0.5 + contentWidth * 0.45 + 0.3,
        y: contentStartY,
        w: contentWidth * 0.55 - 0.3,
        h: contentHeight,
        fontSize: theme.baseSize,
        fontFace: theme.fontFamily,
        color: theme.text,
        valign: "top",
        paraSpaceAfter: 6,
      });
      break;

    case "right":
      // テキストを左側に配置
      const textPropsLeft = toTextProps(data.body, {
        fontSize: theme.baseSize,
        color: theme.text,
        fontFace: theme.fontFamily,
      });

      slide.addText(textPropsLeft as PptxGenJS.TextProps[], {
        x: 0.5,
        y: contentStartY,
        w: contentWidth * 0.55 - 0.3,
        h: contentHeight,
        fontSize: theme.baseSize,
        fontFace: theme.fontFamily,
        color: theme.text,
        valign: "top",
        paraSpaceAfter: 6,
      });

      // 画像を右側に配置
      addImageToSlide(slide, {
        ...data.image,
        x: 0.5 + contentWidth * 0.55,
        y: contentStartY,
        w: data.image.w || contentWidth * 0.45,
        h: data.image.h || contentHeight,
      });
      break;

    case "top":
      // 画像を上部に配置
      addImageToSlide(slide, {
        ...data.image,
        x: 0.5,
        y: contentStartY,
        w: data.image.w || contentWidth,
        h: data.image.h || contentHeight * 0.5,
      });

      // テキストを下部に配置
      const textPropsBottom = toTextProps(data.body, {
        fontSize: theme.baseSize,
        color: theme.text,
        fontFace: theme.fontFamily,
      });

      slide.addText(textPropsBottom as PptxGenJS.TextProps[], {
        x: 0.6,
        y: contentStartY + contentHeight * 0.5 + 0.2,
        w: 8.8,
        h: contentHeight * 0.5 - 0.2,
        fontSize: theme.baseSize,
        fontFace: theme.fontFamily,
        color: theme.text,
        valign: "top",
        paraSpaceAfter: 6,
      });
      break;

    case "bottom":
      // テキストを上部に配置
      const textPropsTop = toTextProps(data.body, {
        fontSize: theme.baseSize,
        color: theme.text,
        fontFace: theme.fontFamily,
      });

      slide.addText(textPropsTop as PptxGenJS.TextProps[], {
        x: 0.6,
        y: contentStartY,
        w: 8.8,
        h: contentHeight * 0.5 - 0.2,
        fontSize: theme.baseSize,
        fontFace: theme.fontFamily,
        color: theme.text,
        valign: "top",
        paraSpaceAfter: 6,
      });

      // 画像を下部に配置
      addImageToSlide(slide, {
        ...data.image,
        x: 0.5,
        y: contentStartY + contentHeight * 0.5,
        w: data.image.w || contentWidth,
        h: data.image.h || contentHeight * 0.5,
      });
      break;
  }

  if (data.notes) {
    slide.addNotes(data.notes);
  }
}
