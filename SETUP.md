# AIOプレス セットアップガイド

## 前提条件

- Node.js 20以上
- pnpm（パッケージマネージャー）
- Firebase CLI
- Google Cloud プロジェクト（Vertex AI API有効化済み）

## 1. リポジトリのクローンと依存関係のインストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd aiopress

# 依存関係をインストール
pnpm install

# Cloud Functionsの依存関係をインストール
cd functions
pnpm install
cd ..
```

## 2. Firebase プロジェクトのセットアップ

### 2.1. Firebase CLIのインストール

```bash
npm install -g firebase-tools
firebase login
```

### 2.2. Firebase プロジェクトの初期化

```bash
firebase init
```

以下のオプションを選択：
- ✅ Firestore
- ✅ Functions
- ✅ Storage
- ✅ Hosting

### 2.3. 環境変数の設定

#### フロントエンド用（`.env.local`）

プロジェクトルートに`.env.local`ファイルを作成：

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

#### Cloud Functions用（`functions/.env`）

`functions/.env`ファイルを作成：

```env
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=asia-northeast1
```

**重要**: Cloud Functionsの環境変数は、Firebase Consoleからも設定する必要があります：

```bash
firebase functions:config:set \
  google.cloud.project_id="your-project-id" \
  google.cloud.location="asia-northeast1"
```

## 3. Google Cloud の設定

### 3.1. Vertex AI APIの有効化

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクトを選択
3. 「APIとサービス」→「ライブラリ」に移動
4. 以下のAPIを有効化：
   - Vertex AI API
   - Cloud Vision API
   - Cloud Storage API

### 3.2. サービスアカウントの作成と権限設定

1. 「IAMと管理」→「サービスアカウント」に移動
2. 新しいサービスアカウントを作成
3. 以下のロールを付与：
   - Vertex AI User
   - Cloud Vision API User
   - Storage Admin

### 3.3. 認証情報の設定

Firebase FunctionsでGoogle Cloud APIを使用する場合、デフォルトでプロジェクトのサービスアカウントが使用されます。

## 4. Firestore セキュリティルールのデプロイ

```bash
firebase deploy --only firestore:rules
```

## 5. Storage セキュリティルールのデプロイ

```bash
firebase deploy --only storage
```

## 6. Firestore インデックスの作成

```bash
firebase deploy --only firestore:indexes
```

## 7. Cloud Functions のデプロイ

```bash
cd functions
pnpm run build
cd ..
firebase deploy --only functions
```

## 8. フロントエンドの開発サーバー起動

```bash
pnpm dev
```

ブラウザで `http://localhost:3000` にアクセス

## 9. 本番環境へのデプロイ

### 9.1. フロントエンドのビルド

```bash
pnpm build
```

### 9.2. 全体のデプロイ

```bash
firebase deploy
```

## トラブルシューティング

### Cloud Functionsが動作しない

1. 環境変数が正しく設定されているか確認
2. Google Cloud APIが有効化されているか確認
3. サービスアカウントに適切な権限があるか確認

### 資産アップロード後の自動分析が動作しない

1. Cloud Functionsのログを確認：
   ```bash
   firebase functions:log
   ```
2. Storageトリガーが正しく設定されているか確認
3. ファイルパスが `brands/{brandId}/assets/{assetId}.{ext}` の形式になっているか確認

### 認証エラー

1. Firebase Authenticationが有効化されているか確認
2. 認証プロバイダー（Email/Password、Google）が有効化されているか確認

## 開発時の注意事項

- Cloud Functionsはローカルでエミュレートできます：
  ```bash
  firebase emulators:start
  ```
- 環境変数は`.env.local`と`functions/.env`で管理してください
- `.gitignore`に`.env`ファイルが含まれていることを確認してください

## 次のステップ

- [設計書.md](./設計書.md)を参照して、詳細な実装を確認
- [要件定義書.md](./要件定義書.md)を参照して、機能要件を確認
