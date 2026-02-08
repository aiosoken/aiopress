"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <AlertCircle className="h-16 w-16 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">エラーが発生しました</h2>
          <p className="text-muted-foreground">
            予期しないエラーが発生しました。もう一度お試しください。
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Button onClick={reset}>再試行</Button>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            トップに戻る
          </Button>
        </div>
      </div>
    </div>
  );
}
