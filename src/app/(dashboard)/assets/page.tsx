"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthContext, useBrandsContext } from "@/components/providers";
import { useAssets } from "@/hooks/useAssets";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FolderOpen,
  Upload,
  FileImage,
  FileText,
  File,
  Trash2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

export default function AssetsPage() {
  const searchParams = useSearchParams();
  const brandIdParam = searchParams.get("brandId");
  const { firebaseUser } = useAuthContext();
  const { brands, loading: brandsLoading } = useBrandsContext();
  const {
    assets,
    loading: assetsLoading,
    uploading,
    fetchAssets,
    uploadNewAsset,
    removeAsset,
  } = useAssets();
  const [selectedBrandId, setSelectedBrandId] = useState<string>(brandIdParam || "");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (brandIdParam) {
      setSelectedBrandId(brandIdParam);
    }
  }, [brandIdParam]);

  useEffect(() => {
    if (selectedBrandId) {
      fetchAssets(selectedBrandId);
    }
  }, [selectedBrandId, fetchAssets]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedBrandId) return;

    try {
      await uploadNewAsset(selectedBrandId, selectedFile, firebaseUser?.uid);
      toast.success("資産をアップロードしました");
      setIsUploadOpen(false);
      setSelectedFile(null);
    } catch {
      toast.error("アップロードに失敗しました");
    }
  };

  const handleDelete = async (assetId: string) => {
    setIsDeleting(assetId);
    try {
      await removeAsset(assetId);
      toast.success("資産を削除しました");
    } catch {
      toast.error("削除に失敗しました");
    } finally {
      setIsDeleting(null);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <FileImage className="h-8 w-8 text-blue-500" />;
    }
    if (fileType === "application/pdf" || fileType.startsWith("text/")) {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">資産管理</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ブランド資産のアップロード・管理ができます
          </p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedBrandId}>
              <Upload className="mr-2 h-4 w-4" />
              アップロード
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>資産をアップロード</DialogTitle>
              <DialogDescription>
                画像、PDF、テキストファイルなどをアップロードできます
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="file">ファイルを選択</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*,.pdf,.txt,.doc,.docx"
                  onChange={handleFileChange}
                />
              </div>
              {selectedFile && (
                <div className="rounded-lg border p-4">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsUploadOpen(false);
                  setSelectedFile(null);
                }}
                disabled={uploading}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? "アップロード中..." : "アップロード"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">ブランドを選択</CardTitle>
          <CardDescription>
            資産を管理するブランドを選択してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedBrandId}
            onValueChange={setSelectedBrandId}
            disabled={brandsLoading}
          >
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="ブランドを選択" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {!selectedBrandId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">
              ブランドを選択してください
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              資産を表示・管理するにはブランドを選択する必要があります
            </p>
          </CardContent>
        </Card>
      ) : assetsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : assets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">資産がありません</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              最初の資産をアップロードして、AIによる分析を始めましょう
            </p>
            <Button className="mt-6" onClick={() => setIsUploadOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              最初の資産をアップロード
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {assets.map((asset) => (
            <Card key={asset.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2.5 rounded-lg bg-muted">
                    {getFileIcon(asset.fileType)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{asset.fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      {asset.fileSize ? formatFileSize(asset.fileSize) : asset.fileType}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    asChild
                  >
                    <a href={asset.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Eye className="mr-2 h-4 w-4" />
                      表示
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(asset.id)}
                    disabled={isDeleting === asset.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {asset.status === "processing" && (
                  <div className="mt-4 rounded-lg bg-amber-500/10 p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                      <p className="text-xs text-amber-600 font-medium">
                        分析中...
                      </p>
                    </div>
                  </div>
                )}
                {asset.status === "failed" && (
                  <div className="mt-4 rounded-lg bg-destructive/10 p-3">
                    <p className="text-xs text-destructive font-medium">
                      分析に失敗しました
                    </p>
                  </div>
                )}
                {asset.analysis && asset.status === "completed" && (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-lg bg-emerald-500/10 p-3">
                      <p className="text-xs font-medium text-emerald-600 mb-1">
                        AI分析完了
                      </p>
                      <p className="text-sm text-foreground line-clamp-2">
                        {asset.analysis.description}
                      </p>
                    </div>
                    {asset.analysis.keywords && asset.analysis.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {asset.analysis.keywords.slice(0, 5).map((keyword, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                    {asset.analysis.tone && (
                      <p className="text-xs text-muted-foreground">
                        トーン: <span className="font-medium text-foreground">{asset.analysis.tone}</span>
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
