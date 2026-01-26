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

export interface DesignSystem {
  brandId: string;
  colors: ColorPalette;
  typography: Typography;
  voiceTone: VoiceTone;
  keywords: string[];
  brandValues: string[];
  targetAudience: string;
  updatedAt: Timestamp;
}

export interface CreativeMetadata {
  model: string;
  parameters: Record<string, unknown>;
  brandFitScore?: number;
}

export interface Creative {
  id: string;
  brandId: string;
  type: CreativeType;
  prompt: string;
  content: string;
  imageUrl?: string;
  metadata: CreativeMetadata;
  createdBy: string;
  createdAt: Timestamp;
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
