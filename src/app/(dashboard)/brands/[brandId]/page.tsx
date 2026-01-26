"use client";

import { useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBrands } from "@/hooks/useBrands";
import { useAssets } from "@/hooks/useAssets";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  FolderOpen,
  Palette,
  Wand2,
  ArrowLeft,
  Upload,
  Settings,
} from "lucide-react";

interface BrandDetailPageProps {
  params: Promise<{ brandId: string }>;
}

export default function BrandDetailPage({ params }: BrandDetailPageProps) {
  const { brandId } = use(params);
  const router = useRouter();
  const { currentBrand, loading: brandLoading, selectBrand } = useBrands();
  const { assets, loading: assetsLoading, fetchAssets } = useAssets();

  useEffect(() => {
    if (brandId) {
      selectBrand(brandId);
      fetchAssets(brandId);
    }
  }, [brandId, selectBrand, fetchAssets]);

  if (brandLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!currentBrand) {
    return (
      <div className="space-y-4">
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{currentBrand.name}</h1>
            <p className="text-muted-foreground">
              {currentBrand.description || "説明なし"}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="assets">資産</TabsTrigger>
          <TabsTrigger value="design-system">デザインシステム</TabsTrigger>
          <TabsTrigger value="creatives">クリエイティブ</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">資産数</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {assetsLoading ? "-" : assets.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  デザインシステム
                </CardTitle>
                <Palette className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">未設定</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  クリエイティブ
                </CardTitle>
                <Wand2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>クイックアクション</CardTitle>
                <CardDescription>
                  このブランドでよく使う機能
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/assets?brandId=${brandId}`}>
                    <Upload className="mr-2 h-4 w-4" />
                    資産をアップロード
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/design-system?brandId=${brandId}`}>
                    <Palette className="mr-2 h-4 w-4" />
                    デザインシステムを編集
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/creatives?brandId=${brandId}`}>
                    <Wand2 className="mr-2 h-4 w-4" />
                    クリエイティブを生成
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ブランド設定</CardTitle>
                <CardDescription>
                  ブランドの基本情報を管理
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/brands/${brandId}/settings`}>
                    <Settings className="mr-2 h-4 w-4" />
                    設定を開く
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assets">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>ブランド資産</CardTitle>
                  <CardDescription>
                    アップロードされた資産を管理します
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link href={`/assets?brandId=${brandId}`}>
                    <Upload className="mr-2 h-4 w-4" />
                    アップロード
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {assetsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : assets.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    まだ資産がアップロードされていません
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href={`/assets?brandId=${brandId}`}>
                      <Upload className="mr-2 h-4 w-4" />
                      最初の資産をアップロード
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="rounded-lg border p-4 space-y-2"
                    >
                      <p className="font-medium truncate">{asset.fileName}</p>
                      <p className="text-sm text-muted-foreground">
                        {asset.fileType}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="design-system">
          <Card>
            <CardHeader>
              <CardTitle>デザインシステム</CardTitle>
              <CardDescription>
                ブランドのデザインシステムを管理します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Palette className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  デザインシステムはまだ設定されていません
                </p>
                <Button className="mt-4" asChild>
                  <Link href={`/design-system?brandId=${brandId}`}>
                    <Palette className="mr-2 h-4 w-4" />
                    デザインシステムを設定
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="creatives">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>クリエイティブ</CardTitle>
                  <CardDescription>
                    AIが生成したクリエイティブを管理します
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link href={`/creatives?brandId=${brandId}`}>
                    <Wand2 className="mr-2 h-4 w-4" />
                    新規生成
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Wand2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  まだクリエイティブが生成されていません
                </p>
                <Button className="mt-4" asChild>
                  <Link href={`/creatives?brandId=${brandId}`}>
                    <Wand2 className="mr-2 h-4 w-4" />
                    最初のクリエイティブを生成
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
