"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  CreateWebWorkerMLCEngine,
  WebWorkerMLCEngine,
  InitProgressReport,
  deleteModelAllInfoInCache,
  ChatCompletionMessageParam,
} from "@mlc-ai/web-llm";
import { DEFAULT_MODEL_ID, AVAILABLE_MODELS } from "@/lib/models";

export type LLMStatus = "idle" | "loading" | "ready" | "generating" | "error";

export interface UseLLMReturn {
  status: LLMStatus;
  progress: number;
  progressText: string;
  activeModelId: string | null;
  error: string | null;
  loadModel: (modelId?: string) => Promise<void>;
  send: (
    messages: ChatCompletionMessageParam[],
    onToken?: (delta: string, fullText: string) => void
  ) => Promise<string>;
  stop: () => void;
  clearCache: () => Promise<void>;
  clearError: () => void;
}

function parseErrorMessage(err: unknown): string {
  if (!err) return "An unexpected error occurred.";
  const msg = typeof err === "string" ? err : (err as any)?.message || String(err);
  const lower = msg.toLowerCase();

  if (
    lower.includes("out of memory") ||
    lower.includes("oom") ||
    lower.includes("devicelost") ||
    lower.includes("buffer allocation") ||
    lower.includes("failed to allocate")
  ) {
    return "GPU Out of Memory or Device Lost. The model requires more VRAM than is currently available. We recommend switching to the lighter 1B model (Llama-3.2-1B-Instruct).";
  }

  if (
    lower.includes("network") ||
    lower.includes("failed to fetch") ||
    lower.includes("net::err") ||
    lower.includes("fetch failed")
  ) {
    return "Network error while downloading model weights from Hugging Face. Please verify your connection and click Retry.";
  }

  if (lower.includes("webgpu") || lower.includes("adapter") || lower.includes("device")) {
    return "WebGPU device initialization failed. Ensure hardware acceleration is enabled in your browser settings and GPU drivers are up to date.";
  }

  return msg;
}

export function useLLM(initialModelId: string = DEFAULT_MODEL_ID): UseLLMReturn {
  const [status, setStatus] = useState<LLMStatus>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [progressText, setProgressText] = useState<string>("");
  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const engineRef = useRef<WebWorkerMLCEngine | null>(null);
  const isGeneratingRef = useRef<boolean>(false);

  // Terminate worker safely on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        try {
          workerRef.current.terminate();
        } catch (e) {
          console.warn("Worker termination error:", e);
        }
        workerRef.current = null;
      }
      engineRef.current = null;
    };
  }, []);

  const getOrCreateWorker = useCallback((): Worker => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL("../workers/llm.worker.ts", import.meta.url),
        { type: "module" }
      );
    }
    return workerRef.current;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadModel = useCallback(
    async (modelId: string = initialModelId) => {
      setStatus("loading");
      setProgress(0);
      setProgressText("Initializing WebGPU worker...");
      setError(null);

      const initProgressCallback = (report: InitProgressReport) => {
        const pct = Math.min(100, Math.max(0, Math.round(report.progress * 100)));
        setProgress(pct);
        setProgressText(report.text || "Loading model files from Hugging Face...");
      };

      try {
        const worker = getOrCreateWorker();

        if (engineRef.current) {
          // If the engine is already loaded and we are switching models, use engine.reload
          setProgressText(`Reloading model: ${modelId}...`);
          await engineRef.current.reload(modelId, { initProgressCallback });
        } else {
          // First-time engine creation
          const engine = await CreateWebWorkerMLCEngine(worker, modelId, {
            initProgressCallback,
          });
          engineRef.current = engine;
        }

        setActiveModelId(modelId);
        setStatus("ready");
        setProgress(100);
        setProgressText("Model ready for inference");
      } catch (err: unknown) {
        console.error("Failed to load model:", err);
        setStatus("error");
        setError(parseErrorMessage(err));
      }
    },
    [initialModelId, getOrCreateWorker]
  );

  const send = useCallback(
    async (
      messages: ChatCompletionMessageParam[],
      onToken?: (delta: string, fullText: string) => void
    ): Promise<string> => {
      if (!engineRef.current) {
        const errMsg = "Engine is not ready yet. Please load a model first.";
        setError(errMsg);
        setStatus("error");
        throw new Error(errMsg);
      }

      setStatus("generating");
      setError(null);
      isGeneratingRef.current = true;

      let fullText = "";

      try {
        const chunks = await engineRef.current.chat.completions.create({
          messages,
          stream: true,
          temperature: 0.3,
        });

        for await (const chunk of chunks) {
          if (!isGeneratingRef.current) {
            // User aborted generation
            break;
          }
          const delta = chunk.choices[0]?.delta?.content || "";
          if (delta) {
            fullText += delta;
            if (onToken) {
              onToken(delta, fullText);
            }
          }
        }

        setStatus("ready");
        return fullText;
      } catch (err: unknown) {
        console.error("Inference generation error:", err);
        const errorMsg = parseErrorMessage(err);
        const lower = String(err).toLowerCase();

        // If stopped by user, don't flag as error
        if (lower.includes("interrupt") || lower.includes("abort") || !isGeneratingRef.current) {
          setStatus("ready");
          return fullText;
        }

        setStatus("error");
        setError(errorMsg);
        throw err;
      } finally {
        isGeneratingRef.current = false;
      }
    },
    []
  );

  const stop = useCallback(() => {
    isGeneratingRef.current = false;
    if (engineRef.current) {
      try {
        engineRef.current.interruptGenerate();
      } catch (e) {
        console.warn("Error calling interruptGenerate:", e);
      }
    }
    setStatus("ready");
  }, []);

  const clearCache = useCallback(async () => {
    try {
      isGeneratingRef.current = false;
      if (engineRef.current) {
        try {
          engineRef.current.interruptGenerate();
        } catch {}
      }

      // Terminate the active worker and reset references
      if (workerRef.current) {
        try {
          workerRef.current.terminate();
        } catch {}
        workerRef.current = null;
      }
      engineRef.current = null;

      // Call deleteModelAllInfoInCache for all known models
      for (const m of AVAILABLE_MODELS) {
        try {
          await deleteModelAllInfoInCache(m.id);
        } catch (e) {
          console.warn(`deleteModelAllInfoInCache failed for ${m.id}:`, e);
        }
      }

      // Also clean up any browser CacheStorage entries
      if (typeof window !== "undefined" && "caches" in window) {
        try {
          const keys = await window.caches.keys();
          for (const key of keys) {
            if (key.includes("webllm") || key.includes("model")) {
              await window.caches.delete(key);
            }
          }
        } catch (e) {
          console.warn("CacheStorage cleanup error:", e);
        }
      }

      setActiveModelId(null);
      setStatus("idle");
      setProgress(0);
      setProgressText("");
      setError(null);
    } catch (err: unknown) {
      console.error("Failed to clear cache:", err);
      setError(parseErrorMessage(err));
    }
  }, []);

  return {
    status,
    progress,
    progressText,
    activeModelId,
    error,
    loadModel,
    send,
    stop,
    clearCache,
    clearError,
  };
}
