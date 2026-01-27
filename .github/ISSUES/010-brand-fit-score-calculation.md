# Brand Fit Scoreの計算実装

## 概要
クリエイティブ生成時のBrand Fit Score（ブランド適合スコア）がハードコードされた値（85）になっており、実際の計算が行われていない。

## 現状
- **ファイル**: `functions/src/creatives.ts` (line 90)
- **状態**: 固定値 `brandFitScore: 85` を返している

### 現在のコード
```typescript
brandFitScore: 85, // 簡易スコア（実際には計算が必要）
```

## 実装要件

### スコア計算ロジック

Brand Fit Scoreは以下の要素から算出:

1. **キーワード一致率 (30%)**
   - デザインシステムのキーワードとクリエイティブ内容の一致度

2. **トーン&ボイス一致率 (25%)**
   - 設定されたフォーマリティ、熱意、共感レベルとの一致

3. **ターゲットオーディエンス適合度 (20%)**
   - ターゲット層向けの言葉遣い・表現かどうか

4. **ブランドバリュー反映度 (15%)**
   - ブランドの価値観がコンテンツに反映されているか

5. **カラー/ビジュアル一貫性 (10%)**
   - 画像生成プロンプトの場合、ブランドカラーが考慮されているか

### 計算フロー
```
┌─────────────────┐
│ Creative Content │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Gemini Analysis │ ← Design System Data
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Score Weights  │
│  Calculation    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Brand Fit Score │
│    0 - 100      │
└─────────────────┘
```

### 技術的実装

```typescript
interface BrandFitAnalysis {
  keywordMatch: number;      // 0-100
  toneMatch: number;         // 0-100
  audienceMatch: number;     // 0-100
  valueReflection: number;   // 0-100
  visualConsistency: number; // 0-100
}

function calculateBrandFitScore(analysis: BrandFitAnalysis): number {
  return (
    analysis.keywordMatch * 0.30 +
    analysis.toneMatch * 0.25 +
    analysis.audienceMatch * 0.20 +
    analysis.valueReflection * 0.15 +
    analysis.visualConsistency * 0.10
  );
}
```

### Gemini APIプロンプト
デザインシステムの情報とクリエイティブ内容を渡し、各要素のスコアを返すようプロンプト設計が必要。

### UIへの反映
- [ ] スコア表示（0-100の数値 + カラーバー）
- [ ] スコア内訳の表示（ツールチップまたは詳細パネル）
- [ ] 低スコア時の改善提案表示

## 優先度
Medium

## ラベル
`enhancement`, `backend`, `ai`
