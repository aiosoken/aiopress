"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUp, Globe, ArrowRight } from "lucide-react";
import { useBrandExtraction } from "@/hooks/useBrandExtraction";
import { ExtractionPreview } from "./ExtractionPreview";
import type { BrandExtractionResult } from "@/types";

interface BrandExtractionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandId?: string;
  onComplete: (result: BrandExtractionResult) => void;
}

const ACCEPTED_FILE_TYPES = ".pdf,.jpg,.jpeg,.png,.webp";
const MAX_FILE_SIZE = 20 * 1024 * 1024;

export function BrandExtractionDialog({
  open,
  onOpenChange,
  brandId,
  onComplete,
}: BrandExtractionDialogProps) {
  const {
    extractionResult,
    isExtracting,
    error,
    extractFromFile,
    extractFromUrl,
    reset,
    setExtractionResult,
  } = useBrandExtraction();

  const [url, setUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    reset();
    setUrl("");
    setSelectedFile(null);
    setDragOver(false);
    onOpenChange(false);
  };

  const handleFileSelect = (file: File) => {
    if (file.size > MAX_FILE_SIZE) return;
    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleExtractFromFile = async () => {
    if (!selectedFile) return;
    await extractFromFile(selectedFile, brandId);
  };

  const handleExtractFromUrl = async () => {
    if (!url.trim()) return;
    try {
      new URL(url);
    } catch {
      return;
    }
    await extractFromUrl(url.trim(), brandId);
  };

  const handleApply = () => {
    if (extractionResult) {
      onComplete(extractionResult);
      handleClose();
    }
  };

  const handleRetry = () => {
    reset();
    setSelectedFile(null);
    setUrl("");
  };

  const isValidUrl = (() => {
    if (!url.trim()) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  })();

  // --- 抽出結果画面 ---
  if (extractionResult && !isExtracting) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>抽出結果</DialogTitle>
            <DialogDescription>
              内容を確認・編集して「適用」してください
            </DialogDescription>
          </DialogHeader>

          <ExtractionPreview
            result={extractionResult}
            onChange={setExtractionResult}
          />

          <DialogFooter>
            <Button variant="ghost" onClick={handleRetry}>
              やり直す
            </Button>
            <Button onClick={handleApply}>
              適用する
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // --- 入力 / ローディング / エラー画面 ---
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>ブランド情報を自動抽出</DialogTitle>
          <DialogDescription>
            PDF、画像、WebサイトURLからデザインシステムを自動設定します
          </DialogDescription>
        </DialogHeader>

        {/* 抽出中 */}
        {isExtracting && (
          <div className="flex flex-col items-center py-10 gap-3">
            <div className="relative h-10 w-10">
              <div className="absolute inset-0 rounded-full border-2 border-muted" />
              <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
            <div className="text-center mt-2">
              <p className="text-sm font-medium">分析中...</p>
              <p className="text-xs text-muted-foreground mt-1">
                30秒〜1分程度かかります
              </p>
            </div>
          </div>
        )}

        {/* エラー */}
        {error && !isExtracting && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm font-medium text-destructive">
              抽出できませんでした
            </p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={handleRetry}
            >
              やり直す
            </Button>
          </div>
        )}

        {/* 入力フォーム */}
        {!isExtracting && !error && (
          <Tabs defaultValue="file">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file" className="gap-2">
                <FileUp className="h-4 w-4" />
                ファイル
              </TabsTrigger>
              <TabsTrigger value="url" className="gap-2">
                <Globe className="h-4 w-4" />
                URL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="mt-4">
              {/* ドロップゾーン */}
              <div
                className={`rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
                  selectedFile
                    ? "border-primary/40 bg-primary/5"
                    : dragOver
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/20 hover:border-muted-foreground/40"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !selectedFile && fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <div className="flex items-center gap-3 p-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileUp className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                    >
                      変更
                    </Button>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mx-auto">
                      <FileUp className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm mt-3">
                      ドラッグ＆ドロップ、またはクリック
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF / JPG / PNG / WebP（最大20MB）
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_FILE_TYPES}
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>

              <Button
                className="w-full mt-4"
                onClick={handleExtractFromFile}
                disabled={!selectedFile}
              >
                抽出する
              </Button>
            </TabsContent>

            <TabsContent value="url" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>WebサイトURL</Label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  type="url"
                  onKeyDown={(e) =>
                    e.key === "Enter" && isValidUrl && handleExtractFromUrl()
                  }
                />
                <p className="text-xs text-muted-foreground">
                  メタ情報・コンテンツ・画像からブランド情報を抽出します
                </p>
              </div>

              <Button
                className="w-full"
                onClick={handleExtractFromUrl}
                disabled={!isValidUrl}
              >
                抽出する
              </Button>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
