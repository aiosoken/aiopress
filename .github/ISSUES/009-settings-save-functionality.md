# 設定保存機能の実装

## 概要
設定ページの保存ハンドラーがダミー実装（1秒待機するだけ）になっており、実際のデータ永続化が行われていない。

## 現状
- **ファイル**: `src/app/(dashboard)/settings/page.tsx` (lines 82-90)
- **状態**: `setTimeout` で1秒待機後、成功トーストを表示するのみ

### 現在のコード
```typescript
const handleSave = async () => {
  setIsSaving(true);
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("設定を保存しました");
  } finally {
    setIsSaving(false);
  }
};
```

## 実装要件

### 保存対象設定
- [ ] 通知設定
  - メール通知のON/OFF
  - 通知頻度
- [ ] 表示設定
  - 言語
  - タイムゾーン
  - テーマ（ダーク/ライト）
- [ ] セキュリティ設定
  - 二要素認証
  - セッションタイムアウト

### 技術的要件
- [ ] Firestoreの `users/{userId}/settings` サブコレクション作成
- [ ] 設定スキーマ定義
- [ ] 設定読み込み（ページ初期化時）
- [ ] 設定保存（リアルタイム更新）
- [ ] 楽観的更新（UI即時反映）

### 設定スキーマ
```typescript
interface UserSettings {
  notifications: {
    email: boolean;
    frequency: 'realtime' | 'daily' | 'weekly';
  };
  display: {
    language: 'ja' | 'en';
    timezone: string;
    theme: 'light' | 'dark' | 'system';
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number; // minutes
  };
}
```

### バリデーション
- 必須フィールドのチェック
- 値の範囲チェック
- 変更検出（保存ボタンの有効/無効制御）

## 優先度
Medium

## ラベル
`bug`, `backend`, `frontend`
