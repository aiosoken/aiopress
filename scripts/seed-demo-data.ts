/**
 * デモ用サンプルデータ投入スクリプト
 *
 * 使い方:
 *   npx tsx scripts/seed-demo-data.ts
 *
 * 前提: Firebase Admin SDK が使える環境（サービスアカウントキーが設定済み）
 *       環境変数 GOOGLE_APPLICATION_CREDENTIALS を設定するか、
 *       Cloud Shell / Cloud Functions 環境で実行
 *
 * もしくは Firebase コンソールから手動でインポート可能なJSON形式で出力する
 */

// --- サンプルデータ定義 ---

export const demoBrand = {
  name: "Bloom Coffee",
  description:
    "サステナブルなスペシャルティコーヒーブランド。産地直送の高品質な豆を、環境に配慮した方法でお届けします。",
  logoUrl: "",
};

export const demoDesignSystem = {
  colors: {
    primary: "#2D5016",
    secondary: "#8B6914",
    accent: "#D4A843",
    background: "#FDF8F0",
    text: "#1A1A1A",
  },
  typography: {
    fontFamily: "Noto Sans JP",
    baseSize: 16,
    scale: 1.25,
  },
  voiceTone: {
    formality: "ややカジュアル",
    enthusiasm: "温かみのある",
    empathy: "寄り添う",
  },
  keywords: [
    "サステナブル",
    "スペシャルティコーヒー",
    "産地直送",
    "フェアトレード",
    "手作り",
    "朝の一杯",
    "こだわり",
    "環境配慮",
  ],
  brandValues: [
    "品質へのこだわり",
    "環境サステナビリティ",
    "生産者との公正な関係",
    "日常の豊かさ",
  ],
  targetAudience:
    "25〜45歳の環境意識が高く、品質の良いコーヒーを日常的に楽しむ都市生活者。カフェ文化やサステナブルなライフスタイルに関心がある。",
  brandDNA: {
    mission:
      "一杯のコーヒーを通じて、生産者と消費者をつなぎ、サステナブルな未来を共に創る",
    vision:
      "すべてのコーヒーが、地球と人に優しい選択肢であること",
    valueProposition:
      "産地の個性が際立つスペシャルティコーヒーを、環境に配慮した方法でお届けし、毎朝の一杯を特別な体験に変える",
    personality: "温かく誠実で、知識豊富だがフレンドリー。自然体でありながら洗練されている",
    tone: "親しみやすいが知的。押し付けがましくなく、ストーリーで語る。カジュアルだが品がある",
  },
};

