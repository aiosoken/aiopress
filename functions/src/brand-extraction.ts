import * as functions from "firebase-functions";
import { VertexAI } from "@google-cloud/vertexai";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import { verifyBrandMember } from "./utils";

const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "aiopress";
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "asia-northeast1";

const vertexAI = new VertexAI({
  project: PROJECT_ID,
  location: LOCATION,
});

const visionClient = new ImageAnnotatorClient();

const BRAND_EXTRACTION_PROMPT = `あなたはブランド戦略の専門家です。提供されたファイルの内容を分析し、ブランド情報を包括的に抽出してください。

以下のJSON形式で回答してください。すべてのフィールドを可能な限り埋めてください:
{
  "brandName": "ブランド名（判別できる場合）",
  "brandDescription": "ブランドの概要説明（2-3文）",
  "colors": {
    "primary": "#HEXコード（メインカラー）",
    "secondary": "#HEXコード（セカンダリカラー）",
    "accent": "#HEXコード（アクセントカラー）",
    "background": "#HEXコード（背景カラー）",
    "text": "#HEXコード（テキストカラー）"
  },
  "typography": {
    "fontFamily": "推定されるフォント系統（Noto Sans JP / Noto Serif JP / M PLUS 1p / Kosugi Maru のいずれか）",
    "baseSize": 16,
    "scale": 1.25
  },
  "voiceTone": {
    "formality": "formal / casual / neutral のいずれか",
    "enthusiasm": "high / medium / low のいずれか",
    "empathy": "high / medium / low のいずれか"
  },
  "keywords": ["ブランドに関連するキーワード（最大15個）"],
  "brandValues": ["ブランドが大切にする価値観（最大5個）"],
  "targetAudience": "ターゲットオーディエンスの説明",
  "brandDNA": {
    "mission": "ブランドのミッション",
    "vision": "ブランドのビジョン",
    "valueProposition": "提供価値",
    "personality": "ブランドパーソナリティ",
    "tone": "コミュニケーションのトーン＆マナー"
  },
  "confidence": 0-100の信頼度スコア
}

注意事項:
- カラーは必ずHEXコード（#で始まる6桁）で出力してください
- 判別できない情報にはデフォルト値を使ってください
- confidenceは情報の豊富さと確度に基づいて設定してください
- フォントファミリーは選択肢の中から最も近いものを選んでください
`;

interface BrandExtractionResult {
  brandName?: string;
  brandDescription?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    fontFamily: string;
    baseSize: number;
    scale: number;
  };
  voiceTone: {
    formality: string;
    enthusiasm: string;
    empathy: string;
  };
  keywords: string[];
  brandValues: string[];
  targetAudience: string;
  brandDNA: {
    mission: string;
    vision: string;
    valueProposition: string;
    personality: string;
    tone: string;
  };
  confidence: number;
  sourceType: "pdf" | "image" | "url";
}

const DEFAULT_RESULT: Omit<BrandExtractionResult, "sourceType"> = {
  brandName: "",
  brandDescription: "",
  colors: {
    primary: "#F25533",
    secondary: "#3054AD",
    accent: "#F25533",
    background: "#FFFFFF",
    text: "#1A1A1A",
  },
  typography: {
    fontFamily: "Noto Sans JP",
    baseSize: 16,
    scale: 1.25,
  },
  voiceTone: {
    formality: "neutral",
    enthusiasm: "medium",
    empathy: "medium",
  },
  keywords: [],
  brandValues: [],
  targetAudience: "",
  brandDNA: {
    mission: "",
    vision: "",
    valueProposition: "",
    personality: "",
    tone: "",
  },
  confidence: 0,
};

// ---------- Color helpers ----------
function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function toHex2(n: number) {
  return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0,
    g1 = 0,
    b1 = 0;
  if (hp >= 0 && hp < 1) [r1, g1, b1] = [c, x, 0];
  else if (hp >= 1 && hp < 2) [r1, g1, b1] = [x, c, 0];
  else if (hp >= 2 && hp < 3) [r1, g1, b1] = [0, c, x];
  else if (hp >= 3 && hp < 4) [r1, g1, b1] = [0, x, c];
  else if (hp >= 4 && hp < 5) [r1, g1, b1] = [x, 0, c];
  else if (hp >= 5 && hp <= 6) [r1, g1, b1] = [c, 0, x];
  const m = l - c / 2;
  return { r: (r1 + m) * 255, g: (g1 + m) * 255, b: (b1 + m) * 255 };
}

