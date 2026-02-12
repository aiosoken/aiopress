import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import { VertexAI } from "@google-cloud/vertexai";
import { verifyBrandMember } from "./utils";
import { agentToolDeclarations, executeToolCall } from "./agent-tools";

const db = admin.firestore();

const PROJECT_ID =
  process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "aiopress";
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "asia-northeast1";

const vertexAI = new VertexAI({
  project: PROJECT_ID,
  location: LOCATION,
});

const MAX_ITERATIONS = 10;

const SYSTEM_INSTRUCTION = `あなたはAIOプレスのブランドAIエージェントです。
ユーザーの指示に基づき、ブランドに最適化されたクリエイティブを自律的に作成します。

利用可能なツール:
- get_brand_info: ブランドDNA情報を取得（まず最初にこれを実行）
- search_past_creatives: 過去の制作物を検索
- generate_text_creative: テキストコンテンツを生成
- generate_image: 画像を生成
- evaluate_brand_fit: ブランド適合度を評価
- suggest_keywords: キーワードを提案

行動指針:
1. ユーザーの意図を理解し、必要なツールを選択して実行
2. まずget_brand_infoでブランド情報を取得してから他のツールを使う
3. 生成後はevaluate_brand_fitでスコアを確認し、70点未満なら改善を提案
4. 複数のクリエイティブタイプを同時に作成可能
5. 日本語で応答すること`;

/**
 * エージェント実行Cloud Function (Gen2)
 */
export const runAgent = functions.https.onCall(
  {
    region: LOCATION,
    cors: true,
    timeoutSeconds: 300,
    memory: "512MiB",
  },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "認証が必要です"
      );
    }

    const { brandId, message, sessionId } = request.data;

    if (!brandId || !message) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "brandIdとmessageが必要です"
      );
    }

    if (typeof message !== "string" || message.length > 5000) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "messageは5000文字以内で入力してください"
      );
    }

    // ブランドメンバーシップを確認
    await verifyBrandMember(brandId, uid);

    try {
      // 会話履歴の取得
      let sessionRef: FirebaseFirestore.DocumentReference;
      let existingMessages: any[] = [];

      if (sessionId) {
        sessionRef = db.collection("agentSessions").doc(sessionId);
        const sessionDoc = await sessionRef.get();
        if (sessionDoc.exists) {
          existingMessages = sessionDoc.data()?.messages || [];
        }
      } else {
        sessionRef = db.collection("agentSessions").doc();
      }

      // Geminiの会話履歴を構築
      const geminiHistory = existingMessages.flatMap((msg: any) => {
        const parts: any[] = [];
        if (msg.role === "user") {
          return [{ role: "user" as const, parts: [{ text: msg.content }] }];
        } else if (msg.role === "assistant") {
          const result: any[] = [];
          if (msg.content) {
            result.push({
              role: "model" as const,
              parts: [{ text: msg.content }],
            });
          }
          return result;
        }
        return parts;
      });

      // Geminiモデル初期化
      const model = vertexAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.7,
        },
        systemInstruction: SYSTEM_INSTRUCTION,
      });

      // チャット開始
      const chat = model.startChat({
        history: geminiHistory,
        tools: [{ functionDeclarations: agentToolDeclarations }],
      });

      // ユーザーメッセージ送信
      let response = await chat.sendMessage(message);
      let candidate = response.response.candidates?.[0];
      const toolsUsed: string[] = [];
      const creativeIds: string[] = [];
      let iterations = 0;

      // ReActループ: Function Callがあれば実行して結果を送信
      while (iterations < MAX_ITERATIONS) {
        const functionCalls = candidate?.content?.parts?.filter(
          (part: any) => part.functionCall
        );

        if (!functionCalls || functionCalls.length === 0) {
          break;
        }

        // ツール実行
        const functionResponses: any[] = [];
        for (const part of functionCalls) {
          const fc = part.functionCall!;
          const toolName = fc.name;
          const toolArgs = fc.args as Record<string, any>;

          console.log(`Agent executing tool: ${toolName}`, toolArgs);
          toolsUsed.push(toolName);

          try {
            const toolResult = await executeToolCall(toolName, toolArgs, uid);

            // creativeIdを収集
            if (toolResult?.creativeId) {
              creativeIds.push(toolResult.creativeId);
            }

            functionResponses.push({
              functionResponse: {
                name: toolName,
                response: toolResult,
              },
            });
          } catch (error: any) {
            console.error(`Tool ${toolName} failed:`, error);
            functionResponses.push({
              functionResponse: {
                name: toolName,
                response: { error: error.message || "ツールの実行に失敗しました" },
              },
            });
          }
        }

        // ツール結果をGeminiに送信
        response = await chat.sendMessage(functionResponses);
        candidate = response.response.candidates?.[0];
        iterations++;
      }

      // 最終テキスト応答を取得
      const responseText =
        candidate?.content?.parts
          ?.filter((part: any) => part.text)
          .map((part: any) => part.text)
          .join("\n") || "処理が完了しましたが、応答を生成できませんでした。";

      // 会話をFirestoreに保存
      const now = admin.firestore.Timestamp.now();
      const userMessage = {
        id: `msg_${Date.now()}_user`,
        role: "user",
        content: message,
        timestamp: now,
      };

      const assistantMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: "assistant",
        content: responseText,
        toolCalls: toolsUsed.map((name) => ({ name, args: {} })),
        timestamp: now,
      };

      const updatedMessages = [
        ...existingMessages,
        userMessage,
        assistantMessage,
      ];

      // セッションタイトルを自動生成（新規セッションの場合）
      const title =
        existingMessages.length === 0
          ? message.substring(0, 50) + (message.length > 50 ? "..." : "")
          : undefined;

      const sessionData: any = {
        brandId,
        userId: uid,
        messages: updatedMessages,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (!sessionId) {
        sessionData.title = title || message.substring(0, 50);
        sessionData.createdAt = admin.firestore.FieldValue.serverTimestamp();
        await sessionRef.set(sessionData);
      } else {
        if (title) sessionData.title = title;
        await sessionRef.update(sessionData);
      }

      return {
        success: true,
        sessionId: sessionRef.id,
        response: responseText,
        toolsUsed: [...new Set(toolsUsed)],
        creativeIds: creativeIds.length > 0 ? creativeIds : undefined,
      };
    } catch (error: any) {
      console.error("Agent execution error:", error);
      throw new functions.https.HttpsError(
        "internal",
        error.message || "エージェントの実行に失敗しました"
      );
    }
  }
);

