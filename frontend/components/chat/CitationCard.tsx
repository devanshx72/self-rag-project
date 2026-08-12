import React from "react";
import { Citation } from "@/types";
import { FileText, Award, Eye } from "lucide-react";

interface CitationCardProps {
  citation: Citation;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation }) => {
  return (
    <div className="mt-2 rounded-lg border border-[#1e242b] bg-[#121518] p-3 text-xs shadow-sm">
      <div className="flex items-center justify-between border-b border-[#1e242b] pb-2 gap-2 min-w-0">
        <div className="flex items-center gap-1.5 font-medium text-[#00e599] min-w-0 flex-1">
          <FileText className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate" title={`[${citation.ref_number}] ${citation.document_name}`}>
            [{citation.ref_number}] {citation.document_name}
          </span>
          {citation.page_number ? (
            <span className="rounded bg-[#1a1f26] px-1.5 py-0.5 text-[10px] text-slate-400 shrink-0">
              Page {citation.page_number}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1 font-mono text-[10px] text-[#00e599] bg-[#00e599]/10 px-2 py-0.5 rounded border border-[#00e599]/20 shrink-0">
          <Award className="h-3 w-3" />
          <span>{(citation.similarity_score * 100).toFixed(1)}% Match</span>
        </div>
      </div>

      <div className="mt-2 rounded bg-[#0b0d0f] p-2 text-slate-300 italic border-l-2 border-[#00e599] font-mono text-[11px] leading-relaxed break-words">
        &ldquo;{citation.excerpt}&rdquo;
      </div>
    </div>
  );
};
