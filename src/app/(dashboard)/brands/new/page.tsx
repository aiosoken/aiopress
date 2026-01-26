"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext, useBrandsContext } from "@/components/providers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function NewBrandPage() {
  const router = useRouter();
  const { firebaseUser } = useAuthContext();
  const { addBrand } = useBrandsContext();
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!firebaseUser || !formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const brandId = await addBrand(
        formData.name.trim(),
        formData.description.trim() || undefined
      );
      toast.success("ブランドを作成しました");
      router.push(`/brands/${brandId}`);
    } catch {
      toast.error("ブランドの作成に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">新規ブランド作成</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            新しいブランドを作成します
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>ブランド情報</CardTitle>
              <CardDescription>
                ブランドの基本情報を入力してください
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">ブランド名 *</Label>
            <Input
              id="name"
              placeholder="例: 株式会社サンプル"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">説明（任意）</Label>
            <Textarea
              id="description"
              placeholder="ブランドの説明を入力してください"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.name.trim() || isSubmitting}
            >
              {isSubmitting ? "作成中..." : "ブランドを作成"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
