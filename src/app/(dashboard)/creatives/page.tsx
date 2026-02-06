"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wand2,
  Plus,
  Copy,
  FileText,
  Sparkles,
  Heart,
  Image as ImageIcon,
  MessageSquare,
  Download,
  Clock,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import type { CreativeType, Creative } from "@/types";
import { generateCreativeFunction, generateImageFunction } from "@/lib/firebase/functions";
import { getBrandCreatives, updateCreative } from "@/lib/firebase/firestore";

export default function CreativesPage() {
  const searchParams = useSearchParams();
  const brandIdParam = searchParams.get("brandId");
  const { firebaseUser } = useAuthContext();
  const { brands, loading: brandsLoading } = useBrandsContext();
  const [selectedBrandId, setSelectedBrandId] = useState<string>(brandIdParam || "");
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [creativeType, setCreativeType] = useState<CreativeType>("CATCH_COPY");
  const [instruction, setInstruction] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    if (brandIdParam) {
      setSelectedBrandId(brandIdParam);
    }
  }, [brandIdParam]);

  useEffect(() => {
    if (selectedBrandId) {
      fetchCreatives();
    }
  }, [selectedBrandId]);

  const fetchCreatives = async () => {
    if (!selectedBrandId) return;
    setLoading(true);
    try {
      const fetchedCreatives = await getBrandCreatives(selectedBrandId);
      setCreatives(fetchedCreatives);
    } catch (error) {
      console.error("Failed to fetch creatives:", error);
      toast.error("クリエイティブの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedBrandId || !instruction.trim()) return;

    setIsGenerating(true);
    try {
      if (creativeType === "IMAGE") {
        // 画像生成
        const result = await generateImageFunction({
          brandId: selectedBrandId,
          prompt: instruction,
          aspectRatio,
        });

        if (result.data.success) {
          if (result.data.imageUrl) {
            toast.success("画像を生成しました");
          } else {
            toast.success("画像プロンプトを生成しました");
          }
          setIsGenerateOpen(false);
          setInstruction("");
          await fetchCreatives();
        } else {
          toast.error("生成に失敗しました");
        }
      } else {
        // テキスト生成
        const result = await generateCreativeFunction({
          brandId: selectedBrandId,
          type: creativeType,
          prompt: instruction,
        });

        if (result.data.success && result.data.creative) {
          toast.success("クリエイティブを生成しました");
          setIsGenerateOpen(false);
          setInstruction("");
          await fetchCreatives();
        } else {
          toast.error("生成に失敗しました");
        }
      }
    } catch (error: any) {
      console.error("Error generating creative:", error);
      toast.error(error.message || "生成に失敗しました");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFavorite = async (creative: Creative) => {
    const newFavorite = !creative.isFavorite;
    try {
      await updateCreative(creative.id, { isFavorite: newFavorite } as any);
      setCreatives((prev) =>
        prev.map((c) =>
          c.id === creative.id ? { ...c, isFavorite: newFavorite } : c
        )
      );
      toast.success(newFavorite ? "お気に入りに追加しました" : "お気に入りから削除しました");
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      toast.error("更新に失敗しました");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("クリップボードにコピーしました");
  };

  const getTypeIcon = (type: CreativeType) => {
    switch (type) {
      case "CATCH_COPY":
        return <Sparkles className="h-4 w-4" />;
      case "SNS_POST":
        return <MessageSquare className="h-4 w-4" />;
      case "ARTICLE":
        return <FileText className="h-4 w-4" />;
      case "IMAGE":
        return <ImageIcon className="h-4 w-4" />;
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

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filterCreatives = (list: Creative[], type?: CreativeType) => {
    let filtered = type ? list.filter((c) => c.type === type) : list;
    if (showFavoritesOnly) {
      filtered = filtered.filter((c) => c.isFavorite);
    }
    return filtered;
  };

  const renderCreativeCard = (creative: Creative) => (
    <Card key={creative.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {getTypeIcon(creative.type)}
            </div>
            <Badge variant="secondary">
              {getTypeLabel(creative.type)}
            </Badge>
            {creative.metadata?.brandFitScore != null && (
              <Badge
                variant="outline"
                className={`${
                  creative.metadata.brandFitScore >= 80
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-200"
                    : creative.metadata.brandFitScore >= 60
                    ? "bg-yellow-500/10 text-yellow-600 border-yellow-200"
                    : "bg-red-500/10 text-red-600 border-red-200"
                }`}
              >
                適合度: {creative.metadata.brandFitScore}%
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${creative.isFavorite ? "text-red-500" : ""}`}
              onClick={() => toggleFavorite(creative)}
            >
              <Heart className={`h-4 w-4 ${creative.isFavorite ? "fill-current" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => copyToClipboard(creative.content)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 画像表示 */}
        {creative.type === "IMAGE" && creative.imageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden border">
            <img
              src={creative.imageUrl}
              alt="Generated image"
              className="w-full h-auto max-h-96 object-contain bg-muted"
            />
            <div className="flex justify-end p-2 bg-muted/50">
              <a
                href={creative.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-3 w-3" />
                  ダウンロード
                </Button>
              </a>
            </div>
          </div>
        )}

        {/* コンテンツ表示 */}
        <div className="rounded-lg bg-muted p-4">
          <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">
            {creative.content}
          </pre>
        </div>

        {/* メタ情報 */}
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            {creative.prompt && (
              <span>
                <span className="font-medium">テーマ:</span> {creative.prompt}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(creative.createdAt)}
          </div>
        </div>

        {/* Brand Fit Feedback */}
        {creative.metadata?.brandFitFeedback && (
          <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-xs text-blue-700 dark:text-blue-300">
            <span className="font-medium">AI評価:</span> {creative.metadata.brandFitFeedback}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderEmptyState = (type?: CreativeType) => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        {type ? getTypeIcon(type) : <Wand2 className="h-16 w-16 text-muted-foreground/50" />}
        <h3 className="mt-4 text-lg font-semibold">
          {type ? `${getTypeLabel(type)}がありません` : "クリエイティブがありません"}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {showFavoritesOnly
            ? "お気に入りのクリエイティブがありません"
            : "「新規生成」ボタンからクリエイティブを生成してください"}
        </p>
        {!showFavoritesOnly && !type && (
          <Button className="mt-6" onClick={() => setIsGenerateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            最初のクリエイティブを生成
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-24 w-full rounded-lg" />
            <div className="mt-3 flex justify-between">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">クリエイティブ生成</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ブランドDNAに基づいてAIが最適化されたコンテンツを生成します
          </p>
        </div>
        <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedBrandId}>
              <Plus className="mr-2 h-4 w-4" />
              新規生成
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>クリエイティブを生成</DialogTitle>
              <DialogDescription>
                ブランドDNAに基づいてAIが最適なコンテンツを生成します
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>コンテンツタイプ</Label>
                <Select
                  value={creativeType}
                  onValueChange={(value) => setCreativeType(value as CreativeType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CATCH_COPY">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        キャッチコピー（3案生成）
                      </div>
                    </SelectItem>
                    <SelectItem value="SNS_POST">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        SNS投稿（3案生成）
                      </div>
                    </SelectItem>
                    <SelectItem value="ARTICLE">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        記事
                      </div>
                    </SelectItem>
                    <SelectItem value="IMAGE">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        画像生成
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instruction">
                  {creativeType === "IMAGE" ? "画像の説明・イメージ" : "指示・テーマ"}
                </Label>
                <Textarea
                  id="instruction"
                  placeholder={
                    creativeType === "IMAGE"
                      ? "例: 新商品の広告バナー、春らしい爽やかなイメージ"
                      : "例: 新商品発売のお知らせ、春のキャンペーン告知など"
                  }
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  rows={4}
                />
              </div>

              {creativeType === "IMAGE" && (
                <div className="space-y-2">
                  <Label>アスペクト比</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:1">1:1（正方形）</SelectItem>
                      <SelectItem value="16:9">16:9（横長）</SelectItem>
                      <SelectItem value="9:16">9:16（縦長・ストーリーズ）</SelectItem>
                      <SelectItem value="4:3">4:3（標準）</SelectItem>
                      <SelectItem value="3:4">3:4（ポートレート）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsGenerateOpen(false)}
                disabled={isGenerating}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!instruction.trim() || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {creativeType === "IMAGE" ? "画像生成中..." : "生成中..."}
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    {creativeType === "IMAGE" ? "画像を生成" : "生成"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">ブランドを選択</CardTitle>
          <CardDescription>
            クリエイティブを生成するブランドを選択してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select
              value={selectedBrandId}
              onValueChange={setSelectedBrandId}
              disabled={brandsLoading}
            >
              <SelectTrigger className="w-full md:w-[300px]">
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
            {selectedBrandId && (
              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              >
                <Heart className={`mr-2 h-4 w-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
                お気に入り
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {!selectedBrandId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wand2 className="h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">
              ブランドを選択してください
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              クリエイティブを生成するにはブランドを選択する必要があります
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">
              すべて
              {creatives.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                  {filterCreatives(creatives).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="CATCH_COPY">キャッチコピー</TabsTrigger>
            <TabsTrigger value="SNS_POST">SNS投稿</TabsTrigger>
            <TabsTrigger value="ARTICLE">記事</TabsTrigger>
            <TabsTrigger value="IMAGE">画像</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {loading ? (
              renderLoadingSkeleton()
            ) : filterCreatives(creatives).length === 0 ? (
              renderEmptyState()
            ) : (
              <div className="space-y-4">
                {filterCreatives(creatives).map(renderCreativeCard)}
              </div>
            )}
          </TabsContent>

          {(["CATCH_COPY", "SNS_POST", "ARTICLE", "IMAGE"] as CreativeType[]).map(
            (type) => (
              <TabsContent key={type} value={type}>
                {loading ? (
                  renderLoadingSkeleton()
                ) : filterCreatives(creatives, type).length === 0 ? (
                  renderEmptyState(type)
                ) : (
                  <div className="space-y-4">
                    {filterCreatives(creatives, type).map(renderCreativeCard)}
                  </div>
                )}
              </TabsContent>
            )
          )}
        </Tabs>
      )}
    </div>
  );
}
