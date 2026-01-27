# 未実装機能 Issue一覧

このディレクトリには、AIOプレスで未実装または不完全な機能のIssue定義が含まれています。

## 概要

| # | Issue | 優先度 | カテゴリ |
|---|-------|--------|----------|
| 001 | [アカウント削除機能](./001-account-deletion.md) | Medium | Security |
| 002 | [画像生成機能 (Imagen API)](./002-image-generation.md) | High | AI |
| 003 | [Epsonハードウェア統合](./003-epson-integration.md) | Low | Hardware |
| 004 | [ブランドメンバー管理UI](./004-brand-member-management.md) | Medium | Collaboration |
| 005 | [分析・レポート機能](./005-analytics-reporting.md) | Medium | Analytics |
| 006 | [クリエイティブ公開/共有機能](./006-creative-publishing.md) | Medium | Sharing |
| 007 | [検索機能実装](./007-search-functionality.md) | Medium | UX |
| 008 | [ブランドロゴアップロード機能](./008-brand-logo-upload.md) | Low | UX |
| 009 | [設定保存機能の実装](./009-settings-save-functionality.md) | Medium | Bug |
| 010 | [Brand Fit Scoreの計算実装](./010-brand-fit-score-calculation.md) | Medium | AI |

## 優先度別

### High (高優先度)
- #002 画像生成機能 (Imagen API)

### Medium (中優先度)
- #001 アカウント削除機能
- #004 ブランドメンバー管理UI
- #005 分析・レポート機能
- #006 クリエイティブ公開/共有機能
- #007 検索機能実装
- #009 設定保存機能の実装
- #010 Brand Fit Scoreの計算実装

### Low (低優先度)
- #003 Epsonハードウェア統合
- #008 ブランドロゴアップロード機能

## 実装状況サマリー

```
全体実装率: 約65%

✓ 完了済み: 認証、ブランド管理、アセット管理、デザインシステム、クリエイティブ生成（一部）
△ 一部実装: 検索UI、設定ページUI、画像生成（プロンプトのみ）
✗ 未実装: Epson統合、分析機能、チーム機能、公開/共有機能
```

## ラベル定義

- `enhancement` - 新機能追加
- `bug` - バグ修正（ダミー実装の修正含む）
- `backend` - バックエンド（Cloud Functions）作業
- `frontend` - フロントエンド（React/Next.js）作業
- `ai` - AI関連機能
- `security` - セキュリティ関連
- `ux` - ユーザー体験改善
- `hardware` - ハードウェア連携
- `phase-2` - Phase 2での実装予定

## GitHubへのIssue登録

これらのIssueをGitHubに登録する場合:

```bash
# GitHub CLIを使用
gh issue create --title "タイトル" --body-file .github/ISSUES/001-account-deletion.md

# または手動でGitHub Webインターフェースから内容をコピー
```
