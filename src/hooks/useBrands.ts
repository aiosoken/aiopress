"use client";

import { useState, useCallback, useRef } from "react";
import {
  getUserBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "@/lib/firebase/firestore";
import type { Brand } from "@/types";

interface BrandsState {
  brands: Brand[];
  currentBrand: Brand | null;
  loading: boolean;
  error: string | null;
}

export function useBrands() {
  const [state, setState] = useState<BrandsState>({
    brands: [],
    currentBrand: null,
    loading: false,
    error: null,
  });
  const userIdRef = useRef<string | null>(null);

  const fetchBrands = useCallback(async (userId: string) => {
    userIdRef.current = userId;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const brands = await getUserBrands(userId);
      setState((prev) => ({ ...prev, brands, loading: false }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch brands",
      }));
    }
  }, []);

  const selectBrand = useCallback(async (brandId: string) => {
    // 既にローカルにあるブランドを使用（Firestoreへのアクセス不要）
    setState((prev) => {
      const brand = prev.brands.find((b) => b.id === brandId) || null;
      return { ...prev, currentBrand: brand };
    });
  }, []);

  const addBrand = useCallback(
    async (name: string, description?: string) => {
      const userId = userIdRef.current;
      if (!userId) throw new Error("User not authenticated");

      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const brandId = await createBrand(name, userId, description);
        // 楽観的更新: 新しいブランドをローカルに追加
        const newBrand: Brand = {
          id: brandId,
          name,
          description: description || "",
          ownerId: userId,
          createdAt: new Date() as unknown as import("firebase/firestore").Timestamp,
          updatedAt: new Date() as unknown as import("firebase/firestore").Timestamp,
        };
        setState((prev) => ({
          ...prev,
          brands: [...prev.brands, newBrand],
          loading: false,
        }));
        return brandId;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to create brand",
        }));
        throw err;
      }
    },
    []
  );

  const editBrand = useCallback(
    async (brandId: string, data: { name?: string; description?: string }) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        await updateBrand(brandId, data);
        // 楽観的更新: ローカルでブランドを更新
        setState((prev) => ({
          ...prev,
          brands: prev.brands.map((b) =>
            b.id === brandId ? { ...b, ...data, updatedAt: new Date() as unknown as import("firebase/firestore").Timestamp } : b
          ),
          currentBrand:
            prev.currentBrand?.id === brandId
              ? { ...prev.currentBrand, ...data, updatedAt: new Date() as unknown as import("firebase/firestore").Timestamp }
              : prev.currentBrand,
          loading: false,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to update brand",
        }));
        throw err;
      }
    },
    []
  );

  const removeBrand = useCallback(
    async (brandId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        await deleteBrand(brandId);
        // 楽観的更新: ローカルでブランドを削除
        setState((prev) => ({
          ...prev,
          brands: prev.brands.filter((b) => b.id !== brandId),
          currentBrand: prev.currentBrand?.id === brandId ? null : prev.currentBrand,
          loading: false,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to delete brand",
        }));
        throw err;
      }
    },
    []
  );

  return {
    ...state,
    fetchBrands,
    selectBrand,
    addBrand,
    editBrand,
    removeBrand,
  };
}
