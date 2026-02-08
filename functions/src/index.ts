import * as admin from "firebase-admin";

admin.initializeApp();

// 資産関連関数
export { onAssetUpload, analyzeAsset } from "./assets";

// クリエイティブ関連関数
export { generateCreative, generateImage } from "./creatives";

// デザインシステム関連関数
export { updateDesignSystem, suggestKeywords } from "./design-system";

// ブランド情報自動抽出関数
export { extractBrandFromFile, extractBrandFromUrl } from "./brand-extraction";

// アカウント管理関数
export { deleteAccount } from "./account";

// プレゼンテーション生成関数
export { generatePresentation } from "./presentations";

// 印刷関連関数（Epson Connect）
export { printCreative, saveEpsonSettings, getEpsonSettings } from "./printing";
