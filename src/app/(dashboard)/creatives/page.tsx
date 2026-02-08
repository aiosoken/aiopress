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
  Search,
  ArrowUpDown,
  Globe,
  Archive,
  FileEdit,
  Printer,
  Presentation,
} from "lucide-react";
import { toast } from "sonner";
import type { CreativeType, Creative, EpsonPrintSettings, ContentFeedback } from "@/types";
import { generateCreativeFunction, generateImageFunction, generatePresentationFunction, printCreativeFunction, getEpsonSettingsFunction } from "@/lib/firebase/functions";
import { getBrandCreatives, updateCreative, addContentFeedback, updateContentFeedback, removeContentFeedback } from "@/lib/firebase/firestore";
import { CreativeFeedbackDialog } from "@/components/features/creative-feedback";
import { ContentFeedbackHighlight } from "@/components/features/content-feedback/ContentFeedbackHighlight";

export default function CreativesPage() {
  const searchParams = useSearchParams();
  const brandIdParam = searchParams.get("brandId");
  const { firebaseUser } = useAuthContext();
  const { brands, selectedBrandId, selectBrand, loading: brandsLoading } = useBrandsContext();
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [creativeType, setCreativeType] = useState<CreativeType>("CATCH_COPY");
  const [instruction, setInstruction] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [slideCount, setSlideCount] = useState(7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "score">("newest");
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [printTarget, setPrintTarget] = useState<Creative | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [epsonConnected, setEpsonConnected] = useState(false);
  const [printSettings, setPrintSettings] = useState<EpsonPrintSettings>({
    media_size: "ms_a4",
    print_quality: "normal",
    color_mode: "color",
    copies: 1,
  });
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackTarget, setFeedbackTarget] = useState<Creative | null>(null);

  useEffect(() => {
    getEpsonSettingsFunction({}).then((res) => {
      setEpsonConnected(res.data.configured);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (brandIdParam && brandIdParam !== selectedBrandId) {
      selectBrand(brandIdParam);
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
      if (creativeType === "PRESENTATION") {
        const result = await generatePresentationFunction({
          brandId: selectedBrandId,
          prompt: instruction,
          slideCount,
        });
        if (result.data.success) {
          toast.success("プレゼンテーションを生成しました");
          setIsGenerateOpen(false);
          setInstruction("");
          await fetchCreatives();
        } else {
          toast.error("生成に失敗しました");
        }
      } else if (creativeType === "IMAGE") {
        const result = await generateImageFunction({
          brandId: selectedBrandId,
          prompt: instruction,
          aspectRatio,
        });
        if (result.data.success) {
          toast.success(result.data.imageUrl ? "画像を生成しました" : "画像プロンプトを生成しました");
          setIsGenerateOpen(false);
          setInstruction("");
          await fetchCreatives();
        } else {
          toast.error("生成に失敗しました");
        }
      } else {
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

  const changeStatus = async (creative: Creative, newStatus: Creative["status"]) => {
    try {
      await updateCreative(creative.id, { status: newStatus } as any);
      setCreatives((prev) =>
        prev.map((c) =>
          c.id === creative.id ? { ...c, status: newStatus } : c
        )
      );
      const labels = { DRAFT: "下書き", PUBLISHED: "公開", ARCHIVED: "アーカイブ" };
      toast.success(`${labels[newStatus]}に変更しました`);
    } catch (error) {
      console.error("Failed to change status:", error);
      toast.error("ステータス変更に失敗しました");
    }
  };

  const handlePrint = async () => {
    if (!printTarget) return;
    setIsPrinting(true);
    try {
      const result = await printCreativeFunction({
        creativeId: printTarget.id,
        printSettings,
      });
      if (result.data.success) {
        toast.success(result.data.message || "印刷ジョブを送信しました");
        setIsPrintOpen(false);
        setPrintTarget(null);
      }
    } catch (error: any) {
      console.error("Print error:", error);
      toast.error(error.message || "印刷に失敗しました");
    } finally {
      setIsPrinting(false);
    }
  };

  const openPrintDialog = (creative: Creative) => {
    setPrintTarget(creative);
    setPrintSettings({
      media_size: creative.type === "IMAGE" ? "ms_l" : "ms_a4",
      media_type: creative.type === "IMAGE" ? "mt_photopaper" : "mt_plainpaper",
      print_quality: creative.type === "IMAGE" ? "high" : "normal",
      color_mode: "color",
      copies: 1,
    });
    setIsPrintOpen(true);
  };

  const openFeedbackDialog = (creative: Creative) => {
    setFeedbackTarget(creative);
    setIsFeedbackOpen(true);
  };

  const handleFeedbackApplied = async () => {
    await fetchCreatives();
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
      case "PRESENTATION":
        return <Presentation className="h-4 w-4" />;
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
      case "PRESENTATION":
        return "プレゼン";
      default:
        return type;
    }
  };

  const getTypeColor = (type: CreativeType) => {
    switch (type) {
      case "CATCH_COPY": return "text-primary";
      case "SNS_POST": return "text-blue-500";
      case "ARTICLE": return "text-emerald-500";
      case "IMAGE": return "text-purple-500";
      case "PRESENTATION": return "text-amber-500";
      default: return "text-primary";
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
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.content.toLowerCase().includes(q) ||
          c.prompt?.toLowerCase().includes(q) ||
          c.metadata?.brandFitFeedback?.toLowerCase().includes(q)
      );
    }
    filtered = [...filtered].sort((a, b) => {
      if (sortOrder === "score") {
        return (b.metadata?.brandFitScore ?? 0) - (a.metadata?.brandFitScore ?? 0);
      }
      const aTime = a.createdAt?.toDate?.() ?? new Date(a.createdAt as any);
      const bTime = b.createdAt?.toDate?.() ?? new Date(b.createdAt as any);
      return sortOrder === "newest"
        ? bTime.getTime() - aTime.getTime()
        : aTime.getTime() - bTime.getTime();
    });
    return filtered;
  };

  const renderCreativeCard = (creative: Creative) => (
    <Card key={creative.id} className="transition-colors overflow-hidden">
      <CardContent className="p-0">
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/30 bg-muted/20">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={getTypeColor(creative.type)}>
              {getTypeIcon(creative.type)}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {getTypeLabel(creative.type)}
            </span>
            {creative.status === "PUBLISHED" && (
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/10">
                <Globe className="mr-1 h-3 w-3" />公開中
              </Badge>
            )}
            {creative.status === "ARCHIVED" && (
              <Badge variant="outline" className="text-muted-foreground">
                <Archive className="mr-1 h-3 w-3" />アーカイブ
              </Badge>
            )}
            {creative.metadata?.brandFitScore != null && (
              <div className={`flex items-center gap-1 text-sm font-bold ${
                creative.metadata.brandFitScore >= 80
                  ? "text-emerald-600"
                  : creative.metadata.brandFitScore >= 60
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}>
                <div className={`h-2 w-2 rounded-full ${
                  creative.metadata.brandFitScore >= 80
                    ? "bg-emerald-500"
                    : creative.metadata.brandFitScore >= 60
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`} />
                {creative.metadata.brandFitScore}%
              </div>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            {creative.status !== "PUBLISHED" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                title="公開する"
                onClick={() => changeStatus(creative, "PUBLISHED")}
              >
                <Globe className="h-4 w-4" />
              </Button>
            )}
            {creative.status === "PUBLISHED" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-muted"
                title="下書きに戻す"
                onClick={() => changeStatus(creative, "DRAFT")}
              >
                <FileEdit className="h-4 w-4" />
              </Button>
            )}
            {creative.status !== "ARCHIVED" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:bg-muted"
                title="アーカイブ"
                onClick={() => changeStatus(creative, "ARCHIVED")}
              >
                <Archive className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${creative.isFavorite ? "text-red-500" : "hover:text-red-500"} hover:bg-red-500/10`}
              onClick={() => toggleFavorite(creative)}
            >
              <Heart className={`h-4 w-4 ${creative.isFavorite ? "fill-current" : ""}`} />
            </Button>
            {epsonConnected && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-blue-600 hover:bg-blue-500/10"
                title="印刷"
                onClick={() => openPrintDialog(creative)}
              >
                <Printer className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-purple-600 hover:bg-purple-500/10"
              title="フィードバック"
              onClick={() => openFeedbackDialog(creative)}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-muted"
              onClick={() => copyToClipboard(creative.content)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-5">
          {/* PPTX ダウンロード */}
          {creative.type === "PRESENTATION" && creative.pptxUrl && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-border/50 p-4 bg-accent">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                <Presentation className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">プレゼンテーションファイル</p>
                <p className="text-xs text-muted-foreground">PowerPoint形式（.pptx）</p>
              </div>
              <a
                href={creative.pptxUrl}
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
          )}

          {/* 画像表示 */}
          {creative.type === "IMAGE" && creative.imageUrl && (
            <div className="mb-4 rounded-xl overflow-hidden border border-border/50">
              <img
                src={creative.imageUrl}
                alt="Generated image"
                className="w-full h-auto max-h-96 object-contain bg-muted/30"
              />
              <div className="flex justify-end p-2.5 bg-muted/20">
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
          <ContentFeedbackHighlight
            content={creative.content}
            feedbacks={creative.feedbacks || []}
            onAddFeedback={async (feedback) => {
              try {
                await addContentFeedback(creative.id, {
                  ...feedback,
                  createdBy: firebaseUser?.uid || "",
                });
                await fetchCreatives();
                toast.success("フィードバックを追加しました");
              } catch (error) {
                console.error("Failed to add feedback:", error);
                toast.error("フィードバックの追加に失敗しました");
              }
            }}
            onUpdateFeedback={async (feedbackId, updates) => {
              try {
                await updateContentFeedback(creative.id, feedbackId, updates);
                await fetchCreatives();
                toast.success("フィードバックを更新しました");
              } catch (error) {
                console.error("Failed to update feedback:", error);
                toast.error("フィードバックの更新に失敗しました");
              }
            }}
            onRemoveFeedback={async (feedbackId) => {
              try {
                await removeContentFeedback(creative.id, feedbackId);
                await fetchCreatives();
                toast.success("フィードバックを削除しました");
              } catch (error) {
                console.error("Failed to remove feedback:", error);
                toast.error("フィードバックの削除に失敗しました");
              }
            }}
          />

          {/* メタ情報 */}
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              {creative.prompt && (
                <span>
                  <span className="font-semibold text-foreground/70">テーマ:</span> {creative.prompt}
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
            <div className="mt-3 p-4 rounded-xl bg-accent border-l-3 border-primary text-xs text-muted-foreground" style={{ borderLeft: "3px solid var(--primary)" }}>
              <span className="font-semibold text-foreground">AI評価:</span> {creative.metadata.brandFitFeedback}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderEmptyState = (type?: CreativeType) => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50 mb-4">
          {type ? <span className={getTypeColor(type)}>{getTypeIcon(type)}</span> : <Wand2 className="h-8 w-8 text-muted-foreground/40" />}
        </div>
        <h3 className="text-lg font-bold">
          {type ? `${getTypeLabel(type)}がありません` : "クリエイティブがありません"}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs text-center">
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
              <Skeleton className="h-8 w-8 rounded-xl" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-24 w-full rounded-xl" />
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
          <h1 className="heading-page text-foreground">クリエイティブ生成</h1>
          <p className="text-sm text-muted-foreground mt-2">
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
              <DialogTitle className="text-xl font-bold">クリエイティブを生成</DialogTitle>
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
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CATCH_COPY">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        キャッチコピー（3案生成）
                      </div>
                    </SelectItem>
                    <SelectItem value="SNS_POST">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        SNS投稿（3案生成）
                      </div>
                    </SelectItem>
                    <SelectItem value="ARTICLE">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-500" />
                        記事
                      </div>
                    </SelectItem>
                    <SelectItem value="IMAGE">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-purple-500" />
                        画像生成
                      </div>
                    </SelectItem>
                    <SelectItem value="PRESENTATION">
                      <div className="flex items-center gap-2">
                        <Presentation className="h-4 w-4 text-amber-500" />
                        プレゼンテーション（PPTX）
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instruction">
                  {creativeType === "IMAGE"
                    ? "画像の説明・イメージ"
                    : creativeType === "PRESENTATION"
                    ? "プレゼンのテーマ・内容"
                    : "指示・テーマ"}
                </Label>
                <Textarea
                  id="instruction"
                  placeholder={
                    creativeType === "IMAGE"
                      ? "例: 新商品の広告バナー、春らしい爽やかなイメージ"
                      : creativeType === "PRESENTATION"
                      ? "例: 新商品発表会、四半期業績報告、ブランド戦略提案など"
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

              {creativeType === "PRESENTATION" && (
                <div className="space-y-2">
                  <Label>スライド枚数（目安）</Label>
                  <Input
                    type="number"
                    min={3}
                    max={20}
                    value={slideCount}
                    onChange={(e) =>
                      setSlideCount(
                        Math.max(3, Math.min(20, parseInt(e.target.value) || 7))
                      )
                    }
                  />
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
                    {creativeType === "IMAGE"
                      ? "画像生成中..."
                      : creativeType === "PRESENTATION"
                      ? "PPTX生成中..."
                      : "生成中..."}
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    {creativeType === "IMAGE"
                      ? "画像を生成"
                      : creativeType === "PRESENTATION"
                      ? "PPTXを生成"
                      : "生成"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Select
              value={selectedBrandId || ""}
              onValueChange={selectBrand}
              disabled={brandsLoading}
            >
              <SelectTrigger className="w-full sm:w-[260px] h-11">
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
              <>
                <Button
                  variant={showFavoritesOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className="shrink-0"
                >
                  <Heart className={`mr-2 h-4 w-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
                  お気に入り
                </Button>
                <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="テーマ・内容で検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                  <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as typeof sortOrder)}>
                    <SelectTrigger className="w-[140px] h-9">
                      <ArrowUpDown className="mr-2 h-3 w-3" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">新しい順</SelectItem>
                      <SelectItem value="oldest">古い順</SelectItem>
                      <SelectItem value="score">スコア順</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 印刷ダイアログ */}
      <Dialog open={isPrintOpen} onOpenChange={setIsPrintOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              クリエイティブを印刷
            </DialogTitle>
            <DialogDescription>
              Epson Connect を使って印刷します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {printTarget && (
              <div className="rounded-xl bg-muted/30 p-3 text-sm border border-border/30">
                <p className="font-semibold">{getTypeLabel(printTarget.type)}</p>
                <p className="text-muted-foreground mt-1 truncate">
                  {printTarget.content.substring(0, 100)}
                  {printTarget.content.length > 100 ? "..." : ""}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>用紙サイズ</Label>
                <Select
                  value={printSettings.media_size || "ms_a4"}
                  onValueChange={(v) =>
                    setPrintSettings((s) => ({ ...s, media_size: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ms_a4">A4</SelectItem>
                    <SelectItem value="ms_a3">A3</SelectItem>
                    <SelectItem value="ms_a5">A5</SelectItem>
                    <SelectItem value="ms_letter">Letter</SelectItem>
                    <SelectItem value="ms_l">L判</SelectItem>
                    <SelectItem value="ms_2l">2L判</SelectItem>
                    <SelectItem value="ms_postcard">はがき</SelectItem>
                    <SelectItem value="ms_kg">KG</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>印刷品質</Label>
                <Select
                  value={printSettings.print_quality || "normal"}
                  onValueChange={(v) =>
                    setPrintSettings((s) => ({ ...s, print_quality: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">ドラフト</SelectItem>
                    <SelectItem value="normal">標準</SelectItem>
                    <SelectItem value="high">高品質</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>カラーモード</Label>
                <Select
                  value={printSettings.color_mode || "color"}
                  onValueChange={(v) =>
                    setPrintSettings((s) => ({ ...s, color_mode: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="color">カラー</SelectItem>
                    <SelectItem value="mono">モノクロ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>部数</Label>
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={printSettings.copies || 1}
                  onChange={(e) =>
                    setPrintSettings((s) => ({
                      ...s,
                      copies: Math.max(1, Math.min(99, parseInt(e.target.value) || 1)),
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPrintOpen(false)}
              disabled={isPrinting}
            >
              キャンセル
            </Button>
            <Button onClick={handlePrint} disabled={isPrinting}>
              {isPrinting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  送信中...
                </>
              ) : (
                <>
                  <Printer className="mr-2 h-4 w-4" />
                  印刷
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!selectedBrandId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50">
              <Wand2 className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="mt-4 text-lg font-bold">
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
            <TabsTrigger value="PRESENTATION">プレゼン</TabsTrigger>
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

          {(["CATCH_COPY", "SNS_POST", "ARTICLE", "IMAGE", "PRESENTATION"] as CreativeType[]).map(
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

      {/* フィードバックダイアログ */}
      {feedbackTarget && (
        <CreativeFeedbackDialog
          creative={feedbackTarget}
          open={isFeedbackOpen}
          onOpenChange={setIsFeedbackOpen}
          onApplied={handleFeedbackApplied}
        />
      )}
    </div>
  );
}
