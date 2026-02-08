"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">エラーが発生しました</h2>
          <p className="text-sm text-muted-foreground">
            ページの読み込み中にエラーが発生しました。
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Button onClick={reset}>再試行</Button>
          <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>
            ダッシュボードに戻る
          </Button>
        </div>
      </div>
    </div>
  );
}
