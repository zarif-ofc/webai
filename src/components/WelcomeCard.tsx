"use client";

import React from "react";
import {
  Download,
  ShieldCheck,
  Zap,
  Globe,
  Loader2,
  HardDrive,
  Cpu,
} from "lucide-react";
import { ModelOption } from "@/lib/models";
import { LLMStatus } from "@/hooks/useLLM";

interface WelcomeCardProps {
  selectedModel: ModelOption;
  status: LLMStatus;
  progress: number;
  progressText: string;
  hasWebGPU: boolean | null;
  onLoadModel: () => void;
}

export function WelcomeCard({
  selectedModel,
  status,
  progress,
  progressText,
  hasWebGPU,
  onLoadModel,
}: WelcomeCardProps) {
  const isLoading = status === "loading";
  const isReady = status === "ready" || status === "generating";
  const isDisabled = hasWebGPU === false || isLoading;

  if (isReady) return null;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-6">
        {/* Header badge & title */}
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 border border-emerald-800 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Private Client-Side AI</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
            Run AI in Your Browser with WebGPU
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Experience ultra-fast, completely local inference powered by <strong className="text-zinc-200">@mlc-ai/web-llm</strong> and WebGPU.
            Model weights are downloaded once from Hugging Face and cached locally for lifetime offline use.
            Zero telemetry, zero API keys, zero server requests.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-zinc-900 text-emerald-400 border border-zinc-800">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-200">Hardware Accelerated</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">Executes on GPU shaders at native performance.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-zinc-900 text-sky-400 border border-zinc-800">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-200">Cached Locally</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">Stored in browser CacheStorage for instant offline loads.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-zinc-900 text-amber-400 border border-zinc-800">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-zinc-200">Intelligent Actions</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">Ask it to open websites and apps seamlessly.</p>
            </div>
          </div>
        </div>

        {/* Download / Loading CTA */}
        <div className="pt-2">
          {isLoading ? (
            <div className="space-y-3 p-5 rounded-2xl bg-zinc-950 border border-amber-900/40">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-300 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  Downloading & Initializing Engine...
                </span>
                <span className="font-mono font-bold text-amber-300">{progress}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-900 rounded-full h-2.5 overflow-hidden border border-zinc-800">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-[11px] font-mono text-zinc-400 truncate">
                {progressText || "Downloading shards from Hugging Face CDN..."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                disabled={isDisabled}
                onClick={onLoadModel}
                className="w-full group relative flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-zinc-950 font-bold text-base shadow-lg shadow-emerald-950/60 transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <Download className="w-5 h-5 text-zinc-950 transition-transform group-hover:-translate-y-0.5" />
                <span>Load Local AI ({selectedModel.sizeLabel})</span>
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                <span>
                  Selected: <strong className="text-zinc-300">{selectedModel.name}</strong> • {selectedModel.recommendedVRAM}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
