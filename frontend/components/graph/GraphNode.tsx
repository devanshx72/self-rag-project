import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { GraphNodeData } from "@/types";
import { StatusBadge } from "../shared/StatusBadge";
import { Activity, CheckCircle, AlertTriangle, SkipForward, Clock } from "lucide-react";

export const GraphNode: React.FC<NodeProps<GraphNodeData>> = memo(({ data, selected }) => {
  const { label, status, trace } = data;

  let borderColor = "border-[#1e242b] bg-[#14171d]/90 hover:border-[#2a323c]";
  let Icon = Clock;
  let iconColor = "text-slate-500";

  switch (status) {
    case "running":
      borderColor = "border-[#00e599] bg-[#0e1613] ring-2 ring-[#00e599]/30 shadow-[0_0_20px_rgba(0,229,153,0.25)]";
      Icon = Activity;
      iconColor = "text-[#00e599] animate-spin";
      break;
    case "completed":
      borderColor = "border-[#00e599]/40 bg-[#12171a] shadow-sm shadow-[#00e599]/10";
      Icon = CheckCircle;
      iconColor = "text-[#00e599]";
      break;
    case "failed":
      borderColor = "border-rose-700/80 bg-rose-950/30";
      Icon = AlertTriangle;
      iconColor = "text-rose-400";
      break;
    case "skipped":
      borderColor = "border-amber-700/80 bg-slate-900/50 opacity-60";
      Icon = SkipForward;
      iconColor = "text-amber-400";
      break;
  }

  return (
    <div
      className={`min-w-[180px] rounded-xl border p-3 text-slate-100 transition-all ${borderColor} ${
        selected ? "ring-2 ring-[#00e599]" : ""
      }`}
    >
      {/* Target handles (incoming) */}
      <Handle type="target" position={Position.Top} id="top-target" style={{ left: "50%" }} className="!bg-[#00e599]" />
      <Handle type="target" position={Position.Left} id="left-target" style={{ top: "35%" }} className="!bg-[#00e599] !opacity-0" />
      <Handle type="target" position={Position.Right} id="right-target" style={{ top: "65%" }} className="!bg-[#00e599] !opacity-0" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" style={{ left: "50%" }} className="!bg-[#00e599] !opacity-0" />

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Icon className={`h-4 w-4 shrink-0 ${iconColor}`} />
          <span className="truncate text-xs font-semibold">{label}</span>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between">
        <StatusBadge status={status} size="sm" />
        {trace?.latency_ms ? (
          <span className="font-mono text-[10px] text-slate-400">{trace.latency_ms.toFixed(0)}ms</span>
        ) : null}
      </div>

      {trace?.decision && (
        <div className="mt-2 truncate rounded bg-[#0b0d0f] p-1.5 text-[10px] text-slate-400 font-mono border border-[#1e242b]">
          {trace.decision}
        </div>
      )}

      {/* Source handles (outgoing) */}
      <Handle type="source" position={Position.Bottom} id="bottom-source" style={{ left: "50%" }} className="!bg-[#00e599]" />
      <Handle type="source" position={Position.Right} id="right-source" style={{ top: "35%" }} className="!bg-[#00e599] !opacity-0" />
      <Handle type="source" position={Position.Left} id="left-source" style={{ top: "50%" }} className="!bg-[#00e599] !opacity-0" />
      <Handle type="source" position={Position.Top} id="top-source" style={{ left: "50%" }} className="!bg-[#00e599] !opacity-0" />
    </div>
  );
});

GraphNode.displayName = "GraphNode";
