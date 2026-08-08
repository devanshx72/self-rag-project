"""Node: verify_usefulness — IS_USE utility check."""
import time
from typing import Literal
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate

from rag.graph.state import GraphState
from rag.nodes.base import get_small_llm, now_iso

NODE_ID    = "verify_usefulness"
NODE_LABEL = "Useful?"

SYSTEM = (
    "You are judging the USEFULNESS of the ANSWER for the QUESTION.\n\n"
    "Return JSON with keys: isuse, reason.\n"
    "isuse must be one of: useful, not_useful.\n\n"
    "Rules:\n"
    "- useful: The answer directly answers the question or provides the requested specific info.\n"
    "- not_useful: The answer is generic, off-topic, incomplete, or only gives background.\n"
    "- Do NOT re-check grounding (IsSUP already did that). Only check: 'Did we answer the question?'\n"
    "- Keep reason to 1 short line."
)

prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM),
    ("human", "Question:\n{question}\n\nAnswer:\n{answer}"),
])


class IsUSEDecision(BaseModel):
    isuse: Literal["useful", "not_useful"]
    reason: str = Field(..., description="Short reason in 1 line.")


def verify_usefulness(state: GraphState) -> dict:
    t0 = time.perf_counter()
    ts = now_iso()

    llm = get_small_llm()
    structured_llm = llm.with_structured_output(IsUSEDecision)

    messages = prompt.format_messages(
        question=state["question"],
        answer=state.get("answer", ""),
    )
    prompt_str = "\n".join(m.content for m in messages)

    decision: IsUSEDecision = structured_llm.invoke(messages)
    latency_ms = round((time.perf_counter() - t0) * 1000, 2)

    p_tok = 80
    c_tok = 20
    total_tokens = p_tok + c_tok

    trace_entry = {
        "node_id":              NODE_ID,
        "node_label":           NODE_LABEL,
        "status":               "completed",
        "timestamp":            ts,
        "latency_ms":           latency_ms,
        "prompt_tokens":        p_tok,
        "completion_tokens":    c_tok,
        "total_tokens":         total_tokens,
        "prompt_used":          prompt_str,
        "raw_llm_output":       str(decision.model_dump()),
        "node_input":           {"answer_preview": state.get("answer", "")[:200]},
        "node_output":          {
            "isuse":  decision.isuse,
            "reason": decision.reason,
        },
        "decision":             f"Usefulness: {decision.isuse} — {decision.reason}",
        "retrieved_chunks":     0,
        "relevant_chunks":      0,
        "discarded_chunks":     0,
        "avg_similarity_score": 0.0,
        "citations":            [],
    }

    existing_trace = list(state.get("execution_trace", []))
    existing_trace.append(trace_entry)

    return {
        "isuse":           decision.isuse,
        "use_reason":      decision.reason,
        "execution_trace": existing_trace,
        "total_tokens":    state.get("total_tokens", 0) + total_tokens,
    }


def route_after_usefulness(state: GraphState) -> str:
    return "END" if state.get("isuse") == "useful" else "no_answer"
