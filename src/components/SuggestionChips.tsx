"use client";

import React from "react";
import { Globe, Code2, Sparkles, Youtube, Github } from "lucide-react";

interface SuggestionChipsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export const SUGGESTIONS = [
  {
    label: "Open YouTube",
    prompt: "Open YouTube",
    icon: Youtube,
    category: "Action",
    color: "text-red-400 group-hover:text-red-300",
  },
  {
    label: "Open GitHub",
    prompt: "Open GitHub",
    icon: Github,
    category: "Action",
    color: "text-zinc-300 group-hover:text-white",
  },
  {
    label: "Explain quantum computing",
    prompt: "Explain quantum computing in 2 sentences",
    icon: Sparkles,
    category: "Reasoning",
    color: "text-emerald-400 group-hover:text-emerald-300",
  },
  {
    label: "Write a quick Python loop",
    prompt: "Write a quick Python loop",
    icon: Code2,
    category: "Code",
    color: "text-sky-400 group-hover:text-sky-300",
  },
];

export function SuggestionChips({ onSelect, disabled }: SuggestionChipsProps) {
  return (
    <div className="w-full max-w-2xl mx-auto py-4 px-2">
      <div className="text-center mb-3">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Suggested Prompts & Actions
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {SUGGESTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.prompt}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(s.prompt)}
              className="group flex items-center justify-between p-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 transition-all text-left shadow-sm disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 shrink-0">
                  <Icon className={`w-4 h-4 transition-colors ${s.color}`} />
                </div>
                <div className="truncate">
                  <div className="text-xs font-medium text-zinc-200 group-hover:text-white truncate">
                    {s.label}
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate">
                    {s.prompt}
                  </div>
                </div>
              </div>

              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/40 ml-2 shrink-0">
                {s.category}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
