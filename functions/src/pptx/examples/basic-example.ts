/**
 * 基本的な使用例
 * 画像、図形、AI機能を使用したパワーポイント生成のサンプル
 */

import { generatePptx } from "../index";
import { createProcessFlow, arrangeShapesInCircle } from "../utils/shape";

/**
 * 例1: 基本的な画像挿入
 */
export async function example1_BasicImageInsertion() {
  const config = {
    title: "画像挿入のサンプル",
    author: "AIOPress",
    layout: "16x9" as const,
    theme: {
      colors: {
        primary: "FF6B35",
        secondary: "004E89",
        accent: "F77F00",
        background: "FFFFFF",
        text: "2B2D42",
      },
      typography: {
        fontFamily: "Arial",
        baseSize: 14,
        scale: 1.2,
      },
    },
    slides: [
      {
        type: "title" as const,
        data: {
          title: "画像挿入のサンプル",
          subtitle: "PptxGenJSを使用した画像挿入",
          author: "AIOPress",
          date: new Date().toLocaleDateString("ja-JP"),
        },
      },
      {
        type: "content" as const,
        data: {
          title: "画像付きコンテンツスライド",
          subtitle: "画像とテキストの組み合わせ",
          body: "このスライドには画像とテキストが含まれています。画像は右側に配置され、テキストは左側に配置されています。",
          images: [
            {
              source: "https://via.placeholder.com/400x300",
              x: 6,
              y: 2,
              w: 3.5,
              h: 2.6,
              rounding: true,
            },
          ],
        },
      },
      {
        type: "image" as const,
        data: {
          title: "画像ギャラリー",
          subtitle: "グリッドレイアウト",
          images: [
            { source: "https://via.placeholder.com/300x200", x: 0, y: 0, w: 2, h: 2 },
            { source: "https://via.placeholder.com/300x200", x: 0, y: 0, w: 2, h: 2 },
            { source: "https://via.placeholder.com/300x200", x: 0, y: 0, w: 2, h: 2 },
            { source: "https://via.placeholder.com/300x200", x: 0, y: 0, w: 2, h: 2 },
          ],
          layout: "grid" as const,
          caption: "4つの画像をグリッドレイアウトで表示",
        },
      },
    ],
  };

  return await generatePptx(config, {
    outputPath: "/tmp/example1_basic_images.pptx",
  });
}

/**
 * 例2: 図形とダイアグラム
 */
export async function example2_ShapesAndDiagrams() {
  // プロセスフローの作成
  const { shapes, connectors } = createProcessFlow(
    [
      { label: "企画", x: 1, y: 3 },
      { label: "設計", x: 3.5, y: 3 },
      { label: "開発", x: 6, y: 3 },
      { label: "テスト", x: 8.5, y: 3 },
    ],
    {
      shapeWidth: 1.8,
      shapeHeight: 1,
      shapeColor: "4472C4",
      connectorColor: "000000",
    }
  );

  // 円形配置の図形
  const circleShapes = arrangeShapesInCircle(6, 5, 4, 2, 0.6, "ellipse", "ED7D31");

  const config = {
    title: "図形とダイアグラムのサンプル",
    author: "AIOPress",
    layout: "16x9" as const,
    slides: [
      {
        type: "title" as const,
        data: {
          title: "図形とダイアグラム",
          subtitle: "様々な図形を使用したプレゼンテーション",
          author: "AIOPress",
        },
      },
      {
        type: "diagram" as const,
        data: {
          title: "開発プロセスフロー",
          subtitle: "ソフトウェア開発の流れ",
          shapes: shapes,
          connectors: connectors,
          labels: [
            { text: "企画", x: 1.4, y: 2.5, fontSize: 14, bold: true, color: "FFFFFF" },
            { text: "設計", x: 3.9, y: 2.5, fontSize: 14, bold: true, color: "FFFFFF" },
            { text: "開発", x: 6.4, y: 2.5, fontSize: 14, bold: true, color: "FFFFFF" },
            { text: "テスト", x: 8.9, y: 2.5, fontSize: 14, bold: true, color: "FFFFFF" },
          ],
        },
      },
      {
        type: "diagram" as const,
        data: {
          title: "円形配置の図形",
          subtitle: "6つの要素を円形に配置",
          shapes: circleShapes,
          labels: [
            { text: "要素1", x: 4.7, y: 1.8, fontSize: 12 },
            { text: "要素2", x: 6.5, y: 2.8, fontSize: 12 },
            { text: "要素3", x: 6.5, y: 4.8, fontSize: 12 },
            { text: "要素4", x: 4.7, y: 5.8, fontSize: 12 },
            { text: "要素5", x: 2.9, y: 4.8, fontSize: 12 },
            { text: "要素6", x: 2.9, y: 2.8, fontSize: 12 },
          ],
        },
      },
      {
        type: "content" as const,
        data: {
          title: "カスタム図形",
          body: "様々な図形を組み合わせて表現できます。",
          shapes: [
            {
              type: "rightArrow" as const,
              x: 1,
              y: 3,
              w: 2,
              h: 1,
              fill: { color: "5B9BD5", type: "solid" as const },
            },
            {
              type: "star" as const,
              x: 4,
              y: 3,
              w: 1,
              h: 1,
              fill: { color: "FFC000", type: "solid" as const },
            },
            {
              type: "flowChartDecision" as const,
              x: 6,
              y: 3,
              w: 1.5,
              h: 1,
              fill: { color: "70AD47", type: "solid" as const },
            },
          ],
        },
      },
    ],
  };

  return await generatePptx(config, {
    outputPath: "/tmp/example2_shapes_diagrams.pptx",
  });
}

