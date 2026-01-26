"use client";

import { useState, useCallback, useRef } from "react";
import {
  getBrandAssets,
  getAsset,
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

  const fetchAssets = useCallback(async (brandId: string) => {
    brandIdRef.current = brandId;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const assets = await getBrandAssets(brandId);
      setState((prev) => ({ ...prev, assets, loading: false }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch assets",
      }));
    }
  }, []);

  const selectAsset = useCallback(async (assetId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const asset = await getAsset(assetId);
      setState((prev) => ({ ...prev, currentAsset: asset, loading: false }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch asset",
      }));
    }
  }, []);

  const uploadNewAsset = useCallback(
    async (brandId: string, file: File, userId?: string) => {
      brandIdRef.current = brandId;
      setState((prev) => ({ ...prev, uploading: true, error: null }));
      try {
        const tempId = `temp_${Date.now()}`;
        const { storagePath, downloadUrl } = await uploadAsset(
          brandId,
          tempId,
          file
        );

        const assetId = await createAsset(
          brandId,
          file.name,
          file.type,
          storagePath,
          downloadUrl,
          userId || "anonymous"
        );

        await fetchAssets(brandId);
        setState((prev) => ({ ...prev, uploading: false }));
        return assetId;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          uploading: false,
          error: err instanceof Error ? err.message : "Failed to upload asset",
        }));
        throw err;
      }
    },
    [fetchAssets]
  );

  const editAsset = useCallback(
    async (assetId: string, data: Partial<Asset>) => {
      const brandId = brandIdRef.current;
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        await updateAsset(assetId, data);
        if (brandId) {
          await fetchAssets(brandId);
        }
        if (state.currentAsset?.id === assetId) {
          const updatedAsset = await getAsset(assetId);
          setState((prev) => ({ ...prev, currentAsset: updatedAsset }));
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to update asset",
        }));
        throw err;
      }
    },
    [fetchAssets, state.currentAsset?.id]
  );

  const removeAsset = useCallback(
    async (assetId: string) => {
      const brandId = brandIdRef.current;
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const asset = await getAsset(assetId);
        if (asset?.storagePath) {
          await deleteFile(asset.storagePath);
        }
        await deleteAsset(assetId);
        if (state.currentAsset?.id === assetId) {
          setState((prev) => ({ ...prev, currentAsset: null }));
        }
        if (brandId) {
          await fetchAssets(brandId);
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to delete asset",
        }));
        throw err;
      }
    },
    [fetchAssets, state.currentAsset?.id]
  );

  return {
    ...state,
    fetchAssets,
    selectAsset,
    uploadNewAsset,
    editAsset,
    removeAsset,
  };
}