export const demoCreatives = [
  {
    type: "CATCH_COPY",
    prompt: "春の新作ブレンド発売キャンペーン",
    content:
      "【パターン1】\n一杯の春、ひとくちの旅。\n〜エチオピア・イルガチェフェの花のような香りをお届け〜\n\n【パターン2】\n目覚めの一杯に、春の風を。\nBloom Coffee 春限定ブレンド、3月1日より。\n\n【パターン3】\nその豆は、春の花畑で目覚めた。\nサステナブルに届く、季節のスペシャルティ。",
    status: "PUBLISHED",
    isFavorite: true,
    metadata: {
      model: "gemini-1.5-pro",
      parameters: { temperature: 0.9 },
      brandFitScore: 92,
      brandFitFeedback:
        "ブランドのサステナブルな価値観と産地直送のこだわりが自然に表現されており、ターゲット層に響く温かみのあるトーンです。",
    },
  },
  {
    type: "SNS_POST",
    prompt: "サステナビリティの取り組みを紹介するInstagram投稿",
    content:
      "【パターン1】\n☕ 私たちのコーヒーは、地球にも優しい。\n\nBloom Coffeeでは、すべての豆をフェアトレード認証農園から直接仕入れています。\n\n🌱 カーボンニュートラルな輸送\n♻️ 100%コンポスタブルパッケージ\n🤝 生産者への適正価格\n\nおいしいコーヒーは、正しい選択から。\n\n#BloomCoffee #サステナブルコーヒー #フェアトレード #スペシャルティコーヒー\n\n【パターン2】\n🌍 一杯のコーヒーで、世界を変える。\n\n今月のシングルオリジン「コロンビア・ウィラ」の農園を訪問しました。\n標高1,800mで丁寧に育てられた豆たち。\n\n農園のマリアさんの言葉が忘れられません。\n「良いコーヒーは、良い関係から生まれる」\n\n私たちもそう信じています。\n\n#産地直送 #コーヒーのある暮らし #BloomCoffee\n\n【パターン3】\n朝の一杯、何を選びますか？\n\n☕ 環境に配慮した焙煎\n🌿 オーガニック認証\n💛 生産者を支える価格\n\nBloom Coffeeは「おいしい」と「正しい」を両立します。\n\n今なら初回セット20%OFF → リンクはプロフィールから\n\n#エシカル消費 #コーヒー好き #サステナブルライフ",
    status: "PUBLISHED",
    isFavorite: false,
    metadata: {
      model: "gemini-1.5-pro",
      parameters: { temperature: 0.9 },
      brandFitScore: 88,
      brandFitFeedback:
        "SNS向けの親しみやすいトーンで、ブランドのサステナビリティへのコミットメントが効果的に伝えられています。ハッシュタグの選択も適切です。",
    },
  },
  {
    type: "ARTICLE",
    prompt: "ブログ記事：スペシャルティコーヒーの選び方ガイド",
    content:
      "# 初めてのスペシャルティコーヒー完全ガイド\n\nコーヒーの世界は深い。でも、難しくはない。\n\n## スペシャルティコーヒーとは？\n\nスペシャルティコーヒーとは、SCA（スペシャルティコーヒー協会）が定める基準で80点以上の評価を受けた豆のこと。世界のコーヒー生産量のわずか5%程度しか該当しない、特別な豆です。\n\n## 選び方の3つのポイント\n\n### 1. 産地で選ぶ\n- **エチオピア**: フルーティで花のような香り\n- **コロンビア**: バランスが良く、ナッツのような甘み\n- **グアテマラ**: チョコレートのようなコク\n\n### 2. 焙煎度で選ぶ\n浅煎りは酸味と果実感、深煎りはコクと苦味。Bloom Coffeeでは、各産地の個性が最も引き立つ焙煎度をご提案しています。\n\n### 3. 鮮度で選ぶ\n焙煎から2週間以内がベスト。Bloom Coffeeは注文後に焙煎してお届けするので、いつでも最高の鮮度です。\n\n## まとめ\n\n大切なのは「自分の好みを知ること」。まずは異なる産地を飲み比べてみてください。Bloom Coffeeの「ディスカバリーセット」なら、3つの産地を少量ずつお試しいただけます。\n\n---\n*Bloom Coffee - 産地と、あなたをつなぐ一杯*",
    status: "DRAFT",
    isFavorite: true,
    metadata: {
      model: "gemini-1.5-pro",
      parameters: { temperature: 0.7 },
      brandFitScore: 85,
      brandFitFeedback:
        "知識豊富でありながらフレンドリーなトーンが、ブランドパーソナリティと合致しています。商品への自然な誘導も適切です。",
    },
  },
  {
    type: "IMAGE",
    prompt: "春の新作ブレンドの広告バナー画像",
    content:
      "春の陽光が差し込むカフェテーブルに、Bloom Coffeeの新作春ブレンドのパッケージと、湯気が立つコーヒーカップ。背景に桜の花びらが舞い、ナチュラルなグリーンとゴールドのカラーパレット。",
    status: "DRAFT",
    isFavorite: false,
    metadata: {
      model: "imagen-3.0-generate-001",
      parameters: { aspectRatio: "16:9" },
      brandFitScore: 78,
      brandFitFeedback:
        "ブランドカラーとサステナブルなイメージが反映されていますが、コーヒー豆の産地感をもう少し強調できるとより良いです。",
    },
  },
  {
    type: "CATCH_COPY",
    prompt: "ブランド全体のタグライン",
    content:
      "【パターン1】\n産地と、あなたをつなぐ一杯。\n\n【パターン2】\n地球に優しい、朝のルーティン。\n\n【パターン3】\nBloom Coffee — 花開く、毎日のコーヒー体験。",
    status: "PUBLISHED",
    isFavorite: true,
    metadata: {
      model: "gemini-1.5-pro",
      parameters: { temperature: 0.9 },
      brandFitScore: 95,
      brandFitFeedback:
        "ブランドの核心を簡潔に表現した秀逸なタグライン候補。特にパターン1はミッションとの整合性が非常に高く、記憶に残りやすい。",
    },
  },
];

