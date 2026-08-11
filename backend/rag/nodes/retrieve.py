"""Node: retrieve — semantic search against Qdrant."""
import time

from rag.graph.state import GraphState
from rag.retriever.retriever import retrieve_chunks
from rag.nodes.base import now_iso

NODE_ID    = "retrieve"
NODE_LABEL = "Retrieve Documents"


def retrieve(state: GraphState) -> dict:
    t0 = time.perf_counter()
    ts = now_iso()

    chunks = retrieve_chunks(state["question"], top_k=8)
    latency_ms = round((time.perf_counter() - t0) * 1000, 2)

    avg_score = (
        round(sum(c.similarity_score for c in chunks) / len(chunks), 4)
        if chunks else 0.0
    )

    trace_entry = {
        "node_id":              NODE_ID,
        "node_label":           NODE_LABEL,
        "status":               "completed",
        "timestamp":            ts,
        "latency_ms":           latency_ms,
        "prompt_tokens":        0,
        "completion_tokens":    0,
        "total_tokens":         0,
        "prompt_used":          f"Embedding query: {state['question']}",
        "raw_llm_output":       f"Retrieved {len(chunks)} chunks",
        "node_input":           {"question": state["question"]},
        "node_output":          {
            "chunks": [
                {
                    "chunk_id":        c.chunk_id,
                    "document_name":   c.document_name,
                    "page_number":     c.page_number,
                    "similarity_score": c.similarity_score,
                    "preview":         c.content[:120] + "..." if len(c.content) > 120 else c.content,
                }
                for c in chunks
            ]
        },
        "decision":             f"Retrieved {len(chunks)} chunks from Qdrant",
        "retrieved_chunks":     len(chunks),
        "relevant_chunks":      0,
        "discarded_chunks":     0,
        "avg_similarity_score": avg_score,
        "citations":            [],
    }

    existing_trace = list(state.get("execution_trace", []))
    existing_trace.append(trace_entry)

    return {
        "retrieved_chunks": chunks,
        "execution_trace":  existing_trace,
    }
