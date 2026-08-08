"use client";

import React from "react";
import { useExecutionStore } from "@/store/useExecutionStore";
import { StatusBadge } from "../shared/StatusBadge";
import { Clock, Terminal, ChevronRight } from "lucide-react";

export const ExecutionTimeline: React.FC = () => {
  const { executionTrace, selectNode } = useExecutionStore();

  if (executionTrace.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-xs text-slate-500">
        No execution trace recorded yet. Submit a query to view step-by-step logs.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#0b0d0f] p-6 bg-grid-pattern">
      <div className="relative border-l-2 border-[#1e242b] ml-4 space-y-6">
        {executionTrace.map((item, idx) => (
          <div key={`${item.node_id}-${idx}`} className="relative pl-6">
            {/* Timeline node marker */}
            <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-[#0b0d0f] bg-[#00e599] ring-4 ring-[#0b0d0f] glow-mint-sm" />

            <div
              onClick={() => selectNode(item.node_id)}
              className="group cursor-pointer rounded-2xl border border-[#1e242b] bg-[#121518]/90 p-4 transition-all hover:border-[#00e599]/50 hover:bg-[#15191d]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-slate-100 group-hover:text-[#00e599]">
                    {item.node_label}
                  </h4>
                  <StatusBadge status={item.status} size="sm" />
                </div>
                <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                  <Clock className="h-3 w-3 text-slate-500" />
                  <span>{item.latency_ms.toFixed(2)} ms</span>
                </div>
              </div>

              {item.decision && (
                <p className="mt-2 font-mono text-xs text-[#00e599] bg-[#00e599]/10 p-2 rounded-lg border border-[#00e599]/20">
                  {item.decision}
                </p>
              )}

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Tokens: {item.total_tokens}</span>
                <span className="flex items-center gap-0.5 text-[#00e599] group-hover:translate-x-0.5 transition-transform font-medium">
                  View Node Details <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
