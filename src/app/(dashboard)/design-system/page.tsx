"use client";

import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Plus, X, Save, Sparkles, Dna, Type, MessageSquare, Tag, Heart, Target, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { getDesignSystem, updateDesignSystem } from "@/lib/firebase/firestore";
import { updateDesignSystemFunction, suggestKeywordsFunction } from "@/lib/firebase/functions";
import { BrandExtractionDialog } from "@/components/features/brand-extraction/BrandExtractionDialog";
import type { DesignSystem, BrandDNA, BrandExtractionResult } from "@/types";

const defaultBrandDNA: BrandDNA = {
  mission: "",
  vision: "",
  valueProposition: "",
  personality: "",
  tone: "",
};

export default function DesignSystemPage() {
  const searchParams = useSearchParams();
  const brandIdParam = searchParams.get("brandId");
  const { firebaseUser } = useAuthContext();
  const { brands, selectedBrandId, selectBrand, loading: brandsLoading } = useBrandsContext();
  const [designSystem, setDesignSystem] = useState<Partial<DesignSystem>>({
    colors: {
      primary: "#F25533",
      secondary: "#3054AD",
      accent: "#F25533",
      background: "#FFFFFF",
      text: "#1A1A1A",
    },
    typography: {
      fontFamily: "Noto Sans JP",
      baseSize: 16,
      scale: 1.25,
    },
    voiceTone: {
      formality: "neutral",
      enthusiasm: "medium",
      empathy: "medium",
    },
    keywords: [],
    brandValues: [],
    targetAudience: "",
    brandDNA: { ...defaultBrandDNA },
  });
  const [newKeyword, setNewKeyword] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestingKeywords, setIsSuggestingKeywords] = useState(false);
  const [isKeywordDialogOpen, setIsKeywordDialogOpen] = useState(false);
  const [isExtractionDialogOpen, setIsExtractionDialogOpen] = useState(false);

  useEffect(() => {
    if (brandIdParam && brandIdParam !== selectedBrandId) {
      selectBrand(brandIdParam);
    }
  }, [brandIdParam]);

  useEffect(() => {
    if (selectedBrandId) {
      loadDesignSystem();
    }
  }, [selectedBrandId]);

  const loadDesignSystem = async () => {
    if (!selectedBrandId) return;
    setIsLoading(true);
    try {
      const system = await getDesignSystem(selectedBrandId);
      if (system) {
        setDesignSystem({
          colors: system.colors,
          typography: system.typography,
          voiceTone: system.voiceTone,
          keywords: system.keywords || [],
          brandValues: system.brandValues || [],
          targetAudience: system.targetAudience || "",
          brandDNA: system.brandDNA || { ...defaultBrandDNA },
        });
      } else {
        setDesignSystem({
          colors: {
            primary: "#F25533",
            secondary: "#3054AD",
            accent: "#F25533",
            background: "#FFFFFF",
            text: "#1A1A1A",
          },
          typography: {
            fontFamily: "Noto Sans JP",
            baseSize: 16,
            scale: 1.25,
          },
          voiceTone: {
            formality: "neutral",
            enthusiasm: "medium",
            empathy: "medium",
          },
          keywords: [],
          brandValues: [],
          targetAudience: "",
          brandDNA: { ...defaultBrandDNA },
        });
      }
    } catch (error) {
      console.error("Failed to load design system:", error);
      toast.error("デザインシステムの読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleColorChange = (field: keyof DesignSystem["colors"], value: string) => {
    setDesignSystem((prev) => ({
      ...prev,
      colors: {
        ...prev.colors!,
        [field]: value,
      },
    }));
  };

  const handleBrandDNAChange = (field: keyof BrandDNA, value: string) => {
    setDesignSystem((prev) => ({
      ...prev,
      brandDNA: {
        ...(prev.brandDNA || defaultBrandDNA),
        [field]: value,
      },
    }));
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !(designSystem.keywords ?? []).includes(newKeyword.trim())) {
      setDesignSystem((prev) => ({
        ...prev,
        keywords: [...(prev.keywords ?? []), newKeyword.trim()],
      }));
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setDesignSystem((prev) => ({
      ...prev,
      keywords: (prev.keywords ?? []).filter((k) => k !== keyword),
    }));
  };

  const handleAddValue = () => {
    if (newValue.trim() && !(designSystem.brandValues ?? []).includes(newValue.trim())) {
      setDesignSystem((prev) => ({
        ...prev,
        brandValues: [...(prev.brandValues ?? []), newValue.trim()],
      }));
      setNewValue("");
    }
  };

  const handleRemoveValue = (value: string) => {
    setDesignSystem((prev) => ({
      ...prev,
      brandValues: (prev.brandValues ?? []).filter((v) => v !== value),
    }));
  };

  const handleSave = async () => {
    if (!selectedBrandId) return;

    setIsSaving(true);
    try {
      await updateDesignSystemFunction({
        brandId: selectedBrandId,
        designSystem: {
          colors: designSystem.colors,
          typography: designSystem.typography,
          voiceTone: designSystem.voiceTone,
          keywords: designSystem.keywords,
          brandValues: designSystem.brandValues,
          targetAudience: designSystem.targetAudience,
          brandDNA: designSystem.brandDNA,
        },
      });
      toast.success("ブランドDNA・デザインシステムを保存しました");
    } catch (error: any) {
      console.error("Failed to save design system:", error);
      toast.error(error.message || "保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuggestKeywords = async () => {
    if (!selectedBrandId) return;

    setIsSuggestingKeywords(true);
    try {
      const result = await suggestKeywordsFunction({ brandId: selectedBrandId });
      if (result.data.success && result.data.keywords) {
        setDesignSystem((prev) => ({
          ...prev,
          keywords: result.data.keywords || prev.keywords,
        }));
        toast.success(`${result.data.keywords.length}個のキーワードを提案しました`);
        setIsKeywordDialogOpen(false);
      }
    } catch (error: any) {
      console.error("Failed to suggest keywords:", error);
      toast.error(error.message || "キーワードの提案に失敗しました");
    } finally {
      setIsSuggestingKeywords(false);
    }
  };

  const handleExtractionComplete = (result: BrandExtractionResult) => {
    setDesignSystem((prev) => ({
      ...prev,
      colors: result.colors,
      typography: result.typography,
      voiceTone: result.voiceTone,
      keywords: result.keywords,
      brandValues: result.brandValues,
      targetAudience: result.targetAudience,
      brandDNA: result.brandDNA,
    }));
    toast.success("ブランド情報を反映しました。「保存」ボタンで確定してください。");
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 animate-page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-page text-foreground">ブランドDNA / デザインシステム</h1>
          <p className="text-sm text-muted-foreground mt-2">
            ブランドのDNA（ミッション・ビジョン・個性）とデザインシステムを管理します
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsExtractionDialogOpen(true)}
            disabled={!selectedBrandId}
          >
            <Wand2 className="mr-2 h-4 w-4" />
            自動抽出
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedBrandId || isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>

      <Card className="rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">ブランドを選択</CardTitle>
          <CardDescription>
            編集するブランドを選択してください
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <Select
            value={selectedBrandId || ""}
            onValueChange={selectBrand}
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
        </CardContent>
      </Card>

      {!selectedBrandId ? (
        <Card className="rounded-xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-20 w-20 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Dna className="h-16 w-16 text-muted-foreground/50" />
            </div>
            <h3 className="mt-4 text-lg font-bold">
              ブランドを選択してください
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              ブランドDNAとデザインシステムを編集するにはブランドを選択する必要があります
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <Tabs defaultValue="brand-dna" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="brand-dna" className="gap-2">
              <Dna className="h-4 w-4" />
              ブランドDNA
            </TabsTrigger>
            <TabsTrigger value="design-system" className="gap-2">
              <Palette className="h-4 w-4" />
              デザインシステム
            </TabsTrigger>
          </TabsList>

          {/* Brand DNA Tab */}
          <TabsContent value="brand-dna" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="md:col-span-2 rounded-xl transition-colors">
                <CardHeader className="pb-4">
                  <CardTitle className="heading-section flex items-center gap-2 font-semibold">
                    <span className="bg-primary/10 text-primary rounded-lg p-1">
                      <Target className="h-4 w-4" />
                    </span>
                    ミッション
                  </CardTitle>
                  <CardDescription>
                    ブランドが存在する理由、社会に提供する価値を定義します
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={designSystem.brandDNA?.mission || ""}
                    onChange={(e) => handleBrandDNAChange("mission", e.target.value)}
                    placeholder="例: テクノロジーの力で、すべての人のクリエイティブを解放する"
                    rows={3}
                  />
                </CardContent>
              </Card>

              <Card className="md:col-span-2 rounded-xl transition-colors">
                <CardHeader className="pb-4">
                  <CardTitle className="heading-section flex items-center gap-2 font-semibold">
                    <span className="bg-purple-500/10 text-purple-500 rounded-lg p-1">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    ビジョン
                  </CardTitle>
                  <CardDescription>
                    ブランドが目指す将来の姿を定義します
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={designSystem.brandDNA?.vision || ""}
                    onChange={(e) => handleBrandDNAChange("vision", e.target.value)}
                    placeholder="例: AIとクリエイティビティが融合した、新しいマーケティングの世界を創る"
                    rows={3}
                  />
                </CardContent>
              </Card>

              <Card className="md:col-span-2 rounded-xl transition-colors">
                <CardHeader className="pb-4">
                  <CardTitle className="heading-section flex items-center gap-2 font-semibold">
                    <span className="bg-rose-500/10 text-rose-500 rounded-lg p-1">
                      <Heart className="h-4 w-4" />
                    </span>
                    提供価値（バリュープロポジション）
                  </CardTitle>
                  <CardDescription>
                    競合と比較して、顧客にどんな独自の価値を提供するかを定義します
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={designSystem.brandDNA?.valueProposition || ""}
                    onChange={(e) => handleBrandDNAChange("valueProposition", e.target.value)}
                    placeholder="例: ブランドの個性をAIが理解し、一貫性のあるクリエイティブを瞬時に生成"
                    rows={3}
                  />
                </CardContent>
              </Card>

              <Card className="rounded-xl transition-colors">
                <CardHeader className="pb-4">
                  <CardTitle className="heading-section flex items-center gap-2 font-semibold">
                    <span className="bg-blue-500/10 text-blue-500 rounded-lg p-1">
                      <MessageSquare className="h-4 w-4" />
                    </span>
                    ブランドパーソナリティ
                  </CardTitle>
                  <CardDescription>
                    ブランドを人に例えたときの性格や特徴
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={designSystem.brandDNA?.personality || ""}
                    onChange={(e) => handleBrandDNAChange("personality", e.target.value)}
                    placeholder="例: 親しみやすく、革新的、信頼感がある"
                    rows={3}
                  />
                </CardContent>
              </Card>

              <Card className="rounded-xl transition-colors">
                <CardHeader className="pb-4">
                  <CardTitle className="heading-section flex items-center gap-2 font-semibold">
                    <span className="bg-emerald-500/10 text-emerald-500 rounded-lg p-1">
                      <Type className="h-4 w-4" />
                    </span>
                    トーン＆マナー
                  </CardTitle>
                  <CardDescription>
                    コミュニケーション全体のトーンや言葉遣い
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={designSystem.brandDNA?.tone || ""}
                    onChange={(e) => handleBrandDNAChange("tone", e.target.value)}
                    placeholder="例: 専門的だが親しみやすい、ポジティブで前向き"
                    rows={3}
                  />
                </CardContent>
              </Card>

              <Card className="md:col-span-2 rounded-xl transition-colors">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">ターゲットオーディエンス</CardTitle>
                  <CardDescription>
                    ブランドのターゲット層を定義します
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={designSystem.targetAudience || ""}
                    onChange={(e) =>
                      setDesignSystem((prev) => ({
                        ...prev,
                        targetAudience: e.target.value,
                      }))
                    }
                    placeholder="例: 20代から30代のビジネスパーソン、子育て中の母親、中小企業のマーケティング担当者"
                    rows={3}
                  />
                </CardContent>
              </Card>

              <Card className="md:col-span-2 rounded-xl transition-colors">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">ブランドバリュー</CardTitle>
                  <CardDescription>
                    ブランドが大切にする価値観を定義します
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      placeholder="ブランドバリューを入力"
                      onKeyDown={(e) => e.key === "Enter" && handleAddValue()}
                    />
                    <Button onClick={handleAddValue}>追加</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {designSystem.brandValues?.map((value) => (
                      <Badge key={value} variant="outline" className="gap-1 rounded-full">
                        {value}
                        <button
                          onClick={() => handleRemoveValue(value)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 rounded-xl transition-colors">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        キーワード
                      </CardTitle>
                      <CardDescription>
                        ブランドを表すキーワードを定義します
                      </CardDescription>
                    </div>
                    <Dialog open={isKeywordDialogOpen} onOpenChange={setIsKeywordDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Sparkles className="mr-2 h-4 w-4" />
                          AI提案
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>AIキーワード提案</DialogTitle>
                          <DialogDescription>
                            AIがブランド情報に基づいてキーワードを提案します
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <p className="text-sm text-muted-foreground">
                            ブランドDNAと既存のキーワードを分析して、SEOとAIOに効果的なキーワードを提案します。
                          </p>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsKeywordDialogOpen(false)}
                            disabled={isSuggestingKeywords}
                          >
                            キャンセル
                          </Button>
                          <Button
                            onClick={handleSuggestKeywords}
                            disabled={isSuggestingKeywords}
                          >
                            {isSuggestingKeywords ? (
                              <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                提案中...
                              </>
                            ) : (
                              <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                キーワードを提案
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="キーワードを入力"
                      onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
                    />
                    <Button onClick={handleAddKeyword}>追加</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {designSystem.keywords?.map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="gap-1 rounded-full">
                        {keyword}
                        <button
                          onClick={() => handleRemoveKeyword(keyword)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Design System Tab */}
          <TabsContent value="design-system" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">カラーパレット</CardTitle>
                  <CardDescription>
                    ブランドで使用するカラーを定義します
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {([
                      { key: "primary" as const, label: "プライマリ", default: "#F25533" },
                      { key: "secondary" as const, label: "セカンダリ", default: "#3054AD" },
                      { key: "accent" as const, label: "アクセント", default: "#F25533" },
                      { key: "background" as const, label: "背景", default: "#FFFFFF" },
                      { key: "text" as const, label: "テキスト", default: "#1A1A1A" },
                    ]).map(({ key, label, default: defaultVal }) => (
                      <div key={key} className="flex items-center gap-3">
                        <input
                          type="color"
                          value={designSystem.colors?.[key] || defaultVal}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          className="h-12 w-12 rounded-xl border cursor-pointer"
                        />
                        <div className="flex-1">
                          <Label>{label}</Label>
                          <Input
                            value={designSystem.colors?.[key] || defaultVal}
                            onChange={(e) => handleColorChange(key, e.target.value)}
                            placeholder={defaultVal}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">タイポグラフィ</CardTitle>
                  <CardDescription>
                    ブランドで使用するフォントを定義します
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>フォントファミリー</Label>
                    <Select
                      value={designSystem.typography?.fontFamily || "Noto Sans JP"}
                      onValueChange={(value) =>
                        setDesignSystem((prev) => ({
                          ...prev,
                          typography: {
                            ...prev.typography!,
                            fontFamily: value,
                          },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Noto Sans JP">Noto Sans JP</SelectItem>
                        <SelectItem value="Noto Serif JP">Noto Serif JP</SelectItem>
                        <SelectItem value="M PLUS 1p">M PLUS 1p</SelectItem>
                        <SelectItem value="Kosugi Maru">Kosugi Maru</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>ベースサイズ (px)</Label>
                    <Input
                      type="number"
                      value={designSystem.typography?.baseSize || 16}
                      onChange={(e) =>
                        setDesignSystem((prev) => ({
                          ...prev,
                          typography: {
                            ...prev.typography!,
                            baseSize: parseInt(e.target.value) || 16,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>スケール</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={designSystem.typography?.scale || 1.25}
                      onChange={(e) =>
                        setDesignSystem((prev) => ({
                          ...prev,
                          typography: {
                            ...prev.typography!,
                            scale: parseFloat(e.target.value) || 1.25,
                          },
                        }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">ボイス＆トーン</CardTitle>
                  <CardDescription>
                    ブランドの声のトーンを数値で定義します
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>フォーマリティ</Label>
                      <Select
                        value={designSystem.voiceTone?.formality || "neutral"}
                        onValueChange={(value: "formal" | "casual" | "neutral") =>
                          setDesignSystem((prev) => ({
                            ...prev,
                            voiceTone: {
                              ...prev.voiceTone!,
                              formality: value,
                            },
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="formal">フォーマル</SelectItem>
                          <SelectItem value="casual">カジュアル</SelectItem>
                          <SelectItem value="neutral">ニュートラル</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>熱意</Label>
                      <Select
                        value={designSystem.voiceTone?.enthusiasm || "medium"}
                        onValueChange={(value: "high" | "medium" | "low") =>
                          setDesignSystem((prev) => ({
                            ...prev,
                            voiceTone: {
                              ...prev.voiceTone!,
                              enthusiasm: value,
                            },
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">高い</SelectItem>
                          <SelectItem value="medium">中程度</SelectItem>
                          <SelectItem value="low">低い</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>共感性</Label>
                      <Select
                        value={designSystem.voiceTone?.empathy || "medium"}
                        onValueChange={(value: "high" | "medium" | "low") =>
                          setDesignSystem((prev) => ({
                            ...prev,
                            voiceTone: {
                              ...prev.voiceTone!,
                              empathy: value,
                            },
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">高い</SelectItem>
                          <SelectItem value="medium">中程度</SelectItem>
                          <SelectItem value="low">低い</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      <BrandExtractionDialog
        open={isExtractionDialogOpen}
        onOpenChange={setIsExtractionDialogOpen}
        brandId={selectedBrandId ?? undefined}
        onComplete={handleExtractionComplete}
      />
    </div>
  );
}
