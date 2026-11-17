"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { ArrowDown, AlertCircle, X, RotateCcw } from "lucide-react";
import { ChatMessage } from "@/lib/storage";
import { MessageBubble } from "./MessageBubble";
import { SuggestionChips } from "./SuggestionChips";
import { LLMStatus } from "@/hooks/useLLM";

interface MessageListProps {
  messages: ChatMessage[];
  streamingMessage: ChatMessage | null;
  status: LLMStatus;
  error: string | null;
  onClearError: () => void;
  onRetry: () => void;
  onSelectSuggestion: (prompt: string) => void;
}

export function MessageList({
  messages,
  streamingMessage,
  status,
  error,
  onClearError,
  onRetry,
  onSelectSuggestion,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const userScrolledUpRef = useRef(false);

  const scrollToBottom = useCallback((smooth = false) => {
    if (bottomAnchorRef.current) {
      bottomAnchorRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
      });
      userScrolledUpRef.current = false;
      setShowScrollBottomBtn(false);
    }
  }, []);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceToBottom > 80) {
      userScrolledUpRef.current = true;
      setShowScrollBottomBtn(true);
    } else {
      userScrolledUpRef.current = false;
      setShowScrollBottomBtn(false);
    }
  };

  // Keep pinned to bottom on message updates or streaming unless user scrolled up
  useEffect(() => {
    if (!userScrolledUpRef.current) {
      scrollToBottom(false);
    }
  }, [messages, streamingMessage, scrollToBottom]);

  const hasMessages = messages.length > 0 || streamingMessage !== null;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="relative flex-1 overflow-y-auto px-4 py-6 sm:px-6 space-y-6"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Error Notification Banner if present */}
        {error && (
          <div className="rounded-2xl border border-rose-800/80 bg-rose-950/60 p-4 text-rose-200 shadow-lg backdrop-blur-sm animate-in fade-in duration-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-semibold text-rose-100 block">
                    Execution or Inference Error
                  </span>
                  <p className="text-rose-300/90 leading-relaxed">{error}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onRetry}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-900/80 hover:bg-rose-800 text-rose-200 transition-colors border border-rose-700/60"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
                <button
                  type="button"
                  onClick={onClearError}
                  className="p-1 rounded-lg hover:bg-rose-900/50 text-rose-400 hover:text-rose-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Render Conversation Messages */}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Live Streaming Message Bubble */}
        {streamingMessage && (
          <MessageBubble message={streamingMessage} isStreaming={true} />
        )}

        {/* Empty State Suggestion Chips */}
        {!hasMessages && (
          <div className="py-8">
            <SuggestionChips
              onSelect={onSelectSuggestion}
              disabled={status === "loading"}
            />
          </div>
        )}

        {/* Bottom anchor for scrolling */}
        <div ref={bottomAnchorRef} className="h-1" />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottomBtn && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          className="fixed bottom-24 right-6 z-30 p-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 shadow-xl transition-all active:scale-90"
          title="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
