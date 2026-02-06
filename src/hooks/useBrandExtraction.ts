"use client";

import { useState, useCallback } from "react";
import { useAuthContext } from "@/components/providers";
import { uploadFile } from "@/lib/firebase/storage";
import {
  extractBrandFromFileFunction,
  extractBrandFromUrlFunction,
} from "@/lib/firebase/functions";
import { deleteFile } from "@/lib/firebase/storage";
import type { BrandExtractionResult } from "@/types";

interface UseBrandExtractionReturn {
  extractionResult: BrandExtractionResult | null;
  isExtracting: boolean;
  error: string | null;
  extractFromFile: (file: File, brandId?: string) => Promise<void>;
  extractFromUrl: (url: string, brandId?: string) => Promise<void>;
  reset: () => void;
  setExtractionResult: (result: BrandExtractionResult | null) => void;
}

export function useBrandExtraction(): UseBrandExtractionReturn {
  const { firebaseUser } = useAuthContext();
  const [extractionResult, setExtractionResult] =
    useState<BrandExtractionResult | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractFromFile = useCallback(
    async (file: File, brandId?: string) => {
      if (!firebaseUser) {
        setError("ログインが必要です");
        return;
      }

      setIsExtracting(true);
      setError(null);
      setExtractionResult(null);

      let tempPath = "";
      try {
        // 一時ファイルをCloud Storageにアップロード
        const ext = file.name.split(".").pop() || "";
        tempPath = `temp/brand-extraction/${firebaseUser.uid}/${Date.now()}.${ext}`;
        const { downloadUrl } = await uploadFile(file, tempPath);

        // Cloud Functionを呼び出し
        const response = await extractBrandFromFileFunction({
          fileUrl: downloadUrl,
          fileType: file.type,
          fileName: file.name,
          brandId,
        });

        if (response.data.success && response.data.result) {
          setExtractionResult(response.data.result);
        } else {
          setError("抽出結果を取得できませんでした");
        }
      } catch (err: any) {
        console.error("Brand extraction from file failed:", err);
        setError(err.message || "ファイルからのブランド情報抽出に失敗しました");
      } finally {
        // 一時ファイルを削除
        if (tempPath) {
          try {
            await deleteFile(tempPath);
          } catch {
            // 一時ファイルの削除失敗は無視
          }
        }
        setIsExtracting(false);
      }
    },
    [firebaseUser]
  );

  const extractFromUrl = useCallback(
    async (url: string, brandId?: string) => {
      if (!firebaseUser) {
        setError("ログインが必要です");
        return;
      }

      setIsExtracting(true);
      setError(null);
      setExtractionResult(null);

      try {
        const response = await extractBrandFromUrlFunction({ url, brandId });

        if (response.data.success && response.data.result) {
          setExtractionResult(response.data.result);
        } else {
          setError("抽出結果を取得できませんでした");
        }
      } catch (err: any) {
        console.error("Brand extraction from URL failed:", err);
        setError(err.message || "URLからのブランド情報抽出に失敗しました");
      } finally {
        setIsExtracting(false);
      }
    },
    [firebaseUser]
  );

  const reset = useCallback(() => {
    setExtractionResult(null);
    setIsExtracting(false);
    setError(null);
  }, []);

  return {
    extractionResult,
    isExtracting,
    error,
    extractFromFile,
    extractFromUrl,
    reset,
    setExtractionResult,
  };
}
