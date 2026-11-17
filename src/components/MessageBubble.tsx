"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Copy,
  Check,
  Sparkles,
  Bot,
  User,
  Loader2,
} from "lucide-react";
import { ChatMessage } from "@/lib/storage";
import { isStreamingActionCandidate } from "@/lib/actions";
import { ActionCard } from "./ActionCard";

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function CodeBlock({ inline, className, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const codeString = String(children).replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Failed to copy code:", err);
    }
  };

  if (inline) {
    return (
      <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono text-[0.85em] border border-zinc-700/50">
        {children}
      </code>
    );
  }

  return (
    <div className="relative my-3 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 font-mono text-xs shadow-md">
      <div className="flex items-center justify-between px-3.5 py-2 bg-zinc-900/80 border-b border-zinc-800 text-zinc-400">
        <span className="font-semibold text-zinc-300 text-[11px] uppercase tracking-wider">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto text-zinc-200">
        <pre className="!bg-transparent !p-0 !m-0 font-mono leading-relaxed">
          <code>{children}</code>
        </pre>
      </div>
    </div>
  );
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "user";

  // If this assistant message is currently streaming and its text begins with JSON,
  // do not flash raw JSON. Show "Preparing action..."
  const isActionStreaming =
    !isUser &&
    Boolean(isStreaming) &&
    isStreamingActionCandidate(message.content);

  // If message has an action attached, display the ActionCard
  if (message.action) {
    return (
      <div className="flex items-start gap-3 w-full max-w-3xl mr-auto animate-in fade-in duration-150">
        <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
          <Bot className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <ActionCard action={message.action} timestamp={message.timestamp} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-3 w-full max-w-3xl ${
        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
      } animate-in fade-in duration-150`}
    >
      {/* Avatar Icon */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
          isUser
            ? "bg-zinc-800 border border-zinc-700 text-zinc-300"
            : "bg-zinc-900 border border-zinc-800 text-emerald-400"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble Content */}
      <div
        className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-zinc-800 text-zinc-100 rounded-tr-sm border border-zinc-700/60 max-w-[85%]"
            : "bg-zinc-900 text-zinc-100 rounded-tl-sm border border-zinc-800 max-w-[90%]"
        }`}
      >
        {isActionStreaming ? (
          <div className="flex items-center gap-2.5 py-1 text-emerald-400">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span className="text-xs font-semibold tracking-wide">
              Preparing action…
            </span>
          </div>
        ) : (
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code(props) {
                  const { inline, className, children } = props as any;
                  return (
                    <CodeBlock inline={inline} className={className}>
                      {children}
                    </CodeBlock>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>

            {/* Pulsing indicator when still streaming content */}
            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 -mb-0.5 bg-emerald-400 animate-pulse rounded-sm" />
            )}
          </div>
        )}

        {/* Timestamp */}
        {message.timestamp && (
          <div
            className={`mt-1 text-[10px] text-zinc-500 font-mono ${
              isUser ? "text-right" : "text-left"
            }`}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>
    </div>
  );
}
