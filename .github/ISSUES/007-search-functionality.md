# 検索機能の実装

## 概要
ダッシュボードヘッダーに検索入力欄が存在するが、実際の検索ロジックが実装されていない。

## 現状
- **ファイル**: `src/components/dashboard-header.tsx`
- **状態**: UIのみ存在、プレースホルダー「Search assets, creatives...」
- **検索ロジック**: 未実装

## 実装要件

### 検索対象
1. **アセット**
   - ファイル名
   - 分析結果（ラベル、OCRテキスト）
   - タグ

2. **クリエイティブ**
   - タイトル
   - コンテンツ本文
   - タイプ（catchcopy, sns_post, article, image_prompt）

3. **ブランド**
   - ブランド名
   - 説明

### 機能要件
- [ ] グローバル検索（全カテゴリ横断）
- [ ] カテゴリフィルター
- [ ] 検索結果のハイライト
- [ ] 検索履歴
- [ ] オートコンプリート/サジェスト
- [ ] キーボードショートカット（Cmd/Ctrl + K）

### UI/UX
- [ ] コマンドパレット風UI（shadcn/ui Command）
- [ ] 検索結果プレビュー
- [ ] 結果クリックで該当ページへ遷移
- [ ] ローディング状態表示

### 技術的要件

#### オプション1: クライアントサイド検索
```typescript
// Fuse.js を使用した全文検索
import Fuse from 'fuse.js';

const fuse = new Fuse(items, {
  keys: ['name', 'content', 'tags'],
  threshold: 0.3,
});
```

#### オプション2: Firestore全文検索（Algolia連携）
```typescript
// Algolia統合によるサーバーサイド検索
// より大規模なデータセット向け
```

## 推奨実装
1. 初期実装: Fuse.jsでクライアントサイド検索
2. スケール時: Algolia/Elasticsearchに移行

## 優先度
Medium

## ラベル
`enhancement`, `frontend`, `ux`