function parseColorToHex(input?: string | null): string | null {
  if (!input) return null;
  const s = String(input).trim().toLowerCase();
  // #rrggbb
  const m6 = s.match(/^#([0-9a-f]{6})$/i);
  if (m6) return `#${m6[1]}`.toUpperCase();
  // #rgb
  const m3 = s.match(/^#([0-9a-f]{3})$/i);
  if (m3) {
    const [r, g, b] = m3[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  // rgb/rgba
  const mrgb = s.match(/^rgba?\(([^)]+)\)$/i);
  if (mrgb) {
    const parts = mrgb[1].split(/\s*,\s*/).map(Number);
    if (parts.length >= 3 && parts.every((n, i) => (i < 3 ? !isNaN(n) : true))) {
      const [r, g, b] = parts;
      return `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`.toUpperCase();
    }
  }
  // hsl/hsla
  const mhsl = s.match(/^hsla?\(([^)]+)\)$/i);
  if (mhsl) {
    const parts = mhsl[1].split(/\s*,\s*/);
    if (parts.length >= 3) {
      const h = parseFloat(parts[0]);
      const sP = parts[1].trim().replace(/%$/, "");
      const lP = parts[2].trim().replace(/%$/, "");
      const s = clamp01(parseFloat(sP) / 100);
      const l = clamp01(parseFloat(lP) / 100);
      if (!isNaN(h) && !isNaN(s) && !isNaN(l)) {
        const { r, g, b } = hslToRgb(((h % 360) + 360) % 360, s, l);
        return `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`.toUpperCase();
      }
    }
  }
  return null;
}

function isValidHexColor(hex?: string | null): boolean {
  return !!hex && /^#([0-9A-F]{6})$/.test(hex);
}

function lightenDarken(hex: string, amount: number): string {
  // amount: -1.0..1.0
  const m = hex.match(/^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i);
  if (!m) return hex;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  const delta = Math.round(255 * amount);
  return `#${toHex2(r + delta)}${toHex2(g + delta)}${toHex2(b + delta)}`.toUpperCase();
}

function relativeLuminance(hex: string): number {
  const m = hex.match(/^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i);
  if (!m) return 0;
  const [r, g, b] = [m[1], m[2], m[3]].map((v) => parseInt(v, 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastTextFor(bgHex: string): "#000000" | "#FFFFFF" {
  try {
    return relativeLuminance(bgHex) > 0.5 ? "#000000" : "#FFFFFF";
  } catch {
    return "#000000";
  }
}

type PartialColors = Partial<BrandExtractionResult["colors"]>;

function mergeWithFallbackColors(
  extracted: PartialColors,
  hints: { themeColor?: string | null; ogColors?: string[] | null },
  defaults: BrandExtractionResult["colors"]
): BrandExtractionResult["colors"] {
  const themeHex = parseColorToHex(hints.themeColor || undefined);
  const og = (hints.ogColors || []).map((c) => parseColorToHex(c)).filter(isValidHexColor) as string[];

  const primary =
    (parseColorToHex(extracted.primary) as string | null) ||
    themeHex ||
    og[0] ||
    defaults.primary;

  const secondary =
    (parseColorToHex(extracted.secondary) as string | null) ||
    og[1] ||
    lightenDarken(primary, -0.2);

  const accent =
    (parseColorToHex(extracted.accent) as string | null) ||
    og[2] ||
    lightenDarken(primary, 0.2);

  const background =
    (parseColorToHex(extracted.background) as string | null) ||
    defaults.background;

  const text =
    (parseColorToHex(extracted.text) as string | null) ||
    contrastTextFor(background);

  return { primary, secondary, accent, background, text };
}

function parseExtractionResult(
  responseText: string,
  sourceType: "pdf" | "image" | "url"
): BrandExtractionResult {
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // 一旦そのまま取り出し、後段で正規化/フォールバックを適用
      const provisional: BrandExtractionResult = {
        brandName: parsed.brandName || DEFAULT_RESULT.brandName,
        brandDescription:
          parsed.brandDescription || DEFAULT_RESULT.brandDescription,
        colors: {
          primary: parsed.colors?.primary || "",
          secondary: parsed.colors?.secondary || "",
          accent: parsed.colors?.accent || "",
          background: parsed.colors?.background || "",
          text: parsed.colors?.text || "",
        },
        typography: {
          fontFamily:
            parsed.typography?.fontFamily ||
            DEFAULT_RESULT.typography.fontFamily,
          baseSize:
            parsed.typography?.baseSize || DEFAULT_RESULT.typography.baseSize,
          scale: parsed.typography?.scale || DEFAULT_RESULT.typography.scale,
        },
        voiceTone: {
          formality:
            parsed.voiceTone?.formality || DEFAULT_RESULT.voiceTone.formality,
          enthusiasm:
            parsed.voiceTone?.enthusiasm || DEFAULT_RESULT.voiceTone.enthusiasm,
          empathy:
            parsed.voiceTone?.empathy || DEFAULT_RESULT.voiceTone.empathy,
        },
        keywords: parsed.keywords || DEFAULT_RESULT.keywords,
        brandValues: parsed.brandValues || DEFAULT_RESULT.brandValues,
        targetAudience:
          parsed.targetAudience || DEFAULT_RESULT.targetAudience,
        brandDNA: {
          mission:
            parsed.brandDNA?.mission || DEFAULT_RESULT.brandDNA.mission,
          vision: parsed.brandDNA?.vision || DEFAULT_RESULT.brandDNA.vision,
          valueProposition:
            parsed.brandDNA?.valueProposition ||
            DEFAULT_RESULT.brandDNA.valueProposition,
          personality:
            parsed.brandDNA?.personality ||
            DEFAULT_RESULT.brandDNA.personality,
          tone: parsed.brandDNA?.tone || DEFAULT_RESULT.brandDNA.tone,
        },
        confidence: parsed.confidence || DEFAULT_RESULT.confidence,
        sourceType,
      };
      return provisional;
    }
  } catch (error) {
    console.error("Failed to parse extraction result:", error);
  }

  return { ...DEFAULT_RESULT, sourceType };
}

/**
 * ファイル（PDF/画像）からブランド情報を抽出
 */
export const extractBrandFromFile = functions
  .region("asia-northeast1")
  .runWith({ memory: "512MB", timeoutSeconds: 120 })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "認証が必要です"
      );
    }

    const { fileUrl, fileType, fileName, brandId } = data;

    if (!fileUrl || !fileType || !fileName) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "fileUrl, fileType, fileNameが必要です"
      );
    }

    if (brandId) {
      await verifyBrandMember(brandId, context.auth.uid);
    }

    try {
      const isImage = fileType.startsWith("image/");
      const isPdf =
        fileType === "application/pdf" || fileName.endsWith(".pdf");
      const isMarkdown =
        fileType === "text/markdown" ||
        fileType === "text/x-markdown" ||
        fileName.endsWith(".md");

      if (!isImage && !isPdf && !isMarkdown) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "対応形式: PDF, 画像(JPG, PNG, WebP), Markdown"
        );
      }

      let visionContext = "";
      let fileDominantColors: string[] | undefined = undefined;

      // 画像の場合、Vision AIで事前分析
      if (isImage) {
        try {
          const [result] = await visionClient.annotateImage({
            image: { source: { imageUri: fileUrl } },
            features: [
              { type: "LABEL_DETECTION", maxResults: 15 },
              { type: "TEXT_DETECTION" },
              { type: "IMAGE_PROPERTIES" },
              { type: "LOGO_DETECTION", maxResults: 5 },
            ],
          });

          const labels =
            result.labelAnnotations?.map((l) => l.description || "") || [];
          const text = result.textAnnotations?.[0]?.description || "";
          const logos =
            result.logoAnnotations?.map((l) => l.description || "") || [];
          const colors =
            result.imagePropertiesAnnotation?.dominantColors?.colors
              ?.slice(0, 5)
              .map((c) => {
                const r = Math.round(c.color?.red || 0);
                const g = Math.round(c.color?.green || 0);
                const b = Math.round(c.color?.blue || 0);
                return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
              }) || [];

          visionContext = `
Vision AI分析結果:
- ラベル: ${labels.join(", ")}
- 抽出テキスト: ${text.slice(0, 2000)}
- 検出ロゴ: ${logos.join(", ")}
- 主要カラー: ${colors.join(", ")}
`;
          // 後段のフォールバック用に利用
          fileDominantColors = colors;
        } catch (error) {
          console.error("Vision AI error:", error);
        }
      }

      // Gemini 2.0 Flashで包括的分析
      const model = vertexAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.3,
        },
      });

      const parts: any[] = [
        {
          text: `${BRAND_EXTRACTION_PROMPT}\n\nファイル名: ${fileName}\nファイル形式: ${fileType}\n${visionContext}`,
        },
      ];

      // ファイルをマルチモーダル入力として渡す
      parts.push({
        fileData: {
          fileUri: fileUrl,
          mimeType: fileType,
        },
      });

      const result = await model.generateContent({
        contents: [{ role: "user", parts }],
      });

      const responseText =
        result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      const sourceType = isPdf ? "pdf" : "image";
      const extractionResult = parseExtractionResult(responseText, sourceType);

      const ogColors = fileDominantColors;
      const mergedColors = mergeWithFallbackColors(
        extractionResult.colors,
        { themeColor: null, ogColors },
        DEFAULT_RESULT.colors
      );

      const finalResult: BrandExtractionResult = {
        ...extractionResult,
        colors: mergedColors,
      };

      try {
        console.log("[extractBrandFromFile] mergedColors=", mergedColors);
      } catch {}

      return { success: true, result: finalResult };
    } catch (error: any) {
      console.error("Error extracting brand from file:", error);
      if (error instanceof functions.https.HttpsError) throw error;
      throw new functions.https.HttpsError(
        "internal",
        "ブランド情報の抽出に失敗しました"
      );
    }
  });

