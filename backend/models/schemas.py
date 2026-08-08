from typing import List, Optional, Literal, Any, Dict
from pydantic import BaseModel, Field


# ─── Document schemas ──────────────────────────────────────────────────────────

class DocumentMetadata(BaseModel):
    id: str
    filename: str
    file_type: str
    chunk_count: int
    uploaded_at: str


class DocumentListResponse(BaseModel):
    documents: List[DocumentMetadata]


class UploadResponse(BaseModel):
    document_id: str
    filename: str
    chunk_count: int
    message: str


class DeleteResponse(BaseModel):
    message: str


# ─── Query schemas ─────────────────────────────────────────────────────────────

class QueryRequest(BaseModel):
    question: str
    session_id: Optional[str] = None


# ─── Execution trace event (emitted per node via SSE) ─────────────────────────

class NodeTraceEvent(BaseModel):
    event: Literal[
        "node_start",
        "node_complete",
        "node_error",
        "graph_complete",
        "graph_error",
    ]
    node_id: str                          # unique id e.g. "decide_retrieval"
    node_label: str                       # human label e.g. "Need Retrieval?"
    status: Literal["running", "completed", "failed", "skipped"]
    timestamp: str                        # ISO-8601
    latency_ms: Optional[float] = None

    # LLM usage (populated on node_complete)
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
    total_tokens: Optional[int] = None

    # Node I/O
    prompt_used: Optional[str] = None
    raw_llm_output: Optional[str] = None
    node_input: Optional[Any] = None
    node_output: Optional[Any] = None
    decision: Optional[str] = None       # e.g. "need_retrieval=True"

    # Retrieval-specific
    retrieved_chunks: Optional[int] = None
    relevant_chunks: Optional[int] = None
    discarded_chunks: Optional[int] = None
    avg_similarity_score: Optional[float] = None

    # Citations
    citations: Optional[List[Dict[str, Any]]] = None


# ─── Final answer schema ──────────────────────────────────────────────────────

class Citation(BaseModel):
    ref_number: int
    document_name: str
    page_number: Optional[int] = None
    chunk_id: str
    excerpt: str
    similarity_score: float


class QueryResponse(BaseModel):
    session_id: str
    question: str
    answer: str
    citations: List[Citation]
    execution_trace: List[NodeTraceEvent]
    total_latency_ms: float
    total_tokens: int


# ─── History schemas ──────────────────────────────────────────────────────────

class HistoryEntry(BaseModel):
    session_id: str
    question: str
    answer: str
    created_at: str
    total_latency_ms: float
    total_tokens: int


class HistoryListResponse(BaseModel):
    history: List[HistoryEntry]
