"use client";

import Link from "next/link";
import {
  FolderOpen,
  Palette,
  Sparkles,
  TrendingUp,
  Upload,
  FileText,
  ImageIcon,
  MoreHorizontal,
  Eye,
  Download,
  Trash2,
  Building2,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthContext, useBrandsContext } from "@/components/providers";

// このデータは後で実際のデータと統合します
const stats = [
  {
    title: "ブランド数",
    value: "0",
    change: "",
    icon: Building2,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "資産数",
    value: "0",
    change: "",
    icon: FolderOpen,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "クリエイティブ",
    value: "0",
    change: "",
    icon: Sparkles,
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "デザインシステム",
    value: "0%",
    change: "",
    icon: Palette,
    color: "bg-primary/10 text-primary",
  },
];

const recentAssets = [
  {
    id: 1,
    name: "ブランドガイドライン2025.pdf",
    type: "PDF",
    size: "2.4 MB",
    date: "2時間前",
    status: "分析完了",
    icon: FileText,
  },
  {
    id: 2,
    name: "ロゴ_横型_カラー.png",
    type: "PNG",
    size: "845 KB",
    date: "5時間前",
    status: "分析完了",
    icon: ImageIcon,
  },
  {
    id: 3,
    name: "プレスリリース_新製品.docx",
    type: "DOCX",
    size: "1.2 MB",
    date: "1日前",
    status: "分析中",
    icon: FileText,
  },
  {
    id: 4,
    name: "SNSバナー_キャンペーン.jpg",
    type: "JPG",
    size: "1.8 MB",
    date: "2日前",
    status: "分析完了",
    icon: ImageIcon,
  },
];

const designSystemProgress = [
  { name: "カラーパレット", progress: 100 },
  { name: "タイポグラフィ", progress: 100 },
  { name: "トーン&マナー", progress: 85 },
  { name: "キーワード", progress: 72 },
  { name: "ターゲット分析", progress: 60 },
];

const recentCreatives = [
  {
    id: 1,
    title: "新製品発表キャッチコピー",
    type: "テキスト",
    date: "1時間前",
  },
  {
    id: 2,
    title: "Instagram投稿用画像",
    type: "画像",
    date: "3時間前",
  },
  {
    id: 3,
    title: "メールマガジン本文",
    type: "テキスト",
    date: "6時間前",
  },
];

export function DashboardContent() {
  const { firebaseUser } = useAuthContext();
  const { brands, loading: brandsLoading } = useBrandsContext();

  const updatedStats = [
    {
      title: "ブランド数",
      value: brandsLoading ? "-" : brands.length.toString(),
      change: "",
      icon: Building2,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "資産数",
      value: "0",
      change: "",
      icon: FolderOpen,
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      title: "クリエイティブ",
      value: "0",
      change: "",
      icon: Sparkles,
      color: "bg-amber-500/10 text-amber-600",
    },
    {
      title: "デザインシステム",
      value: "0%",
      change: "",
      icon: Palette,
      color: "bg-primary/10 text-primary",
    },
  ];

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
                  {stat.change && (
                    <p className="text-xs text-emerald-600 mt-1">{stat.change}</p>
                  )}
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
            {designSystemProgress.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-medium text-foreground">{item.progress}%</span>
                </div>
                <Progress value={item.progress} className="h-2" />
              </div>
            ))}
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
            {recentCreatives.length === 0 ? (
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
              recentCreatives.map((creative) => (
                <div
                  key={creative.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{creative.title}</p>
                      <p className="text-xs text-muted-foreground">{creative.date}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {creative.type}
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
