// @ts-nocheck
// This file is server-side only and not used in the frontend build
export interface ImageAnalysisResult {
  labels: string[];
  text: string;
  colors: Array<{
    color: string;
    score: number;
    pixelFraction: number;
  }>;
  objects: Array<{
    name: string;
    score: number;
  }>;
  safeSearch: {
    adult: string;
    violence: string;
    racy: string;
  };
  webEntities: Array<{
    description: string;
    score: number;
  }>;
}

export async function analyzeImageFromUrl(
  imageUrl: string
): Promise<ImageAnalysisResult> {
  const { ImageAnnotatorClient } = await import("@google-cloud/vision");
  const visionClient = new ImageAnnotatorClient();

  const [result] = await visionClient.annotateImage({
    image: { source: { imageUri: imageUrl } },
    features: [
      { type: "LABEL_DETECTION", maxResults: 10 },
      { type: "TEXT_DETECTION" },
      { type: "IMAGE_PROPERTIES" },
      { type: "OBJECT_LOCALIZATION", maxResults: 10 },
      { type: "SAFE_SEARCH_DETECTION" },
      { type: "WEB_DETECTION", maxResults: 10 },
    ],
  });

  const labels =
    result.labelAnnotations?.map((label) => label.description || "") || [];

  const textAnnotations = result.textAnnotations || [];
  const text = textAnnotations.length > 0 ? textAnnotations[0].description || "" : "";

  const dominantColors =
    result.imagePropertiesAnnotation?.dominantColors?.colors || [];
  const colors = dominantColors.slice(0, 5).map((colorInfo) => {
    const rgb = colorInfo.color;
    const hex = rgb
      ? `#${Math.round(rgb.red || 0)
          .toString(16)
          .padStart(2, "0")}${Math.round(rgb.green || 0)
          .toString(16)
          .padStart(2, "0")}${Math.round(rgb.blue || 0)
          .toString(16)
          .padStart(2, "0")}`
      : "#000000";
    return {
      color: hex,
      score: colorInfo.score || 0,
      pixelFraction: colorInfo.pixelFraction || 0,
    };
  });

  const objects =
    result.localizedObjectAnnotations?.map((obj) => ({
      name: obj.name || "",
      score: obj.score || 0,
    })) || [];

  const safeSearch = result.safeSearchAnnotation || {};

  const webEntities =
    result.webDetection?.webEntities
      ?.filter((entity) => entity.description)
      .map((entity) => ({
        description: entity.description || "",
        score: entity.score || 0,
      })) || [];

  return {
    labels,
    text,
    colors,
    objects,
    safeSearch: {
      adult: String(safeSearch.adult || "UNKNOWN"),
      violence: String(safeSearch.violence || "UNKNOWN"),
      racy: String(safeSearch.racy || "UNKNOWN"),
    },
    webEntities,
  };
}

export async function analyzeImageFromBuffer(
  imageBuffer: Buffer
): Promise<ImageAnalysisResult> {
  const { ImageAnnotatorClient } = await import("@google-cloud/vision");
  const visionClient = new ImageAnnotatorClient();
  const content = imageBuffer.toString("base64");

  const [result] = await visionClient.annotateImage({
    image: { content },
    features: [
      { type: "LABEL_DETECTION", maxResults: 10 },
      { type: "TEXT_DETECTION" },
      { type: "IMAGE_PROPERTIES" },
      { type: "OBJECT_LOCALIZATION", maxResults: 10 },
      { type: "SAFE_SEARCH_DETECTION" },
      { type: "WEB_DETECTION", maxResults: 10 },
    ],
  });

  const labels =
    result.labelAnnotations?.map((label) => label.description || "") || [];

  const textAnnotations = result.textAnnotations || [];
  const text = textAnnotations.length > 0 ? textAnnotations[0].description || "" : "";

  const dominantColors =
    result.imagePropertiesAnnotation?.dominantColors?.colors || [];
  const colors = dominantColors.slice(0, 5).map((colorInfo) => {
    const rgb = colorInfo.color;
    const hex = rgb
      ? `#${Math.round(rgb.red || 0)
          .toString(16)
          .padStart(2, "0")}${Math.round(rgb.green || 0)
          .toString(16)
          .padStart(2, "0")}${Math.round(rgb.blue || 0)
          .toString(16)
          .padStart(2, "0")}`
      : "#000000";
    return {
      color: hex,
      score: colorInfo.score || 0,
      pixelFraction: colorInfo.pixelFraction || 0,
    };
  });

  const objects =
    result.localizedObjectAnnotations?.map((obj) => ({
      name: obj.name || "",
      score: obj.score || 0,
    })) || [];

  const safeSearch = result.safeSearchAnnotation || {};

  const webEntities =
    result.webDetection?.webEntities
      ?.filter((entity) => entity.description)
      .map((entity) => ({
        description: entity.description || "",
        score: entity.score || 0,
      })) || [];

  return {
    labels,
    text,
    colors,
    objects,
    safeSearch: {
      adult: String(safeSearch.adult || "UNKNOWN"),
      violence: String(safeSearch.violence || "UNKNOWN"),
      racy: String(safeSearch.racy || "UNKNOWN"),
    },
    webEntities,
  };
}

export function formatAnalysisForBrand(analysis: ImageAnalysisResult): string {
  const parts: string[] = [];

  if (analysis.labels.length > 0) {
    parts.push(`ラベル: ${analysis.labels.slice(0, 10).join(", ")}`);
  }

  if (analysis.text) {
    const truncatedText =
      analysis.text.length > 200
        ? analysis.text.substring(0, 200) + "..."
        : analysis.text;
    parts.push(`検出テキスト: ${truncatedText}`);
  }

  if (analysis.colors.length > 0) {
    const colorList = analysis.colors
      .slice(0, 5)
      .map((c) => c.color)
      .join(", ");
    parts.push(`主要カラー: ${colorList}`);
  }

  if (analysis.objects.length > 0) {
    const objectList = analysis.objects
      .slice(0, 5)
      .map((o) => o.name)
      .join(", ");
    parts.push(`検出オブジェクト: ${objectList}`);
  }

  if (analysis.webEntities.length > 0) {
    const entityList = analysis.webEntities
      .slice(0, 5)
      .map((e) => e.description)
      .join(", ");
    parts.push(`関連エンティティ: ${entityList}`);
  }

  return parts.join("\n");
}
