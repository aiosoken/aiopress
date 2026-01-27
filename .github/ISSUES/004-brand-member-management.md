# ブランドメンバー管理UI

## 概要
ブランドを複数ユーザーで共有・管理するためのUIが存在しない。バックエンドのスキーマ（`brandMembers`コレクション）は定義されているが、操作するUIがない。

## 現状
- **型定義**: `src/types/index.ts` に `BrandMember` 型あり
- **Firestoreスキーマ**: `brandMembers` コレクション設計あり
- **UI**: 未実装

### 既存の型定義
```typescript
export type BrandMember = {
  id: string;
  brandId: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  invitedAt: Date;
  joinedAt?: Date;
};
```

## 実装要件

### 機能要件
- [ ] メンバー招待機能（メールアドレスで招待）
- [ ] 招待リンク生成
- [ ] メンバー一覧表示
- [ ] ロール変更（OWNER, ADMIN, MEMBER）
- [ ] メンバー削除
- [ ] オーナーシップ譲渡
- [ ] 招待の承認/拒否フロー

### UIコンポーネント
- [ ] メンバー一覧テーブル
- [ ] 招待ダイアログ
- [ ] ロール選択ドロップダウン
- [ ] 招待ステータスバッジ（pending, accepted, rejected）
- [ ] オーナーシップ譲渡確認ダイアログ

### ロール権限
| 権限 | OWNER | ADMIN | MEMBER |
|------|-------|-------|--------|
| ブランド設定変更 | ✓ | ✓ | ✗ |
| メンバー招待 | ✓ | ✓ | ✗ |
| メンバー削除 | ✓ | ✓ | ✗ |
| アセット管理 | ✓ | ✓ | ✓ |
| クリエイティブ作成 | ✓ | ✓ | ✓ |
| ブランド削除 | ✓ | ✗ | ✗ |
| オーナーシップ譲渡 | ✓ | ✗ | ✗ |

### 想定UI配置
- ブランド設定ページ (`/brands/[brandId]/settings`) にメンバータブ追加

## 優先度
Medium

## ラベル
`enhancement`, `frontend`, `collaboration`
