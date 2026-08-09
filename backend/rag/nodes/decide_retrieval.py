"""Node: decide_retrieval — IS_RETRIEVE decision."""
import time
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate

from rag.graph.state import GraphState
from rag.nodes.base import get_small_llm, now_iso

NODE_ID    = "decide_retrieval"
NODE_LABEL = "Need Retrieval?"

SYSTEM = (
    "You decide whether retrieval from uploaded documents is needed to answer the question.\n"
    "Return JSON with key: should_retrieve (boolean).\n\n"
    "Guidelines:\n"
    "- should_retrieve=True if the question requires specific facts from uploaded documents.\n"
    "- should_retrieve=False for general knowledge questions (definitions, concepts, etc.).\n"
    "- If unsure, choose True."
)

prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM),
    ("human", "Question: {question}"),
])


class RetrieveDecision(BaseModel):
    should_retrieve: bool = Field(
        ...,
        description="True if external documents are needed to answer reliably, else False.",
    )


def decide_retrieval(state: GraphState) -> dict:
    t0 = time.perf_counter()
    ts = now_iso()

    llm = get_small_llm()
    structured_llm = llm.with_structured_output(RetrieveDecision)

    messages = prompt.format_messages(question=state["question"])
    prompt_str = "\n".join(m.content for m in messages)

    decision: RetrieveDecision = structured_llm.invoke(messages)
    latency_ms = round((time.perf_counter() - t0) * 1000, 2)

    # Structured output doesn't return usage_metadata easily; approximate
    prompt_tokens     = 80
    completion_tokens = 10
    total_tokens      = prompt_tokens + completion_tokens

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
        "node_input":           {"question": state["question"]},
        "node_output":          {"should_retrieve": decision.should_retrieve},
        "decision":             f"need_retrieval={decision.should_retrieve}",
        "retrieved_chunks":     0,
        "relevant_chunks":      0,
        "discarded_chunks":     0,
        "avg_similarity_score": 0.0,
        "citations":            [],
    }

    existing_trace = list(state.get("execution_trace", []))
    existing_trace.append(trace_entry)

    return {
        "need_retrieval":   decision.should_retrieve,
        "execution_trace":  existing_trace,
        "total_tokens":     state.get("total_tokens", 0) + total_tokens,
    }


def route_after_decide(state: GraphState) -> str:
    return "retrieve" if state["need_retrieval"] else "generate_direct"
