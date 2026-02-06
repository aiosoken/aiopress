"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/providers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Save, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateUserProfile } from "@/lib/firebase/auth";
import { deleteAccountFunction } from "@/lib/firebase/functions";

export default function SettingsPage() {
  const router = useRouter();
  const { firebaseUser } = useAuthContext();
  const [displayName, setDisplayName] = useState(firebaseUser?.displayName || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    if (!displayName.trim()) {
      toast.error("表示名を入力してください");
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile(displayName.trim());
      toast.success("設定を保存しました");
    } catch (error: any) {
      console.error("Failed to save settings:", error);
      toast.error(error.message || "保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">設定</h1>
        <p className="text-sm text-muted-foreground mt-1">
          アカウント設定とプロフィールを管理します
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">プロフィール</CardTitle>
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
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">アカウント情報</CardTitle>
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
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium text-destructive">危険な操作</CardTitle>
            <CardDescription>
              これらの操作は取り消すことができません
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      削除中...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      アカウントを削除
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>本当にアカウントを削除しますか？</AlertDialogTitle>
                  <AlertDialogDescription>
                    アカウントを削除すると、すべてのブランド、資産、クリエイティブ、デザインシステムのデータが完全に削除されます。この操作は取り消すことができません。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={async () => {
                      setIsDeleting(true);
                      try {
                        await deleteAccountFunction({});
                        toast.success("アカウントを削除しました");
                        router.push("/login");
                      } catch (error: any) {
                        console.error("Failed to delete account:", error);
                        toast.error(error.message || "アカウント削除に失敗しました");
                        setIsDeleting(false);
                      }
                    }}
                  >
                    削除する
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <p className="mt-2 text-xs text-muted-foreground">
              所有するすべてのブランドとデータが完全に削除されます
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
