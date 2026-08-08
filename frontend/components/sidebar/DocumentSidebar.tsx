"use client";

import React, { useEffect, useRef } from "react";
import { useDocumentStore } from "@/store/useDocumentStore";
import { Upload, FileText, Trash2, Database, AlertCircle } from "lucide-react";
import { LoadingSpinner } from "../shared/LoadingSpinner";

export const DocumentSidebar: React.FC = () => {
  const { documents, isLoading, isUploading, error, loadDocuments, uploadFile, removeDocument } =
    useDocumentStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  return (
    <div className="flex h-full flex-col border-r border-[#1a1f26] bg-[#0c0e10] p-4 text-slate-200">
      <div className="mb-4 flex items-center gap-2 border-b border-[#1a1f26] pb-3">
        <Database className="h-5 w-5 text-[#00e599]" />
        <h2 className="font-semibold tracking-wide text-slate-100">Documents</h2>
      </div>

      {/* Upload Box */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="group cool-dropzone mb-4 flex cursor-pointer flex-col items-center justify-center p-5 text-center"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md"
          className="hidden"
          onChange={handleFileChange}
        />
        {isUploading ? (
          <div className="flex flex-col items-center py-2">
            <LoadingSpinner size={24} />
            <span className="mt-2 text-xs text-[#00e599] font-medium animate-pulse">Ingesting & Indexing...</span>
          </div>
        ) : (
          <>
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-[#00e599]/10 text-[#00e599] border border-[#00e599]/20 group-hover:bg-[#00e599] group-hover:text-[#0b0d0f] transition-all">
              <Upload className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-slate-200 group-hover:text-[#00e599] transition-colors">Upload PDF, DOCX, TXT, MD</span>
            <span className="mt-1 text-[10px] text-slate-500">Max 50MB per file</span>
          </>
        )}
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-rose-950/40 p-3 text-xs text-rose-300 border border-rose-800/40">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <span className="leading-tight">{error}</span>
        </div>
      )}

      {/* Document List */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="mb-2.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Indexed Documents</span>
          <span className="rounded-full bg-[#00e599]/10 px-2 py-0.5 text-[#00e599] border border-[#00e599]/20 text-[10px]">
            {documents.length}
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : documents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#1e242b] bg-[#121518]/40 p-6 text-center text-xs text-slate-400 backdrop-blur-sm">
            No documents uploaded yet.
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="group cool-glass-card flex items-center justify-between rounded-xl p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00e599]/10 text-[#00e599] border border-[#00e599]/25 group-hover:border-[#00e599]/50 shadow-[0_0_10px_rgba(0,229,153,0.1)]">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-200 group-hover:text-[#00e599] transition-colors">{doc.filename}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{doc.chunk_count} vector chunks</p>
                  </div>
                </div>

                <button
                  onClick={() => removeDocument(doc.id)}
                  className="p-1.5 text-slate-400 opacity-0 transition-all hover:text-rose-400 hover:bg-rose-500/10 rounded-lg group-hover:opacity-100"
                  title="Remove document"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
