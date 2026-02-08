"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  FolderOpen,
  Sparkles,
  Upload,
  FileText,
  Building2,
  Plus,
  ArrowRight,
  Wand2,
  Dna,
  ImageIcon,
  MessageSquare,
  TrendingUp,
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
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case "ARTICLE":
      return <FileText className="h-4 w-4 text-emerald-500" />;
    case "IMAGE":
      return <Wand2 className="h-4 w-4 text-purple-500" />;
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

  const statCards = useMemo(
    () => [
      {
        title: "ブランド数",
        value: brandsLoading ? "-" : brands.length.toString(),
        icon: Building2,
        border: "bg-gradient-card-blue",
        iconColor: "text-primary",
      },
      {
        title: "資産数",
        value: statsLoading ? "-" : stats.totalAssets.toString(),
        icon: FolderOpen,
        border: "bg-gradient-card-emerald",
        iconColor: "text-emerald-500",
      },
      {
        title: "クリエイティブ",
        value: statsLoading ? "-" : stats.totalCreatives.toString(),
        icon: Sparkles,
        border: "bg-gradient-card-purple",
        iconColor: "text-purple-500",
      },
      {
        title: "ブランドDNA",
        value: statsLoading ? "-" : `${stats.designSystemProgress}%`,
        icon: Dna,
        border: "bg-gradient-card-orange",
        iconColor: "text-amber-500",
      },
    ],
    [brandsLoading, brands.length, statsLoading, stats]
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-page text-foreground">ダッシュボード</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {firebaseUser?.displayName || "ユーザー"}さん、おかえりなさい
          </p>
        </div>
        <Button asChild>
          <Link href="/assets">
            <Upload className="mr-2 h-4 w-4" />
            資産をアップロード
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.title} className={`stat-card ${stat.border}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
              </div>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-muted ${stat.iconColor}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Brand List */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-medium">ブランド一覧</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary text-sm" asChild>
              <Link href="/brands">すべて表示</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {brandsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : brands.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-muted">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  まだブランドがありません
                </p>
                <Button className="mt-3" size="sm" asChild>
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
                    className="flex items-center gap-3 px-6 py-3 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white text-sm font-medium">
                      {brand.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {brand.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {brand.description || "説明なし"}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
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
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">ブランドDNA進捗</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : brands.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">
                  ブランドを作成してブランドDNAを設定しましょう
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
                <div className="rounded-lg bg-accent p-3 border border-primary/10">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      ブランドDNAを設定すると、AIがより適切なクリエイティブを生成できます
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/design-system">
                    <Dna className="mr-2 h-4 w-4" />
                    ブランドDNAを編集
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">クイックアクション</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/assets", icon: Upload, label: "資産アップロード", color: "text-primary" },
                { href: "/creatives", icon: Sparkles, label: "コンテンツ生成", color: "text-purple-500" },
                { href: "/design-system", icon: Dna, label: "ブランドDNA", color: "text-emerald-500" },
                { href: "/brands/new", icon: Plus, label: "新規ブランド", color: "text-blue-500" },
              ].map((action) => (
                <Button
                  key={action.href}
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 bg-transparent hover:bg-muted/50 transition-colors"
                  asChild
                >
                  <Link href={action.href}>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-muted ${action.color}`}>
                      <action.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Creatives */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-medium">最近のクリエイティブ</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary text-sm" asChild>
              <Link href="/creatives">すべて表示</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : stats.recentCreatives.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-muted">
                  <Sparkles className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  まだクリエイティブがありません
                </p>
                <Button className="mt-3" size="sm" asChild>
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
                  className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
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
