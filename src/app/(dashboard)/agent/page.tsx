"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bot,
  Send,
  Plus,
  User,
  Clock,
  Wrench,
  MessageSquare,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useBrandsContext } from "@/components/providers";
import {
  runAgentFunction,
  getAgentSessionsFunction,
  getAgentSessionFunction,
} from "@/lib/firebase/functions";
import type { AgentMessage } from "@/types";

interface SessionSummary {
  id: string;
  brandId: string;
  title: string;
  messageCount: number;
  createdAt: any;
  updatedAt: any;
}

const TOOL_LABELS: Record<string, string> = {
  get_brand_info: "ブランド情報を取得",
  search_past_creatives: "過去のクリエイティブを検索",
  generate_text_creative: "テキストクリエイティブを生成",
  generate_image: "画像を生成",
  evaluate_brand_fit: "ブランド適合度を評価",
  suggest_keywords: "キーワードを提案",
};

export default function AgentPage() {
  const { selectedBrandId } = useBrandsContext();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeTools, scrollToBottom]);

  // セッション一覧を読み込み
  useEffect(() => {
    if (selectedBrandId) {
      loadSessions();
    }
  }, [selectedBrandId]);

  const loadSessions = async () => {
    if (!selectedBrandId) return;
    setIsLoadingSessions(true);
    try {
      const result = await getAgentSessionsFunction({
        brandId: selectedBrandId,
      });
      if (result.data.success) {
        setSessions(result.data.sessions);
      }
    } catch (error: any) {
      console.error("Failed to load sessions:", error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const loadSession = async (sessionId: string) => {
    setIsLoadingSession(true);
    try {
      const result = await getAgentSessionFunction({ sessionId });
      if (result.data.success && result.data.session) {
        setMessages(result.data.session.messages || []);
        setCurrentSessionId(sessionId);
      }
    } catch (error: any) {
      console.error("Failed to load session:", error);
      toast.error("セッションの読み込みに失敗しました");
    } finally {
      setIsLoadingSession(false);
    }
  };

  const startNewSession = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setInputText("");
  };

  const handleSend = async () => {
    if (!inputText.trim() || !selectedBrandId || isSending) return;

    const userMessage = inputText.trim();
    setInputText("");
    setIsSending(true);

    // ユーザーメッセージを即座に表示
    const tempUserMsg: AgentMessage = {
      id: `temp_${Date.now()}_user`,
      role: "user",
      content: userMessage,
      timestamp: { seconds: Math.floor(Date.now() / 1000) } as any,
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    // ツール実行中表示
    setActiveTools(["thinking"]);

    try {
      const result = await runAgentFunction({
        brandId: selectedBrandId,
        message: userMessage,
        sessionId: currentSessionId || undefined,
      });

      if (result.data.success) {
        // セッションIDを更新
        if (!currentSessionId) {
          setCurrentSessionId(result.data.sessionId);
        }

        // アシスタントメッセージを追加
        const assistantMsg: AgentMessage = {
          id: `msg_${Date.now()}_assistant`,
          role: "assistant",
          content: result.data.response,
          toolCalls: result.data.toolsUsed.map((name) => ({
            name,
            args: {},
          })),
          timestamp: { seconds: Math.floor(Date.now() / 1000) } as any,
        };
        setMessages((prev) => [...prev, assistantMsg]);

        // セッション一覧を更新
        await loadSessions();
      }
    } catch (error: any) {
      console.error("Agent error:", error);
      toast.error(error.message || "エージェントの実行に失敗しました");
      // エラー時はユーザーメッセージを削除
      setMessages((prev) =>
        prev.filter((m) => m.id !== tempUserMsg.id)
      );
    } finally {
      setIsSending(false);
      setActiveTools([]);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "";
    let date: Date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp._seconds) {
      date = new Date(timestamp._seconds * 1000);
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!selectedBrandId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mx-auto">
            <Bot className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h2 className="text-lg font-semibold">ブランドを選択してください</h2>
          <p className="text-sm text-muted-foreground">
            サイドバーからブランドを選択すると、AIエージェントが利用できます
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* セッションサイドパネル */}
      {showSidebar && (
        <div className="w-72 border-r flex flex-col bg-muted/10">
          <div className="p-4 border-b">
            <Button
              onClick={startNewSession}
              className="w-full gap-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              新しい会話
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingSessions ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : sessions.length > 0 ? (
              <div className="p-2 space-y-1">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => loadSession(session.id)}
                    className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors hover:bg-accent ${
                      currentSessionId === session.id
                        ? "bg-accent font-medium"
                        : ""
                    }`}
                  >
                    <p className="text-sm truncate">{session.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {session.messageCount}件のメッセージ
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                会話履歴はまだありません
              </div>
            )}
          </div>
        </div>
      )}

      {/* メインチャットエリア */}
      <div className="flex-1 flex flex-col">
        {/* ヘッダー */}
        <div className="px-4 py-3 border-b bg-background flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <ChevronLeft
              className={`h-4 w-4 transition-transform ${
                !showSidebar ? "rotate-180" : ""
              }`}
            />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
              <Bot className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">AIエージェント</h2>
              <p className="text-xs text-muted-foreground">
                自然言語でクリエイティブを自律生成
              </p>
            </div>
          </div>
        </div>

        {/* メッセージエリア */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoadingSession ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-20 w-3/4" />
                </div>
              ))}
            </div>
          ) : messages.length > 0 ? (
            messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                {msg.role === "user" ? (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 max-w-2xl">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold">あなた</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(msg.timestamp)}
                        </span>
                      </div>
                      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                        <p className="text-sm whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10 flex-shrink-0">
                      <Bot className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1 max-w-3xl">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-purple-600">
                          AIエージェント
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(msg.timestamp)}
                        </span>
                      </div>
                      {/* ツール実行バッジ */}
                      {msg.toolCalls && msg.toolCalls.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {msg.toolCalls.map((tool, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs bg-purple-500/5 text-purple-600 border-purple-200"
                            >
                              <Wrench className="mr-1 h-3 w-3" />
                              {TOOL_LABELS[tool.name] || tool.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="rounded-xl bg-purple-500/5 border border-purple-200/50 p-4">
                        <div className="text-sm whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/10 to-primary/10 mb-6">
                <Sparkles className="h-10 w-10 text-purple-500/60" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                AIエージェントに指示してみましょう
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mb-8">
                自然言語で指示するだけで、AIがブランド情報の取得からクリエイティブ生成、品質評価まで自動的に実行します。
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                {[
                  "新商品のキャッチコピーを3つ作って、ブランド適合度も評価して",
                  "SNS投稿を作成して、過去の投稿も参考にして",
                  "ブランドに合った画像を生成して",
                  "SEOキーワードを提案して、それを使った記事も書いて",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInputText(suggestion)}
                    className="text-left text-xs p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground mb-1.5" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ツール実行中表示 */}
          {activeTools.length > 0 && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10 flex-shrink-0">
                <Bot className="h-4 w-4 text-purple-600 animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-purple-600">
                    AIエージェント
                  </span>
                </div>
                <div className="rounded-xl bg-purple-500/5 border border-purple-200/50 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                    考え中...ツールを実行しています
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 入力エリア */}
        <div className="border-t p-4 bg-muted/20">
          <div className="max-w-3xl mx-auto space-y-3">
            <Textarea
              placeholder="AIエージェントへの指示を入力してください（例: 新商品のキャッチコピーを作って、品質も評価して）"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[80px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isSending}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Cmd/Ctrl + Enter で送信
              </span>
              <Button onClick={handleSend} disabled={!inputText.trim() || isSending}>
                {isSending ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    実行中...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    送信
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
