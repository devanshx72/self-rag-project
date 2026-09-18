"""Node: verify_groundedness — IS_SUP grounding check."""
import time
from typing import Literal, List
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate

from rag.graph.state import GraphState
from rag.nodes.base import get_answering_llm, now_iso, extract_usage

NODE_ID    = "verify_groundedness"
NODE_LABEL = "Grounded?"

SYSTEM = (
    "You are verifying whether the ANSWER is supported by the CONTEXT.\n"
    "Return JSON with keys: issup, evidence.\n"
    "issup must be one of: fully_supported, partially_supported, no_support.\n\n"
    "How to decide issup:\n"
    "- fully_supported: Every meaningful claim is explicitly supported by CONTEXT, "
    "and the ANSWER does NOT introduce qualitative/interpretive words not present in CONTEXT.\n"
    "- partially_supported: The core facts are supported, BUT the ANSWER includes ANY abstraction, "
    "interpretation, or qualitative phrasing not explicitly stated in CONTEXT.\n"
    "- no_support: The key claims are not supported by CONTEXT.\n\n"
    "Rules:\n"
    "- Be strict: if you see ANY unsupported qualitative phrasing, choose partially_supported.\n"
    "- Evidence: include up to 3 short direct quotes from CONTEXT that support the answer.\n"
    "- Do not use outside knowledge."
)

prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM),
    (
        "human",
        "Question:\n{question}\n\nAnswer:\n{answer}\n\nContext:\n{context}",
    ),
])

MAX_RETRIES = 3


class IsSUPDecision(BaseModel):
    issup: Literal["fully_supported", "partially_supported", "no_support"]
    evidence: List[str] = Field(default_factory=list)


async def verify_groundedness(state: GraphState) -> dict:
    t0 = time.perf_counter()
    ts = now_iso()

    llm = get_answering_llm()
    structured_llm = llm.with_structured_output(IsSUPDecision, include_raw=True)

    messages = prompt.format_messages(
        question=state["question"],
        answer=state.get("answer", ""),
        context=state.get("context", ""),
    )
    prompt_str = "\n".join(m.content for m in messages)

    result = await structured_llm.ainvoke(messages)
    decision: IsSUPDecision = result["parsed"]
    raw_message = result["raw"]
    latency_ms = round((time.perf_counter() - t0) * 1000, 2)

    prompt_tokens, completion_tokens, total_tokens = extract_usage(raw_message)

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
        "raw_llm_output":       str(decision.model_dump()),
        "node_input":           {
            "answer_preview": state.get("answer", "")[:200],
            "retry":          state.get("retries", 0),
        },
        "node_output":          {
            "issup":    decision.issup,
            "evidence": decision.evidence,
        },
        "decision":             f"Groundedness: {decision.issup} (retry {state.get('retries', 0)})",
        "retrieved_chunks":     0,
        "relevant_chunks":      0,
        "discarded_chunks":     0,
        "avg_similarity_score": 0.0,
        "citations":            [],
    }

    existing_trace = list(state.get("execution_trace", []))
    existing_trace.append(trace_entry)

    return {
        "issup":           decision.issup,
        "evidence":        decision.evidence,
        "execution_trace": existing_trace,
        "total_tokens":    state.get("total_tokens", 0) + total_tokens,
    }


def route_after_groundedness(state: GraphState) -> str:
    if state.get("issup") == "fully_supported":
        return "verify_usefulness"
    if state.get("retries", 0) >= MAX_RETRIES:
        return "verify_usefulness"   # exhausted retries — move on anyway
    return "revise_answer"
