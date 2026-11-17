"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Square, Sparkles } from "lucide-react";
import { LLMStatus } from "@/hooks/useLLM";

interface ChatInputProps {
  status: LLMStatus;
  hasWebGPU: boolean | null;
  onSend: (message: string) => void;
  onStop: () => void;
  onPromptLoad: () => void;
}

export function ChatInput({
  status,
  hasWebGPU,
  onSend,
  onStop,
  onPromptLoad,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isGenerating = status === "generating";
  const isReady = status === "ready";
  const isLoading = status === "loading";
  const isIdle = status === "idle";

  // Auto-expand textarea up to ~6 rows (max 160px)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const nextHeight = Math.min(el.scrollHeight, 160);
    el.style.height = `${Math.max(nextHeight, 44)}px`;
  }, [value]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    if (!isReady && !isGenerating) {
      onPromptLoad();
      return;
    }

    if (isGenerating) return;

    onSend(trimmed);
    setValue("");

    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getPlaceholder = () => {
    if (hasWebGPU === false) return "WebGPU is not supported in this browser...";
    if (isLoading) return "Model is loading into WebGPU memory... please wait.";
    if (isIdle) return "Load the model above to start chatting or execute actions...";
    if (isGenerating) return "AI is generating locally...";
    return "Ask anything or try 'Open YouTube' or 'Visit github.com'...";
  };

  const isDisabled = hasWebGPU === false || isLoading;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4 pt-2">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 bg-zinc-900/90 border border-zinc-800 focus-within:border-emerald-500/80 rounded-2xl p-2 shadow-2xl backdrop-blur-md transition-all"
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          disabled={isDisabled}
          rows={1}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ minHeight: "44px", maxHeight: "160px" }}
        />

        <div className="flex items-center gap-1.5 pb-1 pr-1 shrink-0">
          {isGenerating ? (
            <button
              type="button"
              onClick={onStop}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-md transition-all active:scale-95"
              title="Stop generating"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!value.trim() || isDisabled}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-600 font-bold transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95 shadow-md shadow-emerald-950/40"
              title="Send message"
            >
              <ArrowUp className="w-4 h-4 text-zinc-950" />
            </button>
          )}
        </div>
      </form>

      <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-zinc-500">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-500/70" />
          <span>Press <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px]">Shift+Enter</kbd> for newline</span>
        </span>
        <span className="hidden sm:inline font-mono">100% On-Device Inference</span>
      </div>
    </div>
  );
}