/**
 * 例3: 画像とテキストのレイアウト
 */
export async function example3_ImageTextLayouts() {
  const config = {
    title: "画像とテキストのレイアウト",
    author: "AIOPress",
    layout: "16x9" as const,
    slides: [
      {
        type: "title" as const,
        data: {
          title: "画像とテキストのレイアウト",
          subtitle: "4つの配置パターン",
          author: "AIOPress",
        },
      },
      {
        type: "image-text" as const,
        data: {
          title: "画像を左側に配置",
          subtitle: "左右レイアウト",
          image: {
            source: "https://via.placeholder.com/400x400",
            x: 0,
            y: 0,
            w: 4,
            h: 4,
          },
          body: [
            { text: "画像を左側に配置\n\n", bold: true, fontSize: 16 },
            { text: "このレイアウトでは、画像が左側に配置され、テキストが右側に表示されます。\n\n" },
            { text: "特徴:\n", bold: true },
            { text: "• 画像とテキストのバランスが良い\n" },
            { text: "• 読みやすいレイアウト\n" },
            { text: "• プロフェッショナルな印象" },
          ],
          imagePosition: "left" as const,
        },
      },
      {
        type: "image-text" as const,
        data: {
          title: "画像を右側に配置",
          subtitle: "左右レイアウト（反転）",
          image: {
            source: "https://via.placeholder.com/400x400",
            x: 0,
            y: 0,
            w: 4,
            h: 4,
          },
          body: [
            { text: "画像を右側に配置\n\n", bold: true, fontSize: 16 },
            { text: "このレイアウトでは、テキストが左側に配置され、画像が右側に表示されます。\n\n" },
            { text: "用途:\n", bold: true },
            { text: "• 製品紹介\n" },
            { text: "• サービス説明\n" },
            { text: "• ケーススタディ" },
          ],
          imagePosition: "right" as const,
        },
      },
      {
        type: "image-text" as const,
        data: {
          title: "画像を上部に配置",
          subtitle: "上下レイアウト",
          image: {
            source: "https://via.placeholder.com/800x300",
            x: 0,
            y: 0,
            w: 8,
            h: 3,
          },
          body: "画像を上部に配置し、テキストを下部に表示するレイアウトです。ワイドな画像を使用する場合に適しています。",
          imagePosition: "top" as const,
        },
      },
      {
        type: "image-text" as const,
        data: {
          title: "画像を下部に配置",
          subtitle: "上下レイアウト（反転）",
          image: {
            source: "https://via.placeholder.com/800x300",
            x: 0,
            y: 0,
            w: 8,
            h: 3,
          },
          body: "テキストを上部に配置し、画像を下部に表示するレイアウトです。説明を先に読んでもらいたい場合に有効です。",
          imagePosition: "bottom" as const,
        },
      },
    ],
  };

  return await generatePptx(config, {
    outputPath: "/tmp/example3_image_text_layouts.pptx",
  });
}

