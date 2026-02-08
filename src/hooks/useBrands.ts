"use client";

import { useState, useCallback, useRef } from "react";
import {
  getUserBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "@/lib/firebase/firestore";
import type { Brand } from "@/types";

const STORAGE_KEY = "aiopress_selectedBrandId";

function getStoredBrandId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredBrandId(brandId: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (brandId) {
      localStorage.setItem(STORAGE_KEY, brandId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
}

interface BrandsState {
  brands: Brand[];
  currentBrand: Brand | null;
  selectedBrandId: string | null;
  loading: boolean;
  error: string | null;
}

export function useBrands() {
  const [state, setState] = useState<BrandsState>({
    brands: [],
    currentBrand: null,
    selectedBrandId: getStoredBrandId(),
    loading: false,
    error: null,
  });
  const userIdRef = useRef<string | null>(null);

  const fetchBrands = useCallback(async (userId: string) => {
    userIdRef.current = userId;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const brands = await getUserBrands(userId);
      setState((prev) => {
        // Validate selectedBrandId against fetched brands
        const storedId = prev.selectedBrandId;
        const validId = storedId && brands.some((b) => b.id === storedId)
          ? storedId
          : brands.length > 0 ? brands[0].id : null;
        if (validId !== storedId) {
          setStoredBrandId(validId);
        }
        const currentBrand = validId ? brands.find((b) => b.id === validId) || null : null;
        return { ...prev, brands, selectedBrandId: validId, currentBrand, loading: false };
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch brands",
      }));
    }
  }, []);

  const selectBrand = useCallback((brandId: string) => {
    setStoredBrandId(brandId);
    setState((prev) => {
      const brand = prev.brands.find((b) => b.id === brandId) || null;
      return { ...prev, selectedBrandId: brandId, currentBrand: brand };
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
        setState((prev) => {
          const isFirst = prev.brands.length === 0;
          if (isFirst) {
            setStoredBrandId(brandId);
          }
          return {
            ...prev,
            brands: [...prev.brands, newBrand],
            selectedBrandId: isFirst ? brandId : prev.selectedBrandId,
            currentBrand: isFirst ? newBrand : prev.currentBrand,
            loading: false,
          };
        });
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
        setState((prev) => {
          const remaining = prev.brands.filter((b) => b.id !== brandId);
          const wasSelected = prev.selectedBrandId === brandId;
          const newSelectedId = wasSelected
            ? (remaining.length > 0 ? remaining[0].id : null)
            : prev.selectedBrandId;
          if (wasSelected) {
            setStoredBrandId(newSelectedId);
          }
          return {
            ...prev,
            brands: remaining,
            selectedBrandId: newSelectedId,
            currentBrand: wasSelected
              ? (newSelectedId ? remaining.find((b) => b.id === newSelectedId) || null : null)
              : prev.currentBrand,
            loading: false,
          };
        });
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
