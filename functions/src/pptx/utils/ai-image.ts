import { VertexAI } from "@google-cloud/vertexai";
import type { AIImageConfig } from "../types";

/**
 * Vertex AI Imagen 3を使用して画像を生成
 */
export async function generateAIImage(
  config: AIImageConfig,
  vertexAIConfig: { projectId: string; location: string }
): Promise<string> {
  const vertexAI = new VertexAI({
    project: vertexAIConfig.projectId,
    location: vertexAIConfig.location,
  });

  const generativeVisionModel = vertexAI.preview.getGenerativeModel({
    model: "imagen-3.0-generate-001",
  });

  // プロンプトの構築
  let fullPrompt = config.prompt;
  if (config.negativePrompt) {
    fullPrompt += `\nNegative prompt: ${config.negativePrompt}`;
  }

  // パラメータの設定
  const parameters: Record<string, unknown> = {
    sampleCount: config.numberOfImages || 1,
  };

  if (config.aspectRatio) {
    parameters.aspectRatio = config.aspectRatio;
  }

  if (config.guidanceScale) {
    parameters.guidanceScale = config.guidanceScale;
  }

  if (config.seed !== undefined) {
    parameters.seed = config.seed;
  }

  try {
    const request = {
      contents: [
        {
          role: "user",
          parts: [{ text: fullPrompt }],
        },
      ],
      generationConfig: parameters,
    };

    const result = await generativeVisionModel.generateContent(request);
    const response = result.response;

    // 画像データを抽出（Base64形式）
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.content.parts && candidate.content.parts.length > 0) {
        const part = candidate.content.parts[0];
        if (part.inlineData && part.inlineData.data) {
          // Base64データを返す
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("画像生成に失敗しました: レスポンスに画像データが含まれていません");
  } catch (error) {
    console.error("AI画像生成エラー:", error);
    throw new Error(`AI画像生成に失敗しました: ${error}`);
  }
}

/**
 * 複数のAI画像を並行生成
 */
export async function generateMultipleAIImages(
  configs: AIImageConfig[],
  vertexAIConfig: { projectId: string; location: string }
): Promise<string[]> {
  const promises = configs.map((config) => generateAIImage(config, vertexAIConfig));
  return Promise.all(promises);
}

/**
 * プロンプトにブランドDNAを適用
 */
export function applyBrandDNAToPrompt(
  basePrompt: string,
  brandDNA?: {
    mission: string;
    vision: string;
    valueProposition: string;
    personality: string;
    tone: string;
  }
): string {
  if (!brandDNA) {
    return basePrompt;
  }

  const brandContext = `
Brand Context:
- Personality: ${brandDNA.personality}
- Tone: ${brandDNA.tone}
- Value Proposition: ${brandDNA.valueProposition}

Image Request: ${basePrompt}

Please generate an image that aligns with the brand personality and tone described above.
  `.trim();

  return brandContext;
}