// SSRF対策: プライベートIPへのアクセスをブロック
function isPrivateUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname.replace(/^\[|\]$/g, ""); // IPv6ブラケット除去

    // localhost
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1"
    ) {
      return true;
    }

    // IPv6 プライベート/リンクローカル
    const lowerHost = hostname.toLowerCase();
    if (
      lowerHost.startsWith("fe80:") ||  // link-local
      lowerHost.startsWith("fc") ||      // unique local (fc00::/7)
      lowerHost.startsWith("fd") ||      // unique local (fc00::/7)
      lowerHost.startsWith("ff") ||      // multicast
      lowerHost === "::1" ||
      lowerHost === "::"
    ) {
      return true;
    }

    // プライベートIPレンジ (IPv4)
    const parts = hostname.split(".").map(Number);
    if (parts.length === 4 && parts.every((p) => !isNaN(p))) {
      // 10.0.0.0/8
      if (parts[0] === 10) return true;
      // 172.16.0.0/12
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
      // 192.168.0.0/16
      if (parts[0] === 192 && parts[1] === 168) return true;
      // 169.254.0.0/16 (link-local + クラウドメタデータエンドポイント)
      if (parts[0] === 169 && parts[1] === 254) return true;
      // 0.0.0.0
      if (parts.every((p) => p === 0)) return true;
      // 127.0.0.0/8
      if (parts[0] === 127) return true;
    }

    return false;
  } catch {
    return true;
  }
}

