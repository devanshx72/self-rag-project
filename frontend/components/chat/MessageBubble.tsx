import React from "react";
import { Message } from "@/types";
import { User, Bot } from "lucide-react";
import { CitationCard } from "./CitationCard";
import { LoadingSpinner } from "../shared/LoadingSpinner";

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 p-4 ${isUser ? "bg-[#121518]/40" : "bg-[#0b0d0f]"}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${isUser
            ? "border-slate-700 bg-slate-800 text-slate-200"
            : "border-[#00e599]/30 bg-[#00e599]/10 text-[#00e599]"
          }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">
            {isUser ? "You" : "RAG Agent"}
          </span>
          {message.isStreaming && <LoadingSpinner size={14} />}
        </div>

        <div className="prose prose-invert max-w-none text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
          {message.content}
        </div>

        {message.citations && message.citations.length > 0 && (
          <div className="mt-3 space-y-2 border-t border-slate-800/60 pt-3">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Referenced Citations & Evidences
            </span>
            {message.citations.map((c) => (
              <CitationCard key={c.chunk_id || c.ref_number} citation={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
