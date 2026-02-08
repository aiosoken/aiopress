# AIOPress PowerPoint Generator - AI機能拡張版

このモジュールは、PptxGenJSをベースにしたパワーポイント生成ライブラリで、AI画像生成、画像挿入、図形追加などの高度な機能を提供します。

## 主な機能

### 1. AI画像生成（Vertex AI Imagen 3）
- テキストプロンプトから画像を自動生成
- ブランドDNAに基づいた画像生成
- ネガティブプロンプト、アスペクト比、シード値などの詳細設定

### 2. 画像挿入
- URL、Base64、ローカルパスからの画像挿入
- サイジング、角丸、透明度、ハイパーリンクなどの設定
- グリッドレイアウト、中央配置などの自動レイアウト

### 3. 図形追加
- 100種類以上の図形タイプをサポート
- 矢印、フローチャート、吹き出しなど
- 塗りつぶし、線、回転、反転などの詳細設定

### 4. 新しいスライドレイアウト
- **image**: 画像中心のスライド（単一、グリッド、コラージュ）
- **image-text**: 画像とテキストの組み合わせ（左右上下配置）
- **diagram**: ダイアグラムスライド（図形+コネクタ+ラベル）

## 使用例

### 基本的な画像挿入

```typescript
import { generatePptx } from "./pptx";

const config = {
  title: "サンプルプレゼンテーション",
  author: "AIOPress",
  layout: "16x9",
  slides: [
    {
      type: "content",
      data: {
        title: "画像付きスライド",
        body: "このスライドには画像が含まれています。",
        images: [
          {
            source: "https://example.com/image.jpg",
            x: 6,
            y: 2,
            w: 3,
            h: 4,
            rounding: true,
          },
        ],
      },
    },
  ],
};

const result = await generatePptx(config, {
  outputPath: "/tmp/presentation.pptx",
});
```

### AI画像生成の使用

```typescript
import { generateAIImage, applyBrandDNAToPrompt } from "./pptx/utils/ai-image";

// ブランドDNAを適用したプロンプト生成
const brandDNA = {
  mission: "革新的なソリューションを提供する",
  vision: "未来を創造する",
  valueProposition: "シンプルで使いやすい",
  personality: "フレンドリーでプロフェッショナル",
  tone: "親しみやすく、信頼できる",
};

const prompt = applyBrandDNAToPrompt(
  "オフィスで働く人々の写真",
  brandDNA
);

// AI画像生成
const imageData = await generateAIImage(
  {
    prompt: prompt,
    aspectRatio: "16:9",
    numberOfImages: 1,
  },
  {
    projectId: "your-project-id",
    location: "us-central1",
  }
);

// 生成した画像をスライドに追加
const config = {
  title: "AI生成画像のプレゼンテーション",
  slides: [
    {
      type: "image",
      data: {
        title: "AI生成画像",
        images: [
          {
            source: imageData,
            x: 1,
            y: 2,
            w: 8,
            h: 4.5,
          },
        ],
        layout: "single",
      },
    },
  ],
};
```

### 図形とダイアグラムの作成

```typescript
import { createProcessFlow, arrangeShapesInCircle } from "./pptx/utils/shape";

// プロセスフローの作成
const { shapes, connectors } = createProcessFlow(
  [
    { label: "ステップ1", x: 1, y: 3 },
    { label: "ステップ2", x: 4, y: 3 },
    { label: "ステップ3", x: 7, y: 3 },
  ],
  {
    shapeColor: "4472C4",
    connectorColor: "000000",
  }
);

const config = {
  title: "プロセスフロー",
  slides: [
    {
      type: "diagram",
      data: {
        title: "業務プロセス",
        shapes: shapes,
        connectors: connectors,
        labels: [
          { text: "ステップ1", x: 1.5, y: 2.5, fontSize: 14, bold: true },
          { text: "ステップ2", x: 4.5, y: 2.5, fontSize: 14, bold: true },
          { text: "ステップ3", x: 7.5, y: 2.5, fontSize: 14, bold: true },
        ],
      },
    },
  ],
};
```

### 画像とテキストのレイアウト

