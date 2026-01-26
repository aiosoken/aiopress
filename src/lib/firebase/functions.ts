import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "./config";

const functions = getFunctions(app, "asia-northeast1");

// 資産分析
export const analyzeAssetFunction = httpsCallable<
  { assetId: string; brandId: string },
  { success: boolean; message?: string }
>(functions, "analyzeAsset");

// クリエイティブ生成
export const generateCreativeFunction = httpsCallable<
  {
    brandId: string;
    type: "CATCH_COPY" | "SNS_POST" | "ARTICLE" | "IMAGE";
    prompt: string;
  },
  {
    success: boolean;
    creative?: {
      id: string;
      brandId: string;
      type: string;
      prompt: string;
      content: string;
      metadata: Record<string, unknown>;
      createdBy: string;
      createdAt: any;
      updatedAt: any;
      status: string;
    };
  }
>(functions, "generateCreative");

// 画像生成
export const generateImageFunction = httpsCallable<
  { brandId: string; prompt: string },
  {
    success: boolean;
    imagePrompt?: string;
    message?: string;
  }
>(functions, "generateImage");

// デザインシステム更新
export const updateDesignSystemFunction = httpsCallable<
  {
    brandId: string;
    designSystem: Record<string, unknown>;
  },
  {
    success: boolean;
    designSystem?: Record<string, unknown>;
  }
>(functions, "updateDesignSystem");

// キーワード提案
export const suggestKeywordsFunction = httpsCallable<
  { brandId: string },
  {
    success: boolean;
    keywords?: string[];
  }
>(functions, "suggestKeywords");
