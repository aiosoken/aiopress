import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { VertexAI } from "@google-cloud/vertexai";
import { verifyBrandMember } from "./utils";
import { generatePptx } from "./pptx";

const db = admin.firestore();
const storage = admin.storage();

const PROJECT_ID =
  process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "aiopress";
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "asia-northeast1";

const vertexAI = new VertexAI({
  project: PROJECT_ID,
  location: LOCATION,
});

/**
 * ブランドDNA情報を含むコンテキストを構築
 */
function buildBrandContext(brand: any, designSystem: any): string {
  const brandDNA = designSystem?.brandDNA || {};
  return `
【ブランドDNA】
- ブランド名: ${brand?.name || "不明"}
- 説明: ${brand?.description || "なし"}
- ミッション: ${brandDNA.mission || "未設定"}
- ビジョン: ${brandDNA.vision || "未設定"}
- 提供価値: ${brandDNA.valueProposition || "未設定"}
- パーソナリティ: ${brandDNA.personality || "未設定"}
- トーン＆マナー: ${brandDNA.tone || "未設定"}

【ブランド特性】
- 価値観: ${designSystem?.brandValues?.join("、") || "なし"}
- ボイストーン: フォーマリティ=${designSystem?.voiceTone?.formality || "neutral"}, 熱意=${designSystem?.voiceTone?.enthusiasm || "medium"}, 共感性=${designSystem?.voiceTone?.empathy || "medium"}
- ターゲット: ${designSystem?.targetAudience || "一般"}
- キーワード: ${designSystem?.keywords?.join("、") || "なし"}
- ブランドカラー: プライマリ=${designSystem?.colors?.primary || "#000"}, セカンダリ=${designSystem?.colors?.secondary || "#000"}, アクセント=${designSystem?.colors?.accent || "#000"}
`.trim();
}

/**
 * Brand Fit Scoreを計算
 */
async function calculateBrandFitScore(
  content: string,
  brandContext: string,
  type: string
): Promise<{ score: number; feedback: string }> {
  try {
    const model = vertexAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        maxOutputTokens: 512,
        temperature: 0.3,
      },
    });

    const evaluationPrompt = `
あなたはブランドコンサルタントです。以下の生成されたクリエイティブが、ブランドDNAにどの程度適合しているかを評価してください。

${brandContext}

【評価対象クリエイティブ（${type}）】
${content.substring(0, 1500)}

【評価基準】
1. ブランドミッション・ビジョンとの整合性（25点）
2. ターゲットオーディエンスへの適切さ（25点）
3. ブランドトーン＆マナーの反映度（25点）
4. 創造性・独自性（25点）

合計100点満点で評価し、以下のJSON形式で回答してください:
{"score": 数値(0-100), "feedback": "1〜2文の簡潔な評価コメント（日本語）"}

JSONのみを出力してください。
`;

    const result = await model.generateContent(evaluationPrompt);
    const responseText =
      result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: Math.min(100, Math.max(0, Math.round(parsed.score || 75))),
        feedback: parsed.feedback || "",
      };
    }
  } catch (error) {
    console.warn("Brand Fit Score calculation failed, using default:", error);
  }

  return { score: 75, feedback: "スコア計算中にエラーが発生しました。" };
}

/**
 * プレゼンテーション生成 Cloud Function
 */
