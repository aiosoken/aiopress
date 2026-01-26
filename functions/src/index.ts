import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// 資産関連関数
export { onAssetUpload, analyzeAsset } from "./assets";

// クリエイティブ関連関数
export { generateCreative, generateImage } from "./creatives";

// デザインシステム関連関数
export { updateDesignSystem, suggestKeywords } from "./design-system";
