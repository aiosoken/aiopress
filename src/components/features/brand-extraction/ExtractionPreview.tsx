"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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

  const confidenceColor =
    result.confidence >= 80
      ? "text-emerald-600 dark:text-emerald-400"
      : result.confidence >= 50
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-muted-foreground";

  return (
    <div className="max-h-[60vh] overflow-y-auto -mx-1 px-1">
      <div className="space-y-6">
        {/* カラーパレット */}
        <section>
          <h4 className="text-sm font-medium mb-3">カラーパレット</h4>
          <div className="flex gap-3">
            {(
              [
                { key: "primary" as const, label: "Primary" },
                { key: "secondary" as const, label: "Secondary" },
                { key: "accent" as const, label: "Accent" },
                { key: "background" as const, label: "BG" },
                { key: "text" as const, label: "Text" },
              ] as const
            ).map(({ key, label }) => (
              <div key={key} className="flex-1 min-w-0">
                <label className="block cursor-pointer group">
                  <div
                    className="h-12 rounded-lg border border-border group-hover:ring-2 ring-primary/30 transition-all"
                    style={{ backgroundColor: result.colors[key] }}
                  />
                  <input
                    type="color"
                    value={result.colors[key]}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="sr-only"
                  />
                </label>
                <p className="text-[11px] text-muted-foreground mt-1.5 text-center truncate">
                  {label}
                </p>
                <p className="text-[11px] font-mono text-center text-muted-foreground/70">
                  {result.colors[key].toUpperCase()}
                </p>
              </div>
            ))}
          </div>
        </section>

        <hr className="border-border" />

        {/* ブランドDNA */}
        <section>
          <h4 className="text-sm font-medium mb-3">ブランドDNA</h4>
          <div className="grid gap-3">
            {(
              [
                { key: "mission" as const, label: "ミッション" },
                { key: "vision" as const, label: "ビジョン" },
                { key: "valueProposition" as const, label: "提供価値" },
                { key: "personality" as const, label: "パーソナリティ" },
                { key: "tone" as const, label: "トーン＆マナー" },
              ] as const
            ).map(({ key, label }) => (
              <div key={key}>
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <Textarea
                  value={result.brandDNA[key]}
                  onChange={(e) => updateBrandDNA(key, e.target.value)}
                  rows={1}
                  className="mt-1 resize-none text-sm"
                />
              </div>
            ))}
          </div>
        </section>

        <hr className="border-border" />

        {/* タイポグラフィ & ボイス＆トーン */}
        <section>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-3">タイポグラフィ</h4>
              <Select
                value={result.typography.fontFamily}
                onValueChange={(v) => updateTypography("fontFamily", v)}
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

            <div>
              <h4 className="text-sm font-medium mb-3">ボイス＆トーン</h4>
              <div className="space-y-2">
                {(
                  [
                    {
                      key: "formality" as const,
                      label: "フォーマリティ",
                      options: [
                        { value: "formal", label: "フォーマル" },
                        { value: "neutral", label: "ニュートラル" },
                        { value: "casual", label: "カジュアル" },
                      ],
                    },
                    {
                      key: "enthusiasm" as const,
                      label: "熱意",
                      options: [
                        { value: "high", label: "高い" },
                        { value: "medium", label: "中程度" },
                        { value: "low", label: "低い" },
                      ],
                    },
                    {
                      key: "empathy" as const,
                      label: "共感性",
                      options: [
                        { value: "high", label: "高い" },
                        { value: "medium", label: "中程度" },
                        { value: "low", label: "低い" },
                      ],
                    },
                  ] as const
                ).map(({ key, label, options }) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-20 shrink-0">
                      {label}
                    </span>
                    <Select
                      value={result.voiceTone[key]}
                      onValueChange={(v) => updateVoiceTone(key, v)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <hr className="border-border" />

        {/* ターゲット */}
        <section>
          <h4 className="text-sm font-medium mb-3">ターゲットオーディエンス</h4>
          <Textarea
            value={result.targetAudience}
            onChange={(e) => updateField("targetAudience", e.target.value)}
            rows={2}
            className="resize-none text-sm"
          />
        </section>

        <hr className="border-border" />

        {/* キーワード & バリュー */}
        <section className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium mb-3">キーワード</h4>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {result.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="gap-1">
                  {keyword}
                  <button
                    onClick={() => removeKeyword(keyword)}
                    className="ml-0.5 opacity-50 hover:opacity-100 hover:text-destructive transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-1.5">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="追加..."
                className="h-8 text-sm"
                onKeyDown={(e) => e.key === "Enter" && addKeyword()}
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={addKeyword}
                className="h-8 px-2 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">ブランドバリュー</h4>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {result.brandValues.map((value) => (
                <Badge key={value} variant="outline" className="gap-1">
                  {value}
                  <button
                    onClick={() => removeBrandValue(value)}
                    className="ml-0.5 opacity-50 hover:opacity-100 hover:text-destructive transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-1.5">
              <Input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="追加..."
                className="h-8 text-sm"
                onKeyDown={(e) => e.key === "Enter" && addBrandValue()}
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={addBrandValue}
                className="h-8 px-2 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </section>

        {/* 信頼度 */}
        <div className="flex items-center justify-end gap-2 pt-2 text-xs text-muted-foreground">
          <span>信頼度</span>
          <span className={`font-medium ${confidenceColor}`}>
            {result.confidence}%
          </span>
        </div>
      </div>
    </div>
  );
}
