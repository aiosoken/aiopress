"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Check, Edit, X, MessageSquare, Trash2 } from "lucide-react";
import type { ContentFeedback, FeedbackFlag } from "@/types";

interface ContentFeedbackHighlightProps {
  content: string;
  feedbacks: ContentFeedback[];
  onAddFeedback: (feedback: Omit<ContentFeedback, "id" | "createdAt" | "createdBy">) => Promise<void>;
  onUpdateFeedback: (feedbackId: string, updates: Partial<Pick<ContentFeedback, "flag" | "note">>) => Promise<void>;
  onRemoveFeedback: (feedbackId: string) => Promise<void>;
  readOnly?: boolean;
}

export function ContentFeedbackHighlight({
  content,
  feedbacks,
  onAddFeedback,
  onUpdateFeedback,
  onRemoveFeedback,
  readOnly = false,
}: ContentFeedbackHighlightProps) {
  const [selection, setSelection] = useState<{
    text: string;
    start: number;
    end: number;
  } | null>(null);
  const [showPopover, setShowPopover] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [selectedFeedback, setSelectedFeedback] = useState<ContentFeedback | null>(null);
  const [editingNote, setEditingNote] = useState<string>("");
  const contentRef = useRef<HTMLDivElement>(null);

  const handleTextSelection = () => {
    if (readOnly) return;

    const selectedText = window.getSelection()?.toString();
    if (!selectedText || selectedText.trim().length === 0) {
      setShowPopover(false);
      return;
    }

    const range = window.getSelection()?.getRangeAt(0);
    if (!range) return;

    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(contentRef.current!);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;
    const end = start + selectedText.length;

    setSelection({ text: selectedText, start, end });

    const rect = range.getBoundingClientRect();
    setPopoverPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
    setShowPopover(true);
  };

  const addFeedback = async (flag: FeedbackFlag, note?: string) => {
    if (!selection) return;

    await onAddFeedback({
      startIndex: selection.start,
      endIndex: selection.end,
      selectedText: selection.text,
      flag,
      note,
    });

    setSelection(null);
    setShowPopover(false);
    window.getSelection()?.removeAllRanges();
  };

  const getFlagColor = (flag: FeedbackFlag) => {
    switch (flag) {
      case "approved":
        return "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700";
      case "needs_revision":
        return "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700";
    }
  };

  const getFlagLabel = (flag: FeedbackFlag) => {
    switch (flag) {
      case "approved":
        return "採用";
      case "needs_revision":
        return "要修正";
      case "rejected":
        return "却下";
    }
  };

  const renderHighlightedContent = () => {
    if (feedbacks.length === 0) {
      return <span>{content}</span>;
    }

    const sortedFeedbacks = [...feedbacks].sort((a, b) => a.startIndex - b.startIndex);
    const segments: JSX.Element[] = [];
    let currentIndex = 0;

    sortedFeedbacks.forEach((feedback, idx) => {
      if (currentIndex < feedback.startIndex) {
        segments.push(
          <span key={`text-${idx}`}>{content.slice(currentIndex, feedback.startIndex)}</span>
        );
      }

      segments.push(
        <span
          key={`feedback-${feedback.id}`}
          className={`relative cursor-pointer rounded px-1 ${getFlagColor(feedback.flag)}`}
          onClick={() => {
            setSelectedFeedback(feedback);
            setEditingNote(feedback.note || "");
          }}
        >
          {content.slice(feedback.startIndex, feedback.endIndex)}
        </span>
      );

      currentIndex = feedback.endIndex;
    });

    if (currentIndex < content.length) {
      segments.push(<span key="text-end">{content.slice(currentIndex)}</span>);
    }

    return <>{segments}</>;
  };

  return (
    <div className="space-y-4">
      <div
        ref={contentRef}
        className="rounded-xl bg-muted/20 border border-border/30 p-5 relative select-text"
        onMouseUp={handleTextSelection}
      >
        <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">
          {renderHighlightedContent()}
        </pre>
      </div>

      {/* Selection Popover */}
      {showPopover && selection && (
        <div
          className="fixed z-50"
          style={{
            left: `${popoverPosition.x}px`,
            top: `${popoverPosition.y}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="bg-background rounded-lg shadow-lg border border-border p-2 flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-emerald-600 hover:bg-emerald-50"
              onClick={() => addFeedback("approved")}
            >
              <Check className="h-4 w-4 mr-1" />
              採用
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-yellow-600 hover:bg-yellow-50"
              onClick={() => addFeedback("needs_revision")}
            >
              <Edit className="h-4 w-4 mr-1" />
              要修正
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-red-600 hover:bg-red-50"
              onClick={() => addFeedback("rejected")}
            >
              <X className="h-4 w-4 mr-1" />
              却下
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8"
              onClick={() => setShowPopover(false)}
            >
              キャンセル
            </Button>
          </div>
        </div>
      )}

      {/* Feedback Detail Dialog */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">フィードバック詳細</h3>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSelectedFeedback(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">選択テキスト</label>
                <p className="mt-1 text-sm bg-muted/50 p-2 rounded">
                  {selectedFeedback.selectedText}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">ステータス</label>
                <div className="mt-2 flex gap-2">
                  {(["approved", "needs_revision", "rejected"] as FeedbackFlag[]).map((flag) => (
                    <Button
                      key={flag}
                      size="sm"
                      variant={selectedFeedback.flag === flag ? "default" : "outline"}
                      onClick={() => onUpdateFeedback(selectedFeedback.id, { flag })}
                      disabled={readOnly}
                    >
                      {getFlagLabel(flag)}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">メモ</label>
                <Textarea
                  className="mt-1"
                  placeholder="メモを入力..."
                  value={editingNote}
                  onChange={(e) => setEditingNote(e.target.value)}
                  disabled={readOnly}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    onUpdateFeedback(selectedFeedback.id, { note: editingNote });
                    setSelectedFeedback(null);
                  }}
                  disabled={readOnly}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  保存
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    onRemoveFeedback(selectedFeedback.id);
                    setSelectedFeedback(null);
                  }}
                  disabled={readOnly}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  削除
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Summary */}
      {feedbacks.length > 0 && (
        <div className="rounded-lg border border-border/50 p-4 bg-accent/50">
          <h4 className="text-sm font-semibold mb-3">フィードバックサマリー</h4>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
              <Check className="h-3 w-3 mr-1" />
              採用: {feedbacks.filter((f) => f.flag === "approved").length}
            </Badge>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
              <Edit className="h-3 w-3 mr-1" />
              要修正: {feedbacks.filter((f) => f.flag === "needs_revision").length}
            </Badge>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
              <X className="h-3 w-3 mr-1" />
              却下: {feedbacks.filter((f) => f.flag === "rejected").length}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
