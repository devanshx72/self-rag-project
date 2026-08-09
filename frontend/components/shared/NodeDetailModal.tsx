"use client";

import React, { useEffect } from "react";
import { useExecutionStore } from "@/store/useExecutionStore";
import { X, Clock, Zap, Terminal, Code, HelpCircle } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

export const NodeDetailModal: React.FC = () => {
  const { selectedTrace, selectNode } = useExecutionStore();

  // Close on Escape key
  useEffect(() => {
    if (!selectedTrace) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") selectNode(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedTrace, selectNode]);

  if (!selectedTrace) return null;

  const trace = selectedTrace;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => selectNode(null)}
    >
      {/* Panel */}
      <div
        className="relative w-full max-w-lg mx-4 rounded-2xl border border-[#1e242b] bg-[#0c0e10] p-5 text-slate-200 shadow-2xl flex flex-col max-h-[85vh] glow-mint-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1a1f26] pb-3 shrink-0">
          <div>
            <h3 className="font-semibold text-slate-100">{trace.node_label}</h3>
            <p className="font-mono text-[10px] text-slate-500">Node ID: {trace.node_id}</p>
          </div>
          <button
            onClick={() => selectNode(null)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-[#15191d] hover:text-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto space-y-4 pt-4 pr-1 text-xs">
          {/* Status & Telemetry Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-[#1e242b] bg-[#121518] p-2.5">
              <span className="text-[10px] font-medium text-slate-500 uppercase">Status</span>
              <div className="mt-1">
                <StatusBadge status={trace.status} size="sm" />
              </div>
            </div>
            <div className="rounded-xl border border-[#1e242b] bg-[#121518] p-2.5">
              <span className="text-[10px] font-medium text-slate-500 uppercase">Latency</span>
              <div className="mt-1 flex items-center gap-1 font-mono text-[#00e599] font-semibold">
                <Clock className="h-3.5 w-3.5" />
                <span>{trace.latency_ms.toFixed(2)} ms</span>
              </div>
            </div>
            <div className="rounded-xl border border-[#1e242b] bg-[#121518] p-2.5">
              <span className="text-[10px] font-medium text-slate-500 uppercase">Tokens</span>
              <div className="mt-1 flex items-center gap-1 font-mono text-amber-400 font-semibold">
                <Zap className="h-3.5 w-3.5" />
                <span>{trace.total_tokens}</span>
              </div>
            </div>
          </div>

          {/* Decision Reason */}
          {trace.decision && (
            <div className="rounded-xl border border-[#00e599]/30 bg-[#00e599]/10 p-3">
              <span className="flex items-center gap-1 font-semibold text-[#00e599]">
                <HelpCircle className="h-3.5 w-3.5" /> Reasoning Decision
              </span>
              <p className="mt-1 font-mono text-[11px] text-emerald-200 leading-relaxed">
                {trace.decision}
              </p>
            </div>
          )}

          {/* Prompt Sent */}
          {trace.prompt_used && (
            <div className="space-y-1">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                <Terminal className="h-3.5 w-3.5 text-slate-500" /> Prompt Sent to LLM
              </span>
              <pre className="max-h-44 overflow-y-auto rounded-xl border border-[#1e242b] bg-[#121518] p-3 font-mono text-[10px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                {trace.prompt_used}
              </pre>
            </div>
          )}

          {/* LLM Raw Output */}
          {trace.raw_llm_output && (
            <div className="space-y-1">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                <Code className="h-3.5 w-3.5 text-slate-500" /> Raw LLM Output
              </span>
              <pre className="max-h-44 overflow-y-auto rounded-xl border border-[#1e242b] bg-[#121518] p-3 font-mono text-[10px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                {trace.raw_llm_output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
