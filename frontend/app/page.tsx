"use client";

import React, { useState, useEffect } from "react";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { ExecutionGraph } from "@/components/graph/ExecutionGraph";
import { ExecutionTimeline } from "@/components/timeline/ExecutionTimeline";
import { StatsDashboard } from "@/components/dashboard/StatsDashboard";
import { DocumentSidebar } from "@/components/sidebar/DocumentSidebar";
import { HistoryPanel } from "@/components/sidebar/HistoryPanel";
import { Network, History as HistoryIcon, FileText, Activity, BarChart2 } from "lucide-react";
import { Loader } from "@/components/shared/Loader";

export default function Home() {
  const [activeSidebar, setActiveSidebar] = useState<"documents" | "history">("documents");
  const [activeView, setActiveView] = useState<"graph" | "timeline" | "dashboard">("graph");
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasLoaded = sessionStorage.getItem("app_loaded");
    if (hasLoaded) {
      setLoading(false);
      return;
    }

    // Start fade-out animation 500ms before loader finishes (at 5.5s)
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 5500);

    const doneTimer = setTimeout(() => {
      setLoading(false);
      sessionStorage.setItem("app_loaded", "true");
    }, 6000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (!mounted) {
    return <div className="h-screen w-screen bg-[#0b0d0f]" />;
  }

  return (
    <>
      {loading && (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-500 ease-out ${
            isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <Loader />
        </div>
      )}
      <div className="flex h-screen w-screen overflow-hidden bg-[#0b0d0f] text-slate-100 font-sans antialiased">
      {/* Icon Navigation Bar */}
      <div className="flex flex-col items-center justify-between border-r border-[#1a1f26] bg-[#0c0e10] py-4 px-2">
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setActiveSidebar("documents")}
            className={`rounded-xl p-2.5 transition-all ${
              activeSidebar === "documents"
                ? "cool-nav-active text-[#0b0d0f] font-semibold"
                : "text-slate-400 hover:bg-[#15191d] hover:text-slate-200"
            }`}
            title="Document Knowledge Base"
          >
            <FileText className="h-5 w-5" />
          </button>

          <button
            onClick={() => setActiveSidebar("history")}
            className={`rounded-xl p-2.5 transition-all ${
              activeSidebar === "history"
                ? "cool-nav-active text-[#0b0d0f] font-semibold"
                : "text-slate-400 hover:bg-[#15191d] hover:text-slate-200"
            }`}
            title="Execution History"
          >
            <HistoryIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-[#00e599] animate-pulse glow-mint" />
          <span className="text-[9px] font-mono text-[#00e599] uppercase tracking-wider">Self-RAG</span>
        </div>
      </div>

      {/* Sidebar Drawer */}
      <div className="w-80 shrink-0">
        {activeSidebar === "documents" ? <DocumentSidebar /> : <HistoryPanel />}
      </div>

      {/* Main Content Area (Split Chat & Visualization) */}
      <div className="flex flex-1 min-w-0 overflow-hidden">
        {/* Left Pane: Chat Interaction */}
        <div className="w-1/2 min-w-[400px] border-r border-[#1a1f26] flex flex-col">
          <ChatPanel />
        </div>

        {/* Right Pane: Graph / Timeline / Dashboard Visualization */}
        <div className="w-1/2 flex flex-col min-w-0 bg-[#0b0d0f]">
          {/* Top Visualization Switcher */}
          <div className="flex items-center justify-between border-b border-[#1a1f26] bg-[#0c0e10] px-4 py-2.5">
            <div className="flex items-center gap-1 rounded-xl bg-[#121518] p-1 border border-[#1e242b]">
              <button
                onClick={() => setActiveView("graph")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  activeView === "graph"
                    ? "cool-tab-active"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Network className="h-3.5 w-3.5" />
                <span>Execution Graph</span>
              </button>

              <button
                onClick={() => setActiveView("timeline")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  activeView === "timeline"
                    ? "cool-tab-active"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Timeline Log</span>
              </button>

              <button
                onClick={() => setActiveView("dashboard")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  activeView === "dashboard"
                    ? "cool-tab-active"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <BarChart2 className="h-3.5 w-3.5" />
                <span>Analytics</span>
              </button>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-[#1e242b] bg-[#121518] px-3 py-1 text-xs text-[#00e599]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00e599]" />
              <span className="font-mono text-xs font-medium">LangGraph Engine</span>
            </div>
          </div>

          {/* Visualization Container */}
          <div className="flex-1 relative min-h-0 bg-grid-pattern">
            {activeView === "graph" && <ExecutionGraph />}
            {activeView === "timeline" && <ExecutionTimeline />}
            {activeView === "dashboard" && <StatsDashboard />}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

