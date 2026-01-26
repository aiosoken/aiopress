"use client";

import { useState, useCallback, useRef } from "react";
import {
  getUserBrands,
  getBrand,
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
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const brand = await getBrand(brandId);
      setState((prev) => ({ ...prev, currentBrand: brand, loading: false }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch brand",
      }));
    }
  }, []);

  const addBrand = useCallback(
    async (name: string, description?: string) => {
      const userId = userIdRef.current;
      if (!userId) throw new Error("User not authenticated");

      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const brandId = await createBrand(name, userId, description);
        await fetchBrands(userId);
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
    [fetchBrands]
  );

  const editBrand = useCallback(
    async (brandId: string, data: { name?: string; description?: string }) => {
      const userId = userIdRef.current;
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        await updateBrand(brandId, data);
        if (userId) {
          await fetchBrands(userId);
        }
        if (state.currentBrand?.id === brandId) {
          const updatedBrand = await getBrand(brandId);
          setState((prev) => ({ ...prev, currentBrand: updatedBrand }));
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to update brand",
        }));
        throw err;
      }
    },
    [fetchBrands, state.currentBrand?.id]
  );

  const removeBrand = useCallback(
    async (brandId: string) => {
      const userId = userIdRef.current;
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        await deleteBrand(brandId);
        if (state.currentBrand?.id === brandId) {
          setState((prev) => ({ ...prev, currentBrand: null }));
        }
        if (userId) {
          await fetchBrands(userId);
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to delete brand",
        }));
        throw err;
      }
    },
    [fetchBrands, state.currentBrand?.id]
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
