import * as admin from "firebase-admin";
import {
  FunctionDeclarationSchemaType,
  FunctionDeclaration,
  VertexAI,
} from "@google-cloud/vertexai";
import {
  buildBrandContext,
  calculateBrandFitScore,
  callImagenAPI,
} from "./creatives";

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
 * Gemini Function Calling 用ツール定義
 */
export const agentToolDeclarations: FunctionDeclaration[] = [
  {
    name: "get_brand_info",
    description:
      "ブランドDNA・デザインシステム情報を取得します。他のツールを使う前に必ず最初に呼び出してください。",
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        brandId: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "ブランドID",
        },
      },
      required: ["brandId"],
    },
  },
  {
    name: "search_past_creatives",
    description:
      "過去に作成されたクリエイティブを検索します。参考にしたい過去の制作物を見つけるのに使います。",
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        brandId: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "ブランドID",
        },
        type: {
          type: FunctionDeclarationSchemaType.STRING,
          description:
            "クリエイティブタイプ（CATCH_COPY, SNS_POST, ARTICLE, IMAGE）",
        },
        limit: {
          type: FunctionDeclarationSchemaType.NUMBER,
          description: "取得件数（デフォルト5）",
        },
      },
      required: ["brandId"],
    },
  },
  {
    name: "generate_text_creative",
    description:
      "テキストクリエイティブを生成します（キャッチコピー、SNS投稿、記事）。ブランドDNAに最適化された内容を生成します。",
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        brandId: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "ブランドID",
        },
        type: {
          type: FunctionDeclarationSchemaType.STRING,
          description:
            "クリエイティブタイプ（CATCH_COPY, SNS_POST, ARTICLE）",
        },
        prompt: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "生成の指示・テーマ",
        },
      },
      required: ["brandId", "type", "prompt"],
    },
  },
  {
    name: "generate_image",
    description:
      "Imagen 3を使って画像を生成します。ブランドに合った画像プロンプトを自動最適化して生成します。",
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        brandId: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "ブランドID",
        },
        prompt: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "画像生成の指示",
        },
        aspectRatio: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "アスペクト比（1:1, 16:9, 9:16, 4:3, 3:4）",
        },
      },
      required: ["brandId", "prompt"],
    },
  },
  {
    name: "evaluate_brand_fit",
    description:
      "コンテンツのブランド適合度を100点満点で評価します。生成したクリエイティブの品質チェックに使います。",
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        content: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "評価対象のコンテンツ",
        },
        brandId: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "ブランドID",
        },
        type: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "コンテンツタイプ",
        },
      },
      required: ["content", "brandId", "type"],
    },
  },
  {
    name: "suggest_keywords",
    description:
      "SEO/AIOに効果的なキーワードを提案します。ブランド情報と過去の資産分析に基づいて提案します。",
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        brandId: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "ブランドID",
        },
      },
      required: ["brandId"],
    },
  },
];

/**
 * ツール実行関数
 */
export async function executeToolCall(
  toolName: string,
  args: Record<string, any>,
  userId: string
): Promise<any> {
  switch (toolName) {
    case "get_brand_info":
      return await getBrandInfo(args.brandId);
    case "search_past_creatives":
      return await searchPastCreatives(args.brandId, args.type, args.limit);
    case "generate_text_creative":
      return await generateTextCreative(
        args.brandId,
        args.type,
        args.prompt,
        userId
      );
    case "generate_image":
      return await generateImageTool(
        args.brandId,
        args.prompt,
        args.aspectRatio,
        userId
      );
    case "evaluate_brand_fit":
      return await evaluateBrandFit(args.content, args.brandId, args.type);
    case "suggest_keywords":
      return await suggestKeywordsTool(args.brandId);
    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

// --- ツール実装 ---

async function getBrandInfo(brandId: string) {
  const [brandDoc, designSystemDoc] = await Promise.all([
    db.collection("brands").doc(brandId).get(),
    db.collection("designSystems").doc(brandId).get(),
  ]);

  const brand = brandDoc.exists ? brandDoc.data() : null;
  const designSystem = designSystemDoc.exists ? designSystemDoc.data() : null;

  if (!brand) {
    return { error: "ブランドが見つかりません" };
  }

  return {
    brandName: brand.name,
    description: brand.description || "",
    brandDNA: designSystem?.brandDNA || {},
    colors: designSystem?.colors || {},
    voiceTone: designSystem?.voiceTone || {},
    keywords: designSystem?.keywords || [],
    brandValues: designSystem?.brandValues || [],
    targetAudience: designSystem?.targetAudience || "",
    brandContext: buildBrandContext(brand, designSystem),
  };
}

async function searchPastCreatives(
  brandId: string,
  type?: string,
  limit?: number
) {
  let query: FirebaseFirestore.Query = db
    .collection("creatives")
    .where("brandId", "==", brandId);

  if (type) {
    query = query.where("type", "==", type);
  }

  query = query
    .orderBy("createdAt", "desc")
    .limit(limit || 5);

  const snapshot = await query.get();
  const creatives = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      type: data.type,
      prompt: data.prompt,
      content: data.content?.substring(0, 300),
      brandFitScore: data.metadata?.brandFitScore,
      status: data.status,
      imageUrl: data.imageUrl || null,
    };
  });

  return {
    count: creatives.length,
    creatives,
  };
}

