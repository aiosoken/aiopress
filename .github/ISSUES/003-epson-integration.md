# Epsonハードウェア統合

## 概要
技術設計書に記載されているEpson Connect APIとの連携機能が全く実装されていない。スキャナー、プリンター、プロジェクターとの連携を実装する必要がある。

## 現状
- **設計**: `TECHNICAL_DESIGN.md` に詳細設計あり
- **実装**: 0% - コードは一切存在しない
- **想定ディレクトリ**: `src/lib/epson/` - 未作成

## 実装要件

### Phase 1: スキャナー連携 (DS-970)
- [ ] Epson Connect API認証フロー
- [ ] スキャンジョブの作成・管理
- [ ] スキャン画像の取得・保存
- [ ] アセットへの自動登録

### Phase 2: プリンター連携 (Business Inkjet)
- [ ] 印刷ジョブの作成
- [ ] クリエイティブの印刷出力
- [ ] 印刷プレビュー機能
- [ ] 印刷設定（用紙サイズ、品質等）

### Phase 3: プロジェクター連携
- [ ] プロジェクター検出
- [ ] コンテンツ投影
- [ ] リモートコントロール

## 技術的要件

### Epson Connect API
```
Base URL: https://api.epsonconnect.com/
認証: OAuth 2.0
対象デバイス:
- スキャナー: DS-970
- プリンター: Business Inkjet シリーズ
- プロジェクター: (型番TBD)
```

### 必要なCloud Functions
- `epson/authenticate` - OAuth認証
- `epson/scan` - スキャンジョブ管理
- `epson/print` - 印刷ジョブ管理
- `epson/devices` - デバイス一覧取得

### 必要なUI
- デバイス接続設定ページ
- スキャン操作パネル
- 印刷プレビュー・設定ダイアログ

## 関連ドキュメント
- `TECHNICAL_DESIGN.md` - Epson Connect API設計セクション

## 優先度
Low (Phase 2 feature)

## ラベル
`enhancement`, `hardware`, `epson`, `phase-2`
