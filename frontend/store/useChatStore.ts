import { create } from "zustand";
import { Message, HistoryEntry } from "@/types";
import { fetchHistory, fetchHistoryEntry } from "@/lib/api";

interface ChatState {
  messages: Message[];
  history: HistoryEntry[];
  currentSessionId: string | null;
  isLoadingHistory: boolean;

  addMessage: (msg: Message) => void;
  updateLastMessage: (updates: Partial<Message>) => void;
  loadHistory: () => Promise<void>;
  selectHistorySession: (sessionId: string) => Promise<void>;
  startNewSession: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  history: [],
  currentSessionId: null,
  isLoadingHistory: false,

  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),

  updateLastMessage: (updates) =>
    set((state) => {
      if (state.messages.length === 0) return state;
      const newMsgs = [...state.messages];
      const last = newMsgs[newMsgs.length - 1];
      newMsgs[newMsgs.length - 1] = { ...last, ...updates };
      return { messages: newMsgs };
    }),

  loadHistory: async () => {
    set({ isLoadingHistory: true });
    try {
      const h = await fetchHistory();
      set({ history: h, isLoadingHistory: false });
    } catch {
      set({ isLoadingHistory: false });
    }
  },

  selectHistorySession: async (sessionId) => {
    try {
      const detail = await fetchHistoryEntry(sessionId);
      const userMsg: Message = {
        id: `${sessionId}-user`,
        role: "user",
        content: detail.question,
        timestamp: detail.execution_trace[0]?.timestamp || new Date().toISOString(),
      };
      const assistantMsg: Message = {
        id: `${sessionId}-assistant`,
        role: "assistant",
        content: detail.answer,
        citations: detail.citations,
        session_id: sessionId,
        timestamp: new Date().toISOString(),
      };
      set({
        currentSessionId: sessionId,
        messages: [userMsg, assistantMsg],
      });
    } catch (err) {
      console.error(err);
    }
  },

  startNewSession: () => set({ messages: [], currentSessionId: null }),
}));
