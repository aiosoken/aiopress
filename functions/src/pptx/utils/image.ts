import type PptxGenJS from "pptxgenjs";
import type { ImageConfig } from "../types";

/**
 * スライドに画像を追加
 */
export function addImageToSlide(
  slide: PptxGenJS.Slide,
  imageConfig: ImageConfig
): void {
  const imageOptions: PptxGenJS.ImageProps = {
    x: imageConfig.x,
    y: imageConfig.y,
    w: imageConfig.w,
    h: imageConfig.h,
  };

  // サイジングオプション
  if (imageConfig.sizing) {
    const sizingOptions: any = {
      type: imageConfig.sizing.type,
    };
    if (imageConfig.sizing.w !== undefined) {
      sizingOptions.w = imageConfig.sizing.w;
    }
    if (imageConfig.sizing.h !== undefined) {
      sizingOptions.h = imageConfig.sizing.h;
    }
    imageOptions.sizing = sizingOptions;
  }

  // 角丸
  if (imageConfig.rounding) {
    imageOptions.rounding = true;
  }

  // 透明度
  if (imageConfig.transparency !== undefined) {
    imageOptions.transparency = imageConfig.transparency;
  }

  // ハイパーリンク
  if (imageConfig.hyperlink) {
    imageOptions.hyperlink = {
      url: imageConfig.hyperlink,
    };
  }

  // 代替テキスト
  if (imageConfig.altText) {
    imageOptions.altText = imageConfig.altText;
  }

  // 画像を追加
  slide.addImage({
    ...imageOptions,
    data: imageConfig.source,
  });
}

/**
 * 複数の画像をスライドに追加
 */
export function addImagesToSlide(
  slide: PptxGenJS.Slide,
  images: ImageConfig[]
): void {
  images.forEach((image) => addImageToSlide(slide, image));
}

/**
 * グリッドレイアウトで画像を配置
 */
export function layoutImagesInGrid(
  images: ImageConfig[],
  options: {
    startX: number;
    startY: number;
    totalWidth: number;
    totalHeight: number;
    columns: number;
    spacing?: number;
  }
): ImageConfig[] {
  const spacing = options.spacing || 0.2;
  const rows = Math.ceil(images.length / options.columns);
  const imageWidth = (options.totalWidth - spacing * (options.columns - 1)) / options.columns;
  const imageHeight = (options.totalHeight - spacing * (rows - 1)) / rows;

  return images.map((image, index) => {
    const row = Math.floor(index / options.columns);
    const col = index % options.columns;

    return {
      ...image,
      x: options.startX + col * (imageWidth + spacing),
      y: options.startY + row * (imageHeight + spacing),
      w: imageWidth,
      h: imageHeight,
    };
  });
}

/**
 * 画像を中央配置
 */
export function centerImage(
  image: ImageConfig,
  slideWidth: number,
  slideHeight: number
): ImageConfig {
  return {
    ...image,
    x: (slideWidth - image.w) / 2,
    y: (slideHeight - image.h) / 2,
  };
}

/**
 * 画像のアスペクト比を維持しながらリサイズ
 */
export function resizeImageKeepAspectRatio(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { w: number; h: number } {
  const aspectRatio = originalWidth / originalHeight;

  let newWidth = maxWidth;
  let newHeight = maxWidth / aspectRatio;

  if (newHeight > maxHeight) {
    newHeight = maxHeight;
    newWidth = maxHeight * aspectRatio;
  }

  return { w: newWidth, h: newHeight };
}
