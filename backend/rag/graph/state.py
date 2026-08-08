"""LangGraph state definition for Self-RAG pipeline."""
from typing import List, Optional, Literal, Any, Dict, TypedDict
from rag.retriever.retriever import RetrievedChunk


class NodeTrace(TypedDict):
    node_id: str
    node_label: str
    status: str
    timestamp: str
    latency_ms: float
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    prompt_used: str
    raw_llm_output: str
    node_input: Any
    node_output: Any
    decision: str
    retrieved_chunks: int
    relevant_chunks: int
    discarded_chunks: int
    avg_similarity_score: float
    citations: List[Dict[str, Any]]


class GraphState(TypedDict):
    # Core
    question: str
    session_id: str

    # Retrieval decision
    need_retrieval: bool

    # Retrieved docs (raw from vector DB)
    retrieved_chunks: List[RetrievedChunk]

    # After relevance grading
    relevant_chunks: List[RetrievedChunk]
    discarded_chunks: List[RetrievedChunk]

    # Generation
    context: str
    answer: str

    # Groundedness
    issup: Literal["fully_supported", "partially_supported", "no_support"]
    evidence: List[str]
    retries: int

    # Usefulness
    isuse: Literal["useful", "not_useful"]
    use_reason: str

    # Telemetry
    execution_trace: List[NodeTrace]

    # Accumulated token totals
    total_tokens: int
