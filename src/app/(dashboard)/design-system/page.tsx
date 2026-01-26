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
import { Palette, Plus, X, Save } from "lucide-react";
import { toast } from "sonner";

interface DesignSystemData {
  colors: Array<{ name: string; value: string }>;
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  voiceTone: string;
  keywords: string[];
  brandValues: string[];
}

const defaultDesignSystem: DesignSystemData = {
  colors: [
    { name: "プライマリ", value: "#3b82f6" },
    { name: "セカンダリ", value: "#64748b" },
    { name: "アクセント", value: "#f59e0b" },
  ],
  typography: {
    headingFont: "Noto Sans JP",
    bodyFont: "Noto Sans JP",
  },
  voiceTone: "",
  keywords: [],
  brandValues: [],
};

export default function DesignSystemPage() {
  const searchParams = useSearchParams();
  const brandIdParam = searchParams.get("brandId");
  const { firebaseUser } = useAuthContext();
  const { brands, loading: brandsLoading, fetchBrands } = useBrands();
  const [selectedBrandId, setSelectedBrandId] = useState<string>(brandIdParam || "");
  const [designSystem, setDesignSystem] = useState<DesignSystemData>(defaultDesignSystem);
  const [newKeyword, setNewKeyword] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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

  const handleAddColor = () => {
    setDesignSystem((prev) => ({
      ...prev,
      colors: [...prev.colors, { name: `カラー${prev.colors.length + 1}`, value: "#000000" }],
    }));
  };

  const handleRemoveColor = (index: number) => {
    setDesignSystem((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  const handleColorChange = (index: number, field: "name" | "value", value: string) => {
    setDesignSystem((prev) => ({
      ...prev,
      colors: prev.colors.map((color, i) =>
        i === index ? { ...color, [field]: value } : color
      ),
    }));
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !designSystem.keywords.includes(newKeyword.trim())) {
      setDesignSystem((prev) => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()],
      }));
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setDesignSystem((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword),
    }));
  };

  const handleAddValue = () => {
    if (newValue.trim() && !designSystem.brandValues.includes(newValue.trim())) {
      setDesignSystem((prev) => ({
        ...prev,
        brandValues: [...prev.brandValues, newValue.trim()],
      }));
      setNewValue("");
    }
  };

  const handleRemoveValue = (value: string) => {
    setDesignSystem((prev) => ({
      ...prev,
      brandValues: prev.brandValues.filter((v) => v !== value),
    }));
  };

  const handleSave = async () => {
    if (!selectedBrandId) return;

    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("デザインシステムを保存しました");
    } catch (error) {
      toast.error("保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">デザインシステム</h1>
          <p className="text-muted-foreground">
            ブランドのデザインシステムを管理します
          </p>
        </div>
        <Button onClick={handleSave} disabled={!selectedBrandId || isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "保存中..." : "保存"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ブランドを選択</CardTitle>
          <CardDescription>
            デザインシステムを編集するブランドを選択してください
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
            <Palette className="h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">
              ブランドを選択してください
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              デザインシステムを編集するにはブランドを選択する必要があります
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>カラーパレット</CardTitle>
              <CardDescription>
                ブランドで使用するカラーを定義します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {designSystem.colors.map((color, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color.value}
                    onChange={(e) => handleColorChange(index, "value", e.target.value)}
                    className="h-10 w-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={color.name}
                    onChange={(e) => handleColorChange(index, "name", e.target.value)}
                    placeholder="カラー名"
                    className="flex-1"
                  />
                  <Input
                    value={color.value}
                    onChange={(e) => handleColorChange(index, "value", e.target.value)}
                    placeholder="#000000"
                    className="w-28"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveColor(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={handleAddColor} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                カラーを追加
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>タイポグラフィ</CardTitle>
              <CardDescription>
                ブランドで使用するフォントを定義します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>見出しフォント</Label>
                <Select
                  value={designSystem.typography.headingFont}
                  onValueChange={(value) =>
                    setDesignSystem((prev) => ({
                      ...prev,
                      typography: { ...prev.typography, headingFont: value },
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
                <Label>本文フォント</Label>
                <Select
                  value={designSystem.typography.bodyFont}
                  onValueChange={(value) =>
                    setDesignSystem((prev) => ({
                      ...prev,
                      typography: { ...prev.typography, bodyFont: value },
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ボイス＆トーン</CardTitle>
              <CardDescription>
                ブランドの声のトーンを定義します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={designSystem.voiceTone}
                onChange={(e) =>
                  setDesignSystem((prev) => ({ ...prev, voiceTone: e.target.value }))
                }
                placeholder="例: フレンドリーで親しみやすい、プロフェッショナルで信頼感のある、など"
                rows={4}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>キーワード</CardTitle>
              <CardDescription>
                ブランドを表すキーワードを定義します
              </CardDescription>
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
                {designSystem.keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="gap-1">
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

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>ブランドバリュー</CardTitle>
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
                {designSystem.brandValues.map((value) => (
                  <Badge key={value} variant="outline" className="gap-1">
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
        </div>
      )}
    </div>
  );
}
