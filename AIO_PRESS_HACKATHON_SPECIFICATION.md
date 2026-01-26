# AIOプレス 超詳細技術仕様書 (Agentic AI Hackathon Edition)

## 1. プロジェクト概要

### 1.1. アプリケーションの目的とハッカソンテーマへの適合性

本アプリケーション「AIOプレス」は、企業のブランド資産を学習し、自律的に最適なブランドコミュニケーションを生成する**AIエージェント**である。Google Cloudの最先端AI技術（Vertex AI, Gemini）を駆使し、企業のブランド一貫性を担保しながら、AI時代におけるマーケティング活動を自動化・最適化することを目的とする。

これは、本ハッカソンのテーマである「**君だけの『エージェント』を創り出そう**」に完全に合致する。AIOプレスは、単なるツールではなく、ブランドのペルソナを理解し、戦略を立て、コンテンツを生成するという一連のタスクを自律的に実行する「ブランド戦略AIエージェント」として機能する。

### 1.2. 解決する課題

| 課題カテゴリ | 具体的な課題 | ビジネスインパクト |
| :--- | :--- | :--- |
| **資産のサイロ化** | 過去の資料が整理されず、ナレッジとして活用されていない。 | 毎回ゼロから制作するため、コストと工数が膨らみ続ける。 |
| **ブランドの不統一** | 部署ごとに異なるメッセージやデザインが乱立し、ブランド価値を毀損。 | 収益機会が最大23%失われる可能性がある。[1] |
| **AI時代の可視性** | AIに発見・評価されないブランドは、顧客の選択肢から除外される。 | AI経由の商品発見率は70%以上に達しており、この潮流からの取り残されるリスクがある。[2] |

## 2. アーキテクチャ

### 2.1. システム構成図

コアシステムは完全クラウドネイティブで構成。Epsonハードウェア連携は、デモ用のオプショナルな拡張機能として位置付ける。

```mermaid
graph TD
    subgraph User Interface
        A[Next.js 15 App] --> B{Firebase SDK}
    end

    subgraph Firebase Backend (Core)
        B --> C[Authentication]
        B --> D[Firestore]
        B --> E[Storage]
        B --> F[Cloud Functions]
    end

    subgraph Google Cloud AI (Core)
        F --> G[Vertex AI]
        G --> H[Gemini API]
        G --> I[Imagen API]
        G --> J[Vision AI]
    end

    subgraph Optional Extension
        style K fill:#f9f,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
        style L fill:#f9f,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
        F -.-> K[Epson Connect API]
        K -.-> L[Epson Printer/Scanner]
    end
```

### 2.2. 技術スタック

| レイヤー | 技術 | 目的・役割 |
| :--- | :--- | :--- |
| **フロントエンド** | Next.js 15, TypeScript, React 19 | 高速かつインタラクティブなUIの構築 |
| | Tailwind CSS, shadcn/ui | モダンで一貫性のあるデザインシステムの実装 |
| **バックエンド** | Firebase (Authentication, Firestore, Storage, Functions) | 認証、DB、ストレージ、サーバーレスなAIエージェントの実行基盤 |
| **AI/ML (コア)** | **Vertex AI + Gemini API** | **ブランド分析、戦略立案、コンテンツ生成を行うAIエージェントの中核** |
| | Imagen, Vision AI | 画像生成、OCR、ラベル検出による資産分析の補助 |
| **AI/ML (将来)** | Agent Development Kit (ADK) | より高度なエージェント機能（音声対話など）への拡張パス |
| **ハードウェア連携 (オプション)** | Epson Connect API | クラウド経由でのプリンター・スキャナー制御 |

## 3. AIエージェントとしての機能設計

### 3.1. ブランド人格の学習フェーズ

1.  **資産の取り込み**: ユーザーは既存のブランド資料（PDF, 画像, テキスト）をFirebase Storageにアップロードする。
2.  **自律的分析 (Agentic Action)**: Cloud Functionがトリガーされ、以下の処理を自動実行する。
    a.  **Vision AI**で画像からテキスト(OCR)やオブジェクトを抽出。
    b.  **Gemini API (Function Calling)** を使い、全資産を横断的に分析。ブランドの「ペルソナ」「トーン＆マナー」「価値観」「主要キーワード」などを構造化データ(JSON)として自律的に定義し、Firestoreの`designSystems`に保存する。

### 3.2. コンテンツ生成フェーズ

1.  **ユーザー指示**: ユーザーは「来週のセール告知用のSNS投稿を作って」といった自然言語で指示を出す。
2.  **自律的生成 (Agentic Action)**: Cloud Functionがトリガーされる。
    a.  Firestoreから学習済みのブランド人格（`designSystems`）を読み込む。
    b.  ユーザー指示とブランド人格を組み合わせ、最適なプロンプトを自律的に構築する。
    c.  **Gemini API**（テキスト生成）または**Imagen**（画像生成）を呼び出し、ブランドに一貫したコンテンツを生成する。
    d.  生成物をFirestoreの`creatives`に保存し、ユーザーに提示する。

## 4. プリンター機能のオプショナル化

Epsonハードウェアとの連携は、本ハッカソンのコア機能（AIエージェント）とは独立した**拡張機能**として実装する。

- **有効化**: ユーザーが設定画面でEpson ConnectアカウントをOAuth連携した場合にのみ、UI上に「スキャン」「印刷」ボタンが表示される。
- **無効化**: 連携しない場合は、ハードウェア関連の機能は一切表示されず、コアなAIエージェント機能のみを利用できる。
- **実装**: `src/lib/epson/`ディレクトリにAPIクライアントをカプセル化し、`process.env.EPSON_CONNECT_CLIENT_ID` が存在する場合にのみ動的に機能を有効化する。

これにより、**Google CloudのAI技術を中心としたコアバリュー**と、**物理世界との連携というユニークな拡張性**を両立させ、審査員にアピールする。

## 5. プロジェクトセットアップとディレクトリ構造

(v2仕様書から変更なし。ただし、`.env.local`の`EPSON_CONNECT_*`はオプションであることを明記)

---

## 6. 参考文献

[1] Lucidpress. "The Brand Consistency Impact Report".
[2] プレゼンテーション資料「Epsonプレゼン資料(AIO総研).pdf」より。
[3] Google Cloud Japan AI Hackathon Vol.4. https://zenn.dev/hackathons/google-cloud-japan-ai-hackathon-vol4
