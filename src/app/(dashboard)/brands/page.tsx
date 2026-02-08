"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthContext, useBrandsContext } from "@/components/providers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  ArrowRight,
  FileSearch,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { BrandExtractionDialog } from "@/components/features/brand-extraction/BrandExtractionDialog";
import { updateDesignSystemFunction } from "@/lib/firebase/functions";
import type { BrandExtractionResult } from "@/types";

export default function BrandsPage() {
  const { firebaseUser } = useAuthContext();
  const {
    brands,
    loading,
    addBrand,
    editBrand,
    removeBrand,
  } = useBrandsContext();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<{
    id: string;
    name: string;
    description?: string;
  } | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtractionOpen, setIsExtractionOpen] = useState(false);
  const [pendingExtraction, setPendingExtraction] = useState<BrandExtractionResult | null>(null);

  const handleCreate = async () => {
    if (!firebaseUser || !formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const brandId = await addBrand(
        formData.name.trim(),
        formData.description.trim() || undefined
      );

      // 抽出結果があればデザインシステムに保存
      if (pendingExtraction && brandId) {
        try {
          await updateDesignSystemFunction({
            brandId,
            designSystem: {
              colors: pendingExtraction.colors,
              typography: pendingExtraction.typography,
              voiceTone: pendingExtraction.voiceTone,
              keywords: pendingExtraction.keywords,
              brandValues: pendingExtraction.brandValues,
              targetAudience: pendingExtraction.targetAudience,
              brandDNA: pendingExtraction.brandDNA,
            },
          });
          toast.success("ブランドを作成し、デザインシステムを設定しました");
        } catch {
          toast.success("ブランドを作成しました（デザインシステムの設定に失敗）");
        }
      } else {
        toast.success("ブランドを作成しました");
      }

      setIsCreateOpen(false);
      setFormData({ name: "", description: "" });
      setPendingExtraction(null);
    } catch {
      toast.error("ブランドの作成に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExtractionComplete = (result: BrandExtractionResult) => {
    setPendingExtraction(result);
    if (result.brandName && !formData.name) {
      setFormData((prev) => ({
        ...prev,
        name: result.brandName || prev.name,
        description: result.brandDescription || prev.description,
      }));
    }
    toast.success("ブランド情報を抽出しました");
  };

  const handleEdit = async () => {
    if (!selectedBrand || !formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await editBrand(selectedBrand.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      });
      toast.success("ブランドを更新しました");
      setIsEditOpen(false);
      setSelectedBrand(null);
      setFormData({ name: "", description: "" });
    } catch {
      toast.error("ブランドの更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBrand) return;

    setIsSubmitting(true);
    try {
      await removeBrand(selectedBrand.id);
      toast.success("ブランドを削除しました");
      setIsDeleteOpen(false);
      setSelectedBrand(null);
    } catch {
      toast.error("ブランドの削除に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (brand: { id: string; name: string; description?: string }) => {
    setSelectedBrand(brand);
    setFormData({ name: brand.name, description: brand.description || "" });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (brand: { id: string; name: string }) => {
    setSelectedBrand(brand);
    setIsDeleteOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-page text-foreground">ブランド管理</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ブランドの作成・編集・削除ができます
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新規ブランド作成
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新規ブランド作成</DialogTitle>
              <DialogDescription>
                新しいブランドを作成します。ブランド名は必須です。
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">ブランド名</Label>
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
                />
              </div>
              <div className="border-t pt-4">
                {pendingExtraction ? (
                  <div className="flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/20 p-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileSearch className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">ブランド情報を抽出済み</p>
                      <p className="text-xs text-muted-foreground">
                        作成時にデザインシステムに自動反映されます
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExtractionOpen(true)}
                    >
                      変更
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="flex items-center gap-3 w-full rounded-lg border border-dashed border-muted-foreground/25 p-3 text-left hover:border-primary/40 hover:bg-primary/5 transition-colors"
                    onClick={() => setIsExtractionOpen(true)}
                  >
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileSearch className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">素材からブランド情報を抽出</p>
                      <p className="text-xs text-muted-foreground">
                        PDF・画像・URLからデザインシステムを自動設定
                      </p>
                    </div>
                  </button>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!formData.name.trim() || isSubmitting}
              >
                {isSubmitting ? "作成中..." : "作成"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : brands.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">
              ブランドがありません
            </h3>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              最初のブランドを作成して、AIブランドコミュニケーションを始めましょう
            </p>
            <Button className="mt-6" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              最初のブランドを作成
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <Card key={brand.id} className="group relative card-interactive">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-foreground text-background flex items-center justify-center text-lg font-bold">
                      {brand.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xl font-bold text-foreground truncate">{brand.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {brand.description || "説明なし"}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-1">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          openEditDialog({
                            id: brand.id,
                            name: brand.name,
                            description: brand.description,
                          })
                        }
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        編集
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() =>
                          openDeleteDialog({ id: brand.id, name: brand.name })
                        }
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href={`/brands/${brand.id}`}>
                    詳細を見る
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ブランドを編集</DialogTitle>
            <DialogDescription>
              ブランド情報を更新します。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">ブランド名</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">説明（任意）</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleEdit}
              disabled={!formData.name.trim() || isSubmitting}
            >
              {isSubmitting ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ブランドを削除</DialogTitle>
            <DialogDescription>
              「{selectedBrand?.name}」を削除しますか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "削除中..." : "削除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BrandExtractionDialog
        open={isExtractionOpen}
        onOpenChange={setIsExtractionOpen}
        onComplete={handleExtractionComplete}
      />
    </div>
  );
}
