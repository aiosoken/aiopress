# クリエイティブフィードバック機能 設計書

## 概要
生成されたクリエイティブに対して、チャット形式でフィードバックを行い、AIが改善案を提示・適用できる機能を追加する。

## 機能要件

### 1. フィードバックチャット
- 各クリエイティブカードに「フィードバック」ボタンを追加
- ダイアログまたはサイドパネルでチャット形式のUIを表示
- ユーザーがフィードバックを入力すると、AIが改善案を生成
- 改善案を承認すると、クリエイティブの内容が更新される

### 2. データ構造

#### Firestore コレクション: `creativeFeedbacks`
```typescript
interface CreativeFeedback {
  id: string;
  creativeId: string;
  brandId: string;
  userId: string;
  messages: FeedbackMessage[];
  status: "active" | "resolved";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface FeedbackMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Timestamp;
  // assistantの場合のみ
  improvedContent?: string;
  appliedAt?: Timestamp;
}
```

### 3. Cloud Functions

#### `sendCreativeFeedback`
- リクエスト: `{ creativeId, feedbackText }`
- 処理:
  1. クリエイティブとブランドDNAを取得
  2. フィードバック履歴を取得
  3. Gemini APIで改善案を生成
  4. Firestoreに保存して返却
- レスポンス: `{ success, message, improvedContent }`

#### `applyCreativeImprovement`
- リクエスト: `{ creativeId, messageId }`
- 処理:
  1. フィードバックメッセージから改善内容を取得
  2. クリエイティブの内容を更新
  3. 適用日時を記録
- レスポンス: `{ success, message }`

### 4. フロントエンド実装

#### コンポーネント構成
```
CreativeFeedbackDialog
├── FeedbackChatArea (メッセージ一覧)
│   ├── UserMessage
│   └── AssistantMessage (改善案 + 適用ボタン)
└── FeedbackInput (入力フォーム)
```

#### UI/UX
- クリエイティブカードに「💬 フィードバック」ボタン追加
- ダイアログで全画面表示
- 左側: 元のクリエイティブ内容
- 右側: チャット形式のフィードバックエリア
- 改善案には「✓ この改善を適用」ボタン

## 技術スタック
- フロントエンド: React, shadcn/ui Dialog, Textarea
- バックエンド: Cloud Functions, Vertex AI (Gemini 2.0 Flash)
- データベース: Cloud Firestore

## 実装手順
1. Firestore型定義を追加 (`src/types/index.ts`)
2. Cloud Functions実装 (`functions/src/feedback.ts`)
3. Firebase Functions呼び出し関数追加 (`src/lib/firebase/functions.ts`)
4. Firestore操作関数追加 (`src/lib/firebase/firestore.ts`)
5. フィードバックUIコンポーネント作成 (`src/components/features/creative-feedback/`)
6. クリエイティブページに統合 (`src/app/(dashboard)/creatives/page.tsx`)

## セキュリティ
- フィードバック送信時にブランドメンバーシップを検証
- 改善適用時にも権限チェック
- Firestore Rulesでアクセス制御

## 今後の拡張
- フィードバック履歴の検索・フィルタリング
- 複数の改善案を提示
- フィードバックのエクスポート機能
