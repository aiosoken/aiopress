"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { X, Plus } from "lucide-react";
import type { BrandExtractionResult, BrandDNA } from "@/types";

interface ExtractionPreviewProps {
  result: BrandExtractionResult;
  onChange: (result: BrandExtractionResult) => void;
}

export function ExtractionPreview({
  result,
  onChange,
}: ExtractionPreviewProps) {
  const [newKeyword, setNewKeyword] = useState("");
  const [newValue, setNewValue] = useState("");

  const updateField = <K extends keyof BrandExtractionResult>(
    field: K,
    value: BrandExtractionResult[K]
  ) => {
    onChange({ ...result, [field]: value });
  };

  const updateColor = (
    key: keyof BrandExtractionResult["colors"],
    value: string
  ) => {
    onChange({ ...result, colors: { ...result.colors, [key]: value } });
  };

  const updateTypography = (
    key: keyof BrandExtractionResult["typography"],
    value: string | number
  ) => {
    onChange({
      ...result,
      typography: { ...result.typography, [key]: value },
    });
  };

  const updateVoiceTone = (
    key: keyof BrandExtractionResult["voiceTone"],
    value: string
  ) => {
    onChange({ ...result, voiceTone: { ...result.voiceTone, [key]: value } });
  };

  const updateBrandDNA = (key: keyof BrandDNA, value: string) => {
    onChange({ ...result, brandDNA: { ...result.brandDNA, [key]: value } });
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !result.keywords.includes(newKeyword.trim())) {
      updateField("keywords", [...result.keywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    updateField(
      "keywords",
      result.keywords.filter((k) => k !== keyword)
    );
  };

  const addBrandValue = () => {
    if (newValue.trim() && !result.brandValues.includes(newValue.trim())) {
      updateField("brandValues", [...result.brandValues, newValue.trim()]);
      setNewValue("");
    }
  };

  const removeBrandValue = (value: string) => {
    updateField(
      "brandValues",
      result.brandValues.filter((v) => v !== value)
    );
  };

  const sourceLabel =
    result.sourceType === "pdf"
      ? "PDF"
      : result.sourceType === "image"
        ? "画像"
        : "URL";

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
      {/* 信頼度 & ソース */}
      <div className="flex items-center gap-3">
        <Badge variant="outline">{sourceLabel}から抽出</Badge>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>信頼度:</span>
          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${result.confidence}%` }}
            />
          </div>
          <span className="font-medium">{result.confidence}%</span>
        </div>
      </div>

      {/* ブランド名 & 説明 */}
      {(result.brandName || result.brandDescription) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">ブランド情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.brandName && (
              <div className="space-y-1">
                <Label className="text-xs">ブランド名</Label>
                <Input
                  value={result.brandName}
                  onChange={(e) => updateField("brandName", e.target.value)}
                />
              </div>
            )}
            {result.brandDescription && (
              <div className="space-y-1">
                <Label className="text-xs">説明</Label>
                <Textarea
                  value={result.brandDescription}
                  onChange={(e) =>
                    updateField("brandDescription", e.target.value)
                  }
                  rows={2}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* カラーパレット */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">カラーパレット</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {(
              [
                { key: "primary" as const, label: "プライマリ" },
                { key: "secondary" as const, label: "セカンダリ" },
                { key: "accent" as const, label: "アクセント" },
                { key: "background" as const, label: "背景" },
                { key: "text" as const, label: "テキスト" },
              ] as const
            ).map(({ key, label }) => (
              <div key={key} className="text-center space-y-1">
                <input
                  type="color"
                  value={result.colors[key]}
                  onChange={(e) => updateColor(key, e.target.value)}
                  className="h-10 w-10 rounded border cursor-pointer mx-auto block"
                />
                <p className="text-[10px] text-muted-foreground">{label}</p>
                <Input
                  value={result.colors[key]}
                  onChange={(e) => updateColor(key, e.target.value)}
                  className="text-xs h-7 text-center px-1"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* タイポグラフィ & ボイス＆トーン */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">タイポグラフィ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs">フォント</Label>
              <Select
                value={result.typography.fontFamily}
                onValueChange={(v) => updateTypography("fontFamily", v)}
              >
                <SelectTrigger className="h-8 text-xs">
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
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">ボイス＆トーン</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs">フォーマリティ</Label>
              <Select
                value={result.voiceTone.formality}
                onValueChange={(v) => updateVoiceTone("formality", v)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">フォーマル</SelectItem>
                  <SelectItem value="casual">カジュアル</SelectItem>
                  <SelectItem value="neutral">ニュートラル</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">熱意</Label>
              <Select
                value={result.voiceTone.enthusiasm}
                onValueChange={(v) => updateVoiceTone("enthusiasm", v)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">高い</SelectItem>
                  <SelectItem value="medium">中程度</SelectItem>
                  <SelectItem value="low">低い</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">共感性</Label>
              <Select
                value={result.voiceTone.empathy}
                onValueChange={(v) => updateVoiceTone("empathy", v)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">高い</SelectItem>
                  <SelectItem value="medium">中程度</SelectItem>
                  <SelectItem value="low">低い</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Brand DNA */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">ブランドDNA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(
            [
              { key: "mission" as const, label: "ミッション" },
              { key: "vision" as const, label: "ビジョン" },
              { key: "valueProposition" as const, label: "提供価値" },
              { key: "personality" as const, label: "パーソナリティ" },
              { key: "tone" as const, label: "トーン＆マナー" },
            ] as const
          ).map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs">{label}</Label>
              <Textarea
                value={result.brandDNA[key]}
                onChange={(e) => updateBrandDNA(key, e.target.value)}
                rows={2}
                className="text-sm"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ターゲットオーディエンス */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            ターゲットオーディエンス
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={result.targetAudience}
            onChange={(e) => updateField("targetAudience", e.target.value)}
            rows={2}
            className="text-sm"
          />
        </CardContent>
      </Card>

      {/* キーワード */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">キーワード</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="キーワードを追加"
              className="h-8 text-sm"
              onKeyDown={(e) => e.key === "Enter" && addKeyword()}
            />
            <Button size="sm" variant="outline" onClick={addKeyword}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {result.keywords.map((keyword) => (
              <Badge key={keyword} variant="secondary" className="gap-1 text-xs">
                {keyword}
                <button
                  onClick={() => removeKeyword(keyword)}
                  className="ml-0.5 hover:text-destructive"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ブランドバリュー */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">ブランドバリュー</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="バリューを追加"
              className="h-8 text-sm"
              onKeyDown={(e) => e.key === "Enter" && addBrandValue()}
            />
            <Button size="sm" variant="outline" onClick={addBrandValue}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {result.brandValues.map((value) => (
              <Badge key={value} variant="outline" className="gap-1 text-xs">
                {value}
                <button
                  onClick={() => removeBrandValue(value)}
                  className="ml-0.5 hover:text-destructive"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
