"""Node: no_answer — fallback when no relevant documents or not useful."""
from rag.graph.state import GraphState
from rag.nodes.base import now_iso

NODE_ID    = "no_answer"
NODE_LABEL = "No Answer Found"


async def no_answer(state: GraphState) -> dict:
    ts = now_iso()
    message = (
        "I couldn't find relevant information in the uploaded documents to answer your question. "
        "Please try uploading documents related to your query, or rephrase your question."
    )

    trace_entry = {
        "node_id":              NODE_ID,
        "node_label":           NODE_LABEL,
        "status":               "completed",
        "timestamp":            ts,
        "latency_ms":           0.0,
        "prompt_tokens":        0,
        "completion_tokens":    0,
        "total_tokens":         0,
        "prompt_used":          "",
        "raw_llm_output":       message,
        "node_input":           {},
        "node_output":          {"answer": message},
        "decision":             "No useful answer found — returning fallback",
        "retrieved_chunks":     len(state.get("retrieved_chunks", [])),
        "relevant_chunks":      len(state.get("relevant_chunks", [])),
        "discarded_chunks":     len(state.get("discarded_chunks", [])),
        "avg_similarity_score": 0.0,
        "citations":            [],
    }

    existing_trace = list(state.get("execution_trace", []))
    existing_trace.append(trace_entry)

    return {
        "answer":          message,
        "execution_trace": existing_trace,
    }
