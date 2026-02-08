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
  Zap,
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
        gradient: "bg-gradient-card-orange",
        iconColor: "text-primary",
      },
      {
        title: "資産数",
        value: statsLoading ? "-" : stats.totalAssets.toString(),
        icon: FolderOpen,
        gradient: "bg-gradient-card-blue",
        iconColor: "text-secondary",
      },
      {
        title: "クリエイティブ",
        value: statsLoading ? "-" : stats.totalCreatives.toString(),
        icon: Sparkles,
        gradient: "bg-gradient-card-purple",
        iconColor: "text-purple-500",
      },
      {
        title: "ブランドDNA",
        value: statsLoading ? "-" : `${stats.designSystemProgress}%`,
        icon: Dna,
        gradient: "bg-gradient-card-emerald",
        iconColor: "text-emerald-500",
      },
    ],
    [brandsLoading, brands.length, statsLoading, stats]
  );

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div className="page-header">
          <h1 className="heading-page text-foreground">ダッシュボード</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {firebaseUser?.displayName || "ユーザー"}さん、おかえりなさい
          </p>
        </div>
        <Button className="gap-2 shadow-layered hover:shadow-layered-lg transition-shadow" asChild>
          <Link href="/assets">
            <Upload className="h-4 w-4" />
            資産をアップロード
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div
            key={stat.title}
            className={`stat-card ${stat.gradient} p-5 animate-fade-up`}
            style={{ animationDelay: `${(i + 1) * 0.1}s` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                <p className="text-4xl font-black text-foreground mt-1 tracking-tight">{stat.value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 ${stat.iconColor}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Brand List */}
        <Card className="lg:col-span-2 shadow-layered animate-fade-up delay-200">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-semibold">ブランド一覧</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary font-medium" asChild>
              <Link href="/brands">すべて表示</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {brandsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : brands.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
                  <Building2 className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="mt-4 text-sm font-medium text-muted-foreground">
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
              <div className="divide-y divide-border/50">
                {brands.slice(0, 5).map((brand, i) => (
                  <div
                    key={brand.id}
                    className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-foreground to-foreground/80 text-background text-sm font-bold shadow-sm">
                      {brand.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
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
        <Card className="shadow-layered animate-fade-up delay-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">ブランドDNA進捗</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : brands.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">
                  ブランドを作成してブランドDNAを設定しましょう
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">全体の進捗</span>
                    <span className="font-bold text-foreground">{stats.designSystemProgress}%</span>
                  </div>
                  <Progress value={stats.designSystemProgress} className="h-2.5" />
                </div>
                <div className="rounded-xl bg-gradient-warm p-4 border border-border/30">
                  <div className="flex items-start gap-3">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="shadow-layered animate-fade-up delay-400">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">クイックアクション</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: "/assets", icon: Upload, label: "資産アップロード", color: "text-primary" },
                { href: "/creatives", icon: Sparkles, label: "コンテンツ生成", color: "text-purple-500" },
                { href: "/design-system", icon: Dna, label: "ブランドDNA", color: "text-emerald-500" },
                { href: "/brands/new", icon: Plus, label: "新規ブランド", color: "text-blue-500" },
              ].map((action) => (
                <Button
                  key={action.href}
                  variant="outline"
                  className="h-auto py-5 flex-col gap-2.5 bg-transparent hover:bg-muted/30 border-border/60 hover:border-border transition-all group"
                  asChild
                >
                  <Link href={action.href}>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 ${action.color} transition-transform group-hover:scale-110`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Creatives */}
        <Card className="shadow-layered animate-fade-up delay-500">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-semibold">最近のクリエイティブ</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary font-medium" asChild>
              <Link href="/creatives">すべて表示</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : stats.recentCreatives.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
                  <Sparkles className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="mt-4 text-sm font-medium text-muted-foreground">
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
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/50">
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
                  <Badge variant="secondary" className="text-xs opacity-70 group-hover:opacity-100 transition-opacity">
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
