"use client";

import React, { useMemo, useCallback, useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  ConnectionLineType,
} from "reactflow";
import "reactflow/dist/style.css";
import { Maximize2, Minimize2 } from "lucide-react";

import { useExecutionStore } from "@/store/useExecutionStore";
import { GraphNode } from "./GraphNode";
import { NodeDetailPanel } from "./NodeDetailPanel";

export const ExecutionGraph: React.FC = () => {
  const { nodes, edges, selectNode, selectedTrace } = useExecutionStore();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      customNode: GraphNode,
    }),
    []
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: any) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Exit fullscreen on Escape
  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    // Prevent background scroll while in fullscreen
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isFullscreen]);

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-50 h-screen w-screen bg-[#0b0d0f]"
          : "relative h-full w-full bg-[#0b0d0f]"
      }
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{ type: "smoothstep" }}
        connectionLineType={ConnectionLineType.SmoothStep}
        minZoom={0.4}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        className="bg-[#0b0d0f]"
      >
        <Background color="rgba(255, 255, 255, 0.06)" gap={20} size={5} />
        <Controls
          position="bottom-left"
          showZoom
          showFitView
          showInteractive={false}
          className="
            !flex !flex-col !gap-1 !overflow-hidden
            !rounded-xl !border !border-[#1e242b] !bg-[#121518] !p-1 !shadow-lg
            [&>button]:!border-none [&>button]:!bg-transparent
            [&>button]:!rounded-lg [&>button]:!text-slate-300
            [&>button]:!transition-colors [&>button]:!duration-150
            [&>button:hover]:!bg-[#1a1f24] [&>button:hover]:!text-[#00e599]
            [&>button]:!fill-slate-300 [&>button:hover]:!fill-[#00e599]
            [&>button_svg]:!fill-current [&>button_svg]:!max-h-3 [&>button_svg]:!max-w-3
          "
        />
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          nodeColor={(n) => {
            const status = n.data?.status;
            if (status === "completed") return "#00e599";
            if (status === "running") return "#00e599";
            if (status === "failed") return "#f43f5e";
            if (status === "waiting") return "#3a4249";
            return "#3a4249";
          }}
          nodeStrokeColor={(n) => {
            const status = n.data?.status;
            if (status === "running") return "#00e599";
            if (status === "failed") return "#f43f5e";
            return "#1e242b";
          }}
          nodeStrokeWidth={2}
          nodeBorderRadius={6}
          maskColor="rgba(11, 13, 15, 0.85)"
          maskStrokeColor="#00e599"
          maskStrokeWidth={1}
          className="
            !rounded-xl !border !border-[#1e242b] !bg-[#121518] !shadow-lg
            [&_.react-flow__minimap-mask]:!opacity-90
          "
          style={{
            width: 180,
            height: 120,
            backgroundColor: "#121518",
          }}
        />
      </ReactFlow>

      {/* Fullscreen toggle button */}
      <button
        onClick={toggleFullscreen}
        title={isFullscreen ? "Exit fullscreen" : "Expand to fullscreen"}
        className="
          absolute top-3 right-3 z-10
          flex h-8 w-8 items-center justify-center
          rounded-lg border border-[#1e242b] bg-[#121518]
          text-slate-300 shadow-lg
          transition-colors duration-150
          hover:bg-[#1a1f24] hover:text-[#00e599]
        "
      >
        {isFullscreen ? (
          <Minimize2 className="h-3.5 w-3.5" />
        ) : (
          <Maximize2 className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Node Detail Slide-Over */}
      <NodeDetailPanel trace={selectedTrace} onClose={() => selectNode(null)} />
    </div>
  );
};