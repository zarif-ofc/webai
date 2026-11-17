"use client";

import React, { useState } from "react";
import {
  Cpu,
  Trash2,
  HardDriveDownload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { AVAILABLE_MODELS, ModelOption } from "@/lib/models";
import { LLMStatus } from "@/hooks/useLLM";
import { ConfirmModal } from "./ConfirmModal";

interface HeaderProps {
  status: LLMStatus;
  progress: number;
  selectedModel: ModelOption;
  onSelectModel: (model: ModelOption) => void;
  onClearChat: () => void;
  onClearCache: () => void;
  isModelLoaded: boolean;
  hasWebGPU: boolean;
}

export function Header({
  status,
  progress,
  selectedModel,
  onSelectModel,
  onClearChat,
  onClearCache,
  isModelLoaded,
  hasWebGPU,
}: HeaderProps) {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [pendingModel, setPendingModel] = useState<ModelOption | null>(null);
  const [isClearCacheModalOpen, setIsClearCacheModalOpen] = useState(false);
  const [isClearChatModalOpen, setIsClearChatModalOpen] = useState(false);

  const handleModelClick = (model: ModelOption) => {
    setModelDropdownOpen(false);
    if (model.id === selectedModel.id) return;

    if (isModelLoaded) {
      // Prompt warning before reloading model
      setPendingModel(model);
    } else {
      onSelectModel(model);
    }
  };

  const handleConfirmModelSwitch = () => {
    if (pendingModel) {
      onSelectModel(pendingModel);
      setPendingModel(null);
    }
  };

  const renderStatusPill = () => {
    if (!hasWebGPU) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-950/60 border border-rose-800 text-rose-300">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>WebGPU Unavailable</span>
        </div>
      );
    }

    switch (status) {
      case "idle":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800/80 border border-zinc-700/60 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-zinc-500" />
            <span>Offline / Not Loaded</span>
          </div>
        );
      case "loading":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950/60 border border-amber-800 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Downloading... {progress}%</span>
          </div>
        );
      case "ready":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/60 border border-emerald-800 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span>Ready • Local WebGPU</span>
          </div>
        );
      case "generating":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-950/60 border border-sky-800 text-sky-300">
            <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin" />
            <span>Generating...</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-950/60 border border-rose-800 text-rose-300">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Error</span>
          </div>
        );
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-zinc-950 font-bold shadow-md shadow-emerald-950/50">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-zinc-100 tracking-tight">
                  LocalWeb AI
                </h1>
                <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                  100% Client-Side
                </span>
              </div>
              <p className="text-xs text-zinc-400">Zero backend • In-browser WebGPU</p>
            </div>
          </div>

          {/* Controls: Status, Model selector, and Actions */}
          <div className="flex items-center flex-wrap justify-end gap-2.5">
            {/* Status Pill */}
            {renderStatusPill()}

            {/* Model Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setModelDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 hover:border-zinc-700 transition-colors"
                title="Select model"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold">{selectedModel.shortName}</span>
                <span className="text-zinc-400 text-[11px]">({selectedModel.sizeLabel})</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-0.5" />
              </button>

              {modelDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setModelDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl py-2 z-40 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Available Models
                    </div>
                    {AVAILABLE_MODELS.map((model) => {
                      const isSelected = model.id === selectedModel.id;
                      return (
                        <button
                          key={model.id}
                          onClick={() => handleModelClick(model)}
                          className={`w-full text-left px-3 py-2.5 flex items-start justify-between gap-2 hover:bg-zinc-800/80 transition-colors ${
                            isSelected ? "bg-zinc-800/50" : ""
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-zinc-100">
                                {model.name}
                              </span>
                              {isSelected && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                              {model.description}
                            </p>
                            <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                              Rec: {model.recommendedVRAM}
                            </span>
                          </div>
                          <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/40 shrink-0">
                            {model.sizeLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Clear Cache Button */}
            <button
              type="button"
              onClick={() => setIsClearCacheModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors"
              title="Delete cached model weights from browser storage"
            >
              <HardDriveDownload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Cached Model</span>
            </button>

            {/* Clear Chat Button */}
            <button
              type="button"
              onClick={() => setIsClearChatModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-rose-300 border border-zinc-800 transition-colors"
              title="Clear all messages in conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          </div>
        </div>
      </header>

      {/* Confirmation Modal for Model Switching */}
      <ConfirmModal
        isOpen={Boolean(pendingModel)}
        title="Switch Loaded Model?"
        description={`You currently have ${selectedModel.shortName} active. Switching to ${pendingModel?.name} will reload the WebGPU engine and download ${pendingModel?.sizeLabel} from Hugging Face if not already cached.`}
        confirmLabel="Switch Model"
        variant="warning"
        onConfirm={handleConfirmModelSwitch}
        onCancel={() => setPendingModel(null)}
      />

      {/* Confirmation Modal for Clear Cache */}
      <ConfirmModal
        isOpen={isClearCacheModalOpen}
        title="Clear Cached Model Weights?"
        description="This will delete the downloaded model weights from your browser's CacheStorage/IndexedDB, freeing up storage (~880 MB to 2.2 GB). The model will need to be downloaded again next time."
        confirmLabel="Clear Storage"
        variant="danger"
        onConfirm={() => {
          setIsClearCacheModalOpen(false);
          onClearCache();
        }}
        onCancel={() => setIsClearCacheModalOpen(false)}
      />

      {/* Confirmation Modal for Clear Chat */}
      <ConfirmModal
        isOpen={isClearChatModalOpen}
        title="Clear Chat Conversation?"
        description="This will permanently delete all messages and action cards from your browser's local storage."
        confirmLabel="Clear Messages"
        variant="danger"
        onConfirm={() => {
          setIsClearChatModalOpen(false);
          onClearChat();
        }}
        onCancel={() => setIsClearChatModalOpen(false)}
      />
    </>
  );
}
