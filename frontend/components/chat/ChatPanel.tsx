"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/store/useChatStore";
import { useSSE } from "@/hooks/useSSE";
import { MessageBubble } from "./MessageBubble";
import { Send, Sparkles, MessageSquare } from "lucide-react";

export const ChatPanel: React.FC = () => {
  const { messages } = useChatStore();
  const { runQuery, isQuerying } = useSSE();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isQuerying) return;
    const q = input;
    setInput("");
    runQuery(q);
  };

  return (
    <div className="flex h-full flex-col bg-[#0b0d0f]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1a1f26] bg-[#0c0e10] p-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[#00e599]" />
          <h2 className="font-semibold text-slate-100 tracking-tight">Chat</h2>
        </div>
        {/* <div className="flex items-center gap-1.5 rounded-full bg-[#00e599]/10 px-3 py-1 text-xs text-[#00e599] border border-[#00e599]/30 glow-mint-sm backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-[#00e599] animate-pulse" />
          <span className="font-medium tracking-wide">Self-RAG LangGraph Pipeline</span>
        </div> */}
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#15191d]">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-grid-pattern">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00e599]/10 text-[#00e599] border border-[#00e599]/25">
              <Sparkles className="h-6 w-6 text-[#00e599]" />
            </div>
            <h3 className="text-base font-semibold text-slate-100">Ask Anything!</h3>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-400">
              Query your indexed documents or general knowledge. Watch the execution graph evaluate every step in real time.
            </p>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-[#1a1f26] bg-[#0c0e10] p-4">
        <form onSubmit={handleSubmit} className="flex gap-2.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isQuerying}
            placeholder="Ask a question about your documents..."
            className="cool-input flex-1 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isQuerying || !input.trim()}
            className="btn-cool-ask"
          >
            <span className="btn-inner">
              <span>Ask</span>
              <Send className="h-4 w-4" />
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
