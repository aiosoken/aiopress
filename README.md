# AIOプレス

ブランドDNAに基づいてAIが最適なクリエイティブを自動生成するプラットフォーム。

Google Cloud AI Hackathon Vol.4 出展プロジェクト。

## 主な機能

- **ブランドDNA管理** - ミッション・ビジョン・トーン＆マナー・デザインシステムを一元管理
- **AIクリエイティブ生成** - キャッチコピー（3案）、SNS投稿（3案）、記事、画像をブランドDNAに基づいて生成
- **ブランド適合度スコア** - 生成したクリエイティブのブランドDNAとの整合性をAIが自動評価
- **ブランド情報自動抽出** - URLやファイルからブランド情報を自動抽出してデザインシステムに反映
- **アセット管理** - ロゴ・参考資料のアップロードとCloud Vision APIによる自動分析
- **Epson Connect印刷** - 生成したクリエイティブをEpsonプリンターから直接印刷
- **アナリティクス** - クリエイティブの生成状況とブランド適合度を可視化

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Next.js 16, React 19, Tailwind CSS, shadcn/ui |
| バックエンド | Cloud Functions for Firebase (Node.js 20) |
| データベース | Cloud Firestore |
| ストレージ | Cloud Storage for Firebase |
| 認証 | Firebase Authentication (Google / Email) |
| AI (テキスト) | Vertex AI - Gemini 2.0 Flash |
| AI (画像) | Vertex AI - Imagen 3 |
| AI (分析) | Cloud Vision API |
| 印刷 | Epson Connect API (`epson-connect-js`) |
| デプロイ | Firebase App Hosting |

## プロジェクト構成

```
aiopress/
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # メインページ群
│   │   │   ├── dashboard/     # ダッシュボード
│   │   │   ├── brands/        # ブランド管理
│   │   │   ├── design-system/ # デザインシステム（ブランドDNA）
│   │   │   ├── creatives/     # クリエイティブ生成・一覧
│   │   │   ├── assets/        # アセット管理
│   │   │   ├── analytics/     # アナリティクス
│   │   │   └── settings/      # 設定（プロフィール・Epson Connect）
│   │   ├── login/             # ログイン
│   │   └── register/          # 新規登録
│   ├── components/            # UIコンポーネント
│   ├── lib/
│   │   └── firebase/          # Firebase クライアント設定・関数呼び出し
│   └── types/                 # TypeScript型定義
├── functions/
│   └── src/
│       ├── index.ts           # エクスポート
│       ├── creatives.ts       # クリエイティブ生成（Gemini + Imagen）
│       ├── assets.ts          # アセット分析（Cloud Vision）
│       ├── design-system.ts   # デザインシステム更新
│       ├── brand-extraction.ts # ブランド情報自動抽出
│       ├── printing.ts        # Epson Connect印刷
│       ├── account.ts         # アカウント管理
│       └── utils.ts           # 共通ユーティリティ
├── e2e/                       # Playwright E2Eテスト
├── public/                    # 静的ファイル
└── scripts/                   # ユーティリティスクリプト
```

## セットアップ

### 前提条件

- Node.js 20+
- pnpm
- Firebase CLI (`npm install -g firebase-tools`)
- Google Cloud プロジェクト（Vertex AI API, Cloud Vision API 有効化済み）

### インストール

```bash
# 依存関係のインストール
pnpm install

# Cloud Functions の依存関係
cd functions && npm install && cd ..
```

### 環境変数

`env.example` を参考に `.env.local` を作成:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### 開発

```bash
# フロントエンド開発サーバー
pnpm dev

# Cloud Functions ビルド
cd functions && npm run build
```

### デプロイ

```bash
# フロントエンドビルド
pnpm build

# Cloud Functions デプロイ
firebase deploy --only functions

# 全体デプロイ
firebase deploy
```

## Firestore コレクション

| コレクション | 説明 |
|-------------|------|
| `users` | ユーザー情報 |
| `brands` | ブランド基本情報 |
| `brandMembers` | ブランドメンバーシップ |
| `designSystems` | デザインシステム（ブランドDNA含む） |
| `assets` | アップロード資産 |
| `creatives` | 生成されたクリエイティブ |
| `epsonConnectSettings` | Epson Connect 接続設定（ユーザー別） |
| `printJobs` | 印刷ジョブ履歴 |

## Epson Connect 印刷の利用

1. [Epson Connect 開発者ポータル](https://developer.epsonconnect.com/)でアプリを登録
2. プリンター側でEpson Connectをセットアップしてプリンターメールアドレスを取得
3. 設定ページで Client ID, Client Secret, プリンターメールアドレスを入力して接続テスト
4. クリエイティブページの各カードに印刷ボタンが表示される

## ドキュメント

| ファイル | 内容 |
|---------|------|
| [SETUP.md](./SETUP.md) | 詳細なセットアップ手順 |
| [REQUIREMENTS_V3.md](./REQUIREMENTS_V3.md) | 要件定義書（クリエイティブ生成特化） |
| [SYSTEM_DESIGN_V3.md](./SYSTEM_DESIGN_V3.md) | システム設計書 |
| [TECH_STACK.md](./TECH_STACK.md) | 技術選定の根拠 |

## ライセンス

Private - Google Cloud AI Hackathon Vol.4
