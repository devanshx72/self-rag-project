"use client";

import React from "react";
import { useExecutionStore } from "@/store/useExecutionStore";
import { Clock, Zap, Layers, Filter, CheckCircle2, Award } from "lucide-react";

export const StatsDashboard: React.FC = () => {
  const { stats } = useExecutionStore();

  return (
    <div className="h-full overflow-y-auto bg-[#0b0d0f] p-6 text-slate-200 bg-grid-pattern">
      <h3 className="mb-4 text-base font-semibold text-slate-100">Execution Telemetry & Analytics</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Total Latency */}
        <div className="rounded-2xl border border-[#1e242b] bg-[#121518]/90 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Clock className="h-4 w-4 text-[#00e599]" />
            <span>Total Pipeline Latency</span>
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-slate-100">
            {(stats.total_latency_ms / 1000).toFixed(2)}s
          </p>
        </div>

        {/* Total Tokens */}
        <div className="rounded-2xl border border-[#1e242b] bg-[#121518]/90 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Zap className="h-4 w-4 text-amber-400" />
            <span>Tokens Consumed</span>
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-slate-100">
            {stats.total_tokens}
          </p>
        </div>

        {/* Retrieved Chunks */}
        <div className="rounded-2xl border border-[#1e242b] bg-[#121518]/90 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Layers className="h-4 w-4 text-[#00e599]" />
            <span>Retrieved Chunks</span>
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-slate-100">
            {stats.retrieved_chunks}
          </p>
        </div>

        {/* Relevant vs Discarded */}
        <div className="rounded-2xl border border-[#1e242b] bg-[#121518]/90 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Filter className="h-4 w-4 text-[#00e599]" />
            <span>Relevant / Discarded</span>
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-slate-100">
            <span className="text-[#00e599]">{stats.relevant_chunks}</span> /{" "}
            <span className="text-rose-400">{stats.discarded_chunks}</span>
          </p>
        </div>

        {/* Avg Similarity */}
        <div className="rounded-2xl border border-[#1e242b] bg-[#121518]/90 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Award className="h-4 w-4 text-[#00e599]" />
            <span>Avg Similarity Score</span>
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-slate-100">
            {(stats.avg_similarity_score * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};
