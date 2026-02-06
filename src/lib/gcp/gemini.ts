// @ts-nocheck
// This file is server-side only and not used in the frontend build
import { VertexAI } from "@google-cloud/vertexai";

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || "";
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

let vertexAI: VertexAI | null = null;

function getVertexAI(): VertexAI {
  if (!vertexAI) {
    vertexAI = new VertexAI({
      project: PROJECT_ID,
      location: LOCATION,
    });
  }
  return vertexAI;
}

export interface GenerateTextOptions {
  prompt: string;
  systemInstruction?: string;
  maxOutputTokens?: number;
  temperature?: number;
}

export interface AnalyzeImageOptions {
  imageUrl?: string;
  imageBase64?: string;
  mimeType?: string;
  prompt: string;
  systemInstruction?: string;
}

export interface GeneratedContent {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export async function generateText(
  options: GenerateTextOptions
): Promise<GeneratedContent> {
  const { prompt, systemInstruction, maxOutputTokens = 2048, temperature = 0.7 } = options;

  const vertex = getVertexAI();
  const model = vertex.getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: {
      maxOutputTokens,
      temperature,
    },
    systemInstruction: systemInstruction,
  });

  const result = await model.generateContent(prompt);
  const response = result.response;

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const usageMetadata = response.usageMetadata;

  return {
    text,
    usage: usageMetadata
      ? {
          promptTokens: usageMetadata.promptTokenCount || 0,
          completionTokens: usageMetadata.candidatesTokenCount || 0,
          totalTokens: usageMetadata.totalTokenCount || 0,
        }
      : undefined,
  };
}

export async function analyzeImage(
  options: AnalyzeImageOptions
): Promise<GeneratedContent> {
  const { imageUrl, imageBase64, mimeType = "image/jpeg", prompt, systemInstruction } = options;

  if (!imageUrl && !imageBase64) {
    throw new Error("Either imageUrl or imageBase64 must be provided");
  }

  const vertex = getVertexAI();
  const model = vertex.getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.4,
    },
    systemInstruction: systemInstruction,
  });

  const request = imageBase64
    ? {
        contents: [
          {
            role: "user" as const,
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: imageBase64,
                  mimeType,
                },
              },
            ],
          },
        ],
      }
    : {
        contents: [
          {
            role: "user" as const,
            parts: [
              { text: prompt },
              {
                fileData: {
                  fileUri: imageUrl!,
                  mimeType,
                },
              },
            ],
          },
        ],
      };

  const result = await model.generateContent(request);

  const response = result.response;
  const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const usageMetadata = response.usageMetadata;

  return {
    text,
    usage: usageMetadata
      ? {
          promptTokens: usageMetadata.promptTokenCount || 0,
          completionTokens: usageMetadata.candidatesTokenCount || 0,
          totalTokens: usageMetadata.totalTokenCount || 0,
        }
      : undefined,
  };
}

export async function generateBrandAnalysis(
  brandName: string,
  brandDescription: string,
  assetDescriptions: string[]
): Promise<{
  keywords: string[];
  voiceTone: string;
  brandValues: string[];
  targetAudience: string;
  suggestedColors: string[];
}> {
  const systemInstruction = `あなたはブランド戦略の専門家です。提供された情報を分析し、ブランドの特徴を抽出してください。
回答は必ず以下のJSON形式で返してください：
{
  "keywords": ["キーワード1", "キーワード2", ...],
  "voiceTone": "ブランドの声のトーン説明",
  "brandValues": ["価値1", "価値2", ...],
  "targetAudience": "ターゲット層の説明",
  "suggestedColors": ["#XXXXXX", "#XXXXXX", ...]
}`;

  const prompt = `以下のブランド情報を分析してください：

ブランド名: ${brandName}
説明: ${brandDescription}

アップロードされた資産の分析結果:
${assetDescriptions.map((desc, i) => `${i + 1}. ${desc}`).join("\n")}

上記の情報から、ブランドのキーワード、声のトーン、ブランド価値、ターゲット層、推奨カラーを抽出してください。`;

  const result = await generateText({
    prompt,
    systemInstruction,
    temperature: 0.3,
  });

  try {
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse brand analysis response:", e);
  }

  return {
    keywords: [],
    voiceTone: "",
    brandValues: [],
    targetAudience: "",
    suggestedColors: [],
  };
}

export async function generateCatchCopy(
  brandContext: string,
  instruction: string,
  count: number = 5
): Promise<string[]> {
  const systemInstruction = `あなたは優秀なコピーライターです。ブランドの特徴を理解し、魅力的なキャッチコピーを生成してください。
回答は必ず以下のJSON形式で返してください：
{
  "copies": ["コピー1", "コピー2", ...]
}`;

  const prompt = `以下のブランド情報に基づいて、${count}個のキャッチコピーを生成してください：

ブランド情報:
${brandContext}

指示:
${instruction}

ブランドの声のトーンを維持しながら、印象的で記憶に残るキャッチコピーを生成してください。`;

  const result = await generateText({
    prompt,
    systemInstruction,
    temperature: 0.8,
  });

  try {
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.copies || [];
    }
  } catch (e) {
    console.error("Failed to parse catch copy response:", e);
  }

  return [];
}

export async function generateSNSPost(
  brandContext: string,
  platform: "twitter" | "instagram" | "facebook",
  topic: string
): Promise<{ text: string; hashtags: string[] }> {
  const platformLimits = {
    twitter: 280,
    instagram: 2200,
    facebook: 63206,
  };

  const systemInstruction = `あなたはSNSマーケティングの専門家です。ブランドの特徴を理解し、各プラットフォームに最適化された投稿を生成してください。
回答は必ず以下のJSON形式で返してください：
{
  "text": "投稿本文",
  "hashtags": ["ハッシュタグ1", "ハッシュタグ2", ...]
}`;

  const prompt = `以下のブランド情報に基づいて、${platform}用の投稿を生成してください：

ブランド情報:
${brandContext}

トピック:
${topic}

文字数制限: ${platformLimits[platform]}文字以内
プラットフォームの特性を考慮し、エンゲージメントを高める投稿を作成してください。`;

  const result = await generateText({
    prompt,
    systemInstruction,
    temperature: 0.7,
  });

  try {
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse SNS post response:", e);
  }

  return { text: "", hashtags: [] };
}

export async function generateArticle(
  brandContext: string,
  title: string,
  outline?: string
): Promise<{ title: string; content: string; summary: string }> {
  const systemInstruction = `あなたはプロのコンテンツライターです。ブランドの特徴を理解し、読者に価値を提供する記事を執筆してください。
回答は必ず以下のJSON形式で返してください：
{
  "title": "記事タイトル",
  "content": "記事本文（Markdown形式）",
  "summary": "記事の要約（100文字程度）"
}`;

  const prompt = `以下のブランド情報に基づいて、記事を執筆してください：

ブランド情報:
${brandContext}

タイトル: ${title}
${outline ? `アウトライン:\n${outline}` : ""}

ブランドの声のトーンを維持しながら、読者に価値を提供する記事を執筆してください。`;

  const result = await generateText({
    prompt,
    systemInstruction,
    maxOutputTokens: 4096,
    temperature: 0.6,
  });

  try {
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse article response:", e);
  }

  return { title: "", content: "", summary: "" };
}
