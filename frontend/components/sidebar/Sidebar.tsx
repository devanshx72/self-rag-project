"use client";

import React, { useState } from "react";
import { DocumentSidebar } from "./DocumentSidebar";
import { HistoryPanel } from "./HistoryPanel";
import { SettingsPanel } from "./SettingsPanel";
import { FileText, History as HistoryIcon, Settings } from "lucide-react";

export const Sidebar: React.FC = () => {
  const [activeSidebar, setActiveSidebar] = useState<"documents" | "history" | "settings">("documents");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  return (
    <div className="flex h-full shrink-0">
      {/* Icon Navigation Bar */}
      <div className="flex flex-col items-center justify-between border-r border-[#1a1f26] bg-[#0c0e10] py-4 px-2 select-none">
        <div className="flex flex-col gap-6 items-center">
          {/* Collapse/Expand Toggle Checkbox */}
          <div className="text-[7px] py-1.5 cursor-pointer">
            <input
              id="toggleChecker"
              type="checkbox"
              checked={isSidebarExpanded}
              onChange={(e) => setIsSidebarExpanded(e.target.checked)}
            />
            <label id="togglerLable" htmlFor="toggleChecker">
              <div className="checkboxtoggler">
                <div className="line-1" />
                <div className="line-2" />
                <div className="line-3" />
              </div>
            </label>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => {
                setActiveSidebar("documents");
                setIsSidebarExpanded(true);
              }}
              className={`rounded-xl p-2.5 transition-all cursor-pointer ${
                activeSidebar === "documents" && isSidebarExpanded
                  ? "cool-nav-active text-[#0b0d0f] font-semibold"
                  : "text-slate-400 hover:bg-[#15191d] hover:text-slate-200"
              }`}
              title={isSidebarExpanded ? "Documents Panel" : "Open Documents"}
            >
              <FileText className="h-5 w-5" />
            </button>

            <button
              onClick={() => {
                setActiveSidebar("history");
                setIsSidebarExpanded(true);
              }}
              className={`rounded-xl p-2.5 transition-all cursor-pointer ${
                activeSidebar === "history" && isSidebarExpanded
                  ? "cool-nav-active text-[#0b0d0f] font-semibold"
                  : "text-slate-400 hover:bg-[#15191d] hover:text-slate-200"
              }`}
              title={isSidebarExpanded ? "Execution History" : "Open History"}
            >
              <HistoryIcon className="h-5 w-5" />
            </button>

            <button
              onClick={() => {
                setActiveSidebar("settings");
                setIsSidebarExpanded(true);
              }}
              className={`rounded-xl p-2.5 transition-all cursor-pointer ${
                activeSidebar === "settings" && isSidebarExpanded
                  ? "cool-nav-active text-[#0b0d0f] font-semibold"
                  : "text-slate-400 hover:bg-[#15191d] hover:text-slate-200"
              }`}
              title={isSidebarExpanded ? "Settings Panel" : "Open Settings"}
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-[#00e599] animate-pulse glow-mint" />
          <span className="text-[9px] font-mono text-[#00e599] uppercase tracking-wider">Self-RAG</span>
        </div>
      </div>

      {/* Sidebar Drawer */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? "w-80 border-r border-[#1a1f26]" : "w-0 overflow-hidden border-r-0"
        }`}
      >
        <div className="w-80 h-full">
          {activeSidebar === "documents" ? (
            <DocumentSidebar />
          ) : activeSidebar === "history" ? (
            <HistoryPanel />
          ) : (
            <SettingsPanel />
          )}
        </div>
      </div>
    </div>
  );
};
