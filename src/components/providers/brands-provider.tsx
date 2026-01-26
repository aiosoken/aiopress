"use client";

import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useBrands } from "@/hooks/useBrands";
import { useAuthContext } from "./auth-provider";
import type { Brand } from "@/types";

interface BrandsContextType {
  brands: Brand[];
  currentBrand: Brand | null;
  loading: boolean;
  error: string | null;
  fetchBrands: (userId: string) => Promise<void>;
  selectBrand: (brandId: string) => Promise<void>;
  addBrand: (name: string, description?: string) => Promise<string>;
  editBrand: (brandId: string, data: { name?: string; description?: string }) => Promise<void>;
  removeBrand: (brandId: string) => Promise<void>;
}

const BrandsContext = createContext<BrandsContextType | null>(null);

export function BrandsProvider({ children }: { children: ReactNode }) {
  const { firebaseUser } = useAuthContext();
  const brandsState = useBrands();

  // ユーザーがログインしたら自動的にブランドを取得
  useEffect(() => {
    if (firebaseUser) {
      brandsState.fetchBrands(firebaseUser.uid);
    }
  }, [firebaseUser]);

  return (
    <BrandsContext.Provider value={brandsState}>
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
