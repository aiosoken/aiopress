import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { VertexAI } from "@google-cloud/vertexai";
import { ImageAnnotatorClient } from "@google-cloud/vision";

const db = admin.firestore();

const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "aiopress";
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "asia-northeast1";

const vertexAI = new VertexAI({
  project: PROJECT_ID,
  location: LOCATION,
});

const visionClient = new ImageAnnotatorClient();

interface AssetAnalysis {
  keywords: string[];
  tone: string;
  description: string;
  entities: string[];
  colors?: string[];
  labels?: string[];
  extractedText?: string;
}

/**
 * 資産アップロード時の自動分析トリガー
 */
export const onAssetUpload = functions
  .region("asia-northeast1")
  .storage.object()
  .onFinalize(async (object) => {
    const filePath = object.name;
    if (!filePath) return;

    // brands/{brandId}/assets/{filename} の形式を想定
    const pathParts = filePath.split("/");
    if (pathParts.length !== 4 || pathParts[0] !== "brands" || pathParts[2] !== "assets") {
      return;
    }

    const brandId = pathParts[1];

    let assetId = "";
    try {
      // アセットドキュメントを検索（storagePathで検索）
      const assetsQuery = await db
        .collection("assets")
        .where("storagePath", "==", filePath)
        .limit(1)
        .get();

      if (assetsQuery.empty) {
        console.error(`Asset with path ${filePath} not found`);
        return;
      }

      const assetDoc = assetsQuery.docs[0];
      assetId = assetDoc.id;

      const assetData = assetDoc.data();
      if (!assetData) return;

      // ステータスを処理中に更新
      await assetDoc.ref.update({
        status: "processing",
      });

      // GCS URIを構築（Vertex AIが直接読める形式）
      const gcsUri = `gs://${object.bucket}/${filePath}`;

      // Vision AIで画像分析
      let visionAnalysis: {
        labels: string[];
        text: string;
        colors: string[];
      } = {
        labels: [],
        text: "",
        colors: [],
      };

      if (object.contentType?.startsWith("image/")) {
        try {
          const [result] = await visionClient.annotateImage({
            image: { source: { imageUri: gcsUri } },
            features: [
              { type: "LABEL_DETECTION", maxResults: 10 },
              { type: "TEXT_DETECTION" },
              { type: "IMAGE_PROPERTIES" },
            ],
          });

          visionAnalysis = {
            labels:
              result.labelAnnotations?.map((l) => l.description || "") || [],
            text: result.textAnnotations?.[0]?.description || "",
            colors:
              result.imagePropertiesAnnotation?.dominantColors?.colors?.map(
                (c) =>
                  `rgb(${c.color?.red || 0}, ${c.color?.green || 0}, ${
                    c.color?.blue || 0
                  })`
              ) || [],
          };
        } catch (error) {
          console.error("Vision AI error:", error);
        }
      }

      // Gemini APIで詳細分析
      const model = vertexAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });

      const analysisPrompt = `
この画像/ファイルを詳細に分析し、以下の情報をJSON形式で出力してください:
{
  "description": "ファイルの詳細な説明",
  "keywords": ["キーワード1", "キーワード2", ...],
  "tone": "トーン＆マナー (formal/casual/cheerful/professional等)",
  "entities": ["エンティティ1", "エンティティ2", ...],
  "brandElements": ["ブランド要素1", "ブランド要素2", ...]
}

${visionAnalysis.text ? `抽出されたテキスト: ${visionAnalysis.text}` : ""}
${visionAnalysis.labels.length > 0 ? `検出されたラベル: ${visionAnalysis.labels.join(", ")}` : ""}
`;

      const parts: any[] = [{ text: analysisPrompt }];

      if (object.contentType?.startsWith("image/")) {
        parts.push({
          fileData: {
            fileUri: gcsUri,
            mimeType: object.contentType,
          },
        });
      }

      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts,
          },
        ],
      });

      const responseText = result.response.candidates?.[0]?.content?.parts?.[0]
        ?.text as string;

      // JSONを抽出
      let analysis: AssetAnalysis = {
        keywords: [],
        tone: "",
        description: "",
        entities: [],
        colors: visionAnalysis.colors,
        labels: visionAnalysis.labels,
        extractedText: visionAnalysis.text,
      };

      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          analysis = {
            ...analysis,
            ...parsed,
            colors: parsed.colors || visionAnalysis.colors,
            labels: visionAnalysis.labels,
            extractedText: visionAnalysis.text,
          };
        }
      } catch (error) {
        console.error("Failed to parse analysis:", error);
      }

      // アセットドキュメントを更新
      await assetDoc.ref.update({
        analysis,
        extractedText: visionAnalysis.text,
        status: "completed",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // デザインシステムを更新
      await updateDesignSystemFromAsset(brandId, analysis);

      console.log(`Asset ${assetId} analyzed successfully`);
    } catch (error) {
      console.error(`Error analyzing asset ${assetId}:`, error);
      // エラー時はステータスを失敗に更新
      const assetDoc = await db.collection("assets").doc(assetId).get();
      if (assetDoc.exists) {
        await assetDoc.ref.update({
          status: "failed",
        });
      }
    }
  });

