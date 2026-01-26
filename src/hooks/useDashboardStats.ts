"use client";

import { useState, useCallback, useEffect } from "react";
import {
  getAllUserAssets,
  getAllUserCreatives,
  getAllUserDesignSystems,
} from "@/lib/firebase/firestore";
import type { Asset, Creative, DesignSystem } from "@/types";

interface DashboardStats {
  totalAssets: number;
  totalCreatives: number;
  designSystemProgress: number;
  recentAssets: Asset[];
  recentCreatives: Creative[];
}

interface DashboardStatsState {
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
}

function calculateDesignSystemProgress(designSystems: DesignSystem[]): number {
  if (designSystems.length === 0) return 0;

  let totalProgress = 0;

  for (const ds of designSystems) {
    let progress = 0;
    let fields = 0;

    // Colors (20%)
    if (ds.colors) {
      const colorFields = ["primary", "secondary", "accent", "background", "text"];
      const filledColors = colorFields.filter(
        (f) => ds.colors[f as keyof typeof ds.colors] && ds.colors[f as keyof typeof ds.colors] !== "#000000"
      ).length;
      progress += (filledColors / colorFields.length) * 20;
    }
    fields++;

    // Typography (20%)
    if (ds.typography) {
      const hasFont = ds.typography.fontFamily && ds.typography.fontFamily !== "";
      const hasSize = ds.typography.baseSize && ds.typography.baseSize > 0;
      const hasScale = ds.typography.scale && ds.typography.scale > 0;
      progress += ((hasFont ? 1 : 0) + (hasSize ? 1 : 0) + (hasScale ? 1 : 0)) / 3 * 20;
    }
    fields++;

    // Voice Tone (20%)
    if (ds.voiceTone) {
      const toneFields = ["formality", "enthusiasm", "empathy"];
      const filledTones = toneFields.filter(
        (f) => ds.voiceTone[f as keyof typeof ds.voiceTone] && ds.voiceTone[f as keyof typeof ds.voiceTone] !== ""
      ).length;
      progress += (filledTones / toneFields.length) * 20;
    }
    fields++;

    // Keywords (20%)
    if (ds.keywords && ds.keywords.length > 0) {
      progress += Math.min(ds.keywords.length / 10, 1) * 20;
    }
    fields++;

    // Brand Values (10%)
    if (ds.brandValues && ds.brandValues.length > 0) {
      progress += Math.min(ds.brandValues.length / 5, 1) * 10;
    }
    fields++;

    // Target Audience (10%)
    if (ds.targetAudience && ds.targetAudience.trim() !== "") {
      progress += 10;
    }
    fields++;

    totalProgress += progress;
  }

  return Math.round(totalProgress / designSystems.length);
}

export function useDashboardStats(brandIds: string[]) {
  const [state, setState] = useState<DashboardStatsState>({
    stats: {
      totalAssets: 0,
      totalCreatives: 0,
      designSystemProgress: 0,
      recentAssets: [],
      recentCreatives: [],
    },
    loading: false,
    error: null,
  });

  const fetchStats = useCallback(async () => {
    if (brandIds.length === 0) {
      setState((prev) => ({
        ...prev,
        stats: {
          totalAssets: 0,
          totalCreatives: 0,
          designSystemProgress: 0,
          recentAssets: [],
          recentCreatives: [],
        },
        loading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [assets, creatives, designSystems] = await Promise.all([
        getAllUserAssets(brandIds),
        getAllUserCreatives(brandIds),
        getAllUserDesignSystems(brandIds),
      ]);

      // Sort by createdAt descending
      const sortedAssets = [...assets].sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });

      const sortedCreatives = [...creatives].sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });

      const progress = calculateDesignSystemProgress(designSystems);

      setState({
        stats: {
          totalAssets: assets.length,
          totalCreatives: creatives.length,
          designSystemProgress: progress,
          recentAssets: sortedAssets.slice(0, 5),
          recentCreatives: sortedCreatives.slice(0, 5),
        },
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch stats",
      }));
    }
  }, [brandIds]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    ...state,
    refetch: fetchStats,
  };
}
