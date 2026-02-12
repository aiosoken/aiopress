"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuthContext, useBrandsContext } from "@/components/providers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  Sparkles,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  TrendingUp,
  Target,
  Zap,
  Star,
  Calendar,
} from "lucide-react";
import { getBrandCreatives, getBrandAssets, getDesignSystem } from "@/lib/firebase/firestore";
import type { Creative, CreativeType, Asset, DesignSystem } from "@/types";

interface TypeStats {
  type: CreativeType;
  count: number;
  avgScore: number;
  published: number;
  favorited: number;
}

export default function AnalyticsPage() {
  const { firebaseUser } = useAuthContext();
  const { brands, selectedBrandId, selectBrand, loading: brandsLoading } = useBrandsContext();
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [designSystem, setDesignSystem] = useState<DesignSystem | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedBrandId) {
      fetchData();
    }
  }, [selectedBrandId]);

  const fetchData = async () => {
    if (!selectedBrandId) return;
    setLoading(true);
    try {
      const [c, a, ds] = await Promise.all([
        getBrandCreatives(selectedBrandId),
        getBrandAssets(selectedBrandId),
        getDesignSystem(selectedBrandId),
      ]);
      setCreatives(c);
      setAssets(a);
      setDesignSystem(ds);
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalCreatives = creatives.length;
    const totalAssets = assets.length;

    const scores = creatives
      .map((c) => c.metadata?.brandFitScore)
      .filter((s): s is number => s != null);
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    const published = creatives.filter((c) => c.status === "PUBLISHED").length;
    const favorited = creatives.filter((c) => c.isFavorite).length;

    const typeMap = new Map<CreativeType, Creative[]>();
    for (const c of creatives) {
      const list = typeMap.get(c.type) || [];
      list.push(c);
      typeMap.set(c.type, list);
    }

    const typeStats: TypeStats[] = (
      ["CATCH_COPY", "SNS_POST", "ARTICLE", "IMAGE"] as CreativeType[]
    ).map((type) => {
      const list = typeMap.get(type) || [];
      const typeScores = list
        .map((c) => c.metadata?.brandFitScore)
        .filter((s): s is number => s != null);
      return {
        type,
        count: list.length,
        avgScore: typeScores.length > 0
          ? Math.round(typeScores.reduce((a, b) => a + b, 0) / typeScores.length)
          : 0,
        published: list.filter((c) => c.status === "PUBLISHED").length,
        favorited: list.filter((c) => c.isFavorite).length,
      };
    });

    // Score distribution
    const scoreBuckets = { high: 0, mid: 0, low: 0, none: 0 };
    for (const c of creatives) {
      const s = c.metadata?.brandFitScore;
      if (s == null) scoreBuckets.none++;
      else if (s >= 80) scoreBuckets.high++;
      else if (s >= 60) scoreBuckets.mid++;
      else scoreBuckets.low++;
    }

    // Recent activity (last 7 days)
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const recentCreatives = creatives.filter((c) => {
      const t = c.createdAt?.toDate?.()?.getTime?.() ?? 0;
      return t > weekAgo;
    }).length;
    const recentAssets = assets.filter((a) => {
      const t = a.createdAt?.toDate?.()?.getTime?.() ?? 0;
      return t > weekAgo;
    }).length;

    // Design system completeness
    let dsProgress = 0;
    if (designSystem) {
      if (designSystem.brandDNA?.mission) dsProgress += 15;
      if (designSystem.brandDNA?.vision) dsProgress += 15;
      if (designSystem.brandDNA?.valueProposition) dsProgress += 10;
      if (designSystem.brandDNA?.personality) dsProgress += 10;
      if (designSystem.brandDNA?.tone) dsProgress += 10;
      if (designSystem.colors?.primary && designSystem.colors.primary !== "#000000") dsProgress += 10;
      if (designSystem.typography?.fontFamily) dsProgress += 10;
      if (designSystem.keywords?.length) dsProgress += 10;
      if (designSystem.targetAudience) dsProgress += 10;
    }

    return {
      totalCreatives,
      totalAssets,
      avgScore,
      published,
      favorited,
      typeStats,
      scoreBuckets,
      recentCreatives,
      recentAssets,
      dsProgress: Math.min(dsProgress, 100),
    };
  }, [creatives, assets, designSystem]);

  const getTypeIcon = (type: CreativeType) => {
    switch (type) {
      case "CATCH_COPY": return <Sparkles className="h-4 w-4" />;
      case "SNS_POST": return <MessageSquare className="h-4 w-4" />;
      case "ARTICLE": return <FileText className="h-4 w-4" />;
      case "IMAGE": return <ImageIcon className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: CreativeType) => {
    switch (type) {
      case "CATCH_COPY": return "キャッチコピー";
      case "SNS_POST": return "SNS投稿";
      case "ARTICLE": return "記事";
      case "IMAGE": return "画像";
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 lg:p-8 animate-page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-page text-foreground">分析・レポート</h1>
          <p className="text-sm text-muted-foreground mt-2">
            クリエイティブの生成状況とブランド適合度を分析します
          </p>
        </div>
        <Select value={selectedBrandId || ""} onValueChange={selectBrand} disabled={brandsLoading}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="ブランドを選択" />
          </SelectTrigger>
          <SelectContent>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedBrandId ? (
        <Card className="rounded-xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50">
              <BarChart3 className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">ブランドを選択してください</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              分析データを表示するにはブランドを選択してください
            </p>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="rounded-xl">
              <CardContent className="p-5">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* サマリーカード */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div
              className="stat-card bg-gradient-card-orange p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">クリエイティブ数</p>
                  <p className="text-4xl font-black mt-1">{stats.totalCreatives}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    直近7日: +{stats.recentCreatives}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>

            <div
              className="stat-card bg-gradient-card-blue p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">平均適合スコア</p>
                  <p className={`text-4xl font-black mt-1 ${scoreColor(stats.avgScore)}`}>
                    {stats.avgScore > 0 ? `${stats.avgScore}%` : "-"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.published}件 公開中
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50">
                  <Target className="h-5 w-5 text-secondary" />
                </div>
              </div>
            </div>

            <div
              className="stat-card bg-gradient-card-emerald p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">アセット数</p>
                  <p className="text-4xl font-black mt-1">{stats.totalAssets}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    直近7日: +{stats.recentAssets}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50">
                  <BarChart3 className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
            </div>

            <div
              className="stat-card bg-gradient-card-purple p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ブランドDNA</p>
                  <p className="text-4xl font-black mt-1">{stats.dsProgress}%</p>
                  <Progress value={stats.dsProgress} className="h-1.5 mt-2 rounded-sm" />
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50">
                  <Star className="h-5 w-5 text-purple-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* タイプ別分析 */}
            <Card className="rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">タイプ別クリエイティブ</CardTitle>
                <CardDescription>生成タイプごとの統計情報</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.typeStats.map((ts) => (
                    <div key={ts.type} className="flex items-center gap-4">
                      <div className="p-2 rounded-xl bg-muted">
                        {getTypeIcon(ts.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{getTypeLabel(ts.type)}</span>
                          <span className="text-sm text-muted-foreground">{ts.count}件</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={stats.totalCreatives > 0 ? (ts.count / stats.totalCreatives) * 100 : 0}
                            className="h-2 flex-1"
                          />
                          {ts.avgScore > 0 && (
                            <span className={`text-xs font-medium ${scoreColor(ts.avgScore)}`}>
                              {ts.avgScore}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* スコア分布 */}
            <Card className="rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Brand Fit スコア分布</CardTitle>
                <CardDescription>クリエイティブの品質分布</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-emerald-500" />
                        <span className="text-sm">高適合（80〜100%）</span>
                      </div>
                      <span className="text-sm font-medium">{stats.scoreBuckets.high}件</span>
                    </div>
                    <Progress
                      value={stats.totalCreatives > 0 ? (stats.scoreBuckets.high / stats.totalCreatives) * 100 : 0}
                      className="h-3 [&>div]:bg-emerald-500"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <span className="text-sm">中適合（60〜79%）</span>
                      </div>
                      <span className="text-sm font-medium">{stats.scoreBuckets.mid}件</span>
                    </div>
                    <Progress
                      value={stats.totalCreatives > 0 ? (stats.scoreBuckets.mid / stats.totalCreatives) * 100 : 0}
                      className="h-3 [&>div]:bg-yellow-500"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <span className="text-sm">低適合（60%未満）</span>
                      </div>
                      <span className="text-sm font-medium">{stats.scoreBuckets.low}件</span>
                    </div>
                    <Progress
                      value={stats.totalCreatives > 0 ? (stats.scoreBuckets.low / stats.totalCreatives) * 100 : 0}
                      className="h-3 [&>div]:bg-red-500"
                    />
                  </div>

                  {stats.scoreBuckets.none > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                          <span className="text-sm">未評価</span>
                        </div>
                        <span className="text-sm font-medium">{stats.scoreBuckets.none}件</span>
                      </div>
                      <Progress
                        value={stats.totalCreatives > 0 ? (stats.scoreBuckets.none / stats.totalCreatives) * 100 : 0}
                        className="h-3 [&>div]:bg-muted-foreground/30"
                      />
                    </div>
                  )}
                </div>

                {stats.totalCreatives > 0 && (
                  <div className="mt-6 p-4 rounded-xl bg-accent border-l-2 border-primary">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">インサイト</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {stats.avgScore >= 80
                        ? "ブランドDNAとの適合度が高い優れたクリエイティブが生成されています。現在の設定を維持してください。"
                        : stats.avgScore >= 60
                        ? "適合度は良好ですが、ブランドDNAの設定をより詳細にすることで品質向上が期待できます。"
                        : stats.avgScore > 0
                        ? "ブランドDNAの設定を見直すことで、より適合度の高いクリエイティブが生成できます。"
                        : "クリエイティブを生成して、ブランド適合度の分析を始めましょう。"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* お気に入り & 公開状況 */}
            <Card className="rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">ステータス概要</CardTitle>
                <CardDescription>クリエイティブの公開・お気に入り状況</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-xl border border-border">
                    <p className="text-2xl font-bold text-foreground">
                      {creatives.filter((c) => c.status === "DRAFT").length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">下書き</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border">
                    <p className="text-2xl font-bold text-emerald-600">{stats.published}</p>
                    <p className="text-xs text-muted-foreground mt-1">公開中</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border">
                    <p className="text-2xl font-bold text-red-500">{stats.favorited}</p>
                    <p className="text-xs text-muted-foreground mt-1">お気に入り</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 最近の生成アクティビティ */}
            <Card className="rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">最近のアクティビティ</CardTitle>
                <CardDescription>直近の生成履歴</CardDescription>
              </CardHeader>
              <CardContent>
                {creatives.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50">
                      <Calendar className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm text-muted-foreground text-center mt-4">
                      まだクリエイティブがありません
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {creatives.slice(0, 5).map((creative) => {
                      const date = creative.createdAt?.toDate?.();
                      return (
                        <div key={creative.id} className="flex items-center gap-3">
                          <div className="p-1.5 rounded-xl bg-muted">
                            {getTypeIcon(creative.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{creative.prompt || "無題"}</p>
                            <p className="text-xs text-muted-foreground">
                              {getTypeLabel(creative.type)}
                              {creative.metadata?.brandFitScore != null && (
                                <> · <span className={scoreColor(creative.metadata.brandFitScore)}>
                                  {creative.metadata.brandFitScore}%
                                </span></>
                              )}
                            </p>
                          </div>
                          {date && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
