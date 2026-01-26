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

    // デザインシステムを取得
    const designSystemDoc = await db
      .collection("designSystems")
      .doc(brandId)
      .get();

    const designSystem = designSystemDoc.exists
      ? designSystemDoc.data()
      : null;

    // ブランド情報を取得
    const brandDoc = await db.collection("brands").doc(brandId).get();
    const brand = brandDoc.exists ? brandDoc.data() : null;

    // Gemini APIでクリエイティブを生成
    const model = vertexAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        maxOutputTokens: type === "ARTICLE" ? 4096 : 2048,
        temperature: type === "CATCH_COPY" ? 0.8 : 0.7,
      },
    });

    const systemInstruction = `
あなたは、以下のブランド特性を持つプロのクリエイティブディレクターです。

【ブランドDNA】
- ブランド名: ${brand?.name || "不明"}
- 説明: ${brand?.description || "なし"}
- 価値観: ${designSystem?.brandValues?.join(", ") || "なし"}
- トーン: ${JSON.stringify(designSystem?.voiceTone || {})}
- ターゲット: ${designSystem?.targetAudience || "一般"}
- キーワード: ${designSystem?.keywords?.join(", ") || "なし"}
- カラー: ${JSON.stringify(designSystem?.colors || {})}

【制約条件】
1. ブランドイメージを絶対に崩さないこと
2. ターゲット顧客に響く表現を使うこと
3. AI検索で発見されやすい構造化された表現を含めること
4. ${type === "CATCH_COPY" ? "20文字以内の簡潔なコピーを複数生成" : ""}
5. ${type === "SNS_POST" ? "280文字以内でハッシュタグを含める" : ""}
6. ${type === "ARTICLE" ? "800-1200文字の読みやすい記事" : ""}
7. ${type === "IMAGE" ? "画像生成用の詳細なプロンプト" : ""}

【ユーザーの指示】
${prompt}

上記を踏まえて、最適なクリエイティブを生成してください。
`;

    try {
      const result = await model.generateContent(systemInstruction);
      const content =
        result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // クリエイティブをFirestoreに保存
      const creativeRef = db.collection("creatives").doc();
      const creativeData = {
        id: creativeRef.id,
        brandId,
        type,
        prompt,
        content,
        metadata: {
          model: "gemini-1.5-pro",
          parameters: {
            maxOutputTokens: type === "ARTICLE" ? 4096 : 2048,
            temperature: type === "CATCH_COPY" ? 0.8 : 0.7,
          },
          brandFitScore: 85, // 簡易スコア（実際には計算が必要）
          generationTime: Date.now(),
        },
        createdBy: context.auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "DRAFT",
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
 * 画像生成関数
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

    const { brandId, prompt } = data;

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

    // デザインシステムを取得
    const designSystemDoc = await db
      .collection("designSystems")
      .doc(brandId)
      .get();

    const designSystem = designSystemDoc.exists
      ? designSystemDoc.data()
      : null;

    // Imagen APIで画像生成
    // 注意: Imagen APIは現在Vertex AI SDKで直接サポートされていないため、
    // REST APIを使用する必要があります
    // ここでは簡易実装として、Geminiでプロンプトを最適化し、
    // 実際の画像生成は将来実装

    const model = vertexAI.getGenerativeModel({
      model: "gemini-1.5-pro",
    });

    const enhancedPrompt = `
以下のブランド情報に基づいて、画像生成用の詳細なプロンプトを作成してください：

ブランド情報:
- カラー: ${JSON.stringify(designSystem?.colors || {})}
- トーン: ${JSON.stringify(designSystem?.voiceTone || {})}
- 価値観: ${designSystem?.brandValues?.join(", ") || "なし"}

ユーザーの指示:
${prompt}

画像生成用のプロンプトを、ブランドの特性を反映した形で作成してください。
`;

    try {
      const result = await model.generateContent(enhancedPrompt);
      const imagePrompt =
        result.response.candidates?.[0]?.content?.parts?.[0]?.text || prompt;

      // 実際の画像生成はImagen APIを使用
      // 現在はプロンプトのみを返す（将来実装）
      return {
        success: true,
        imagePrompt,
        message:
          "画像生成機能は現在開発中です。プロンプトが生成されました。",
      };
    } catch (error) {
      console.error("Error generating image prompt:", error);
      throw new functions.https.HttpsError(
        "internal",
        "画像生成プロンプトの作成に失敗しました"
      );
    }
  });
