"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuthContext } from "@/components/providers";
import { useBrands } from "@/hooks/useBrands";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building2,
  FolderOpen,
  Wand2,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const { firebaseUser } = useAuthContext();
  const { brands, loading: brandsLoading, fetchBrands } = useBrands();

  useEffect(() => {
    if (firebaseUser) {
      fetchBrands(firebaseUser.uid);
    }
  }, [firebaseUser, fetchBrands]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
          <p className="text-muted-foreground">
            {firebaseUser?.displayName || "ユーザー"}さん、おかえりなさい
          </p>
        </div>
        <Button asChild>
          <Link href="/brands/new">
            <Plus className="mr-2 h-4 w-4" />
            新規ブランド作成
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ブランド数</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {brandsLoading ? "-" : brands.length}
            </div>
            <p className="text-xs text-muted-foreground">
              管理中のブランド
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">資産数</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              アップロード済み資産
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">生成数</CardTitle>
            <Wand2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              今月のクリエイティブ生成
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ブランド一覧</CardTitle>
            <CardDescription>
              管理中のブランドを確認・編集できます
            </CardDescription>
          </CardHeader>
          <CardContent>
            {brandsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : brands.length === 0 ? (
              <div className="text-center py-8">
                <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  まだブランドがありません
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/brands/new">
                    <Plus className="mr-2 h-4 w-4" />
                    最初のブランドを作成
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {brands.slice(0, 3).map((brand) => (
                  <div
                    key={brand.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{brand.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {brand.description || "説明なし"}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/brands/${brand.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
                {brands.length > 3 && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/brands">
                      すべてのブランドを見る
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>クイックアクション</CardTitle>
            <CardDescription>
              よく使う機能にすばやくアクセス
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/brands/new">
                <Plus className="mr-2 h-4 w-4" />
                新規ブランドを作成
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/assets">
                <FolderOpen className="mr-2 h-4 w-4" />
                資産をアップロード
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/creatives">
                <Wand2 className="mr-2 h-4 w-4" />
                クリエイティブを生成
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
