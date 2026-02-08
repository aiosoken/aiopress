import { Timestamp } from "firebase/firestore";

export type BrandRole = "OWNER" | "ADMIN" | "MEMBER";

export type CreativeType = "CATCH_COPY" | "SNS_POST" | "ARTICLE" | "IMAGE";

export type CreativeStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BrandMember {
  id: string;
  brandId: string;
  userId: string;
  role: BrandRole;
  joinedAt: Timestamp;
}

export interface AssetAnalysis {
  keywords: string[];
  tone: string;
  description: string;
  entities: string[];
  colors?: string[];
  brandElements?: string[];
}

export interface Asset {
  id: string;
  brandId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  storagePath: string;
  downloadUrl: string;
  extractedText?: string;
  analysis?: AssetAnalysis;
  uploadedBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status?: "processing" | "completed" | "failed";
}

export interface VoiceTone {
  formality: string;
  enthusiasm: string;
  empathy: string;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface Typography {
  fontFamily: string;
  baseSize: number;
  scale: number;
}

export interface BrandDNA {
  mission: string;
  vision: string;
  valueProposition: string;
  personality: string;
  tone: string;
}

export interface DesignSystem {
  brandId: string;
  colors: ColorPalette;
  typography: Typography;
  voiceTone: VoiceTone;
  keywords: string[];
  brandValues: string[];
  targetAudience: string;
  brandDNA?: BrandDNA;
  updatedAt: Timestamp;
}

export interface CreativeMetadata {
  model: string;
  parameters: Record<string, unknown>;
  brandFitScore?: number;
  brandFitFeedback?: string;
  generationTime?: number;
}

export interface Creative {
  id: string;
  brandId: string;
  type: CreativeType;
  prompt: string;
  content: string;
  imageUrl?: string;
  metadata: CreativeMetadata;
  isFavorite?: boolean;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  status: CreativeStatus;
}

export interface AnalyticsMetrics {
  impressions: number;
  clicks: number;
  ctr: number;
  aiScore: number;
}

export interface Analytics {
  id: string;
  brandId: string;
  creativeId: string;
  metrics: AnalyticsMetrics;
  timestamp: Timestamp;
}

export interface GenerateCreativeRequest {
  type: CreativeType;
  prompt: string;
  brandId: string;
}

export interface AnalyzeAssetRequest {
  assetId: string;
  brandId: string;
}

// ブランド情報自動抽出
export interface BrandExtractionResult {
  brandName?: string;
  brandDescription?: string;
  colors: ColorPalette;
  typography: Typography;
  voiceTone: VoiceTone;
  keywords: string[];
  brandValues: string[];
  targetAudience: string;
  brandDNA: BrandDNA;
  confidence: number;
  sourceType: "pdf" | "image" | "url";
}

export interface ExtractBrandFromFileRequest {
  brandId?: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
}

export interface ExtractBrandFromUrlRequest {
  brandId?: string;
  url: string;
}

// Epson Connect 印刷
export interface EpsonPrintSettings {
  media_size?: string;
  media_type?: string;
  borderless?: boolean;
  print_quality?: string;
  color_mode?: string;
  two_sided?: string;
  copies?: number;
}

export interface EpsonConnectSettings {
  configured: boolean;
  printerEmail?: string;
  printerName?: string;
  connectionStatus?: string;
}
