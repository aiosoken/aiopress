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

// アカウント削除
export const deleteAccountFunction = httpsCallable<
  Record<string, never>,
  { success: boolean }
>(functions, "deleteAccount");

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

// Epson Connect 印刷
export const printCreativeFunction = httpsCallable<
  {
    creativeId: string;
    printSettings?: import("@/types").EpsonPrintSettings;
  },
  {
    success: boolean;
    jobId?: string;
    message?: string;
  }
>(functions, "printCreative");

// Epson Connect 設定保存
export const saveEpsonSettingsFunction = httpsCallable<
  {
    printerEmail: string;
    clientId: string;
    clientSecret: string;
  },
  {
    success: boolean;
    printerName?: string;
    message?: string;
  }
>(functions, "saveEpsonSettings");

// Epson Connect 設定取得
export const getEpsonSettingsFunction = httpsCallable<
  Record<string, never>,
  {
    success: boolean;
    configured: boolean;
    printerEmail?: string;
    printerName?: string;
    connectionStatus?: string;
  }
>(functions, "getEpsonSettings");
