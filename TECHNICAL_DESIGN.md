# AIOプレス 技術設計書 (Firebase + Google Cloud)

## 1. アーキテクチャ概要

### 1.1. システム構成図

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
│  Next.js 15 (App Router) + TypeScript + React + Tailwind CSS   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Firebase Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Authentication│  │  Firestore   │  │   Storage    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Google Cloud AI Services                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Vertex AI   │  │  Gemini API  │  │    Imagen    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Vision AI    │  │ Natural Lang │  │ Translation  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │ Speech APIs  │  │Agent Builder │                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Epson Hardware Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Scanner    │  │   Printer    │  │  Projector   │         │
│  │   DS-970     │  │Business Inkjet│ │High-Lumen   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2. 技術スタック詳細

#### フロントエンド
- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript 5.x
- **UIライブラリ**: React 19
- **スタイリング**: Tailwind CSS 4.x
- **UIコンポーネント**: shadcn/ui
- **状態管理**: React Context + Zustand
- **フォーム**: react-hook-form + zod
- **アイコン**: lucide-react

#### バックエンド (Firebase)
- **認証**: Firebase Authentication
- **データベース**: Cloud Firestore
- **ファイルストレージ**: Firebase Storage
- **関数**: Cloud Functions for Firebase (Node.js 20)
- **ホスティング**: Firebase Hosting

#### AI/ML (Google Cloud)
- **Vertex AI**: AIモデルのトレーニング、デプロイ、管理
- **Gemini API**: マルチモーダルAI (テキスト、画像、音声)
- **Gemma**: オープンソースLLM
- **Imagen**: 画像生成
- **Agent Builder**: AIエージェント構築
- **ADK**: Agents Development Kit
- **Vision AI API**: 画像認識・OCR
- **Natural Language AI API**: テキスト分析・エンティティ抽出
- **Translation AI API**: 多言語翻訳
- **Speech-to-Text API**: 音声認識
- **Text-to-Speech API**: 音声合成

#### 開発ツール
- **パッケージマネージャー**: pnpm
- **リンター**: ESLint
- **フォーマッター**: Prettier
- **型チェック**: TypeScript
- **テスト**: Jest + React Testing Library

---

## 2. Firebase構成

### 2.1. Firebase Authentication

#### 認証プロバイダー
- Email/Password
- Google OAuth
- Microsoft OAuth (企業向け)