/**
 * エージェントセッション一覧取得 (Gen2)
 */
export const getAgentSessions = functions.https.onCall(
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

    const { brandId } = request.data;

    if (!brandId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "brandIdが必要です"
      );
    }

    await verifyBrandMember(brandId, uid);

    try {
      const snapshot = await db
        .collection("agentSessions")
        .where("brandId", "==", brandId)
        .where("userId", "==", uid)
        .orderBy("updatedAt", "desc")
        .limit(20)
        .get();

      const sessions = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          brandId: d.brandId,
          title: d.title,
          messageCount: d.messages?.length || 0,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        };
      });

      return { success: true, sessions };
    } catch (error: any) {
      console.error("getAgentSessions error:", error);
      throw new functions.https.HttpsError(
        "internal",
        "セッション一覧の取得に失敗しました"
      );
    }
  }
);

/**
 * エージェントセッション詳細取得 (Gen2)
 */
export const getAgentSession = functions.https.onCall(
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

    const { sessionId } = request.data;

    if (!sessionId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "sessionIdが必要です"
      );
    }

    try {
      const sessionDoc = await db
        .collection("agentSessions")
        .doc(sessionId)
        .get();

      if (!sessionDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "セッションが見つかりません"
        );
      }

      const sessionData = sessionDoc.data()!;

      // ユーザーの権限確認
      if (sessionData.userId !== uid) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "このセッションにアクセスする権限がありません"
        );
      }

      return {
        success: true,
        session: {
          id: sessionDoc.id,
          ...sessionData,
        },
      };
    } catch (error: any) {
      if (error instanceof functions.https.HttpsError) throw error;
      console.error("getAgentSession error:", error);
      throw new functions.https.HttpsError(
        "internal",
        "セッションの取得に失敗しました"
      );
    }
  }
);
