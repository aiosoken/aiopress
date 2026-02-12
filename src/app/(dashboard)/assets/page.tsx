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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FolderOpen,
  Upload,
  FileImage,
  FileText,
  File,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { toast } from "sonner";

export default function AssetsPage() {
  const searchParams = useSearchParams();
  const brandIdParam = searchParams.get("brandId");
  const { firebaseUser } = useAuthContext();
  const { brands, selectedBrandId, selectBrand, loading: brandsLoading } = useBrandsContext();
  const {
    assets,
    loading: assetsLoading,
    uploading,
    fetchAssets,
    uploadNewAsset,
    removeAsset,
  } = useAssets();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [expandedAsset, setExpandedAsset] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    if (brandIdParam && brandIdParam !== selectedBrandId) {
      selectBrand(brandIdParam);
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

  const isImageType = (fileType: string) => fileType.startsWith("image/");

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = !searchQuery ||
      asset.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.analysis?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.analysis?.keywords?.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === "all" ||
      (filterType === "image" && asset.fileType.startsWith("image/")) ||
      (filterType === "pdf" && (asset.fileType === "application/pdf" || asset.fileName.endsWith(".pdf"))) ||
      (filterType === "markdown" && (asset.fileType === "text/markdown" || asset.fileType === "text/x-markdown" || asset.fileName.endsWith(".md"))) ||
      (filterType === "other" && !asset.fileType.startsWith("image/") && asset.fileType !== "application/pdf" && asset.fileType !== "text/markdown" && asset.fileType !== "text/x-markdown" && !asset.fileName.endsWith(".md"));

    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 animate-page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-page text-foreground">資産管理</h1>
          <p className="text-sm text-muted-foreground mt-2">
            ブランド資産のアップロード・管理・AI分析ができます
          </p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedBrandId}>
              <Upload className="mr-2 h-4 w-4" />
              アップロード
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-xl">
            <DialogHeader>
              <DialogTitle>資産をアップロード</DialogTitle>
              <DialogDescription>
                画像、PDF、テキストファイルなどをアップロードできます。AIが自動分析します。
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="file">ファイルを選択</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*,.pdf,.txt,.doc,.docx,.md"
                  onChange={handleFileChange}
                />
              </div>
              {selectedFile && (
                <div className="rounded-xl border p-4">
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

      <Card className="rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">ブランドを選択</CardTitle>
          <CardDescription>
            資産を管理するブランドを選択してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedBrandId || ""}
            onValueChange={selectBrand}
            disabled={brandsLoading}
          >
            <SelectTrigger className="h-11 w-full md:w-[300px]">
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
        <Card className="rounded-xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-20 w-20 rounded-2xl bg-muted/50 flex items-center justify-center">
              <FolderOpen className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="mt-4 text-lg font-bold">
              ブランドを選択してください
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              資産を表示・管理するにはブランドを選択する必要があります
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search and Filter */}
          {assets.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ファイル名、キーワードで検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 pl-9"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-11 w-full sm:w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて ({assets.length})</SelectItem>
                  <SelectItem value="image">画像</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="other">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {assetsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="rounded-xl">
                  <CardContent className="p-5">
                    <Skeleton className="h-32 w-full rounded-xl mb-4" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredAssets.length === 0 ? (
            <Card className="rounded-xl">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="h-20 w-20 rounded-2xl bg-muted/50 flex items-center justify-center">
                  <FolderOpen className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <h3 className="mt-4 text-lg font-bold">
                  {searchQuery || filterType !== "all" ? "該当する資産がありません" : "資産がありません"}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery || filterType !== "all"
                    ? "検索条件を変更してください"
                    : "最初の資産をアップロードして、AIによる分析を始めましょう"}
                </p>
                {!searchQuery && filterType === "all" && (
                  <Button className="mt-6" onClick={() => setIsUploadOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    最初の資産をアップロード
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAssets.map((asset) => (
                <Card key={asset.id} className="group transition-colors rounded-xl overflow-hidden">
                  {/* Image Thumbnail */}
                  {isImageType(asset.fileType) && asset.fileUrl && (
                    <div className="aspect-video bg-muted overflow-hidden">
                      <img
                        src={asset.fileUrl}
                        alt={asset.fileName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <CardContent className={`p-5 ${!isImageType(asset.fileType) ? "" : ""}`}>
                    <div className="flex items-start gap-3 mb-3">
                      {!isImageType(asset.fileType) && (
                        <div className="p-2.5 rounded-xl bg-muted shrink-0">
                          {getFileIcon(asset.fileType)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate text-sm">{asset.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {asset.fileSize ? formatFileSize(asset.fileSize) : asset.fileType}
                        </p>
                      </div>
                    </div>

                    {/* Status badges */}
                    {asset.status === "processing" && (
                      <div className="mb-3 rounded-xl bg-amber-500/10 p-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                          <p className="text-xs text-amber-600 font-medium">AI分析中...</p>
                        </div>
                      </div>
                    )}
                    {asset.status === "failed" && (
                      <div className="mb-3 rounded-xl bg-destructive/10 p-2.5">
                        <p className="text-xs text-destructive font-medium">分析に失敗しました</p>
                      </div>
                    )}

                    {/* Analysis summary */}
                    {asset.analysis && asset.status === "completed" && (
                      <div className="mb-3 space-y-2">
                        <div className="rounded-xl bg-emerald-500/10 p-2.5">
                          <p className="text-xs font-medium text-emerald-600 mb-1">AI分析完了</p>
                          <p className="text-xs text-foreground line-clamp-2">
                            {asset.analysis.description}
                          </p>
                        </div>

                        {asset.analysis.keywords && asset.analysis.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {asset.analysis.keywords.slice(0, 4).map((keyword, idx) => (
                              <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0">
                                {keyword}
                              </Badge>
                            ))}
                            {asset.analysis.keywords.length > 4 && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                +{asset.analysis.keywords.length - 4}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Expandable details */}
                        {expandedAsset === asset.id && (
                          <div className="space-y-2 pt-2 border-t text-xs">
                            {asset.analysis.tone && (
                              <p className="text-muted-foreground">
                                トーン: <span className="font-medium text-foreground">{asset.analysis.tone}</span>
                              </p>
                            )}
                            {asset.analysis.entities && asset.analysis.entities.length > 0 && (
                              <p className="text-muted-foreground">
                                エンティティ: <span className="font-medium text-foreground">{asset.analysis.entities.join(", ")}</span>
                              </p>
                            )}
                            {asset.analysis.colors && asset.analysis.colors.length > 0 && (
                              <div>
                                <p className="text-muted-foreground mb-1">検出カラー:</p>
                                <div className="flex gap-1">
                                  {asset.analysis.colors.map((color, idx) => (
                                    <div
                                      key={idx}
                                      className="h-6 w-6 rounded border"
                                      style={{ backgroundColor: color }}
                                      title={color}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <button
                          onClick={() => setExpandedAsset(expandedAsset === asset.id ? null : asset.id)}
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          {expandedAsset === asset.id ? (
                            <>
                              <ChevronUp className="h-3 w-3" />
                              閉じる
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3" />
                              詳細を表示
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        asChild
                      >
                        <a href={asset.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Eye className="mr-2 h-3.5 w-3.5" />
                          表示
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(asset.id)}
                        disabled={isDeleting === asset.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
