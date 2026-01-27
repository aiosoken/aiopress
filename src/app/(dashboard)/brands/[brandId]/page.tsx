"use client";

import { useEffect, use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBrandsContext } from "@/components/providers";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  FolderOpen,
  Palette,
  Wand2,
  ArrowLeft,
  Upload,
  Settings,
  Copy,
  Sparkles,
  Twitter,
  FileText,
  Type,
  MessageSquare,
  Tag,
  Heart,
  Users,
} from "lucide-react";
import { getBrandCreatives, getDesignSystem } from "@/lib/firebase/firestore";
import type { Creative, CreativeType, DesignSystem } from "@/types";

interface BrandDetailPageProps {
  params: Promise<{ brandId: string }>;
}

function calculateDesignSystemProgress(ds: DesignSystem | null): number {
  if (!ds) return 0;

  let progress = 0;

  if (ds.colors) {
    const colorFields = ["primary", "secondary", "accent", "background", "text"];
    const filledColors = colorFields.filter(
      (f) => ds.colors[f as keyof typeof ds.colors] && ds.colors[f as keyof typeof ds.colors] !== "#000000"
    ).length;
    progress += (filledColors / colorFields.length) * 20;
  }

  if (ds.typography) {
    const hasFont = ds.typography.fontFamily && ds.typography.fontFamily !== "";
    const hasSize = ds.typography.baseSize && ds.typography.baseSize > 0;
    const hasScale = ds.typography.scale && ds.typography.scale > 0;
    progress += ((hasFont ? 1 : 0) + (hasSize ? 1 : 0) + (hasScale ? 1 : 0)) / 3 * 20;
  }

  if (ds.voiceTone) {
    const toneFields = ["formality", "enthusiasm", "empathy"];
    const filledTones = toneFields.filter(
      (f) => ds.voiceTone[f as keyof typeof ds.voiceTone] && ds.voiceTone[f as keyof typeof ds.voiceTone] !== ""
    ).length;
    progress += (filledTones / toneFields.length) * 20;
  }

  if (ds.keywords && ds.keywords.length > 0) {
    progress += Math.min(ds.keywords.length / 10, 1) * 20;
  }

  if (ds.brandValues && ds.brandValues.length > 0) {
    progress += Math.min(ds.brandValues.length / 5, 1) * 10;
  }

  if (ds.targetAudience && ds.targetAudience.trim() !== "") {
    progress += 10;
  }

  return Math.round(progress);
}

