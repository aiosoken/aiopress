"use client";

import { useEffect, use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBrandsContext } from "@/components/providers";
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
import { Textarea } from "@/components/ui/textarea";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Building2,
  ArrowLeft,
  Save,
  Trash2,
  Loader2,
  Upload,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { uploadLogo } from "@/lib/firebase/storage";
import { updateBrand } from "@/lib/firebase/firestore";
import { BrandMembersCard } from "@/components/features/brand-members/BrandMembersCard";

interface BrandSettingsPageProps {
  params: Promise<{ brandId: string }>;
}

export default function BrandSettingsPage({ params }: BrandSettingsPageProps) {
  const { brandId } = use(params);
  const router = useRouter();
  const { currentBrand, loading: brandLoading, selectBrand, editBrand, removeBrand } = useBrandsContext();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    if (brandId) {
      selectBrand(brandId);
    }
  }, [brandId, selectBrand]);

  useEffect(() => {
    if (currentBrand) {
      setName(currentBrand.name);
      setDescription(currentBrand.description || "");
      setLogoUrl(currentBrand.logoUrl || "");
    }
  }, [currentBrand]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ファイルサイズは5MB以下にしてください");
      return;
    }
    setUploadingLogo(true);
    try {
      const { downloadUrl } = await uploadLogo(brandId, file);
      await updateBrand(brandId, { logoUrl: downloadUrl } as any);
      setLogoUrl(downloadUrl);
      toast.success("ロゴをアップロードしました");
    } catch (error) {
      console.error("Failed to upload logo:", error);
      toast.error("ロゴのアップロードに失敗しました");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    setSaving(true);
    try {
      await editBrand(brandId, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      router.push(`/brands/${brandId}`);
    } catch (error) {
      console.error("Failed to update brand:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await removeBrand(brandId);
      router.push("/brands");
    } catch (error) {
      console.error("Failed to delete brand:", error);
      setDeleting(false);
    }
  };

  if (brandLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!currentBrand) {
    return (
      <div className="space-y-4 p-4 md:p-6 lg:p-8">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          戻る
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">
              ブランドが見つかりません
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              指定されたブランドは存在しないか、アクセス権限がありません
            </p>
            <Button className="mt-6" asChild>
              <Link href="/brands">ブランド一覧に戻る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
          <Link href={`/brands/${brandId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">ブランド設定</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {currentBrand.name}の設定を管理します
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">ブランドロゴ</CardTitle>
            <CardDescription>
              ブランドのロゴ画像をアップロードします
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 rounded-lg">
                <AvatarImage src={logoUrl || undefined} alt="Brand logo" className="object-cover" />
                <AvatarFallback className="rounded-lg bg-primary/10">
                  <ImageIcon className="h-8 w-8 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" disabled={uploadingLogo} asChild>
                  <label className="cursor-pointer">
                    {uploadingLogo ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        アップロード中...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        ロゴを変更
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </label>
                </Button>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WebP（最大5MB）
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">基本情報</CardTitle>
            <CardDescription>
              ブランドの名前と説明を編集します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">ブランド名</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ブランド名を入力"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ブランドの説明を入力（任意）"
                rows={4}
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="w-full sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  変更を保存
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <BrandMembersCard brandId={brandId} />

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-base font-medium text-destructive">危険な操作</CardTitle>
            <CardDescription>
              この操作は取り消すことができません
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deleting}>
                  {deleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      削除中...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      ブランドを削除
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                  <AlertDialogDescription>
                    「{currentBrand.name}」を削除すると、関連するすべての資産、デザインシステム、クリエイティブも削除されます。この操作は取り消すことができません。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    削除する
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