#### セキュリティルール
```javascript
// Firebase Authentication Rules
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

### 2.2. Cloud Firestore データモデル

#### コレクション構造
```
firestore
├── users/
│   └── {userId}/
│       ├── profile (map)
│       ├── createdAt (timestamp)
│       └── updatedAt (timestamp)
│
├── brands/
│   └── {brandId}/
│       ├── name (string)
│       ├── ownerId (string)
│       ├── createdAt (timestamp)
│       └── updatedAt (timestamp)
│
├── brandMembers/
│   └── {brandId}_{userId}/
│       ├── brandId (string)
│       ├── userId (string)
│       ├── role (string: 'OWNER' | 'ADMIN' | 'MEMBER')
│       └── joinedAt (timestamp)
│
├── assets/
│   └── {assetId}/
│       ├── brandId (string)
│       ├── fileName (string)
│       ├── fileType (string)
│       ├── storagePath (string)
│       ├── downloadUrl (string)
│       ├── extractedText (string)
│       ├── analysis (map)
│       │   ├── keywords (array)
│       │   ├── tone (string)
│       │   ├── description (string)
│       │   └── entities (array)
│       ├── uploadedBy (string)
│       ├── createdAt (timestamp)
│       └── updatedAt (timestamp)
│
├── designSystems/
│   └── {brandId}/
│       ├── colors (map)
│       │   ├── primary (string)
│       │   ├── secondary (string)
│       │   └── accent (string)
│       ├── typography (map)
│       │   ├── fontFamily (string)
│       │   ├── baseSize (number)
│       │   └── scale (number)
│       ├── voiceTone (map)
│       │   ├── formality (string)
│       │   ├── enthusiasm (string)
│       │   └── empathy (string)
│       ├── keywords (array)
│       ├── brandValues (array)
│       ├── targetAudience (string)
│       └── updatedAt (timestamp)
│
├── creatives/
│   └── {creativeId}/
│       ├── brandId (string)
│       ├── type (string: 'CATCH_COPY' | 'SNS_POST' | 'ARTICLE' | 'IMAGE')
│       ├── prompt (string)
│       ├── content (string)
│       ├── metadata (map)
│       │   ├── model (string)
│       │   ├── parameters (map)
│       │   └── brandFitScore (number)
│       ├── createdBy (string)
│       ├── createdAt (timestamp)
│       └── status (string: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED')
│
└── analytics/
    └── {analyticsId}/
        ├── brandId (string)
        ├── creativeId (string)
        ├── metrics (map)
        │   ├── impressions (number)
        │   ├── clicks (number)
        │   ├── ctr (number)
        │   └── aiScore (number)
        └── timestamp (timestamp)
```

#### Firestoreセキュリティルール
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ユーザープロファイル
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // ブランド
    match /brands/{brandId} {
      allow read: if isBrandMember(brandId);
      allow create: if request.auth != null;
      allow update, delete: if isBrandOwner(brandId);
    }
    
    // ブランドメンバー
    match /brandMembers/{memberId} {
      allow read: if request.auth != null;
      allow write: if isBrandOwner(resource.data.brandId);
    }
    
    // 資産
    match /assets/{assetId} {
      allow read: if isBrandMember(resource.data.brandId);
      allow create: if request.auth != null && isBrandMember(request.resource.data.brandId);
      allow update, delete: if isBrandMember(resource.data.brandId);
    }
    
    // デザインシステム
    match /designSystems/{brandId} {
      allow read: if isBrandMember(brandId);
      allow write: if isBrandOwner(brandId) || isBrandAdmin(brandId);
    }
    
    // クリエイティブ
    match /creatives/{creativeId} {
      allow read: if isBrandMember(resource.data.brandId);
      allow create: if request.auth != null && isBrandMember(request.resource.data.brandId);
      allow update, delete: if isBrandMember(resource.data.brandId);
    }
    
    // ヘルパー関数
    function isBrandMember(brandId) {
      return exists(/databases/$(database)/documents/brandMembers/$(brandId + '_' + request.auth.uid));
    }
    
    function isBrandOwner(brandId) {
      return get(/databases/$(database)/documents/brandMembers/$(brandId + '_' + request.auth.uid)).data.role == 'OWNER';
    }
    
    function isBrandAdmin(brandId) {
      let role = get(/databases/$(database)/documents/brandMembers/$(brandId + '_' + request.auth.uid)).data.role;
      return role == 'OWNER' || role == 'ADMIN';
    }
  }
}
```

### 2.3. Firebase Storage 構造

```
storage
├── brands/
│   └── {brandId}/
│       ├── assets/
│       │   └── {assetId}.{ext}
│       ├── logos/
│       │   └── {logoId}.{ext}
│       └── creatives/
│           └── {creativeId}.{ext}
```

#### Storageセキュリティルール
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /brands/{brandId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 3. Google Cloud AI Services 統合

### 3.1. Vertex AI 構成

#### プロジェクト設定
```typescript
// lib/vertexai.ts
import { VertexAI } from '@google-cloud/vertexai';

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID!;
const location = 'asia-northeast1'; // 東京リージョン

export const vertexAI = new VertexAI({
  project: projectId,
  location: location,
});
```

#### モデル一覧
- **gemini-2.0-flash-exp**: 高速マルチモーダルモデル
- **gemini-1.5-pro**: 高性能マルチモーダルモデル
- **gemini-1.5-flash**: バランス型モデル
- **gemma-2-9b-it**: オープンソースLLM
- **imagen-3.0-generate-001**: 画像生成モデル

### 3.2. Gemini API 統合

#### 資産分析フロー
```typescript
// lib/ai/asset-analyzer.ts
import { vertexAI } from '@/lib/vertexai';

export async function analyzeAsset(
  imageUrl: string,
  fileType: string
): Promise<AssetAnalysis> {
  const model = vertexAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
  });

  const prompt = `
この画像を詳細に分析し、以下の情報をJSON形式で出力してください:
{
  "description": "画像の詳細な説明",
  "keywords": ["キーワード1", "キーワード2", ...],
  "tone": "トーン＆マナー (formal/casual/cheerful/professional等)",
  "colors": ["#hex1", "#hex2", ...],
  "extractedText": "画像内のテキスト",
  "entities": ["エンティティ1", "エンティティ2", ...],
  "brandElements": ["ブランド要素1", "ブランド要素2", ...]
}
`;

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          {
            fileData: {
              fileUri: imageUrl,
              mimeType: fileType,
            },
          },
        ],
      },
    ],
  });

  const response = result.response.text();
  return JSON.parse(response);
}
```

#### デザインシステムからのキーワード提案
```typescript
// lib/ai/keyword-suggester.ts
export async function suggestKeywords(
  designSystem: DesignSystem
): Promise<string[]> {
  const model = vertexAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
  });

  const prompt = `
以下のブランド情報に基づいて、SEOとAIO（AI最適化）に効果的なキーワードを30個提案してください。

ブランド情報:
- 価値観: ${JSON.stringify(designSystem.brandValues)}
- トーン: ${JSON.stringify(designSystem.voiceTone)}
- ターゲット: ${designSystem.targetAudience}
- 既存キーワード: ${designSystem.keywords.join(', ')}

要件:
1. 検索エンジンで発見されやすいキーワード
2. AIが理解しやすい構造化されたキーワード
3. ブランドの本質を表現するキーワード
4. ロングテールキーワードも含める

JSON配列形式で出力してください: ["keyword1", "keyword2", ...]
`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  return JSON.parse(response);
}
```

#### クリエイティブ生成
```typescript
// lib/ai/creative-generator.ts
export async function generateCreative(
  type: CreativeType,
  userPrompt: string,
  designSystem: DesignSystem
): Promise<string> {
  const model = vertexAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
  });

  const systemPrompt = `
あなたは、以下のブランド特性を持つプロのクリエイティブディレクターです。

【ブランドDNA】
- 価値観: ${designSystem.brandValues.join(', ')}
- トーン: ${JSON.stringify(designSystem.voiceTone)}
- ターゲット: ${designSystem.targetAudience}
- キーワード: ${designSystem.keywords.join(', ')}
- カラー: ${JSON.stringify(designSystem.colors)}

【制約条件】
1. ブランドイメージを絶対に崩さないこと
2. ターゲット顧客に響く表現を使うこと
3. AI検索で発見されやすい構造化された表現を含めること
4. ${type === 'CATCH_COPY' ? '20文字以内の簡潔なコピー' : ''}
5. ${type === 'SNS_POST' ? '280文字以内でハッシュタグを含める' : ''}
6. ${type === 'ARTICLE' ? '800-1200文字の読みやすい記事' : ''}

【ユーザーの指示】
${userPrompt}

上記を踏まえて、最適なクリエイティブを生成してください。
`;

  const result = await model.generateContent(systemPrompt);
  return result.response.text();
}
```

### 3.3. Imagen 画像生成

```typescript
// lib/ai/image-generator.ts
import { ImageGenerationModel } from '@google-cloud/vertexai';

export async function generateImage(
  prompt: string,
  designSystem: DesignSystem
): Promise<string> {
  const model = vertexAI.getGenerativeModel({
    model: 'imagen-3.0-generate-001',
  }) as ImageGenerationModel;

  const enhancedPrompt = `
${prompt}

Style: ${designSystem.voiceTone.formality}
Colors: ${Object.values(designSystem.colors).join(', ')}
Brand values: ${designSystem.brandValues.join(', ')}
`;

  const result = await model.generateImages({
    prompt: enhancedPrompt,
    numberOfImages: 1,
    aspectRatio: '16:9',
    safetyFilterLevel: 'block_some',
    personGeneration: 'allow_all',
  });

  // 生成された画像をFirebase Storageにアップロード
  const imageData = result.images[0].imageBytes;
  const storagePath = `brands/${designSystem.brandId}/creatives/${Date.now()}.png`;
  
  // アップロード処理 (後述)
  const downloadUrl = await uploadToStorage(imageData, storagePath);
  
  return downloadUrl;
}
```

### 3.4. Vision AI 統合

```typescript
// lib/ai/vision-analyzer.ts
import vision from '@google-cloud/vision';

const visionClient = new vision.ImageAnnotatorClient();

export async function analyzeImageWithVision(
  imageUrl: string
): Promise<VisionAnalysis> {
  const [result] = await visionClient.annotateImage({
    image: { source: { imageUri: imageUrl } },
    features: [
      { type: 'LABEL_DETECTION', maxResults: 10 },
      { type: 'TEXT_DETECTION' },
      { type: 'LOGO_DETECTION' },
      { type: 'IMAGE_PROPERTIES' },
      { type: 'SAFE_SEARCH_DETECTION' },
      { type: 'WEB_DETECTION' },
    ],
  });

  return {
    labels: result.labelAnnotations?.map(l => l.description) || [],
    text: result.textAnnotations?.[0]?.description || '',
    logos: result.logoAnnotations?.map(l => l.description) || [],
    dominantColors: result.imagePropertiesAnnotation?.dominantColors?.colors?.map(
      c => `rgb(${c.color?.red}, ${c.color?.green}, ${c.color?.blue})`
    ) || [],
    safeSearch: result.safeSearchAnnotation,
    webEntities: result.webDetection?.webEntities?.map(e => e.description) || [],
  };
}
```

### 3.5. Natural Language AI 統合

```typescript
// lib/ai/text-analyzer.ts
import language from '@google-cloud/language';

const languageClient = new language.LanguageServiceClient();

export async function analyzeText(text: string): Promise<TextAnalysis> {
  const document = {
    content: text,
    type: 'PLAIN_TEXT' as const,
    language: 'ja',
  };

  const [sentiment] = await languageClient.analyzeSentiment({ document });
  const [entities] = await languageClient.analyzeEntities({ document });
  const [syntax] = await languageClient.analyzeSyntax({ document });

  return {
    sentiment: {
      score: sentiment.documentSentiment?.score || 0,
      magnitude: sentiment.documentSentiment?.magnitude || 0,
    },
    entities: entities.entities?.map(e => ({
      name: e.name,
      type: e.type,
      salience: e.salience,
    })) || [],
    keywords: syntax.tokens
      ?.filter(t => t.partOfSpeech?.tag === 'NOUN')
      .map(t => t.text?.content)
      .filter(Boolean) || [],
  };
}
```

### 3.6. Translation AI 統合

```typescript
// lib/ai/translator.ts
import { TranslationServiceClient } from '@google-cloud/translate';

const translationClient = new TranslationServiceClient();

export async function translateContent(
  text: string,
  targetLanguage: string
): Promise<string> {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID!;
  const location = 'global';

  const request = {
    parent: `projects/${projectId}/locations/${location}`,
    contents: [text],
    mimeType: 'text/plain',
    sourceLanguageCode: 'ja',
    targetLanguageCode: targetLanguage,
  };

  const [response] = await translationClient.translateText(request);
  return response.translations?.[0]?.translatedText || text;
}
```

### 3.7. Speech-to-Text / Text-to-Speech 統合

```typescript
// lib/ai/speech.ts
import speech from '@google-cloud/speech';
import textToSpeech from '@google-cloud/text-to-speech';

const speechClient = new speech.SpeechClient();
const ttsClient = new textToSpeech.TextToSpeechClient();

// 音声からテキストへ
export async function transcribeAudio(
  audioUrl: string
): Promise<string> {
  const audio = {
    uri: audioUrl,
  };

  const config = {
    encoding: 'LINEAR16' as const,
    sampleRateHertz: 16000,
    languageCode: 'ja-JP',
    enableAutomaticPunctuation: true,
  };

  const [response] = await speechClient.recognize({ audio, config });
  const transcription = response.results
    ?.map(result => result.alternatives?.[0]?.transcript)
    .join('\n');

  return transcription || '';
}

// テキストから音声へ
export async function synthesizeSpeech(
  text: string,
  voiceName: string = 'ja-JP-Neural2-B'
): Promise<Buffer> {
  const request = {
    input: { text },
    voice: {
      languageCode: 'ja-JP',
      name: voiceName,
    },
    audioConfig: {
      audioEncoding: 'MP3' as const,
    },
  };

  const [response] = await ttsClient.synthesizeSpeech(request);
  return response.audioContent as Buffer;
}
```

### 3.8. Agent Builder 統合

```typescript
// lib/ai/agent-builder.ts
import { AgentBuilderClient } from '@google-cloud/dialogflow-cx';

const agentClient = new AgentBuilderClient();

export async function createBrandAgent(
  brandId: string,
  designSystem: DesignSystem
): Promise<string> {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID!;
  const location = 'asia-northeast1';
  const parent = `projects/${projectId}/locations/${location}`;

  const agent = {
    displayName: `AIOPress Agent - ${brandId}`,
    defaultLanguageCode: 'ja',
    timeZone: 'Asia/Tokyo',
    description: `ブランド「${designSystem.brandValues.join(', ')}」のAIエージェント`,
  };

  const [response] = await agentClient.createAgent({
    parent,
    agent,
  });

  return response.name || '';
}
```

---

## 4. Epsonハードウェア連携アーキテクチャ

### 4.1. ローカルブリッジアプリケーション

Epsonハードウェア（スキャナー、プリンター、プロジェクター）との連携は、セキュリティとドライバの制約から、ユーザーのローカルマシンで動作する「ブリッジアプリケーション」を介して行う。

#### アーキテクチャ
```
Web App (Browser)
    │
    │ Custom Protocol (aiopress://)
    ▼
Local Bridge App (Electron)
    │
    ├─► Epson Scanner Driver (DS-970)
    ├─► Epson Printer Driver (Business Inkjet)
    └─► Epson Projector SDK
    │
    │ HTTPS API
    ▼
Firebase Storage / Cloud Functions
```

#### カスタムプロトコル定義
```
aiopress://scan?brandId={brandId}&assetType={type}
aiopress://print?creativeId={creativeId}&copies={num}
aiopress://project?presentationId={id}
```

### 4.2. ローカルブリッジアプリ仕様

#### 技術スタック
- **フレームワーク**: Electron
- **言語**: TypeScript
- **通信**: WebSocket + HTTPS
- **認証**: Firebase Authentication (Custom Token)

#### 主要機能
1. **スキャン**: Epson DS-970との連携
2. **プリント**: Business Inkjetとの連携
3. **プロジェクション**: High-Lumen Projectorとの連携
4. **自動アップロード**: スキャンした資産を自動的にFirebase Storageにアップロード

---

## 5. まとめ

本技術設計では、Firebase + Google Cloud (Vertex AI、Gemini API等)を中心とした、スケーラブルで高度なAI機能を持つアーキテクチャを定義した。次のフェーズでは、この設計に基づいた超詳細技術仕様書を作成する。