```typescript
const config = {
  title: "製品紹介",
  slides: [
    {
      type: "image-text",
      data: {
        title: "新製品のご紹介",
        subtitle: "革新的なソリューション",
        image: {
          source: "https://example.com/product.jpg",
          x: 0,
          y: 0,
          w: 4,
          h: 5,
        },
        body: [
          { text: "特徴1: ", bold: true },
          { text: "高性能で使いやすい\n" },
          { text: "特徴2: ", bold: true },
          { text: "コストパフォーマンスに優れる\n" },
          { text: "特徴3: ", bold: true },
          { text: "充実したサポート体制" },
        ],
        imagePosition: "left",
      },
    },
  ],
};
```

### 複数画像のグリッドレイアウト

```typescript
const config = {
  title: "ギャラリー",
  slides: [
    {
      type: "image",
      data: {
        title: "製品ギャラリー",
        images: [
          { source: "https://example.com/img1.jpg", x: 0, y: 0, w: 2, h: 2 },
          { source: "https://example.com/img2.jpg", x: 0, y: 0, w: 2, h: 2 },
          { source: "https://example.com/img3.jpg", x: 0, y: 0, w: 2, h: 2 },
          { source: "https://example.com/img4.jpg", x: 0, y: 0, w: 2, h: 2 },
        ],
        layout: "grid", // 自動的にグリッドレイアウトで配置
        caption: "当社の製品ラインナップ",
      },
    },
  ],
};
```

## 図形タイプ一覧

### 基本図形
- `rect`: 長方形
- `ellipse`: 楕円
- `roundRect`: 角丸長方形
- `triangle`: 三角形
- `diamond`: ひし形
- `pentagon`: 五角形
- `hexagon`: 六角形
- `octagon`: 八角形
- `star`: 星形

### 矢印
- `rightArrow`: 右矢印
- `leftArrow`: 左矢印
- `upArrow`: 上矢印
- `downArrow`: 下矢印
- `leftRightArrow`: 左右矢印
- `upDownArrow`: 上下矢印
- `quadArrow`: 四方向矢印
- `curvedRightArrow`: 曲線右矢印
- `bentArrow`: 曲がり矢印

### フローチャート
- `flowChartProcess`: プロセス
- `flowChartDecision`: 判断
- `flowChartInputOutput`: 入出力
- `flowChartDocument`: 文書
- `flowChartTerminator`: 開始/終了
- `flowChartPreparation`: 準備
- `flowChartConnector`: 結合子

### その他
- `gear6`: 歯車（6歯）
- `gear9`: 歯車（9歯）
- `funnel`: じょうご
- `mathPlus`: プラス記号
- `mathMinus`: マイナス記号

完全なリストは`types.ts`の`ShapeConfig`型を参照してください。

## API リファレンス

### `generatePptx(config, options)`

パワーポイントファイルを生成します。

**パラメータ:**
- `config: PresentationConfig` - プレゼンテーション設定
- `options?: GenerateOptions` - 生成オプション

**戻り値:**
- `Promise<GenerateResult>` - 生成結果（Buffer、ファイルパス、スライド数）

### `generateAIImage(config, vertexAIConfig)`

AI画像を生成します。

**パラメータ:**
- `config: AIImageConfig` - 画像生成設定
- `vertexAIConfig: { projectId: string; location: string }` - Vertex AI設定

**戻り値:**
- `Promise<string>` - Base64エンコードされた画像データ

### ユーティリティ関数

- `addImageToSlide(slide, imageConfig)`: スライドに画像を追加
- `addShapeToSlide(pptx, slide, shapeConfig)`: スライドに図形を追加
- `layoutImagesInGrid(images, options)`: 画像をグリッドレイアウトで配置
- `createProcessFlow(steps, options)`: プロセスフローを作成
- `arrangeShapesInCircle(count, centerX, centerY, radius, ...)`: 円形配置で図形を配置

## 型定義

主要な型定義は`types.ts`に定義されています：

- `ImageConfig`: 画像設定
- `AIImageConfig`: AI画像生成設定
- `ShapeConfig`: 図形設定
- `ConnectorConfig`: コネクタ設定
- `ImageSlideData`: 画像スライドデータ
- `ImageTextSlideData`: 画像+テキストスライドデータ
- `DiagramSlideData`: ダイアグラムスライドデータ

## 注意事項

1. **AI画像生成**: Vertex AI APIが有効になっている必要があります
2. **画像ソース**: URLの場合はCORS設定に注意してください
3. **ファイルサイズ**: 多数の画像を含む場合、ファイルサイズが大きくなる可能性があります
4. **パフォーマンス**: AI画像生成は時間がかかる場合があります

## ライセンス

Private - Google Cloud AI Hackathon Vol.4