export default function BrandDetailPage({ params }: BrandDetailPageProps) {
  const { brandId } = use(params);
  const router = useRouter();
  const { currentBrand, loading: brandLoading, selectBrand } = useBrandsContext();
  const { assets, loading: assetsLoading, fetchAssets } = useAssets();
  const [designSystem, setDesignSystem] = useState<DesignSystem | null>(null);
  const [designSystemLoading, setDesignSystemLoading] = useState(false);
  const [creativesCount, setCreativesCount] = useState<number>(0);

  useEffect(() => {
    if (brandId) {
      selectBrand(brandId);
      fetchAssets(brandId);
      loadDesignSystem();
      loadCreativesCount();
    }
  }, [brandId, selectBrand, fetchAssets]);

  const loadDesignSystem = async () => {
    setDesignSystemLoading(true);
    try {
      const ds = await getDesignSystem(brandId);
      setDesignSystem(ds);
    } catch (error) {
      console.error("Failed to fetch design system:", error);
    } finally {
      setDesignSystemLoading(false);
    }
  };

  const loadCreativesCount = async () => {
    try {
      const creatives = await getBrandCreatives(brandId);
      setCreativesCount(creatives.length);
    } catch (error) {
      console.error("Failed to fetch creatives count:", error);
    }
  };

  const dsProgress = calculateDesignSystemProgress(designSystem);

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
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{currentBrand.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
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
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">資産数</p>
                    <p className="text-2xl font-semibold text-foreground mt-1">
                      {assetsLoading ? "-" : assets.length}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                    <FolderOpen className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">デザインシステム</p>
                    <p className="text-2xl font-semibold text-foreground mt-1">
                      {designSystemLoading ? "-" : `${dsProgress}%`}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                    <Palette className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">クリエイティブ</p>
                    <p className="text-2xl font-semibold text-foreground mt-1">{creativesCount}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600">
                    <Wand2 className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-medium">クイックアクション</CardTitle>
                <CardDescription>
                  このブランドでよく使う機能
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <Button variant="outline" className="h-auto py-3 justify-start bg-transparent" asChild>
                    <Link href={`/assets?brandId=${brandId}`}>
                      <div className="p-2 rounded-lg bg-emerald-500/10 mr-3">
                        <Upload className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span className="text-sm">資産をアップロード</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-auto py-3 justify-start bg-transparent" asChild>
                    <Link href={`/design-system?brandId=${brandId}`}>
                      <div className="p-2 rounded-lg bg-primary/10 mr-3">
                        <Palette className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">デザインシステムを編集</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-auto py-3 justify-start bg-transparent" asChild>
                    <Link href={`/creatives?brandId=${brandId}`}>
                      <div className="p-2 rounded-lg bg-amber-500/10 mr-3">
                        <Wand2 className="h-4 w-4 text-amber-600" />
                      </div>
                      <span className="text-sm">クリエイティブを生成</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-medium">ブランド設定</CardTitle>
                <CardDescription>
                  ブランドの基本情報を管理
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="h-auto py-3 justify-start w-full bg-transparent" asChild>
                  <Link href={`/brands/${brandId}/settings`}>
                    <div className="p-2 rounded-lg bg-muted mr-3">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm">設定を開く</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assets">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-base font-medium">ブランド資産</CardTitle>
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
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-base font-medium">デザインシステム</CardTitle>
                <CardDescription>
                  ブランドのデザインシステムを管理します
                </CardDescription>
              </div>
              <Button asChild>
                <Link href={`/design-system?brandId=${brandId}`}>
                  <Palette className="mr-2 h-4 w-4" />
                  編集
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {designSystemLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : !designSystem || dsProgress === 0 ? (
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
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">設定の完了度</span>
                      <span className="font-medium">{dsProgress}%</span>
                    </div>
                    <Progress value={dsProgress} className="h-2" />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {designSystem.colors && (
                      <div className="rounded-lg border p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Palette className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">カラーパレット</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {designSystem.colors.primary && (
                            <div className="flex items-center gap-2">
                              <div
                                className="h-6 w-6 rounded border"
                                style={{ backgroundColor: designSystem.colors.primary }}
                              />
                              <span className="text-xs text-muted-foreground">Primary</span>
                            </div>
                          )}
                          {designSystem.colors.secondary && (
                            <div className="flex items-center gap-2">
                              <div
                                className="h-6 w-6 rounded border"
                                style={{ backgroundColor: designSystem.colors.secondary }}
                              />
                              <span className="text-xs text-muted-foreground">Secondary</span>
                            </div>
                          )}
                          {designSystem.colors.accent && (
                            <div className="flex items-center gap-2">
                              <div
                                className="h-6 w-6 rounded border"
                                style={{ backgroundColor: designSystem.colors.accent }}
                              />
                              <span className="text-xs text-muted-foreground">Accent</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {designSystem.typography && designSystem.typography.fontFamily && (
                      <div className="rounded-lg border p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Type className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">タイポグラフィ</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>フォント: {designSystem.typography.fontFamily}</p>
                          {designSystem.typography.baseSize && (
                            <p>基本サイズ: {designSystem.typography.baseSize}px</p>
                          )}
                        </div>
                      </div>
                    )}

                    {designSystem.voiceTone && (
                      <div className="rounded-lg border p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">トーン&マナー</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {designSystem.voiceTone.formality && (
                            <Badge variant="secondary">{designSystem.voiceTone.formality}</Badge>
                          )}
                          {designSystem.voiceTone.enthusiasm && (
                            <Badge variant="secondary">{designSystem.voiceTone.enthusiasm}</Badge>
                          )}
                          {designSystem.voiceTone.empathy && (
                            <Badge variant="secondary">{designSystem.voiceTone.empathy}</Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {designSystem.keywords && designSystem.keywords.length > 0 && (
                      <div className="rounded-lg border p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">キーワード</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {designSystem.keywords.slice(0, 5).map((keyword, i) => (
                            <Badge key={i} variant="outline">{keyword}</Badge>
                          ))}
                          {designSystem.keywords.length > 5 && (
                            <Badge variant="outline">+{designSystem.keywords.length - 5}</Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {designSystem.brandValues && designSystem.brandValues.length > 0 && (
                      <div className="rounded-lg border p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">ブランドバリュー</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {designSystem.brandValues.slice(0, 3).map((value, i) => (
                            <Badge key={i} variant="outline">{value}</Badge>
                          ))}
                          {designSystem.brandValues.length > 3 && (
                            <Badge variant="outline">+{designSystem.brandValues.length - 3}</Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {designSystem.targetAudience && (
                      <div className="rounded-lg border p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">ターゲットオーディエンス</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {designSystem.targetAudience}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="creatives">
          <CreativesTab brandId={brandId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CreativesTab({ brandId }: { brandId: string }) {
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCreatives();
  }, [brandId]);

  const loadCreatives = async () => {
    setLoading(true);
    try {
      const fetchedCreatives = await getBrandCreatives(brandId);
      setCreatives(fetchedCreatives);
    } catch (error) {
      console.error("Failed to fetch creatives:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: CreativeType) => {
    switch (type) {
      case "CATCH_COPY":
        return <Sparkles className="h-4 w-4" />;
      case "SNS_POST":
        return <Twitter className="h-4 w-4" />;
      case "ARTICLE":
        return <FileText className="h-4 w-4" />;
      case "IMAGE":
        return <Wand2 className="h-4 w-4" />;
      default:
        return <Wand2 className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: CreativeType) => {
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
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
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
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : creatives.length === 0 ? (
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
        ) : (
          <div className="space-y-4">
            {creatives.slice(0, 5).map((creative) => (
              <div
                key={creative.id}
                className="rounded-lg border p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(creative.type)}
                    <Badge variant="secondary">
                      {getTypeLabel(creative.type)}
                    </Badge>
                    {creative.metadata?.brandFitScore && (
                      <Badge variant="outline">
                        適合度: {creative.metadata.brandFitScore}%
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(creative.content)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <pre className="whitespace-pre-wrap text-sm bg-muted p-3 rounded">
                  {creative.content}
                </pre>
                {creative.prompt && (
                  <p className="text-xs text-muted-foreground">
                    プロンプト: {creative.prompt}
                  </p>
                )}
              </div>
            ))}
            {creatives.length > 5 && (
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/creatives?brandId=${brandId}`}>
                  すべてのクリエイティブを見る ({creatives.length}件)
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