/**
 * WebサイトURLからブランド情報を抽出
 */
export const extractBrandFromUrl = functions
  .region("asia-northeast1")
  .runWith({ memory: "512MB", timeoutSeconds: 120 })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "認証が必要です"
      );
    }

    const { url, brandId } = data;

    if (!url) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "URLが必要です"
      );
    }

    // URL形式チェック
    try {
      new URL(url);
    } catch {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "有効なURLを入力してください"
      );
    }

    // SSRF対策
    if (isPrivateUrl(url)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "プライベートネットワークへのアクセスは許可されていません"
      );
    }

    if (brandId) {
      await verifyBrandMember(brandId, context.auth.uid);
    }

    try {
      // HTMLを取得
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; AIOPress/1.0; Brand Analysis Bot)",
          Accept: "text/html,application/xhtml+xml",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          `URLの取得に失敗しました (${response.status})`
        );
      }

      const html = await response.text();

      // メタ情報を抽出
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
      const descMatch = html.match(
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i
      );
      const ogTitleMatch = html.match(
        /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i
      );
      const ogDescMatch = html.match(
        /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i
      );
      const ogImageMatch = html.match(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i
      );
      const themeColorMatch = html.match(
        /<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']*)["']/i
      );

      const metaInfo = {
        title: titleMatch?.[1]?.trim() || "",
        description: descMatch?.[1]?.trim() || "",
        ogTitle: ogTitleMatch?.[1]?.trim() || "",
        ogDescription: ogDescMatch?.[1]?.trim() || "",
        ogImage: ogImageMatch?.[1]?.trim() || "",
        themeColor: themeColorMatch?.[1]?.trim() || "",
      };

      // OG画像があればVision AIで分析
      let imageAnalysis = "";
      let ogColors: string[] | undefined = undefined;
      if (metaInfo.ogImage) {
        try {
          const imageUrl = metaInfo.ogImage.startsWith("http")
            ? metaInfo.ogImage
            : new URL(metaInfo.ogImage, url).toString();

          if (!isPrivateUrl(imageUrl)) {
            const [result] = await visionClient.annotateImage({
              image: { source: { imageUri: imageUrl } },
              features: [
                { type: "LABEL_DETECTION", maxResults: 10 },
                { type: "IMAGE_PROPERTIES" },
                { type: "LOGO_DETECTION", maxResults: 5 },
              ],
            });

            const labels =
              result.labelAnnotations?.map((l) => l.description || "") || [];
            const logos =
              result.logoAnnotations?.map((l) => l.description || "") || [];
            const colors =
              result.imagePropertiesAnnotation?.dominantColors?.colors
                ?.slice(0, 5)
                .map((c) => {
                  const r = Math.round(c.color?.red || 0);
                  const g = Math.round(c.color?.green || 0);
                  const b = Math.round(c.color?.blue || 0);
                  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
                }) || [];

            imageAnalysis = `
OG画像のVision AI分析:
- ラベル: ${labels.join(", ")}
- 検出ロゴ: ${logos.join(", ")}
- 主要カラー: ${colors.join(", ")}
`;
            ogColors = colors;
          }
        } catch (error) {
          console.error("OG image analysis error:", error);
        }
      }

      // HTMLからテキストコンテンツを抽出（script/style除外）
      const textContent = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 5000);

      // Gemini 2.0 Flashで分析
      const model = vertexAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.3,
        },
      });

      const analysisPrompt = `${BRAND_EXTRACTION_PROMPT}

対象URL: ${url}

メタ情報:
- タイトル: ${metaInfo.title}
- 説明: ${metaInfo.description}
- OGタイトル: ${metaInfo.ogTitle}
- OG説明: ${metaInfo.ogDescription}
- テーマカラー: ${metaInfo.themeColor}
${imageAnalysis}

ページのテキストコンテンツ（抜粋）:
${textContent}
`;

      const result = await model.generateContent(analysisPrompt);
      const responseText =
        result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      const extractionResult = parseExtractionResult(responseText, "url");

      // テーマカラーとOGカラー群からフォールバックを構築
      const mergedColors = mergeWithFallbackColors(
        extractionResult.colors,
        { themeColor: metaInfo.themeColor, ogColors },
        DEFAULT_RESULT.colors
      );

      const finalResult: BrandExtractionResult = {
        ...extractionResult,
        brandName: extractionResult.brandName || metaInfo.ogTitle || metaInfo.title || extractionResult.brandName,
        brandDescription:
          extractionResult.brandDescription || metaInfo.ogDescription || metaInfo.description || extractionResult.brandDescription,
        colors: mergedColors,
      };

      try {
        console.log("[extractBrandFromUrl] themeColor=", metaInfo.themeColor, "ogColors=", ogColors, "mergedColors=", mergedColors);
      } catch {}

      return { success: true, result: finalResult };
    } catch (error: any) {
      console.error("Error extracting brand from URL:", error);
      if (error instanceof functions.https.HttpsError) throw error;
      throw new functions.https.HttpsError(
        "internal",
        "URLからのブランド情報抽出に失敗しました"
      );
    }
  });
