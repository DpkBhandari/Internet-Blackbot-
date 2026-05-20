import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
}

interface ChatState {
  messages: ChatMessage[];
  sessionId: string;
  addMessage: (msg: Omit<ChatMessage, "id">) => void;
  clearMessages: () => void;
  setSessionId: (id: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      sessionId: `session-${Date.now()}`,
      addMessage: (msg) => set((s) => ({
        messages: [...s.messages, { ...msg, id: `${Date.now()}-${Math.random()}` }],
      })),
      clearMessages: () => set({ messages: [], sessionId: `session-${Date.now()}` }),
      setSessionId: (id) => set({ sessionId: id }),
    }),
    {
      name: "ibb-chat",
      partialize: (s) => ({ messages: s.messages.slice(-100), sessionId: s.sessionId }),
    }
  )
);