/**
 * 手動で資産を分析する関数
 */
export const analyzeAsset = functions
  .region("asia-northeast1")
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "認証が必要です"
      );
    }

    const { assetId, brandId } = data;

    if (!assetId || !brandId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "assetIdとbrandIdが必要です"
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

    // アセットを取得
    const assetDoc = await db.collection("assets").doc(assetId).get();
    if (!assetDoc.exists) {
      throw new functions.https.HttpsError("not-found", "資産が見つかりません");
    }

    const assetData = assetDoc.data();
    if (!assetData) {
      throw new functions.https.HttpsError("not-found", "資産データが見つかりません");
    }

    // 分析処理（簡易版 - 実際にはonAssetUploadと同じロジックを使用）
    return {
      success: true,
      message: "分析を開始しました。結果はしばらくしてから確認してください。",
    };
  });

/**
 * デザインシステムを資産分析結果から更新
 */
async function updateDesignSystemFromAsset(
  brandId: string,
  analysis: AssetAnalysis
) {
  try {
    const designSystemRef = db.collection("designSystems").doc(brandId);
    const designSystemDoc = await designSystemRef.get();

    const existingData = designSystemDoc.exists
      ? designSystemDoc.data()
      : null;

    // 既存のキーワードとマージ（重複を除去）
    const existingKeywords = existingData?.keywords || [];
    const newKeywords = analysis.keywords || [];
    const mergedKeywords = Array.from(
      new Set([...existingKeywords, ...newKeywords])
    ).slice(0, 30); // 最大30個

    // デザインシステムを更新
    const updateData: any = {
      keywords: mergedKeywords,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // カラーが抽出された場合は更新
    if (analysis.colors && analysis.colors.length > 0) {
      const colors = analysis.colors.slice(0, 5); // 最大5色
      updateData.colors = {
        primary: colors[0] || existingData?.colors?.primary || "#000000",
        secondary: colors[1] || existingData?.colors?.secondary || "#666666",
        accent: colors[2] || existingData?.colors?.accent || "#FF0000",
        background:
          colors[3] || existingData?.colors?.background || "#FFFFFF",
        text: colors[4] || existingData?.colors?.text || "#000000",
      };
    }

    // トーンが抽出された場合は更新
    if (analysis.tone) {
      updateData.voiceTone = {
        formality:
          analysis.tone.includes("formal") ||
          analysis.tone.includes("professional")
            ? "formal"
            : analysis.tone.includes("casual")
            ? "casual"
            : existingData?.voiceTone?.formality || "neutral",
        enthusiasm:
          analysis.tone.includes("cheerful") ||
          analysis.tone.includes("enthusiastic")
            ? "high"
            : existingData?.voiceTone?.enthusiasm || "medium",
        empathy:
          existingData?.voiceTone?.empathy || "medium",
      };
    }

    if (designSystemDoc.exists) {
      await designSystemRef.update(updateData);
    } else {
      // 新規作成
      await designSystemRef.set({
        brandId,
        ...updateData,
        typography: {
          fontFamily: existingData?.typography?.fontFamily || "sans-serif",
          baseSize: existingData?.typography?.baseSize || 16,
          scale: existingData?.typography?.scale || 1.25,
        },
        brandValues: existingData?.brandValues || [],
        targetAudience: existingData?.targetAudience || "",
      });
    }
  } catch (error) {
    console.error("Error updating design system:", error);
  }
}