async function generateTextCreative(
  brandId: string,
  type: string,
  prompt: string,
  userId: string
) {
  const [designSystemDoc, brandDoc] = await Promise.all([
    db.collection("designSystems").doc(brandId).get(),
    db.collection("brands").doc(brandId).get(),
  ]);

  const designSystem = designSystemDoc.exists ? designSystemDoc.data() : null;
  const brand = brandDoc.exists ? brandDoc.data() : null;
  const brandContext = buildBrandContext(brand, designSystem);

  const typeConfig: Record<
    string,
    { maxTokens: number; temperature: number; instruction: string }
  > = {
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
  };

  const config = typeConfig[type] || typeConfig.CATCH_COPY;

  const model = vertexAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      maxOutputTokens: config.maxTokens,
      temperature: config.temperature,
    },
  });

  const systemInstruction = `
あなたは、ブランド戦略に精通したプロのクリエイティブディレクターです。
以下のブランドDNAを深く理解し、ブランドの世界観を忠実に反映したクリエイティブを生成してください。

${brandContext}

${config.instruction}

【ユーザーの指示】
${prompt}

上記を踏まえて、ブランドDNAに最適化されたクリエイティブをJSON形式で生成してください。
JSONのみを出力し、それ以外のテキストは含めないでください。
`;

  const startTime = Date.now();
  const result = await model.generateContent(systemInstruction);
  const generationTime = Date.now() - startTime;
  const rawContent =
    result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

  let parsedContent: any = null;
  let displayContent = rawContent;

  try {
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsedContent = JSON.parse(jsonMatch[0]);
      if (type === "CATCH_COPY" && parsedContent.patterns) {
        displayContent = parsedContent.patterns
          .map(
            (p: any, i: number) =>
              `【案${i + 1}】${p.copy}\n  → ${p.description}`
          )
          .join("\n\n");
      } else if (type === "SNS_POST" && parsedContent.patterns) {
        displayContent = parsedContent.patterns
          .map(
            (p: any, i: number) =>
              `【案${i + 1}】\n${p.post}\n${(p.hashtags || []).join(" ")}`
          )
          .join("\n\n---\n\n");
      } else if (type === "ARTICLE" && parsedContent.title) {
        displayContent = `# ${parsedContent.title}\n\n${parsedContent.content}`;
      }
    }
  } catch {
    // use raw content
  }

  const { score: brandFitScore, feedback: brandFitFeedback } =
    await calculateBrandFitScore(displayContent, brandContext, type);

  // Firestoreに保存
  const creativeRef = db.collection("creatives").doc();
  const creativeData = {
    id: creativeRef.id,
    brandId,
    type,
    prompt,
    content: displayContent,
    parsedContent,
    metadata: {
      model: "gemini-2.0-flash",
      parameters: { maxOutputTokens: config.maxTokens, temperature: config.temperature },
      brandFitScore,
      brandFitFeedback,
      generationTime,
    },
    createdBy: userId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: "DRAFT",
    isFavorite: false,
  };

  await creativeRef.set(creativeData);

  return {
    creativeId: creativeRef.id,
    type,
    content: displayContent,
    brandFitScore,
    brandFitFeedback,
    generationTime,
  };
}

