# アカウント削除機能の実装

## 概要
設定ページにアカウント削除ボタンが存在するが、「現在準備中です」と表示され機能が無効化されている。

## 現状
- **ファイル**: `src/app/(dashboard)/settings/page.tsx` (line 170)
- **状態**: UIは存在するがボタンが `disabled` で機能していない

## 実装要件

### 機能要件
- [ ] ユーザーがアカウントを完全に削除できる
- [ ] 削除前に確認ダイアログを表示
- [ ] 削除時にパスワード再入力を要求（セキュリティ確保）
- [ ] 関連データの削除処理

### 削除対象データ
1. **Firebase Authentication**: ユーザーアカウント
2. **Firestore コレクション**:
   - `users/{userId}` - ユーザープロファイル
   - `brands` (where ownerId == userId) - 所有ブランド
   - `assets` (関連ブランドのアセット)
   - `creatives` (関連ブランドのクリエイティブ)
   - `designSystems` (関連ブランドのデザインシステム)
3. **Firebase Storage**: ユーザー関連のアップロードファイル

### 技術的考慮事項
- Cloud Function `deleteUser` の作成が必要
- カスケード削除のトランザクション処理
- 削除確認メールの送信（オプション）

## 関連ドキュメント
- `TECHNICAL_DESIGN.md` - セキュリティ要件

## 優先度
Medium

## ラベル
`enhancement`, `backend`, `frontend`, `security`
