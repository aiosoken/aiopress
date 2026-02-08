"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { User, Mail, Save, Trash2, Loader2, Printer, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { updateUserProfile } from "@/lib/firebase/auth";
import { deleteAccountFunction, saveEpsonSettingsFunction, getEpsonSettingsFunction } from "@/lib/firebase/functions";

export default function SettingsPage() {
  const router = useRouter();
  const { firebaseUser } = useAuthContext();
  const [displayName, setDisplayName] = useState(firebaseUser?.displayName || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Epson Connect 設定
  const [epsonPrinterEmail, setEpsonPrinterEmail] = useState("");
  const [epsonClientId, setEpsonClientId] = useState("");
  const [epsonClientSecret, setEpsonClientSecret] = useState("");
  const [epsonConnected, setEpsonConnected] = useState(false);
  const [epsonPrinterName, setEpsonPrinterName] = useState("");
  const [isEpsonSaving, setIsEpsonSaving] = useState(false);
  const [isEpsonLoading, setIsEpsonLoading] = useState(true);

  useEffect(() => {
    loadEpsonSettings();
  }, []);

  const loadEpsonSettings = async () => {
    try {
      const result = await getEpsonSettingsFunction({});
      if (result.data.configured) {
        setEpsonConnected(true);
        setEpsonPrinterEmail(result.data.printerEmail || "");
        setEpsonPrinterName(result.data.printerName || "");
      }
    } catch (error) {
      console.error("Failed to load Epson settings:", error);
    } finally {
      setIsEpsonLoading(false);
    }
  };

  const handleEpsonSave = async () => {
    if (!epsonPrinterEmail.trim() || !epsonClientId.trim() || !epsonClientSecret.trim()) {
      toast.error("すべての項目を入力してください");
      return;
    }
    setIsEpsonSaving(true);
    try {
      const result = await saveEpsonSettingsFunction({
        printerEmail: epsonPrinterEmail.trim(),
        clientId: epsonClientId.trim(),
        clientSecret: epsonClientSecret.trim(),
      });
      if (result.data.success) {
        setEpsonConnected(true);
        setEpsonPrinterName(result.data.printerName || "");
        setEpsonClientId("");
        setEpsonClientSecret("");
        toast.success(result.data.message || "Epson Connect に接続しました");
      }
    } catch (error: any) {
      console.error("Failed to save Epson settings:", error);
      toast.error(error.message || "接続に失敗しました。認証情報を確認してください。");
    } finally {
      setIsEpsonSaving(false);
    }
  };

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
        <h1 className="heading-page text-foreground">設定</h1>
        <p className="text-sm text-muted-foreground mt-2">
          アカウント設定とプロフィールを管理します
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">プロフィール</CardTitle>
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
                <AvatarFallback className="text-2xl bg-gradient-to-br from-muted to-muted/50 font-bold">
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
            <CardTitle className="text-base font-semibold">アカウント情報</CardTitle>
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

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/10">
                    <Printer className="h-3.5 w-3.5 text-blue-500" />
                  </div>
                  Epson Connect
                </CardTitle>
                <CardDescription>
                  プリンターと連携してクリエイティブを直接印刷できます
                </CardDescription>
              </div>
              {!isEpsonLoading && (
                <Badge
                  variant="outline"
                  className={
                    epsonConnected
                      ? "text-emerald-600 border-emerald-300"
                      : "text-muted-foreground"
                  }
                >
                  {epsonConnected ? (
                    <>
                      <CheckCircle className="mr-1 h-3 w-3" />
                      接続済み
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-1 h-3 w-3" />
                      未設定
                    </>
                  )}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {epsonConnected && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 p-4 border border-emerald-200/50">
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  プリンター: {epsonPrinterName || epsonPrinterEmail}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  クリエイティブページから印刷できます
                </p>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                <a
                  href="https://developer.epsonconnect.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Epson Connect 開発者ポータル
                </a>
                でアプリを作成し、認証情報を取得してください。
              </p>

              <div className="space-y-2">
                <Label htmlFor="epsonPrinterEmail">プリンターメールアドレス</Label>
                <Input
                  id="epsonPrinterEmail"
                  type="email"
                  value={epsonPrinterEmail}
                  onChange={(e) => setEpsonPrinterEmail(e.target.value)}
                  placeholder="printer@print.epsonconnect.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="epsonClientId">Client ID</Label>
                <Input
                  id="epsonClientId"
                  value={epsonClientId}
                  onChange={(e) => setEpsonClientId(e.target.value)}
                  placeholder={epsonConnected ? "••••••••（設定済み）" : "Client IDを入力"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="epsonClientSecret">Client Secret</Label>
                <Input
                  id="epsonClientSecret"
                  type="password"
                  value={epsonClientSecret}
                  onChange={(e) => setEpsonClientSecret(e.target.value)}
                  placeholder={epsonConnected ? "••••••••（設定済み）" : "Client Secretを入力"}
                />
              </div>
            </div>

            <Button onClick={handleEpsonSave} disabled={isEpsonSaving}>
              {isEpsonSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  接続テスト中...
                </>
              ) : (
                <>
                  <Printer className="mr-2 h-4 w-4" />
                  {epsonConnected ? "再接続" : "接続テスト＆保存"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-destructive/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-destructive">危険な操作</CardTitle>
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
