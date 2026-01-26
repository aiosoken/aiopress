"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  FolderOpen,
  Palette,
  Sparkles,
  Upload,
  FileText,
  FileImage,
  Building2,
  Plus,
  ArrowRight,
  Twitter,
  Wand2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuthContext, useBrandsContext } from "@/components/providers";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import type { CreativeType } from "@/types";

function getTypeIcon(type: CreativeType) {
  switch (type) {
    case "CATCH_COPY":
      return <Sparkles className="h-4 w-4 text-primary" />;
    case "SNS_POST":
      return <Twitter className="h-4 w-4 text-primary" />;
    case "ARTICLE":
      return <FileText className="h-4 w-4 text-primary" />;
    case "IMAGE":
      return <Wand2 className="h-4 w-4 text-primary" />;
    default:
      return <Wand2 className="h-4 w-4 text-primary" />;
  }
}

function getTypeLabel(type: CreativeType) {
  switch (type) {
    case "CATCH_COPY":
      return "キャッチコピー";
    case "SNS_POST":
      return "SNS投稿";
    case "ARTICLE":
      return "記事";
    case "IMAGE":
      return "画像";
    default:
      return type;
  }
}

function formatRelativeTime(timestamp: { toMillis?: () => number } | undefined): string {
  if (!timestamp || !timestamp.toMillis) return "";
  
  const now = Date.now();
  const diff = now - timestamp.toMillis();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}分前`;
  if (hours < 24) return `${hours}時間前`;
  return `${days}日前`;
}

export function DashboardContent() {
  const { firebaseUser } = useAuthContext();
  const { brands, loading: brandsLoading } = useBrandsContext();

  const brandIds = useMemo(() => brands.map((b) => b.id), [brands]);
  const { stats, loading: statsLoading } = useDashboardStats(brandIds);

  const updatedStats = useMemo(
    () => [
      {
        title: "ブランド数",
        value: brandsLoading ? "-" : brands.length.toString(),
        icon: Building2,
        color: "bg-blue-500/10 text-blue-600",
      },
      {
        title: "資産数",
        value: statsLoading ? "-" : stats.totalAssets.toString(),
        icon: FolderOpen,
        color: "bg-emerald-500/10 text-emerald-600",
      },
      {
        title: "クリエイティブ",
        value: statsLoading ? "-" : stats.totalCreatives.toString(),
        icon: Sparkles,
        color: "bg-amber-500/10 text-amber-600",
      },
      {
        title: "デザインシステム",
        value: statsLoading ? "-" : `${stats.designSystemProgress}%`,
        icon: Palette,
        color: "bg-primary/10 text-primary",
      },
    ],
    [brandsLoading, brands.length, statsLoading, stats]
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">ダッシュボード</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {firebaseUser?.displayName || "ユーザー"}さん、おかえりなさい
          </p>
        </div>
        <Button className="gap-2" asChild>
          <Link href="/assets">
            <Upload className="h-4 w-4" />
            資産をアップロード
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {updatedStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Brand List */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-medium">ブランド一覧</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary" asChild>
              <Link href="/brands">すべて表示</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {brandsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : brands.length === 0 ? (
              <div className="text-center py-8 px-6">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
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
              <div className="divide-y divide-border">
                {brands.slice(0, 5).map((brand) => (
                  <div
                    key={brand.id}
                    className="flex items-center gap-4 px-6 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {brand.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {brand.description || "説明なし"}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href={`/brands/${brand.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Design System Progress */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">デザインシステム進捗</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {statsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : brands.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  ブランドを作成してデザインシステムを設定しましょう
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">全体の進捗</span>
                    <span className="font-medium text-foreground">{stats.designSystemProgress}%</span>
                  </div>
                  <Progress value={stats.designSystemProgress} className="h-2" />
                </div>
                <p className="text-xs text-muted-foreground">
                  デザインシステムを設定すると、AIがより適切なクリエイティブを生成できます
                </p>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/design-system">
                    <Palette className="mr-2 h-4 w-4" />
                    デザインシステムを編集
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">クイックアクション</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent" asChild>
                <Link href="/assets">
                  <Upload className="h-5 w-5 text-primary" />
                  <span className="text-sm">資産アップロード</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent" asChild>
                <Link href="/creatives">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="text-sm">コンテンツ生成</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent" asChild>
                <Link href="/design-system">
                  <Palette className="h-5 w-5 text-primary" />
                  <span className="text-sm">デザイン編集</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent" asChild>
                <Link href="/brands/new">
                  <Plus className="h-5 w-5 text-primary" />
                  <span className="text-sm">新規ブランド</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Creatives */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-medium">最近のクリエイティブ</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary" asChild>
              <Link href="/creatives">すべて表示</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {statsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : stats.recentCreatives.length === 0 ? (
              <div className="text-center py-8">
                <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  まだクリエイティブがありません
                </p>
                <Button className="mt-4" size="sm" asChild>
                  <Link href="/creatives">
                    <Sparkles className="mr-2 h-4 w-4" />
                    クリエイティブを生成
                  </Link>
                </Button>
              </div>
            ) : (
              stats.recentCreatives.map((creative) => (
                <div
                  key={creative.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      {getTypeIcon(creative.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {creative.prompt || getTypeLabel(creative.type)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(creative.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {getTypeLabel(creative.type)}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
