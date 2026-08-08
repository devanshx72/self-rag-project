"use client";

import React, { useEffect } from "react";
import { useChatStore } from "@/store/useChatStore";
import { useExecutionStore } from "@/store/useExecutionStore";
import { History, PlayCircle, Clock } from "lucide-react";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { fetchHistoryEntry } from "@/lib/api";

export const HistoryPanel: React.FC = () => {
  const { history, isLoadingHistory, loadHistory, selectHistorySession, currentSessionId } = useChatStore();
  const { setFullTrace } = useExecutionStore();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSelectSession = async (sessionId: string) => {
    await selectHistorySession(sessionId);
    try {
      const detail = await fetchHistoryEntry(sessionId);
      if (detail.execution_trace) {
        setFullTrace(detail.execution_trace);
      }
    } catch (e) {
      console.error("Failed to replay execution trace:", e);
    }
  };

  return (
    <div className="flex h-full flex-col border-r border-[#1a1f26] bg-[#0c0e10] p-4 text-slate-200">
      <div className="mb-4 flex items-center gap-2 border-b border-[#1a1f26] pb-3">
        <History className="h-5 w-5 text-[#00e599]" />
        <h2 className="font-semibold tracking-wide text-slate-100">Execution History</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {isLoadingHistory ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-lg bg-[#121518] p-4 text-center text-xs text-slate-500 border border-[#1e242b]">
            No execution history found. Run your first query!
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item) => {
              const isSelected = currentSessionId === item.session_id;
              return (
                <div
                  key={item.session_id}
                  onClick={() => handleSelectSession(item.session_id)}
                  className={`group cursor-pointer rounded-lg border p-3 transition-all ${
                    isSelected
                      ? "border-[#00e599] bg-[#00e599]/10 shadow-[0_0_15px_rgba(0,229,153,0.15)]"
                      : "border-[#1e242b] bg-[#121518] hover:border-[#00e599]/40 hover:bg-[#15191d]"
                  }`}
                >
                  <p className="line-clamp-2 text-xs font-medium text-slate-200 group-hover:text-[#00e599]">
                    {item.question}
                  </p>
                  
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {(item.total_latency_ms / 1000).toFixed(2)}s
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[#00e599]">
                      <PlayCircle className="h-3 w-3" /> Replay Graph
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
