"use client";

import { useState } from "react";
import { useAuthContext } from "@/components/providers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Save } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { firebaseUser } = useAuthContext();
  const [displayName, setDisplayName] = useState(firebaseUser?.displayName || "");
  const [isSaving, setIsSaving] = useState(false);

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("設定を保存しました");
    } catch (error) {
      toast.error("保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">設定</h1>
        <p className="text-muted-foreground">
          アカウント設定とプロフィールを管理します
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>プロフィール</CardTitle>
            <CardDescription>
              あなたのプロフィール情報を管理します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={firebaseUser?.photoURL || undefined}
                  alt={firebaseUser?.displayName || "User"}
                />
                <AvatarFallback className="text-2xl">
                  {getInitials(firebaseUser?.displayName || null)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">プロフィール画像</h3>
                <p className="text-sm text-muted-foreground">
                  Googleアカウントの画像が使用されます
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">表示名</Label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="表示名を入力"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={firebaseUser?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  メールアドレスは変更できません
                </p>
              </div>
            </div>

            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "保存中..." : "変更を保存"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>アカウント情報</CardTitle>
            <CardDescription>
              アカウントの詳細情報
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  ユーザーID
                </dt>
                <dd className="mt-1 text-sm font-mono">
                  {firebaseUser?.uid || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  認証プロバイダー
                </dt>
                <dd className="mt-1 text-sm">
                  {firebaseUser?.providerData?.[0]?.providerId === "google.com"
                    ? "Google"
                    : "メール/パスワード"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  メール確認
                </dt>
                <dd className="mt-1 text-sm">
                  {firebaseUser?.emailVerified ? "確認済み" : "未確認"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">危険な操作</CardTitle>
            <CardDescription>
              これらの操作は取り消すことができません
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" disabled>
              アカウントを削除
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              アカウント削除機能は現在準備中です
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