/**
 * 例4: AI画像生成（Vertex AI使用）
 * 注意: この例を実行するには、Vertex AI APIが有効になっている必要があります
 */
export async function example4_AIImageGeneration() {
  const brandDNA = {
    mission: "革新的なソリューションを提供する",
    vision: "未来を創造する",
    valueProposition: "シンプルで使いやすい",
    personality: "フレンドリーでプロフェッショナル",
    tone: "親しみやすく、信頼できる",
  };

  // AI画像生成（実際に実行する場合はコメントを外してください）
  /*
  const prompt1 = applyBrandDNAToPrompt(
    "モダンなオフィスで働く多様なチーム",
    brandDNA
  );

  const image1 = await generateAIImage(
    {
      prompt: prompt1,
      aspectRatio: "16:9",
      numberOfImages: 1,
    },
    {
      projectId: "your-project-id",
      location: "us-central1",
    }
  );

  const prompt2 = applyBrandDNAToPrompt(
    "デジタル技術と未来的なデザイン",
    brandDNA
  );

  const image2 = await generateAIImage(
    {
      prompt: prompt2,
      aspectRatio: "1:1",
      numberOfImages: 1,
    },
    {
      projectId: "your-project-id",
      location: "us-central1",
    }
  );
  */

  const config = {
    title: "AI生成画像のプレゼンテーション",
    author: "AIOPress",
    layout: "16x9" as const,
    theme: {
      colors: {
        primary: "FF6B35",
        secondary: "004E89",
        accent: "F77F00",
        background: "FFFFFF",
        text: "2B2D42",
      },
      typography: {
        fontFamily: "Arial",
        baseSize: 14,
        scale: 1.2,
      },
      brandDNA: brandDNA,
    },
    slides: [
      {
        type: "title" as const,
        data: {
          title: "AI生成画像の活用",
          subtitle: "Vertex AI Imagen 3を使用",
          author: "AIOPress",
        },
      },
      {
        type: "content" as const,
        data: {
          title: "AI画像生成の特徴",
          body: [
            { text: "ブランドDNAに基づいた画像生成\n\n", bold: true, fontSize: 16 },
            { text: "• テキストプロンプトから自動生成\n" },
            { text: "• ブランドの個性とトーンを反映\n" },
            { text: "• 複数のアスペクト比に対応\n" },
            { text: "• ネガティブプロンプトで不要な要素を除外\n\n" },
            { text: "用途:\n", bold: true },
            { text: "• プレゼンテーション資料\n" },
            { text: "• マーケティング素材\n" },
            { text: "• SNS投稿画像\n" },
            { text: "• ウェブサイトのビジュアル" },
          ],
        },
      },
      // AI生成画像を使用する場合は、以下のコメントを外してください
      /*
      {
        type: "image" as const,
        data: {
          title: "AI生成画像: チームワーク",
          images: [
            {
              source: image1,
              x: 1,
              y: 2,
              w: 8,
              h: 4.5,
            },
          ],
          layout: "single",
          caption: "Vertex AI Imagen 3で生成",
        },
      },
      {
        type: "image-text" as const,
        data: {
          title: "AI生成画像: デジタル技術",
          image: {
            source: image2,
            x: 0,
            y: 0,
            w: 4,
            h: 4,
          },
          body: [
            { text: "未来的なデザイン\n\n", bold: true, fontSize: 16 },
            { text: "AIが生成した画像は、ブランドDNAに基づいて作成されています。\n\n" },
            { text: "この画像は以下の要素を含んでいます:\n" },
            { text: "• モダンなビジュアル\n" },
            { text: "• テクノロジーの表現\n" },
            { text: "• ブランドカラーの活用" },
          ],
          imagePosition: "left" as const,
        },
      },
      */
    ],
  };

  return await generatePptx(config, {
    outputPath: "/tmp/example4_ai_images.pptx",
  });
}

/**
 * 例5: 総合サンプル
 * すべての機能を組み合わせた包括的な例
 */
