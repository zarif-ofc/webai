import { OpenUrlAction } from "./actions";

export interface ChatMessage {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  action?: OpenUrlAction;
  timestamp: number;
}

const STORAGE_KEYS = {
  MESSAGES: "webllm_chat_messages_v1",
  SELECTED_MODEL: "webllm_selected_model_v1",
} as const;

export function loadStoredMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.error("Failed to load chat messages from localStorage:", err);
  }
  return [];
}

export function saveStoredMessages(messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  } catch (err) {
    console.error("Failed to save chat messages to localStorage:", err);
  }
}

export function clearStoredMessages(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.MESSAGES);
  } catch (err) {
    console.error("Failed to clear chat messages from localStorage:", err);
  }
}

export function loadStoredModelId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL);
  } catch {
    return null;
  }
}

export function saveStoredModelId(modelId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, modelId);
  } catch (err) {
    console.error("Failed to save selected model ID:", err);
  }
}
