"use client";

import React, { useState, useEffect } from "react";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { ExecutionGraph } from "@/components/graph/ExecutionGraph";
import { ExecutionTimeline } from "@/components/timeline/ExecutionTimeline";
import { StatsDashboard } from "@/components/dashboard/StatsDashboard";
import { Network, Activity, BarChart2 } from "lucide-react";
import { Loader } from "@/components/shared/Loader";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { NodeDetailModal } from "@/components/shared/NodeDetailModal";

export default function Home() {
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
      <NodeDetailModal />
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
      <Sidebar />

      {/* Main Content Area (Split Chat & Visualization) */}
      <div className="flex flex-1 min-w-0 overflow-hidden">
        {/* Left Pane: Chat Interaction */}
        <div className="w-1/2 min-w-[400px] border-r border-[#1a1f26] flex flex-col">
          <ChatPanel />
        </div>

        {/* Right Pane: Graph / Timeline / Dashboard Visualization */}
        <div className="w-1/2 flex flex-col min-w-0 bg-[#0b0d0f] right-pane-container">
          {/* Top Visualization Switcher */}
          <div className="flex flex-wrap items-center justify-between border-b border-[#1a1f26] bg-[#0c0e10] px-4 py-2.5 gap-2">
            <div className="flex items-center gap-1 rounded-xl bg-[#121518] p-1 border border-[#1e242b] shrink-0">
              <button
                onClick={() => setActiveView("graph")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  activeView === "graph"
                    ? "cool-tab-active"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Network className="h-3.5 w-3.5 shrink-0" />
                <span className="switcher-btn-text-full">Execution Graph</span>
                <span className="switcher-btn-text-short">Graph</span>
              </button>

              <button
                onClick={() => setActiveView("timeline")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  activeView === "timeline"
                    ? "cool-tab-active"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Activity className="h-3.5 w-3.5 shrink-0" />
                <span className="switcher-btn-text-full">Timeline Log</span>
                <span className="switcher-btn-text-short">Timeline</span>
              </button>

              <button
                onClick={() => setActiveView("dashboard")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  activeView === "dashboard"
                    ? "cool-tab-active"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <BarChart2 className="h-3.5 w-3.5 shrink-0" />
                <span>Analytics</span>
              </button>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-[#1e242b] bg-[#121518] px-3 py-1 text-xs text-[#00e599] shrink-0 engine-badge">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00e599]" />
              <span className="font-mono text-xs font-medium engine-badge-text">LangGraph Engine</span>
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

