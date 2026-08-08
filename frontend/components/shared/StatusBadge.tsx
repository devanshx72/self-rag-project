import React from "react";
import { NodeStatus } from "@/types";

interface StatusBadgeProps {
  status: NodeStatus | string;
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  let colorBg = "bg-slate-800 text-slate-400 border-slate-700";
  let dotColor = "bg-slate-500";
  let text = "Waiting";

  switch (status) {
    case "running":
      colorBg = "bg-[#00e599]/20 text-[#00e599] border-[#00e599]/50 shadow-[0_0_12px_rgba(0,229,153,0.3)] animate-pulse";
      dotColor = "bg-[#00e599] animate-ping";
      text = "Running";
      break;
    case "completed":
      colorBg = "bg-[#00e599]/10 text-[#00e599] border-[#00e599]/30";
      dotColor = "bg-[#00e599]";
      text = "Completed";
      break;
    case "failed":
      colorBg = "bg-rose-950/60 text-rose-400 border-rose-800/60";
      dotColor = "bg-rose-400";
      text = "Failed";
      break;
    case "skipped":
      colorBg = "bg-amber-950/60 text-amber-400 border-amber-800/60";
      dotColor = "bg-amber-400";
      text = "Skipped";
      break;
  }

  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-medium";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${padding} ${colorBg}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {text}
    </span>
  );
};
