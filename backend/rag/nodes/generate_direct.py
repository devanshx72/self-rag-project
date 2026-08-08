"""Node: generate_direct — answer without retrieval."""
import time
from langchain_core.prompts import ChatPromptTemplate

from rag.graph.state import GraphState
from rag.nodes.base import get_answering_llm, now_iso, extract_usage

NODE_ID    = "generate_direct"
NODE_LABEL = "Generate Direct Answer"

SYSTEM = (
    "Answer using only your general knowledge.\n"
    "Be concise and accurate.\n"
    "If the question requires specific information from uploaded documents that you cannot access, "
    "say: 'I don't have the specific information for this in my general knowledge.'"
)

prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM),
    ("human", "{question}"),
])


def generate_direct(state: GraphState) -> dict:
    t0 = time.perf_counter()
    ts = now_iso()

    llm = get_answering_llm()
    messages = prompt.format_messages(question=state["question"])
    prompt_str = "\n".join(m.content for m in messages)

    response = llm.invoke(messages)
    latency_ms = round((time.perf_counter() - t0) * 1000, 2)

    prompt_tokens, completion_tokens, total_tokens = extract_usage(response)

    trace_entry = {
        "node_id":              NODE_ID,
        "node_label":           NODE_LABEL,
        "status":               "completed",
        "timestamp":            ts,
        "latency_ms":           latency_ms,
        "prompt_tokens":        prompt_tokens,
        "completion_tokens":    completion_tokens,
        "total_tokens":         total_tokens,
        "prompt_used":          prompt_str,
        "raw_llm_output":       response.content,
        "node_input":           {"question": state["question"]},
        "node_output":          {"answer": response.content},
        "decision":             "No retrieval needed — answered from parametric knowledge",
        "retrieved_chunks":     0,
        "relevant_chunks":      0,
        "discarded_chunks":     0,
        "avg_similarity_score": 0.0,
        "citations":            [],
    }

    existing_trace = list(state.get("execution_trace", []))
    existing_trace.append(trace_entry)

    return {
        "answer":           response.content,
        "execution_trace":  existing_trace,
        "total_tokens":     state.get("total_tokens", 0) + total_tokens,
    }
