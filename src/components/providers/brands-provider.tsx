"use client";

import React, { createContext, useContext, useEffect, useRef, useCallback, ReactNode } from "react";
import { useBrands } from "@/hooks/useBrands";
import { useAuthContext } from "./auth-provider";
import type { Brand } from "@/types";

interface BrandsContextType {
  brands: Brand[];
  currentBrand: Brand | null;
  selectedBrandId: string | null;
  loading: boolean;
  error: string | null;
  fetchBrands: (userId: string) => Promise<void>;
  selectBrand: (brandId: string) => void;
  addBrand: (name: string, description?: string) => Promise<string>;
  editBrand: (brandId: string, data: { name?: string; description?: string }) => Promise<void>;
  removeBrand: (brandId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const BrandsContext = createContext<BrandsContextType | null>(null);

export function BrandsProvider({ children }: { children: ReactNode }) {
  const { firebaseUser } = useAuthContext();
  const brandsState = useBrands();
  const fetchedUserIdRef = useRef<string | null>(null);

  // 初回フェッチのみ実行（同じユーザーで複数回フェッチしない）
  useEffect(() => {
    if (firebaseUser && fetchedUserIdRef.current !== firebaseUser.uid) {
      fetchedUserIdRef.current = firebaseUser.uid;
      brandsState.fetchBrands(firebaseUser.uid);
    }
    // ログアウト時にリセット
    if (!firebaseUser) {
      fetchedUserIdRef.current = null;
    }
  }, [firebaseUser]);

  const refetch = useCallback(async () => {
    if (firebaseUser) {
      await brandsState.fetchBrands(firebaseUser.uid);
    }
  }, [firebaseUser, brandsState.fetchBrands]);

  return (
    <BrandsContext.Provider value={{ ...brandsState, refetch }}>
      {children}
    </BrandsContext.Provider>
  );
}

export function useBrandsContext() {
  const context = useContext(BrandsContext);
  if (!context) {
    throw new Error("useBrandsContext must be used within a BrandsProvider");
  }
  return context;
}
