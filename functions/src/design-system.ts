import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { VertexAI } from "@google-cloud/vertexai";

const db = admin.firestore();

const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "aiopress";
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "asia-northeast1";

const vertexAI = new VertexAI({
  project: PROJECT_ID,
  location: LOCATION,
});

/**
 * デザインシステム更新関数
 */
export const updateDesignSystem = functions
  .region("asia-northeast1")
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "認証が必要です"
      );
    }

    const { brandId, designSystem } = data;

    if (!brandId || !designSystem) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "brandIdとdesignSystemが必要です"
      );
    }

    // ブランドOWNERまたはADMINを確認
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

    const memberData = memberDoc.data();
    if (memberData?.role !== "OWNER" && memberData?.role !== "ADMIN") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "OWNERまたはADMINのみがデザインシステムを更新できます"
      );
    }

    try {
      const designSystemRef = db.collection("designSystems").doc(brandId);
      const designSystemDoc = await designSystemRef.get();

      const updateData = {
        ...designSystem,
        brandId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (designSystemDoc.exists) {
        await designSystemRef.update(updateData);
      } else {
        await designSystemRef.set(updateData);
      }

      const updatedDoc = await designSystemRef.get();
      return {
        success: true,
        designSystem: updatedDoc.data(),
      };
    } catch (error) {
      console.error("Error updating design system:", error);
      throw new functions.https.HttpsError(
        "internal",
        "デザインシステムの更新に失敗しました"
      );
    }
  });

/**
 * キーワード提案関数
 */
export const suggestKeywords = functions
  .region("asia-northeast1")
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "認証が必要です"
      );
    }

    const { brandId } = data;

    if (!brandId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "brandIdが必要です"
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

    // ブランド情報とデザインシステムを取得
    const [brandDoc, designSystemDoc] = await Promise.all([
      db.collection("brands").doc(brandId).get(),
      db.collection("designSystems").doc(brandId).get(),
    ]);

    const brand = brandDoc.exists ? brandDoc.data() : null;
    const designSystem = designSystemDoc.exists
      ? designSystemDoc.data()
      : null;

    // 既存の資産から分析結果を取得
    const assetsSnapshot = await db
      .collection("assets")
      .where("brandId", "==", brandId)
      .where("status", "==", "completed")
      .limit(10)
      .get();

    const assetDescriptions = assetsSnapshot.docs
      .map((doc) => doc.data().analysis?.description || "")
      .filter((desc) => desc.length > 0);

    // Gemini APIでキーワードを生成
    const model = vertexAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    });

    const prompt = `
以下のブランド情報に基づいて、SEOとAIO（AI最適化）に効果的なキーワードを30個提案してください。

ブランド名: ${brand?.name || "不明"}
説明: ${brand?.description || "なし"}
既存のキーワード: ${designSystem?.keywords?.join(", ") || "なし"}
ターゲット: ${designSystem?.targetAudience || "一般"}

資産の分析結果:
${assetDescriptions.map((desc, i) => `${i + 1}. ${desc}`).join("\n")}

回答は以下のJSON形式で返してください:
{
  "keywords": ["キーワード1", "キーワード2", ...]
}
`;

    try {
      const result = await model.generateContent(prompt);
      const responseText =
        result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // JSONを抽出
      let keywords: string[] = [];
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          keywords = parsed.keywords || [];
        }
      } catch (error) {
        console.error("Failed to parse keywords:", error);
      }

      // 既存のキーワードとマージ（重複を除去）
      const existingKeywords = designSystem?.keywords || [];
      const mergedKeywords = Array.from(
        new Set([...existingKeywords, ...keywords])
      ).slice(0, 30);

      return {
        success: true,
        keywords: mergedKeywords,
      };
    } catch (error) {
      console.error("Error suggesting keywords:", error);
      throw new functions.https.HttpsError(
        "internal",
        "キーワードの提案に失敗しました"
      );
    }
  });