export const demoAssets = [
  {
    fileName: "bloom-coffee-logo.png",
    fileType: "image/png",
    fileSize: 245000,
    status: "completed",
    analysis: {
      keywords: ["コーヒー", "ロゴ", "リーフ", "グリーン", "サステナブル"],
      tone: "ナチュラルで洗練された印象",
      description:
        "緑の葉とコーヒー豆を組み合わせたシンボルマーク。サステナビリティへのコミットメントを視覚的に表現。",
      entities: ["コーヒー豆", "葉", "テキストロゴ"],
      colors: ["#2D5016", "#8B6914", "#FDF8F0"],
      brandElements: ["ブランド名", "シンボルマーク"],
    },
  },
  {
    fileName: "spring-blend-package.jpg",
    fileType: "image/jpeg",
    fileSize: 1200000,
    status: "completed",
    analysis: {
      keywords: ["パッケージ", "春ブレンド", "クラフト紙", "コーヒー豆"],
      tone: "温かみがあり上質な雰囲気",
      description:
        "クラフト紙ベースのパッケージデザイン。春の花のイラストとブランドロゴが配置され、ナチュラルな質感を強調。",
      entities: ["パッケージ", "花のイラスト", "ロゴ", "商品情報"],
      colors: ["#2D5016", "#D4A843", "#F5E6C8"],
      brandElements: ["パッケージデザイン", "商品名", "産地表記"],
    },
  },
  {
    fileName: "brand-guideline.pdf",
    fileType: "application/pdf",
    fileSize: 3500000,
    status: "completed",
    analysis: {
      keywords: [
        "ブランドガイドライン",
        "ロゴ使用規定",
        "カラーパレット",
        "タイポグラフィ",
        "トーン",
      ],
      tone: "プロフェッショナルで統一感がある",
      description:
        "ブランドのビジュアルアイデンティティとコミュニケーションガイドラインを定義したドキュメント。",
      entities: [
        "ロゴ規定",
        "カラー指定",
        "フォント指定",
        "写真スタイル",
        "コピーガイドライン",
      ],
      brandElements: ["ビジュアルID", "コミュニケーション規定"],
    },
  },
];

// ========================================
// 以下はFirestoreに手動投入する際の参考JSON
// Firebase コンソール > Firestore > インポート で利用可能
// ========================================

console.log("=== デモ用サンプルデータ ===\n");
console.log("以下のデータをFirestoreに投入してください。\n");
console.log("--- ブランド ---");
console.log(JSON.stringify(demoBrand, null, 2));
console.log("\n--- デザインシステム ---");
console.log(JSON.stringify(demoDesignSystem, null, 2));
console.log("\n--- クリエイティブ（5件） ---");
demoCreatives.forEach((c, i) => {
  console.log(`\n[${i + 1}] ${c.type}:`);
  console.log(JSON.stringify(c, null, 2));
});
console.log("\n--- アセット（3件） ---");
demoAssets.forEach((a, i) => {
  console.log(`\n[${i + 1}] ${a.fileName}:`);
  console.log(JSON.stringify(a, null, 2));
});

console.log("\n\n=== 投入手順 ===");
console.log("1. Firebase コンソールでプロジェクト 'aiopress' を開く");
console.log("2. Firestore Database > 'brands' コレクションにブランドを追加");
console.log("3. ブランドIDを控える");
console.log("4. 'brandMembers' にオーナーメンバーを追加 (brandId, userId, role: 'OWNER')");
console.log("5. 'designSystems' にブランドIDをドキュメントIDとしてデザインシステムを追加");
console.log("6. 'creatives' に各クリエイティブを追加 (brandIdフィールドを設定)");
console.log("7. 'assets' に各アセットを追加 (brandIdフィールドを設定)");
