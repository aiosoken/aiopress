# 分析・レポート機能

## 概要
クリエイティブのパフォーマンス追跡（インプレッション、クリック、CTR、AIスコア）が設計書に記載されているが、実装されていない。

## 現状
- **型定義**: `Analytics` インターフェースが `src/types/index.ts` に存在
- **Firestoreコレクション**: 設計のみ
- **UI**: 未実装
- **データ収集**: 未実装

## 実装要件

### Phase 1: データ収集基盤
- [ ] Analytics型に基づくFirestoreコレクション作成
- [ ] クリエイティブ閲覧トラッキングAPI
- [ ] クリック計測API
- [ ] 日次集計バッチ処理（Cloud Functions）

### Phase 2: ダッシュボードUI
- [ ] クリエイティブ別パフォーマンス一覧
- [ ] 日別・週別・月別グラフ
- [ ] CTR計算・表示
- [ ] AI適合スコア表示

### Phase 3: レポート機能
- [ ] PDF/CSVエクスポート
- [ ] 定期レポートメール配信
- [ ] カスタムレポート作成

## 収集するメトリクス

### クリエイティブレベル
```typescript
interface CreativeMetrics {
  impressions: number;      // 表示回数
  clicks: number;           // クリック数
  ctr: number;              // クリック率
  shares: number;           // 共有数
  brandFitScore: number;    // AIブランド適合スコア
  engagementRate: number;   // エンゲージメント率
}
```

### ブランドレベル
```typescript
interface BrandMetrics {
  totalCreatives: number;
  totalAssets: number;
  avgBrandFitScore: number;
  topPerformingCreatives: string[];
  designSystemProgress: number;
}
```

## 技術的要件
- [ ] Cloud Functions: `trackImpression`, `trackClick`, `aggregateDaily`
- [ ] Firestoreインデックス設計
- [ ] リアルタイムダッシュボード更新（Firestore listeners）
- [ ] グラフライブラリ選定（Recharts推奨）

## 優先度
Medium

## ラベル
`enhancement`, `backend`, `frontend`, `analytics`
