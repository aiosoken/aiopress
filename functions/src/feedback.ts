import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import { VertexAI } from "@google-cloud/vertexai";
import { verifyBrandMember } from "./utils";

const db = admin.firestore();

const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "aiopress";
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
 * クリエイティブフィードバックを送信し、改善案を生成
 */
export const sendCreativeFeedback = functions.https.onCall(
  {
    region: LOCATION,
    cors: true,
  },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "認証が必要です"
      );
    }

    const { creativeId, feedbackText } = request.data;

    if (!creativeId || !feedbackText?.trim()) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "creativeIdとfeedbackTextは必須です"
      );
    }

    try {
      // クリエイティブを取得
      const creativeDoc = await db.collection("creatives").doc(creativeId).get();
      if (!creativeDoc.exists) {
        throw new functions.https.HttpsError("not-found", "クリエイティブが見つかりません");
      }

      const creative = creativeDoc.data();
      const brandId = creative?.brandId;

      if (!brandId) {
        throw new functions.https.HttpsError("invalid-argument", "ブランドIDが不正です");
      }

      // ブランドメンバーシップを検証
      await verifyBrandMember(brandId, uid);

      // ブランドとデザインシステムを取得
      const [brandDoc, designSystemDoc] = await Promise.all([
        db.collection("brands").doc(brandId).get(),
        db.collection("designSystems").doc(brandId).get(),
      ]);

      const brand = brandDoc.data();
      const designSystem = designSystemDoc.data();
      const brandContext = buildBrandContext(brand, designSystem);

      // 既存のフィードバックを取得
      const feedbackQuery = await db
        .collection("creativeFeedbacks")
        .where("creativeId", "==", creativeId)
        .where("status", "==", "active")
        .limit(1)
        .get();

      let feedbackDoc: FirebaseFirestore.DocumentReference;
      let existingMessages: any[] = [];

      if (!feedbackQuery.empty) {
        feedbackDoc = feedbackQuery.docs[0].ref;
        existingMessages = feedbackQuery.docs[0].data().messages || [];
      } else {
        // 新規フィードバックセッションを作成
        feedbackDoc = db.collection("creativeFeedbacks").doc();
        await feedbackDoc.set({
          creativeId,
          brandId,
          userId: uid,
          messages: [],
          status: "active",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // Gemini APIで改善案を生成
      const model = vertexAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.7,
        },
      });

      // 会話履歴を構築
      const conversationHistory = existingMessages
        .map((msg: any) => {
          if (msg.role === "user") {
            return `【ユーザーのフィードバック】\n${msg.content}`;
          } else {
            return `【AIの改善案】\n${msg.improvedContent || msg.content}`;
          }
        })
        .join("\n\n");

      const improvementPrompt = `
あなたはブランドコンサルタント兼クリエイティブディレクターです。
ユーザーから受け取ったフィードバックに基づいて、クリエイティブの改善案を提示してください。

${brandContext}

【元のクリエイティブ（${creative.type}）】
${creative.content}

${conversationHistory ? `【これまでの会話履歴】\n${conversationHistory}\n` : ""}

【新しいフィードバック】
${feedbackText}

【指示】
1. ユーザーのフィードバックを理解し、具体的な改善案を提示してください
2. ブランドDNAとの整合性を保ちながら改善してください
3. 改善案は元のクリエイティブと同じ形式・長さで提示してください
4. 以下のJSON形式で回答してください:

{
  "analysis": "フィードバックの分析と改善方針（1〜2文）",
  "improvedContent": "改善されたクリエイティブの全文"
}

JSONのみを出力してください。
`;

      const result = await model.generateContent(improvementPrompt);
      const responseText =
        result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("AIからの応答を解析できませんでした");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const analysis = parsed.analysis || "改善案を生成しました。";
      const improvedContent = parsed.improvedContent || creative.content;

      // メッセージを追加
      const userMessageId = `msg_${Date.now()}_user`;
      const assistantMessageId = `msg_${Date.now()}_assistant`;
      const now = admin.firestore.Timestamp.now();

      const newMessages = [
        ...existingMessages,
        {
          id: userMessageId,
          role: "user",
          content: feedbackText,
          timestamp: now,
        },
        {
          id: assistantMessageId,
          role: "assistant",
          content: analysis,
          improvedContent,
          timestamp: now,
        },
      ];

      await feedbackDoc.update({
        messages: newMessages,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        message: "フィードバックを送信しました",
        feedbackId: feedbackDoc.id,
        messageId: assistantMessageId,
        analysis,
        improvedContent,
      };
    } catch (error: any) {
      console.error("sendCreativeFeedback error:", error);
      throw new functions.https.HttpsError(
        "internal",
        error.message || "フィードバック送信に失敗しました"
      );
    }
  }
);