export async function example5_ComprehensiveSample() {
  const config = {
    title: "AIOPress 総合サンプル",
    author: "AIOPress Team",
    layout: "16x9" as const,
    theme: {
      colors: {
        primary: "FF6B35",
        secondary: "004E89",
        accent: "F77F00",
        background: "FFFFFF",
        text: "2B2D42",
      },
      typography: {
        fontFamily: "Arial",
        baseSize: 14,
        scale: 1.2,
      },
    },
    slides: [
      // タイトルスライド
      {
        type: "title" as const,
        data: {
          title: "AIOPress",
          subtitle: "AI機能を活用したパワーポイント生成",
          author: "AIOPress Team",
          date: new Date().toLocaleDateString("ja-JP"),
        },
      },
      // セクションスライド
      {
        type: "section" as const,
        data: {
          number: "01",
          title: "機能紹介",
        },
      },
      // コンテンツスライド（画像付き）
      {
        type: "content" as const,
        data: {
          title: "主な機能",
          subtitle: "AIOPressができること",
          body: [
            { text: "1. AI画像生成\n", bold: true },
            { text: "   Vertex AI Imagen 3を使用した画像生成\n\n" },
            { text: "2. 画像挿入\n", bold: true },
            { text: "   URL、Base64、ローカルパスからの挿入\n\n" },
            { text: "3. 図形追加\n", bold: true },
            { text: "   100種類以上の図形をサポート\n\n" },
            { text: "4. 多様なレイアウト\n", bold: true },
            { text: "   画像、テキスト、ダイアグラムなど" },
          ],
          shapes: [
            {
              type: "rightArrow" as const,
              x: 7,
              y: 2,
              w: 2,
              h: 0.8,
              fill: { color: "FF6B35", type: "solid" as const },
            },
          ],
        },
      },
      // 2カラムスライド
      {
        type: "two-column" as const,
        data: {
          title: "メリットと用途",
          left: {
            title: "メリット",
            body: [
              { text: "• 効率的な資料作成\n" },
              { text: "• ブランド統一性の維持\n" },
              { text: "• AI活用による高品質\n" },
              { text: "• 柔軟なカスタマイズ" },
            ],
            accentColor: "FF6B35",
          },
          right: {
            title: "用途",
            body: [
              { text: "• ビジネスプレゼン\n" },
              { text: "• マーケティング資料\n" },
              { text: "• 教育コンテンツ\n" },
              { text: "• レポート作成" },
            ],
            accentColor: "004E89",
          },
        },
      },
      // メトリクススライド
      {
        type: "metrics" as const,
        data: {
          title: "実績",
          subtitle: "2024年の成果",
          metrics: [
            {
              label: "生成プレゼン数",
              value: "1,234",
              change: "+45%",
              changeType: "positive" as const,
            },
            {
              label: "AI画像生成数",
              value: "5,678",
              change: "+120%",
              changeType: "positive" as const,
            },
            {
              label: "ユーザー満足度",
              value: "98%",
              change: "+5%",
              changeType: "positive" as const,
            },
            {
              label: "平均作成時間",
              value: "15分",
              change: "-30%",
              changeType: "positive" as const,
            },
          ],
        },
      },
      // エンドスライド
      {
        type: "end" as const,
        data: {
          message: "ありがとうございました",
          organization: "AIOPress Team",
          url: "https://aiopress.example.com",
          copyright: "© 2024 AIOPress. All rights reserved.",
        },
      },
    ],
  };

  return await generatePptx(config, {
    outputPath: "/tmp/example5_comprehensive.pptx",
  });
}

// すべての例を実行
export async function runAllExamples() {
  console.log("例1: 基本的な画像挿入");
  await example1_BasicImageInsertion();
  console.log("✓ 完了");

  console.log("\n例2: 図形とダイアグラム");
  await example2_ShapesAndDiagrams();
  console.log("✓ 完了");

  console.log("\n例3: 画像とテキストのレイアウト");
  await example3_ImageTextLayouts();
  console.log("✓ 完了");

  console.log("\n例4: AI画像生成（スキップ - Vertex AI設定が必要）");
  // await example4_AIImageGeneration();
  console.log("⊘ スキップ");

  console.log("\n例5: 総合サンプル");
  await example5_ComprehensiveSample();
  console.log("✓ 完了");

  console.log("\n全ての例が完了しました！");
}
