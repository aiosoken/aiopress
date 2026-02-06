import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { VertexAI } from "@google-cloud/vertexai";

const db = admin.firestore();
const storage = admin.storage();

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || "";
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "asia-northeast1";

const vertexAI = new VertexAI({
  project: PROJECT_ID,
  location: LOCATION,
});

/**
 * ブランドDNA情報を含むシステム命令を構築
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
 * Brand Fit Scoreを計算（Gemini APIによる評価）
 */
async function calculateBrandFitScore(
  content: string,
  brandContext: string,
  type: string
): Promise<{ score: number; feedback: string }> {
  try {
    const model = vertexAI.getGenerativeModel({
      model: "gemini-1.5-pro",
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
 * クリエイティブ生成関数
 */
export const generateCreative = functions
  .region("asia-northeast1")
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "認証が必要です"
      );
    }

    const { brandId, type, prompt } = data;

    if (!brandId || !type || !prompt) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "brandId、type、promptが必要です"
      );
    }

    // ブランドメンバーシップを確認
    const memberDoc = await db
      .collection("brandMembers")
      .doc(`${brandId}_${context.auth.uid}`)
      .get();

    if (!memberDoc.exists) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "ブランドメンバーではありません"
      );
    }

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

    // タイプ別の設定
    const typeConfig: Record<string, { maxTokens: number; temperature: number; instruction: string }> = {
      CATCH_COPY: {
        maxTokens: 2048,
        temperature: 0.9,
        instruction: `以下の条件でキャッチコピーを生成してください:
- 3つの異なるパターンを生成
- 各パターンは20文字以内
- それぞれのパターンに意図の説明（50文字以内）を付ける
- JSON形式で出力: {"patterns": [{"copy": "...", "description": "..."}]}`,
      },
      SNS_POST: {
        maxTokens: 2048,
        temperature: 0.8,
        instruction: `以下の条件でSNS投稿文を生成してください:
- 3つの異なるパターンを生成（Twitter/X向け）
- 各パターンは280文字以内
- ハッシュタグを含める
- JSON形式で出力: {"patterns": [{"post": "...", "hashtags": ["#...", "#..."]}]}`,
      },
      ARTICLE: {
        maxTokens: 4096,
        temperature: 0.7,
        instruction: `以下の条件で記事を生成してください:
- 800〜1200文字の読みやすい記事
- 見出し、本文、まとめの構成
- SEOを意識した構造
- JSON形式で出力: {"title": "...", "content": "..."}`,
      },
      IMAGE: {
        maxTokens: 2048,
        temperature: 0.8,
        instruction: `以下の条件で画像生成用プロンプトを作成してください:
- 3つの異なるビジュアルコンセプトを提案
- 各プロンプトはImagen APIに最適化された英語で記述
- ブランドカラーやスタイルを反映
- JSON形式で出力: {"patterns": [{"prompt": "...", "concept": "...（日本語で説明）"}]}`,
      },
    };

    const config = typeConfig[type] || typeConfig.CATCH_COPY;

    const model = vertexAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        maxOutputTokens: config.maxTokens,
        temperature: config.temperature,
      },
    });

    const systemInstruction = `
あなたは、ブランド戦略に精通したプロのクリエイティブディレクターです。
以下のブランドDNAを深く理解し、ブランドの世界観を忠実に反映したクリエイティブを生成してください。

${brandContext}

【重要な制約】
1. ブランドのミッション・ビジョンと矛盾する表現は絶対に使わない
2. ターゲットオーディエンスに自然に響く言葉選びをする
3. ブランドパーソナリティを体現する表現にする
4. AI検索（AIO）で発見されやすい構造化された表現を含める

${config.instruction}

【ユーザーの指示】
${prompt}

上記を踏まえて、ブランドDNAに最適化されたクリエイティブをJSON形式で生成してください。
JSONのみを出力し、それ以外のテキストは含めないでください。
`;

    try {
      const startTime = Date.now();
      const result = await model.generateContent(systemInstruction);
      const generationTime = Date.now() - startTime;
      const rawContent =
        result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // JSON部分を抽出してパース
      let parsedContent: any = null;
      let displayContent = rawContent;

      try {
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedContent = JSON.parse(jsonMatch[0]);

          // タイプに応じて表示用テキストをフォーマット
          if (type === "CATCH_COPY" && parsedContent.patterns) {
            displayContent = parsedContent.patterns
              .map((p: any, i: number) => `【案${i + 1}】${p.copy}\n  → ${p.description}`)
              .join("\n\n");
          } else if (type === "SNS_POST" && parsedContent.patterns) {
            displayContent = parsedContent.patterns
              .map((p: any, i: number) => `【案${i + 1}】\n${p.post}\n${(p.hashtags || []).join(" ")}`)
              .join("\n\n---\n\n");
          } else if (type === "ARTICLE" && parsedContent.title) {
            displayContent = `# ${parsedContent.title}\n\n${parsedContent.content}`;
          } else if (type === "IMAGE" && parsedContent.patterns) {
            displayContent = parsedContent.patterns
              .map((p: any, i: number) => `【コンセプト${i + 1}】${p.concept}\nPrompt: ${p.prompt}`)
              .join("\n\n---\n\n");
          }
        }
      } catch (parseError) {
        console.warn("JSON parse failed, using raw content:", parseError);
      }

      // Brand Fit ScoreをGemini APIで計算
      const { score: brandFitScore, feedback: brandFitFeedback } =
        await calculateBrandFitScore(displayContent, brandContext, type);

      // クリエイティブをFirestoreに保存
      const creativeRef = db.collection("creatives").doc();
      const creativeData = {
        id: creativeRef.id,
        brandId,
        type,
        prompt,
        content: displayContent,
        parsedContent: parsedContent,
        metadata: {
          model: "gemini-1.5-pro",
          parameters: {
            maxOutputTokens: config.maxTokens,
            temperature: config.temperature,
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
        creative: {
          ...creativeData,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        },
      };
    } catch (error) {
      console.error("Error generating creative:", error);
      throw new functions.https.HttpsError(
        "internal",
        "クリエイティブの生成に失敗しました"
      );
    }
  });