/**
 * 改善案をクリエイティブに適用
 */
export const applyCreativeImprovement = functions.https.onCall(
  {
    region: LOCATION,
    cors: true,
  },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "認証が必要です"
      );
    }

    const { creativeId, messageId } = request.data;

    if (!creativeId || !messageId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "creativeIdとmessageIdは必須です"
      );
    }

    try {
      // クリエイティブを取得
      const creativeDoc = await db.collection("creatives").doc(creativeId).get();
      if (!creativeDoc.exists) {
        throw new functions.https.HttpsError("not-found", "クリエイティブが見つかりません");
      }

      const creative = creativeDoc.data();
      const brandId = creative?.brandId;

      if (!brandId) {
        throw new functions.https.HttpsError("invalid-argument", "ブランドIDが不正です");
      }

      // ブランドメンバーシップを検証
      await verifyBrandMember(brandId, uid);

      // フィードバックを取得
      const feedbackQuery = await db
        .collection("creativeFeedbacks")
        .where("creativeId", "==", creativeId)
        .where("status", "==", "active")
        .limit(1)
        .get();

      if (feedbackQuery.empty) {
        throw new functions.https.HttpsError("not-found", "フィードバックが見つかりません");
      }

      const feedbackDoc = feedbackQuery.docs[0];
      const feedback = feedbackDoc.data();
      const messages = feedback.messages || [];

      // 対象メッセージを検索
      const targetMessage = messages.find((msg: any) => msg.id === messageId);
      if (!targetMessage || targetMessage.role !== "assistant") {
        throw new functions.https.HttpsError("not-found", "改善案が見つかりません");
      }

      if (!targetMessage.improvedContent) {
        throw new functions.https.HttpsError("invalid-argument", "改善内容がありません");
      }

      // クリエイティブを更新
      await creativeDoc.ref.update({
        content: targetMessage.improvedContent,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // メッセージに適用日時を記録
      const updatedMessages = messages.map((msg: any) => {
        if (msg.id === messageId) {
          return {
            ...msg,
            appliedAt: admin.firestore.Timestamp.now(),
          };
        }
        return msg;
      });

      await feedbackDoc.ref.update({
        messages: updatedMessages,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        message: "改善案を適用しました",
      };
    } catch (error: any) {
      console.error("applyCreativeImprovement error:", error);
      throw new functions.https.HttpsError(
        "internal",
        error.message || "改善案の適用に失敗しました"
      );
    }
  }
);

/**
 * クリエイティブのフィードバック履歴を取得
 */
export const getCreativeFeedback = functions.https.onCall(
  {
    region: LOCATION,
    cors: true,
  },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "認証が必要です"
      );
    }

    const { creativeId } = request.data;

    if (!creativeId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "creativeIdは必須です"
      );
    }

    try {
      // クリエイティブを取得
      const creativeDoc = await db.collection("creatives").doc(creativeId).get();
      if (!creativeDoc.exists) {
        throw new functions.https.HttpsError("not-found", "クリエイティブが見つかりません");
      }

      const creative = creativeDoc.data();
      const brandId = creative?.brandId;

      if (!brandId) {
        throw new functions.https.HttpsError("invalid-argument", "ブランドIDが不正です");
      }

      // ブランドメンバーシップを検証
      await verifyBrandMember(brandId, uid);

      // フィードバックを取得
      const feedbackQuery = await db
        .collection("creativeFeedbacks")
        .where("creativeId", "==", creativeId)
        .where("status", "==", "active")
        .limit(1)
        .get();

      if (feedbackQuery.empty) {
        return {
          success: true,
          feedback: null,
        };
      }

      const feedbackDoc = feedbackQuery.docs[0];
      const feedback = feedbackDoc.data();

      return {
        success: true,
        feedback: {
          id: feedbackDoc.id,
          ...feedback,
        },
      };
    } catch (error: any) {
      console.error("getCreativeFeedback error:", error);
      throw new functions.https.HttpsError(
        "internal",
        error.message || "フィードバックの取得に失敗しました"
      );
    }
  }
);
