"use client";

import { useState, useCallback, useRef } from "react";
import {
  getBrandAssets,
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

  const fetchAssets = useCallback(async (brandId: string) => {
    brandIdRef.current = brandId;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const assets = await getBrandAssets(brandId);
      assetsRef.current = assets;
      setState((prev) => ({ ...prev, assets, loading: false }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch assets",
      }));
    }
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
        // アセットIDを先に生成（Cloud Functionsで使用）
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

        await fetchAssets(brandId);
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
    [fetchAssets]
  );

  // 楽観的更新（全データ再取得しない）
  const editAsset = useCallback(async (assetId: string, data: Partial<Asset>) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await updateAsset(assetId, data);
      // 楽観的更新：ローカルのstateを直接更新
      setState((prev) => ({
        ...prev,
        loading: false,
        assets: prev.assets.map((a) =>
          a.id === assetId ? { ...a, ...data } : a
        ),
        currentAsset:
          prev.currentAsset?.id === assetId
            ? { ...prev.currentAsset, ...data }
            : prev.currentAsset,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to update asset",
      }));
      throw err;
    }
  }, []);

  // 楽観的更新（全データ再取得しない）
  const removeAsset = useCallback(async (assetId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // refからstoragePathを取得（API呼び出し不要）
      const asset = assetsRef.current.find((a) => a.id === assetId);
      if (asset?.storagePath) {
        await deleteFile(asset.storagePath);
      }
      await deleteAsset(assetId);

      // refも更新
      assetsRef.current = assetsRef.current.filter((a) => a.id !== assetId);

      // 楽観的更新：ローカルのstateから削除
      setState((prev) => ({
        ...prev,
        loading: false,
        assets: prev.assets.filter((a) => a.id !== assetId),
        currentAsset: prev.currentAsset?.id === assetId ? null : prev.currentAsset,
      }));
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