/**
 * 画像生成関数（Imagen API）
 */
export const generateImage = functions
  .region("asia-northeast1")
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "認証が必要です"
      );
    }

    const { brandId, prompt, aspectRatio } = data;

    if (!brandId || !prompt) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "brandIdとpromptが必要です"
      );
    }

    // ブランドメンバーシップを確認
    const memberDoc = await db
      .collection("brandMembers")
      .doc(`${brandId}_${context.auth.uid}`)
      .get();

    if (!memberDoc.exists) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "ブランドメンバーではありません"
      );
    }

    // デザインシステムとブランド情報を並列取得
    const [designSystemDoc, brandDoc] = await Promise.all([
      db.collection("designSystems").doc(brandId).get(),
      db.collection("brands").doc(brandId).get(),
    ]);

    const designSystem = designSystemDoc.exists
      ? designSystemDoc.data()
      : null;
    const brand = brandDoc.exists ? brandDoc.data() : null;

    // まずGeminiでプロンプトを最適化
    const model = vertexAI.getGenerativeModel({
      model: "gemini-1.5-pro",
    });

    const brandContext = buildBrandContext(brand, designSystem);

    const enhancePromptInstruction = `
以下のブランド情報と指示に基づいて、Imagen 3 画像生成APIに最適化された英語のプロンプトを1つだけ生成してください。

${brandContext}

【ユーザーの指示】
${prompt}

【プロンプト生成のルール】
- 英語で出力すること
- ブランドのカラーやスタイルを具体的に指定すること
- 写実的/イラスト風などスタイルを明確にすること
- 構図やレイアウトの指示を含めること
- テキストは含めないこと（画像のみ）
- プロンプトテキストのみを出力し、説明や前置きは不要

プロンプト:`;

    try {
      const startTime = Date.now();

      // Step 1: Geminiでプロンプトを最適化
      const enhanceResult = await model.generateContent(enhancePromptInstruction);
      const enhancedPrompt =
        enhanceResult.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || prompt;

      // Step 2: Imagen APIで画像を生成
      const imageResult = await callImagenAPI(enhancedPrompt, aspectRatio || "1:1");

      if (!imageResult.success || !imageResult.imageBase64) {
        // Imagen APIが利用できない場合はプロンプトのみ返す
        return {
          success: true,
          imageUrl: null,
          imagePrompt: enhancedPrompt,
          message: "プロンプトが生成されました。画像生成APIは現在利用できません。",
        };
      }

      // Step 3: 画像をCloud Storageに保存
      const bucket = storage.bucket();
      const fileName = `brands/${brandId}/creatives/${Date.now()}.png`;
      const file = bucket.file(fileName);

      const imageBuffer = Buffer.from(imageResult.imageBase64, "base64");
      await file.save(imageBuffer, {
        contentType: "image/png",
        metadata: {
          metadata: {
            brandId,
            prompt: enhancedPrompt,
            generatedBy: "imagen-3",
          },
        },
      });

      // 公開URLを生成
      await file.makePublic();
      const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

      const generationTime = Date.now() - startTime;

      // Step 4: Brand Fit Score計算
      const brandContextForScore = buildBrandContext(brand, designSystem);
      const { score: brandFitScore, feedback: brandFitFeedback } =
        await calculateBrandFitScore(
          `画像プロンプト: ${enhancedPrompt}`,
          brandContextForScore,
          "IMAGE"
        );

      // Step 5: クリエイティブとしてFirestoreに保存
      const creativeRef = db.collection("creatives").doc();
      const creativeData = {
        id: creativeRef.id,
        brandId,
        type: "IMAGE",
        prompt,
        content: enhancedPrompt,
        imageUrl,
        metadata: {
          model: "imagen-3.0-generate-001",
          parameters: {
            aspectRatio: aspectRatio || "1:1",
            originalPrompt: prompt,
            enhancedPrompt,
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
        imageUrl,
        imagePrompt: enhancedPrompt,
        creative: {
          ...creativeData,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        },
      };
    } catch (error) {
      console.error("Error generating image:", error);
      throw new functions.https.HttpsError(
        "internal",
        "画像生成に失敗しました"
      );
    }
  });

/**
 * Imagen API呼び出し（REST API経由）
 */
async function callImagenAPI(
  prompt: string,
  aspectRatio: string
): Promise<{ success: boolean; imageBase64?: string }> {
  try {
    const { GoogleAuth } = require("google-auth-library");
    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagen-3.0-generate-001:predict`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: prompt,
          },
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: aspectRatio,
          safetyFilterLevel: "block_some",
          personGeneration: "allow_adult",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Imagen API error:", response.status, errorText);
      return { success: false };
    }

    const result = await response.json();
    const imageBase64 = result.predictions?.[0]?.bytesBase64Encoded;

    if (!imageBase64) {
      console.error("No image data in response");
      return { success: false };
    }

    return { success: true, imageBase64 };
  } catch (error) {
    console.error("Imagen API call failed:", error);
    return { success: false };
  }
}
