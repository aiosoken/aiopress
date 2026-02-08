"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  subscribeToBrandAssets,
  createAsset,
  updateAsset,
  deleteAsset,
} from "@/lib/firebase/firestore";
import { uploadAsset, deleteFile } from "@/lib/firebase/storage";
import type { Asset } from "@/types";

interface AssetsState {
  assets: Asset[];
  currentAsset: Asset | null;
  loading: boolean;
  uploading: boolean;
  error: string | null;
}

export function useAssets() {
  const [state, setState] = useState<AssetsState>({
    assets: [],
    currentAsset: null,
    loading: false,
    uploading: false,
    error: null,
  });
  const brandIdRef = useRef<string | null>(null);
  const assetsRef = useRef<Asset[]>([]);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const fetchAssets = useCallback((brandId: string) => {
    // 前のリスナーを解除
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    brandIdRef.current = brandId;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    // リアルタイムリスナーを設定
    unsubscribeRef.current = subscribeToBrandAssets(
      brandId,
      (assets) => {
        assetsRef.current = assets;
        setState((prev) => ({ ...prev, assets, loading: false }));
      },
      (error) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "Failed to fetch assets",
        }));
      }
    );
  }, []);

  // ローカルキャッシュから選択（APIコール不要）
  const selectAsset = useCallback((assetId: string | null) => {
    if (!assetId) {
      setState((prev) => ({ ...prev, currentAsset: null }));
      return;
    }
    setState((prev) => {
      const asset = prev.assets.find((a) => a.id === assetId) || null;
      return { ...prev, currentAsset: asset };
    });
  }, []);

  const uploadNewAsset = useCallback(
    async (brandId: string, file: File, userId?: string) => {
      brandIdRef.current = brandId;
      setState((prev) => ({ ...prev, uploading: true, error: null }));
      try {
        const assetId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const { storagePath, downloadUrl } = await uploadAsset(
          brandId,
          assetId,
          file
        );

        await createAsset(
          brandId,
          file.name,
          file.type,
          storagePath,
          downloadUrl,
          userId || "anonymous",
          file.size
        );

        // リアルタイムリスナーが自動的に更新するので fetchAssets 不要
        setState((prev) => ({ ...prev, uploading: false }));
        return assetId;
      } catch (err) {
        console.error("Asset upload error:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to upload asset";
        setState((prev) => ({
          ...prev,
          uploading: false,
          error: errorMessage,
        }));
        throw err;
      }
    },
    []
  );

  // 楽観的更新（全データ再取得しない）
  const editAsset = useCallback(async (assetId: string, data: Partial<Asset>) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await updateAsset(assetId, data);
      setState((prev) => ({ ...prev, loading: false }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to update asset",
      }));
      throw err;
    }
  }, []);

  const removeAsset = useCallback(async (assetId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const asset = assetsRef.current.find((a) => a.id === assetId);
      if (asset?.storagePath) {
        await deleteFile(asset.storagePath);
      }
      await deleteAsset(assetId);
      // リアルタイムリスナーが自動的に更新
      setState((prev) => ({ ...prev, loading: false }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to delete asset",
      }));
      throw err;
    }
  }, []);

  return {
    ...state,
    fetchAssets,
    selectAsset,
    uploadNewAsset,
    editAsset,
    removeAsset,
  };
}
