"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "@/components/Header";
import { WebGPUBanner } from "@/components/WebGPUBanner";
import { WelcomeCard } from "@/components/WelcomeCard";
import { MessageList } from "@/components/MessageList";
import { ChatInput } from "@/components/ChatInput";
import { useLLM } from "@/hooks/useLLM";
import {
  AVAILABLE_MODELS,
  DEFAULT_MODEL_ID,
  getModelById,
  ModelOption,
} from "@/lib/models";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import { parseAction, executeOpenUrl } from "@/lib/actions";
import {
  ChatMessage,
  loadStoredMessages,
  saveStoredMessages,
  clearStoredMessages,
  loadStoredModelId,
  saveStoredModelId,
} from "@/lib/storage";
import { ChatCompletionMessageParam } from "@mlc-ai/web-llm";

export default function Home() {
  const [hasWebGPU, setHasWebGPU] = useState<boolean | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelOption>(() => {
    return AVAILABLE_MODELS[0];
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<ChatMessage | null>(null);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const queuedPromptRef = useRef<string | null>(null);

  const {
    status,
    progress,
    progressText,
    error,
    loadModel,
    send,
    stop,
    clearCache,
    clearError,
  } = useLLM(selectedModel.id);

  // Check WebGPU availability on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const gpuAvailable = "gpu" in navigator && Boolean((navigator as any).gpu);
      setHasWebGPU(gpuAvailable);
    }
  }, []);

  // Safe SSR hydration: Load messages and model preferences from localStorage
  useEffect(() => {
    const savedMessages = loadStoredMessages();
    setMessages(savedMessages);

    const savedModelId = loadStoredModelId();
    if (savedModelId) {
      setSelectedModel(getModelById(savedModelId));
    }

    setIsHydrated(true);
  }, []);

  // Persist messages whenever they change after initial hydration
  useEffect(() => {
    if (isHydrated) {
      saveStoredMessages(messages);
    }
  }, [messages, isHydrated]);

  // Handle model change from Header
  const handleSelectModel = useCallback(
    (model: ModelOption) => {
      setSelectedModel(model);
      saveStoredModelId(model.id);

      // If the engine is already loaded or in error state, reload it
      if (status === "ready" || status === "error") {
        loadModel(model.id);
      }
    },
    [status, loadModel]
  );

  // Handle clearing chat history
  const handleClearChat = useCallback(() => {
    setMessages([]);
    setStreamingMessage(null);
    clearStoredMessages();
  }, []);

  // Handle clearing cached weights from storage
  const handleClearCache = useCallback(async () => {
    await clearCache();
  }, [clearCache]);

  // Core send message handler
  const handleSendMessage = useCallback(
    async (text: string) => {
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        role: "user",
        content: text,
        timestamp: Date.now(),
      };

      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);

      // Prepare context for WebLLM engine with strict system prompt
      const llmMessages: ChatCompletionMessageParam[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...nextMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ];

      const assistantMsgId = `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setStreamingMessage({
        id: assistantMsgId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      });

      try {
        const fullResponse = await send(llmMessages, (_delta, accumulated) => {
          setStreamingMessage((prev) =>
            prev ? { ...prev, content: accumulated } : null
          );
        });

        // Parse actions from finished response
        const actionResult = parseAction(fullResponse);

        let finalAssistantMessage: ChatMessage;

        if (actionResult.isAction && actionResult.action) {
          // Attempt to open URL automatically
          executeOpenUrl(actionResult.action.url);

          finalAssistantMessage = {
            id: assistantMsgId,
            role: "assistant",
            content: fullResponse,
            action: actionResult.action,
            timestamp: Date.now(),
          };
        } else {
          finalAssistantMessage = {
            id: assistantMsgId,
            role: "assistant",
            content: fullResponse,
            timestamp: Date.now(),
          };
        }

        setMessages((prev) => [...prev, finalAssistantMessage]);
      } catch (err) {
        console.error("Error during generation:", err);
      } finally {
        setStreamingMessage(null);
      }
    },
    [messages, send]
  );

  // If a prompt was queued while model was loading, send it once ready
  useEffect(() => {
    if (status === "ready" && queuedPromptRef.current) {
      const prompt = queuedPromptRef.current;
      queuedPromptRef.current = null;
      handleSendMessage(prompt);
    }
  }, [status, handleSendMessage]);

  // Handle clicking a suggestion chip
  const handleSelectSuggestion = useCallback(
    (prompt: string) => {
      if (status === "ready") {
        handleSendMessage(prompt);
      } else {
        queuedPromptRef.current = prompt;
        loadModel(selectedModel.id);
      }
    },
    [status, handleSendMessage, loadModel, selectedModel]
  );

  // Handle retry after error
  const handleRetry = useCallback(() => {
    clearError();
    if (status === "error" && (!messages.length || messages[messages.length - 1]?.role !== "user")) {
      loadModel(selectedModel.id);
    } else if (messages.length > 0) {
      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
      if (lastUserMsg) {
        handleSendMessage(lastUserMsg.content);
      }
    }
  }, [clearError, status, messages, loadModel, selectedModel, handleSendMessage]);

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Top Bar Header */}
      <Header
        status={status}
        progress={progress}
        selectedModel={selectedModel}
        onSelectModel={handleSelectModel}
        onClearChat={handleClearChat}
        onClearCache={handleClearCache}
        isModelLoaded={status === "ready" || status === "generating"}
        hasWebGPU={hasWebGPU ?? true}
      />

      {/* WebGPU Warning Banner if not available */}
      <WebGPUBanner hasWebGPU={hasWebGPU} />

      {/* Main chat viewport */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        {/* Unloaded/Idle state: show WelcomeCard */}
        {messages.length === 0 && (status === "idle" || status === "loading") && (
          <div className="flex-1 overflow-y-auto flex items-center justify-center py-6">
            <WelcomeCard
              selectedModel={selectedModel}
              status={status}
              progress={progress}
              progressText={progressText}
              hasWebGPU={hasWebGPU}
              onLoadModel={() => loadModel(selectedModel.id)}
            />
          </div>
        )}

        {/* Conversation list: shown once loaded or if history exists */}
        {(messages.length > 0 || status === "ready" || status === "generating" || status === "error") && (
          <MessageList
            messages={messages}
            streamingMessage={streamingMessage}
            status={status}
            error={error}
            onClearError={clearError}
            onRetry={handleRetry}
            onSelectSuggestion={handleSelectSuggestion}
          />
        )}
      </main>

      {/* Bottom Chat Input */}
      <footer className="w-full bg-zinc-950/80 backdrop-blur-md border-t border-zinc-900 shrink-0">
        <ChatInput
          status={status}
          hasWebGPU={hasWebGPU}
          onSend={handleSendMessage}
          onStop={stop}
          onPromptLoad={() => loadModel(selectedModel.id)}
        />
      </footer>
    </div>
  );
}
