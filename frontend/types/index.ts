// Shared TypeScript types for RAG

export type NodeStatus = "waiting" | "running" | "completed" | "failed" | "skipped";

export type GroundednessStatus = "fully_supported" | "partially_supported" | "no_support";

export type UsefulnessStatus = "useful" | "not_useful";

export interface Citation {
  ref_number: number;
  chunk_id: string;
  document_name: string;
  page_number?: number;
  excerpt: string;
  similarity_score: number;
}

export interface NodeTrace {
  node_id: string;
  node_label: string;
  status: NodeStatus | "completed" | "failed";
  timestamp: string;
  latency_ms: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_used: string;
  raw_llm_output: string;
  node_input: Record<string, unknown>;
  node_output: Record<string, unknown>;
  decision: string;
  retrieved_chunks: number;
  relevant_chunks: number;
  discarded_chunks: number;
  avg_similarity_score: number;
  citations: Citation[];
}

export interface ExecutionResult {
  session_id: string;
  question: string;
  answer: string;
  citations: Citation[];
  execution_trace: NodeTrace[];
  total_latency_ms: number;
  total_tokens: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  session_id?: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface DocumentMeta {
  id: string;
  filename: string;
  file_type: string;
  chunk_count: number;
  uploaded_at: string;
}

export interface HistoryEntry {
  session_id: string;
  question: string;
  answer: string;
  created_at: string;
  total_latency_ms: number;
  total_tokens: number;
}

export interface ExecutionStats {
  total_latency_ms: number;
  total_tokens: number;
  retrieved_chunks: number;
  relevant_chunks: number;
  discarded_chunks: number;
  avg_similarity_score: number;
}

// React Flow node data
export interface GraphNodeData {
  label: string;
  status: NodeStatus;
  nodeId: string;
  trace?: NodeTrace;
}