async function generateImageTool(
  brandId: string,
  prompt: string,
  aspectRatio: string | undefined,
  userId: string
) {
  const [designSystemDoc, brandDoc] = await Promise.all([
    db.collection("designSystems").doc(brandId).get(),
    db.collection("brands").doc(brandId).get(),
  ]);

  const designSystem = designSystemDoc.exists ? designSystemDoc.data() : null;
  const brand = brandDoc.exists ? brandDoc.data() : null;
  const brandContext = buildBrandContext(brand, designSystem);

  // Geminiでプロンプトを最適化
  const model = vertexAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const enhancePromptInstruction = `
以下のブランド情報と指示に基づいて、Imagen 3 画像生成APIに最適化された英語のプロンプトを1つだけ生成してください。

${brandContext}

【ユーザーの指示】
${prompt}

【ルール】
- 英語で出力
- ブランドカラーやスタイルを具体的に指定
- テキストは含めない（画像のみ）
- プロンプトテキストのみを出力

プロンプト:`;

  const startTime = Date.now();

  const enhanceResult = await model.generateContent(enhancePromptInstruction);
  const enhancedPrompt =
    enhanceResult.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
    prompt;

  const imageResult = await callImagenAPI(
    enhancedPrompt,
    aspectRatio || "1:1"
  );

  if (!imageResult.success || !imageResult.imageBase64) {
    return {
      imageUrl: null,
      imagePrompt: enhancedPrompt,
      message: "プロンプトが生成されました。画像生成APIは現在利用できません。",
    };
  }

  // Cloud Storageに保存
  const bucket = storage.bucket();
  const fileName = `brands/${brandId}/creatives/${Date.now()}.png`;
  const file = bucket.file(fileName);

  const imageBuffer = Buffer.from(imageResult.imageBase64, "base64");
  await file.save(imageBuffer, {
    contentType: "image/png",
    metadata: { metadata: { brandId, prompt: enhancedPrompt, generatedBy: "imagen-3" } },
  });

  await file.makePublic();
  const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

  const generationTime = Date.now() - startTime;

  const { score: brandFitScore, feedback: brandFitFeedback } =
    await calculateBrandFitScore(
      `画像プロンプト: ${enhancedPrompt}`,
      brandContext,
      "IMAGE"
    );

  // Firestoreに保存
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
      parameters: { aspectRatio: aspectRatio || "1:1", originalPrompt: prompt, enhancedPrompt },
      brandFitScore,
      brandFitFeedback,
      generationTime,
    },
    createdBy: userId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: "DRAFT",
    isFavorite: false,
  };

  await creativeRef.set(creativeData);

  return {
    creativeId: creativeRef.id,
    imageUrl,
    imagePrompt: enhancedPrompt,
    brandFitScore,
    brandFitFeedback,
    generationTime,
  };
}

async function evaluateBrandFit(
  content: string,
  brandId: string,
  type: string
) {
  const [brandDoc, designSystemDoc] = await Promise.all([
    db.collection("brands").doc(brandId).get(),
    db.collection("designSystems").doc(brandId).get(),
  ]);

  const brand = brandDoc.exists ? brandDoc.data() : null;
  const designSystem = designSystemDoc.exists ? designSystemDoc.data() : null;
  const brandContext = buildBrandContext(brand, designSystem);

  const { score, feedback } = await calculateBrandFitScore(
    content,
    brandContext,
    type
  );

  return { score, feedback };
}

async function suggestKeywordsTool(brandId: string) {
  const [brandDoc, designSystemDoc] = await Promise.all([
    db.collection("brands").doc(brandId).get(),
    db.collection("designSystems").doc(brandId).get(),
  ]);

  const brand = brandDoc.exists ? brandDoc.data() : null;
  const designSystem = designSystemDoc.exists ? designSystemDoc.data() : null;

  const assetsSnapshot = await db
    .collection("assets")
    .where("brandId", "==", brandId)
    .where("status", "==", "completed")
    .limit(10)
    .get();

  const assetDescriptions = assetsSnapshot.docs
    .map((doc) => doc.data().analysis?.description || "")
    .filter((desc: string) => desc.length > 0);

  const model = vertexAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
  });

  const prompt = `
以下のブランド情報に基づいて、SEOとAIO（AI最適化）に効果的なキーワードを30個提案してください。

ブランド名: ${brand?.name || "不明"}
説明: ${brand?.description || "なし"}
既存のキーワード: ${designSystem?.keywords?.join(", ") || "なし"}
ターゲット: ${designSystem?.targetAudience || "一般"}

資産の分析結果:
${assetDescriptions.map((desc: string, i: number) => `${i + 1}. ${desc}`).join("\n")}

回答は以下のJSON形式で返してください:
{"keywords": ["キーワード1", "キーワード2", ...]}
`;

  const result = await model.generateContent(prompt);
  const responseText =
    result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

  let keywords: string[] = [];
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      keywords = parsed.keywords || [];
    }
  } catch {
    // fallback to empty
  }

  const existingKeywords = designSystem?.keywords || [];
  const mergedKeywords = Array.from(
    new Set([...existingKeywords, ...keywords])
  ).slice(0, 30);

  return { keywords: mergedKeywords };
}
