import type PptxGenJS from "pptxgenjs";
import type { ImageSlideData, ResolvedTheme } from "../types";
import { addImagesToSlide, layoutImagesInGrid, centerImage } from "../utils/image";

/**
 * 画像中心のスライドを追加
 */
export function addImageSlide(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  data: ImageSlideData,
  theme: ResolvedTheme
): void {
  slide.background = { color: theme.background };

  let contentStartY = 0.6;

  // タイトルがある場合
  if (data.title) {
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

    contentStartY = 1.4;

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
  }

  // レイアウトに応じて画像を配置
  const slideHeight = 7.5;
  const contentHeight = slideHeight - contentStartY - (data.caption ? 0.8 : 0.3);
  const contentWidth = 9;

  let processedImages = [...data.images];

  switch (data.layout) {
    case "single":
      // 単一画像を中央配置
      if (processedImages.length > 0) {
        const image = processedImages[0];
        const centeredImage = centerImage(
          {
            ...image,
            x: 0.5,
            y: contentStartY,
            w: image.w || contentWidth,
            h: image.h || contentHeight,
          },
          10,
          slideHeight
        );
        processedImages = [centeredImage];
      }
      break;

    case "grid":
      // グリッドレイアウト
      const columns = Math.ceil(Math.sqrt(processedImages.length));
      processedImages = layoutImagesInGrid(processedImages, {
        startX: 0.5,
        startY: contentStartY,
        totalWidth: contentWidth,
        totalHeight: contentHeight,
        columns,
        spacing: 0.2,
      });
      break;

    case "collage":
      // コラージュレイアウト（簡易版：2x2グリッド）
      processedImages = layoutImagesInGrid(processedImages, {
        startX: 0.5,
        startY: contentStartY,
        totalWidth: contentWidth,
        totalHeight: contentHeight,
        columns: 2,
        spacing: 0.15,
      });
      break;

    default:
      // デフォルトは単一画像
      if (processedImages.length > 0) {
        processedImages[0] = {
          ...processedImages[0],
          x: processedImages[0].x || 0.5,
          y: processedImages[0].y || contentStartY,
          w: processedImages[0].w || contentWidth,
          h: processedImages[0].h || contentHeight,
        };
      }
  }

  // 画像を追加
  addImagesToSlide(slide, processedImages);

  // キャプションがある場合
  if (data.caption) {
    slide.addText(data.caption, {
      x: 0.6,
      y: slideHeight - 0.6,
      w: 8.8,
      h: 0.5,
      fontSize: theme.baseSize * 0.9,
      fontFace: theme.fontFamily,
      color: theme.text,
      align: "center",
      italic: true,
    });
  }
}
