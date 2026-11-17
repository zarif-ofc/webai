"use client";

import React from "react";
import { ExternalLink, CheckCircle2, Globe } from "lucide-react";
import { OpenUrlAction } from "@/lib/actions";

interface ActionCardProps {
  action: OpenUrlAction;
  timestamp?: number;
}

export function ActionCard({ action, timestamp }: ActionCardProps) {
  const displayHost = (() => {
    try {
      const u = new URL(action.url);
      return u.hostname + (u.pathname !== "/" ? u.pathname : "");
    } catch {
      return action.url;
    }
  })();

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="w-full max-w-md my-2 rounded-2xl border border-emerald-800/80 bg-zinc-900/90 p-4 shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Action Executed</span>
            </div>
            <h4 className="text-sm font-semibold text-zinc-100 mt-1 break-all">
              Opened {displayHost}
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5 break-all font-mono">
              {action.url}
            </p>
          </div>
        </div>

        {formattedTime && (
          <span className="text-[10px] text-zinc-500 font-mono shrink-0">
            {formattedTime}
          </span>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
        <span className="text-[11px] text-zinc-400">
          Browser popup blocked? Use fallback:
        </span>
        <a
          href={action.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-semibold transition-colors shadow-sm shrink-0"
        >
          <span>Open Link</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
