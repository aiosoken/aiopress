"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  Send,
  Sparkles,
  Check,
  Clock,
  User,
  Bot,
} from "lucide-react";
import { toast } from "sonner";
import type { Creative, CreativeFeedback, FeedbackMessage } from "@/types";
import {
  sendCreativeFeedbackFunction,
  applyCreativeImprovementFunction,
  getCreativeFeedbackFunction,
} from "@/lib/firebase/functions";

interface CreativeFeedbackDialogProps {
  creative: Creative;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplied?: () => void;
}

export function CreativeFeedbackDialog({
  creative,
  open,
  onOpenChange,
  onApplied,
}: CreativeFeedbackDialogProps) {
  const [feedback, setFeedback] = useState<CreativeFeedback | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isApplying, setIsApplying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      loadFeedback();
    }
  }, [open, creative.id]);

  useEffect(() => {
    scrollToBottom();
  }, [feedback?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadFeedback = async () => {
    setIsLoading(true);
    try {
      const result = await getCreativeFeedbackFunction({
        creativeId: creative.id,
      });
      if (result.data.success && result.data.feedback) {
        setFeedback(result.data.feedback);
      } else {
        setFeedback(null);
      }
    } catch (error: any) {
      console.error("Failed to load feedback:", error);
      toast.error("フィードバック履歴の読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) return;

    setIsSending(true);
    try {
      const result = await sendCreativeFeedbackFunction({
        creativeId: creative.id,
        feedbackText: feedbackText.trim(),
      });

      if (result.data.success) {
        toast.success("フィードバックを送信しました");
        setFeedbackText("");
        await loadFeedback();
      } else {
        toast.error("フィードバックの送信に失敗しました");
      }
    } catch (error: any) {
      console.error("Failed to send feedback:", error);
      toast.error(error.message || "フィードバックの送信に失敗しました");
    } finally {
      setIsSending(false);
    }
  };

  const handleApplyImprovement = async (messageId: string) => {
    setIsApplying(messageId);
    try {
      const result = await applyCreativeImprovementFunction({
        creativeId: creative.id,
        messageId,
      });

      if (result.data.success) {
        toast.success("改善案を適用しました");
        await loadFeedback();
        onApplied?.();
      } else {
        toast.error("改善案の適用に失敗しました");
      }
    } catch (error: any) {
      console.error("Failed to apply improvement:", error);
      toast.error(error.message || "改善案の適用に失敗しました");
    } finally {
      setIsApplying(null);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "CATCH_COPY":
        return "キャッチコピー";
      case "SNS_POST":
        return "SNS投稿";
      case "ARTICLE":
        return "記事";
      case "IMAGE":
        return "画像";
      case "PRESENTATION":
        return "プレゼン";
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                クリエイティブフィードバック
              </DialogTitle>
              <DialogDescription>
                AIと対話しながらクリエイティブを改善できます
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* 左側: 元のクリエイティブ */}
          <div className="w-1/2 border-r flex flex-col">
            <div className="px-6 py-3 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{getTypeLabel(creative.type)}</Badge>
                <span className="text-sm font-semibold text-muted-foreground">
                  元のクリエイティブ
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {creative.type === "IMAGE" && creative.imageUrl && (
                <div className="mb-4 rounded-xl overflow-hidden border">
                  <img
                    src={creative.imageUrl}
                    alt="Generated image"
                    className="w-full h-auto"
                  />
                </div>
              )}
              <div className="rounded-xl bg-muted/20 border p-5">
                <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">
                  {creative.content}
                </pre>
              </div>
              {creative.prompt && (
                <div className="mt-4 text-xs text-muted-foreground">
                  <span className="font-semibold">テーマ:</span> {creative.prompt}
                </div>
              )}
            </div>
          </div>

          {/* 右側: フィードバックチャット */}
          <div className="w-1/2 flex flex-col">
            <div className="px-6 py-3 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-muted-foreground">
                  フィードバック履歴
                </span>
              </div>
            </div>

            {/* メッセージエリア */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ))}
                </div>
              ) : feedback?.messages && feedback.messages.length > 0 ? (
                feedback.messages.map((message: FeedbackMessage) => (
                  <div key={message.id} className="space-y-2">
                    {message.role === "user" ? (
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold">あなた</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(message.timestamp)}
                            </span>
                          </div>
                          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                            <p className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10 flex-shrink-0">
                          <Bot className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-purple-600">
                              AI
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(message.timestamp)}
                            </span>
                            {message.appliedAt && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-200"
                              >
                                <Check className="mr-1 h-3 w-3" />
                                適用済み
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-3">
                            <div className="rounded-xl bg-purple-500/5 border border-purple-200/50 p-4">
                              <p className="text-sm text-muted-foreground mb-2">
                                {message.content}
                              </p>
                              {message.improvedContent && (
                                <>
                                  <div className="mt-3 pt-3 border-t border-purple-200/50">
                                    <p className="text-xs font-semibold text-purple-600 mb-2">
                                      改善案:
                                    </p>
                                    <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                                      {message.improvedContent}
                                    </pre>
                                  </div>
                                  {!message.appliedAt && (
                                    <Button
                                      size="sm"
                                      className="mt-3 w-full"
                                      onClick={() =>
                                        handleApplyImprovement(message.id)
                                      }
                                      disabled={isApplying === message.id}
                                    >
                                      {isApplying === message.id ? (
                                        <>
                                          <Clock className="mr-2 h-3 w-3 animate-spin" />
                                          適用中...
                                        </>
                                      ) : (
                                        <>
                                          <Check className="mr-2 h-3 w-3" />
                                          この改善を適用
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                    <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-sm font-semibold mb-2">
                    フィードバックがありません
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    下のフォームからフィードバックを送信すると、AIが改善案を提示します
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 入力エリア */}
            <div className="border-t p-4 bg-muted/20">
              <div className="space-y-3">
                <Textarea
                  placeholder="改善してほしい点を入力してください（例: もっとカジュアルなトーンにしてほしい、具体例を追加してほしい）"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="min-h-[80px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleSendFeedback();
                    }
                  }}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Cmd/Ctrl + Enter で送信
                  </span>
                  <Button
                    onClick={handleSendFeedback}
                    disabled={!feedbackText.trim() || isSending}
                  >
                    {isSending ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        送信中...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        フィードバックを送信
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
