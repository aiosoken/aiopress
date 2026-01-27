# 画像生成機能の実装 (Imagen API)

## 概要
現在、画像生成機能はプロンプト最適化のみを行い、実際の画像生成は行われていない。Imagen APIを使用した実際の画像生成を実装する必要がある。

## 現状
- **ファイル**: `functions/src/creatives.ts` (lines 106-156)
- **状態**: Geminiでプロンプトを最適化するのみ
- **現在の戻り値**: 「画像生成機能は現在開発中です」というメッセージ

### 現在のコードコメント
```typescript
// 注意: Imagen APIは現在Vertex AI SDKで直接サポートされていないため、
// REST APIを使用する必要があります
// ここでは簡易実装として、Geminiでプロンプトを最適化し、
// 実際の画像生成は将来実装
```

## 実装要件

### 機能要件
- [ ] Imagen API (Vertex AI) を使用した画像生成
- [ ] 生成された画像をFirebase Storageに保存
- [ ] 画像のサムネイル生成
- [ ] 複数バリエーションの生成オプション

### 技術的要件
- [ ] Vertex AI REST APIの統合
- [ ] 画像生成のジョブキュー実装（長時間処理対応）
- [ ] ステータス追跡（generating → completed / failed）
- [ ] エラーハンドリングとリトライロジック

### API連携
```
Vertex AI Imagen API
- Endpoint: aiplatform.googleapis.com
- Model: imagegeneration@006
- Input: 最適化されたプロンプト
- Output: Base64エンコードされた画像
```

## 関連ドキュメント
- `TECHNICAL_DESIGN.md` - Vertex AI設計
- `AIO_PRESS_ULTIMATE_SPECIFICATION_v2.md` - クリエイティブ機能仕様

## 優先度
High

## ラベル
`enhancement`, `backend`, `ai`, `vertex-ai`