export const generatePresentation = functions
  .region("asia-northeast1")
  .runWith({ timeoutSeconds: 300, memory: "1GB" })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "認証が必要です"
      );
    }

    const { brandId, prompt, slideCount } = data;

    if (!brandId || !prompt) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "brandIdとpromptが必要です"
      );
    }

    // promptの長さ制限
    if (typeof prompt !== "string" || prompt.length > 5000) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "promptは5000文字以内で入力してください"
      );
    }

    await verifyBrandMember(brandId, context.auth.uid);

    // デザインシステムとブランド情報を並列取得
    const [designSystemDoc, brandDoc] = await Promise.all([
      db.collection("designSystems").doc(brandId).get(),
      db.collection("brands").doc(brandId).get(),
    ]);

    const designSystem = designSystemDoc.exists
      ? designSystemDoc.data()
      : null;
    const brand = brandDoc.exists ? brandDoc.data() : null;

    const brandContext = buildBrandContext(brand, designSystem);

    // slideCountのバリデーション（3〜20枚）
    const targetSlideCount = Math.min(20, Math.max(3, Number(slideCount) || 7));

    // Gemini APIでスライド構成JSONを生成
    const model = vertexAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.7,
      },
    });

    const slideGenerationPrompt = `
あなたはプロのプレゼンテーションデザイナーです。以下のブランド情報とユーザーの指示に基づいて、
プレゼンテーションのスライド構成をJSON形式で生成してください。

${brandContext}

【ユーザーの指示】
${prompt}

【スライド枚数】${targetSlideCount}枚程度

【利用可能なスライドタイプと必須フィールド】
1. "title" - タイトルスライド: { "title": "...", "subtitle": "...", "author": "...", "date": "..." }
2. "section" - セクション区切り: { "number": "01", "title": "..." }
3. "content" - コンテンツスライド: { "title": "...", "subtitle": "...", "body": "..." }
4. "metrics" - 数値・KPIスライド: { "title": "...", "subtitle": "...", "metrics": [{ "label": "...", "value": "...", "change": "+10%", "changeType": "positive" }] }
5. "table" - テーブルスライド: { "title": "...", "tables": [{ "headers": ["列1", "列2"], "rows": [{ "cells": [{ "text": "..." }] }] }] }
6. "two-column" - 2カラムスライド: { "title": "...", "left": { "title": "...", "body": "..." }, "right": { "title": "...", "body": "..." } }
7. "end" - 最終スライド: { "message": "...", "organization": "...", "url": "..." }

【生成ルール】
- 最初は必ず "title" スライドで始める
- 最後は必ず "end" スライドで終わる
- 内容の区切りには "section" スライドを使う
- コンテンツは具体的で情報量のある内容にする
- metricsスライドでは具体的な数値を含める（架空でもよい）
- ブランドの世界観・トーンを反映した表現にする

以下のJSON形式で出力してください（JSONのみ、説明不要）:
{
  "title": "プレゼンテーションのタイトル",
  "slides": [
    { "type": "title", "data": { ... } },
    { "type": "content", "data": { ... } },
    ...
  ]
}
`;

    try {
      const startTime = Date.now();

      const result = await model.generateContent(slideGenerationPrompt);
      const rawContent =
        result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // JSON抽出
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Gemini APIからのJSON解析に失敗しました");
      }

      const slideConfig = JSON.parse(jsonMatch[0]);

      // PresentationConfig を構築
      const presentationConfig = {
        title: slideConfig.title || prompt,
        author: brand?.name || "AIOプレス",
        theme: designSystem
          ? {
              colors: {
                primary: designSystem.colors?.primary || "#0050A0",
                secondary: designSystem.colors?.secondary || "#003366",
                accent: designSystem.colors?.accent || "#00A0E9",
                background: designSystem.colors?.background || "#FFFFFF",
                text: designSystem.colors?.text || "#333333",
              },
              typography: {
                fontFamily: designSystem.typography?.fontFamily || "Calibri",
                baseSize: designSystem.typography?.baseSize || 14,
                scale: designSystem.typography?.scale || 1.25,
              },
              brandDNA: designSystem.brandDNA || undefined,
            }
          : undefined,
        layout: "16x9" as const,
        slides: slideConfig.slides || [],
      };

      // PPTX生成
      const pptxResult = await generatePptx(presentationConfig);
      const pptxBuffer: Buffer = pptxResult.buffer;

      // Cloud Storageにアップロード
      const bucket = storage.bucket();
      const fileName = `brands/${brandId}/presentations/${Date.now()}.pptx`;
      const file = bucket.file(fileName);

      await file.save(pptxBuffer, {
        contentType:
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        metadata: {
          metadata: {
            brandId,
            prompt,
            generatedBy: "aiopress-pptx-generator",
            slideCount: String(pptxResult.slideCount),
          },
        },
      });

      await file.makePublic();
      const pptxUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

      const generationTime = Date.now() - startTime;

      // Brand Fit Score計算
      const slideSummary = (slideConfig.slides || [])
        .map((s: any) => {
          const d = s.data || {};
          return `[${s.type}] ${d.title || d.message || d.body || ""}`;
        })
        .join("\n");

      const { score: brandFitScore, feedback: brandFitFeedback } =
        await calculateBrandFitScore(slideSummary, brandContext, "PRESENTATION");

      // Firestoreに保存
      const creativeRef = db.collection("creatives").doc();
      const displayContent = `プレゼンテーション: ${slideConfig.title || prompt}\nスライド数: ${pptxResult.slideCount}枚\n\n${slideSummary}`;

      const creativeData = {
        id: creativeRef.id,
        brandId,
        type: "PRESENTATION",
        prompt,
        content: displayContent,
        pptxUrl,
        metadata: {
          model: "gemini-2.0-flash",
          parameters: {
            slideCount: pptxResult.slideCount,
            targetSlideCount,
          },
          brandFitScore,
          brandFitFeedback,
          generationTime,
        },
        createdBy: context.auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "DRAFT",
        isFavorite: false,
      };

      await creativeRef.set(creativeData);

      return {
        success: true,
        pptxUrl,
        creative: {
          ...creativeData,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        },
      };
    } catch (error) {
      console.error("Error generating presentation:", error);
      throw new functions.https.HttpsError(
        "internal",
        "プレゼンテーションの生成に失敗しました"
      );
    }
  });
