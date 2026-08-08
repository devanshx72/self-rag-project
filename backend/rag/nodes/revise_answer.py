"""Node: revise_answer — quote-only strict revision."""
import time
from langchain_core.prompts import ChatPromptTemplate

from rag.graph.state import GraphState
from rag.nodes.base import get_answering_llm, now_iso, extract_usage

NODE_ID    = "revise_answer"
NODE_LABEL = "Revise Answer"

SYSTEM = (
    "You are a STRICT reviser.\n\n"
    "Your output must be a bullet-point list of direct quotes from the CONTEXT only.\n\n"
    "FORMAT:\n"
    "- <direct quote from CONTEXT>\n"
    "- <direct quote from CONTEXT>\n\n"
    "Rules:\n"
    "- Use ONLY the CONTEXT provided.\n"
    "- Do NOT add any new words beyond bullet dashes and the quotes themselves.\n"
    "- Do NOT explain anything.\n"
    "- Do NOT mention 'context', 'not mentioned', 'not provided', etc.\n"
    "- Include only quotes that directly answer the question."
)

prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM),
    (
        "human",
        "Question:\n{question}\n\nCurrent Answer:\n{answer}\n\nCONTEXT:\n{context}",
    ),
])


def revise_answer(state: GraphState) -> dict:
    t0 = time.perf_counter()
    ts = now_iso()

    llm = get_answering_llm()
    messages = prompt.format_messages(
        question=state["question"],
        answer=state.get("answer", ""),
        context=state.get("context", ""),
    )
    prompt_str = "\n".join(m.content for m in messages)

    response = llm.invoke(messages)
    latency_ms = round((time.perf_counter() - t0) * 1000, 2)

    prompt_tokens, completion_tokens, total_tokens = extract_usage(response)
    new_retries = state.get("retries", 0) + 1

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
        "node_input":           {
            "retry":        new_retries,
            "prev_answer":  state.get("answer", "")[:200],
        },
        "node_output":          {"revised_answer": response.content},
        "decision":             f"Revised answer (attempt {new_retries}) — quote-only from context",
        "retrieved_chunks":     0,
        "relevant_chunks":      0,
        "discarded_chunks":     0,
        "avg_similarity_score": 0.0,
        "citations":            [],
    }

    existing_trace = list(state.get("execution_trace", []))
    existing_trace.append(trace_entry)

    return {
        "answer":          response.content,
        "retries":         new_retries,
        "execution_trace": existing_trace,
        "total_tokens":    state.get("total_tokens", 0) + total_tokens,
    }
