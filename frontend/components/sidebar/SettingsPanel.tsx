"use client";

import React, { useState, useEffect } from "react";
import { Settings, Key, Eye, EyeOff, Save, Trash2, CheckCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

export const SettingsPanel: React.FC = () => {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    // Load existing key from localStorage on mount
    const savedKey = localStorage.getItem("mistral_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSave = () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setStatus({ type: "error", message: "API key cannot be empty." });
      return;
    }
    
    // Save to browser localStorage only
    localStorage.setItem("mistral_api_key", trimmed);
    setApiKey(trimmed);
    setStatus({ type: "success", message: "API Key saved in browser!" });
    
    // Clear status message after 3 seconds
    setTimeout(() => {
      setStatus(null);
    }, 3000);
  };

  const handleClear = () => {
    localStorage.removeItem("mistral_api_key");
    setApiKey("");
    setStatus({ type: "success", message: "API Key cleared." });
    
    setTimeout(() => {
      setStatus(null);
    }, 3000);
  };

  return (
    <div className="flex h-full flex-col border-r border-[#1a1f26] bg-[#0c0e10] p-4 text-slate-200">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2 border-b border-[#1a1f26] pb-3">
        <Settings className="h-5 w-5 text-[#00e599]" />
        <h2 className="font-semibold tracking-wide text-slate-100">Settings</h2>
      </div>

      <div className="flex-1 space-y-6">
        {/* Explanation Card */}
        <div className="rounded-xl border border-[#1e242b] bg-[#121518]/50 p-3.5 text-xs text-slate-400 leading-relaxed backdrop-blur-sm">
          <p className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
            <Key className="h-3.5 w-3.5 text-[#00e599]" /> Custom Mistral API Key
          </p>
          <ReactMarkdown>
            Configure your personal Mistral API key to override the server's default configuration. 
            The key is stored **only in your browser** (`localStorage`) and is sent directly in request headers.
          </ReactMarkdown>
          
        </div>

        {/* Input Form Field */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
            Mistral API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Mistral API Key..."
              className="cool-input w-full rounded-xl pl-4 pr-10 py-3 text-xs text-slate-100 placeholder-slate-600 bg-[#0e1114] border border-[#1e242b] focus:border-[#00e599]/50 transition-colors focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              title={showKey ? "Hide API Key" : "Show API Key"}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Status Alert */}
        {status && (
          <div
            className={`flex items-start gap-2.5 rounded-xl p-3 text-xs border transition-all ${
              status.type === "success"
                ? "bg-[#00e599]/5 text-[#00e599]/90 border-[#00e599]/20"
                : "bg-rose-950/40 text-rose-300 border-rose-800/40"
            }`}
          >
            <CheckCircle className={`h-4 w-4 shrink-0 mt-0.5 ${status.type === "success" ? "text-[#00e599]" : "text-rose-400"}`} />
            <span className="leading-tight">{status.message}</span>
          </div>
        )}

        {/* Actions Button Group */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 rounded-xl bg-[#00e599] text-[#0b0d0f] font-semibold text-xs py-2.5 hover:bg-[#00c885] active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(0,229,153,0.15)] hover:shadow-[0_0_20px_rgba(0,229,153,0.25)]"
          >
            <Save className="h-3.5 w-3.5" />
            Save Key
          </button>

          {apiKey && (
            <button
              onClick={handleClear}
              className="cursor-pointer px-3.5 flex items-center justify-center rounded-xl bg-transparent border border-[#1e242b] text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 active:scale-[0.98] transition-all"
              title="Clear Saved API Key"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
