import { create } from "zustand";
import { NodeTrace, ExecutionStats } from "@/types";
import { INITIAL_NODES, INITIAL_EDGES } from "@/lib/graphLayout";
import { Node, Edge } from "reactflow";

interface ExecutionState {
  nodes: Node[];
  edges: Edge[];
  executionTrace: NodeTrace[];
  selectedNodeId: string | null;
  selectedTrace: NodeTrace | null;
  isRunning: boolean;
  activeNodeId: string | null;
  stats: ExecutionStats;

  setRunning: (running: boolean) => void;
  selectNode: (nodeId: string | null) => void;
  updateNodeStatus: (nodeId: string, status: "waiting" | "running" | "completed" | "failed" | "skipped", trace?: NodeTrace) => void;
  addTrace: (trace: NodeTrace) => void;
  resetGraph: () => void;
  setFullTrace: (trace: NodeTrace[]) => void;
}

const initialStats: ExecutionStats = {
  total_latency_ms: 0,
  total_tokens: 0,
  retrieved_chunks: 0,
  relevant_chunks: 0,
  discarded_chunks: 0,
  avg_similarity_score: 0,
};

export const useExecutionStore = create<ExecutionState>((set, get) => ({
  nodes: INITIAL_NODES,
  edges: INITIAL_EDGES,
  executionTrace: [],
  selectedNodeId: null,
  selectedTrace: null,
  isRunning: false,
  activeNodeId: null,
  stats: initialStats,

  setRunning: (running) => set({ isRunning: running }),

  selectNode: (nodeId) => {
    if (!nodeId) {
      set({ selectedNodeId: null, selectedTrace: null });
      return;
    }
    const trace = get().executionTrace.find((t) => t.node_id === nodeId) || null;
    set({ selectedNodeId: nodeId, selectedTrace: trace });
  },

  updateNodeStatus: (nodeId, status, trace) => {
    set((state) => {
      const newNodes = state.nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              status,
              trace: trace || node.data.trace,
            },
          };
        }
        return node;
      });

      const newEdges = state.edges.map((edge) => {
        if (edge.source === nodeId || edge.target === nodeId) {
          return {
            ...edge,
            animated: status === "running",
            style: {
              ...edge.style,
              stroke: status === "running" ? "#00e599" : status === "completed" ? "#00e599" : "#334155",
            },
          };
        }
        return edge;
      });

      return {
        nodes: newNodes,
        edges: newEdges,
        activeNodeId: status === "running" ? nodeId : state.activeNodeId === nodeId ? null : state.activeNodeId,
      };
    });
  },

  addTrace: (trace) => {
    set((state) => {
      const newTrace = [...state.executionTrace, trace];
      
      // Update cumulative stats
      const newStats: ExecutionStats = {
        total_latency_ms: state.stats.total_latency_ms + (trace.latency_ms || 0),
        total_tokens: state.stats.total_tokens + (trace.total_tokens || 0),
        retrieved_chunks: Math.max(state.stats.retrieved_chunks, trace.retrieved_chunks || 0),
        relevant_chunks: Math.max(state.stats.relevant_chunks, trace.relevant_chunks || 0),
        discarded_chunks: Math.max(state.stats.discarded_chunks, trace.discarded_chunks || 0),
        avg_similarity_score: trace.avg_similarity_score || state.stats.avg_similarity_score,
      };

      return {
        executionTrace: newTrace,
        stats: newStats,
        selectedTrace: state.selectedNodeId === trace.node_id ? trace : state.selectedTrace,
      };
    });
  },

  resetGraph: () => {
    set({
      nodes: INITIAL_NODES,
      edges: INITIAL_EDGES,
      executionTrace: [],
      selectedNodeId: null,
      selectedTrace: null,
      isRunning: false,
      activeNodeId: null,
      stats: initialStats,
    });
  },

  setFullTrace: (traceList) => {
    set((state) => {
      const traceMap = new Map(traceList.map((t) => [t.node_id, t]));
      
      const newNodes = state.nodes.map((node) => {
        const tr = traceMap.get(node.id);
        return {
          ...node,
          data: {
            ...node.data,
            status: tr ? (tr.status as any) : "waiting",
            trace: tr,
          },
        };
      });

      let totalLat = 0, totalTok = 0;
      let rChunk = 0, relChunk = 0, disChunk = 0, avgSim = 0;

      traceList.forEach((t) => {
        totalLat += t.latency_ms || 0;
        totalTok += t.total_tokens || 0;
        if (t.retrieved_chunks) rChunk = t.retrieved_chunks;
        if (t.relevant_chunks) relChunk = t.relevant_chunks;
        if (t.discarded_chunks) disChunk = t.discarded_chunks;
        if (t.avg_similarity_score) avgSim = t.avg_similarity_score;
      });

      return {
        nodes: newNodes,
        executionTrace: traceList,
        stats: {
          total_latency_ms: totalLat,
          total_tokens: totalTok,
          retrieved_chunks: rChunk,
          relevant_chunks: relChunk,
          discarded_chunks: disChunk,
          avg_similarity_score: avgSim,
        },
      };
    });
  },
}));
