"use client";

import React from "react";
import { AlertTriangle, Chrome, Settings, RefreshCw, Cpu } from "lucide-react";

interface WebGPUBannerProps {
  hasWebGPU: boolean | null; // null while checking on initial render
}

export function WebGPUBanner({ hasWebGPU }: WebGPUBannerProps) {
  // If still detecting or WebGPU is supported, show nothing
  if (hasWebGPU === null || hasWebGPU === true) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto my-4 px-4">
      <div className="rounded-2xl border border-rose-800/80 bg-rose-950/40 p-5 text-rose-200 shadow-xl backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-rose-900/60 text-rose-300 border border-rose-700/60 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-base font-semibold text-rose-100">
                WebGPU Not Supported or Disabled in this Browser
              </h2>
              <p className="text-sm text-rose-300/90 mt-1 leading-relaxed">
                This app runs modern large language models directly on your graphics card via WebGPU. Your current browser or environment does not support or has disabled WebGPU hardware acceleration.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-zinc-900/70 border border-rose-900/40 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-100">
                  <Chrome className="w-4 h-4 text-amber-400" />
                  <span>Use Modern Browser</span>
                </div>
                <p className="text-zinc-400">
                  Google Chrome, Microsoft Edge, or Brave (v113+ recommended).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/70 border border-rose-900/40 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-100">
                  <Settings className="w-4 h-4 text-sky-400" />
                  <span>Hardware Acceleration</span>
                </div>
                <p className="text-zinc-400">
                  Enable &ldquo;Use graphics acceleration when available&rdquo; in browser settings.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/70 border border-rose-900/40 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-100">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span>Flags & Drivers</span>
                </div>
                <p className="text-zinc-400">
                  Check <code className="text-[11px] text-zinc-200">chrome://flags/#enable-unsafe-webgpu</code> and update GPU drivers.
                </p>
              </div>
            </div>

            <div className="text-xs text-rose-400/80 pt-1 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>After modifying browser flags or settings, restart your browser and refresh this page.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
