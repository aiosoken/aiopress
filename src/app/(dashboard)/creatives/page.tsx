"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import {
  Wand2,
  Plus,
  Copy,
  Twitter,
  Instagram,
  Facebook,
  FileText,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import type { CreativeType, Creative } from "@/types";
import { generateCreativeFunction } from "@/lib/firebase/functions";
import { getBrandCreatives } from "@/lib/firebase/firestore";

export default function CreativesPage() {
  const searchParams = useSearchParams();
  const brandIdParam = searchParams.get("brandId");
  const { firebaseUser } = useAuthContext();
  const { brands, loading: brandsLoading, fetchBrands } = useBrands();
  const [selectedBrandId, setSelectedBrandId] = useState<string>(brandIdParam || "");
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [creativeType, setCreativeType] = useState<CreativeType>("CATCH_COPY");
  const [instruction, setInstruction] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (firebaseUser) {
      fetchBrands(firebaseUser.uid);
    }
  }, [firebaseUser, fetchBrands]);

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
      const result = await generateCreativeFunction({
        brandId: selectedBrandId,
        type: creativeType,
        prompt: instruction,
      });

      if (result.data.success && result.data.creative) {
        toast.success("クリエイティブを生成しました");
        setIsGenerateOpen(false);
        setInstruction("");
        // クリエイティブ一覧を再取得
        await fetchCreatives();
      } else {
        toast.error("生成に失敗しました");
      }
    } catch (error: any) {
      console.error("Error generating creative:", error);
      toast.error(error.message || "生成に失敗しました");
    } finally {
      setIsGenerating(false);
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">クリエイティブ生成</h1>
          <p className="text-muted-foreground">
            AIを活用してブランドに最適化されたコンテンツを生成します
          </p>
        </div>
        <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedBrandId}>
              <Plus className="mr-2 h-4 w-4" />
              新規生成
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>クリエイティブを生成</DialogTitle>
              <DialogDescription>
                生成したいコンテンツの種類と指示を入力してください
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
                        キャッチコピー
                      </div>
                    </SelectItem>
                    <SelectItem value="SNS_POST">
                      <div className="flex items-center gap-2">
                        <Twitter className="h-4 w-4" />
                        SNS投稿
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
                        <Wand2 className="h-4 w-4" />
                        画像プロンプト
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instruction">指示・テーマ</Label>
                <Textarea
                  id="instruction"
                  placeholder="例: 新商品発売のお知らせ、春のキャンペーン告知など"
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  rows={4}
                />
              </div>
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
                    生成中...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    生成
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ブランドを選択</CardTitle>
          <CardDescription>
            クリエイティブを生成するブランドを選択してください
          </CardDescription>
        </CardHeader>
        <CardContent>
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
            <TabsTrigger value="all">すべて</TabsTrigger>
            <TabsTrigger value="CATCH_COPY">キャッチコピー</TabsTrigger>
            <TabsTrigger value="SNS_POST">SNS投稿</TabsTrigger>
            <TabsTrigger value="ARTICLE">記事</TabsTrigger>
            <TabsTrigger value="IMAGE">画像</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : creatives.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Wand2 className="h-16 w-16 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">
                    クリエイティブがありません
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    「新規生成」ボタンからクリエイティブを生成してください
                  </p>
                  <Button className="mt-6" onClick={() => setIsGenerateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    最初のクリエイティブを生成
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {creatives.map((creative) => (
                  <Card key={creative.id}>
                    <CardHeader>
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
                    </CardHeader>
                    <CardContent>
                      <pre className="whitespace-pre-wrap text-sm">
                        {creative.content}
                      </pre>
                      {creative.prompt && (
                        <p className="mt-4 text-xs text-muted-foreground">
                          プロンプト: {creative.prompt}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {(["CATCH_COPY", "SNS_POST", "ARTICLE", "IMAGE"] as CreativeType[]).map(
            (type) => (
              <TabsContent key={type} value={type}>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : creatives.filter((c) => c.type === type).length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      {getTypeIcon(type)}
                      <h3 className="mt-4 text-lg font-semibold">
                        {getTypeLabel(type)}がありません
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        「新規生成」ボタンから生成してください
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {creatives
                      .filter((c) => c.type === type)
                      .map((creative) => (
                        <Card key={creative.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary">
                                {getTypeLabel(creative.type)}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(creative.content)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <pre className="whitespace-pre-wrap text-sm">
                              {creative.content}
                            </pre>
                            {creative.prompt && (
                              <p className="mt-4 text-xs text-muted-foreground">
                                プロンプト: {creative.prompt}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
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
