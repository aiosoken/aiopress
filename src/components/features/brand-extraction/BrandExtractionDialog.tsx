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
import { FileUp, Globe, Upload, AlertCircle, RotateCcw } from "lucide-react";
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
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

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
    if (file.size > MAX_FILE_SIZE) {
      return;
    }
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {extractionResult
              ? "抽出結果を確認"
              : "素材からブランド情報を抽出"}
          </DialogTitle>
          <DialogDescription>
            {extractionResult
              ? "抽出されたブランド情報を確認・編集してください"
              : "PDF、画像、またはWebサイトURLからブランド情報をAIが自動抽出します"}
          </DialogDescription>
        </DialogHeader>

        {/* 抽出中 */}
        {isExtracting && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              ブランド情報を分析中...
            </p>
            <p className="text-xs text-muted-foreground">
              処理には30秒〜1分程度かかります
            </p>
          </div>
        )}

        {/* エラー表示 */}
        {error && !isExtracting && (
          <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">
                抽出に失敗しました
              </p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={handleRetry}
              >
                <RotateCcw className="mr-2 h-3 w-3" />
                やり直す
              </Button>
            </div>
          </div>
        )}

        {/* 抽出結果プレビュー */}
        {extractionResult && !isExtracting && (
          <>
            <ExtractionPreview
              result={extractionResult}
              onChange={setExtractionResult}
            />
            <DialogFooter>
              <Button variant="outline" onClick={handleRetry}>
                <RotateCcw className="mr-2 h-4 w-4" />
                再抽出
              </Button>
              <Button onClick={handleApply}>適用</Button>
            </DialogFooter>
          </>
        )}

        {/* 入力フォーム（未抽出時） */}
        {!extractionResult && !isExtracting && !error && (
          <>
            <Tabs defaultValue="file" className="mt-2">
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

              <TabsContent value="file" className="space-y-4 mt-4">
                {/* ドラッグ＆ドロップエリア */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                    dragOver
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">
                    ファイルをドラッグ＆ドロップ
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    またはクリックして選択（PDF, JPG, PNG, WebP / 最大20MB）
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_FILE_TYPES}
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>

                {/* 選択されたファイル */}
                {selectedFile && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <FileUp className="h-5 w-5 text-primary shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleExtractFromFile}
                      disabled={isExtracting}
                    >
                      抽出開始
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="url" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>WebサイトURL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      type="url"
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        isValidUrl &&
                        handleExtractFromUrl()
                      }
                    />
                    <Button
                      onClick={handleExtractFromUrl}
                      disabled={!isValidUrl || isExtracting}
                    >
                      抽出
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Webサイトのメタ情報・コンテンツ・画像からブランド情報を抽出します
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                キャンセル
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
