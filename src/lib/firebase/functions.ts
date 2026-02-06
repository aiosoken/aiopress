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
      parsedContent?: any;
      metadata: Record<string, unknown>;
      createdBy: string;
      createdAt: any;
      updatedAt: any;
      status: string;
      isFavorite?: boolean;
    };
  }
>(functions, "generateCreative");

// 画像生成
export const generateImageFunction = httpsCallable<
  { brandId: string; prompt: string; aspectRatio?: string },
  {
    success: boolean;
    imageUrl?: string | null;
    imagePrompt?: string;
    message?: string;
    creative?: {
      id: string;
      brandId: string;
      type: string;
      prompt: string;
      content: string;
      imageUrl?: string;
      metadata: Record<string, unknown>;
      createdBy: string;
      createdAt: any;
      updatedAt: any;
      status: string;
    };
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

// ブランド情報抽出（ファイル）
export const extractBrandFromFileFunction = httpsCallable<
  {
    brandId?: string;
    fileUrl: string;
    fileType: string;
    fileName: string;
  },
  {
    success: boolean;
    result?: import("@/types").BrandExtractionResult;
  }
>(functions, "extractBrandFromFile");

// ブランド情報抽出（URL）
export const extractBrandFromUrlFunction = httpsCallable<
  {
    brandId?: string;
    url: string;
  },
  {
    success: boolean;
    result?: import("@/types").BrandExtractionResult;
  }
>(functions, "extractBrandFromUrl");
