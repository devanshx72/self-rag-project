"""Node: grade_documents — IS_REL relevance grading per chunk."""
import time
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate

from rag.graph.state import GraphState
from rag.retriever.retriever import RetrievedChunk
from rag.nodes.base import get_small_llm, now_iso

NODE_ID    = "grade_documents"
NODE_LABEL = "Grade Documents"

SYSTEM = (
    "You are judging document relevance at a TOPIC level.\n"
    "Return JSON matching the schema.\n\n"
    "A document is relevant if it discusses the same entity or topic area as the question.\n"
    "It does NOT need to contain the exact answer.\n\n"
    "Rules:\n"
    "- Relevant: the document chunk discusses the same topic as the question.\n"
    "- Not relevant: the chunk is clearly about a different topic.\n"
    "- When unsure, return is_relevant=true.\n"
    "Do NOT decide whether the document fully answers the question — that will be checked later."
)

prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM),
    ("human", "Question:\n{question}\n\nDocument chunk:\n{document}"),
])


class RelevanceDecision(BaseModel):
    is_relevant: bool = Field(
        ...,
        description="True ONLY if the document discusses the same topic as the question.",
    )
    reason: str = Field(..., description="One-line reason.")


async def grade_documents(state: GraphState) -> dict:
    t0 = time.perf_counter()
    ts = now_iso()

    llm = get_small_llm()
    structured_llm = llm.with_structured_output(RelevanceDecision)

    chunks: list[RetrievedChunk] = state.get("retrieved_chunks", [])
    relevant: list[RetrievedChunk] = []
    discarded: list[RetrievedChunk] = []

    total_prompt_tokens     = 0
    total_completion_tokens = 0
    grading_details         = []

    for chunk in chunks:
        messages = prompt.format_messages(
            question=state["question"],
            document=chunk.content,
        )
        decision: RelevanceDecision = await structured_llm.ainvoke(messages)
        # Approximate token usage per call
        p_tok = len(chunk.content.split()) + 80
        c_tok = 15
        total_prompt_tokens     += p_tok
        total_completion_tokens += c_tok

        if decision.is_relevant:
            relevant.append(chunk)
        else:
            discarded.append(chunk)

        grading_details.append({
            "chunk_id":       chunk.chunk_id,
            "document_name":  chunk.document_name,
            "is_relevant":    decision.is_relevant,
            "reason":         decision.reason,
            "similarity":     chunk.similarity_score,
        })

    latency_ms = round((time.perf_counter() - t0) * 1000, 2)
    total_tokens = total_prompt_tokens + total_completion_tokens

    avg_score = (
        round(sum(c.similarity_score for c in relevant) / len(relevant), 4)
        if relevant else 0.0
    )

    trace_entry = {
        "node_id":              NODE_ID,
        "node_label":           NODE_LABEL,
        "status":               "completed",
        "timestamp":            ts,
        "latency_ms":           latency_ms,
        "prompt_tokens":        total_prompt_tokens,
        "completion_tokens":    total_completion_tokens,
        "total_tokens":         total_tokens,
        "prompt_used":          SYSTEM,
        "raw_llm_output":       str(grading_details),
        "node_input":           {"chunks_evaluated": len(chunks)},
        "node_output":          {
            "relevant_count":  len(relevant),
            "discarded_count": len(discarded),
            "grading":         grading_details,
        },
        "decision":             (
            f"Kept {len(relevant)}/{len(chunks)} chunks as relevant, "
            f"discarded {len(discarded)}"
        ),
        "retrieved_chunks":     len(chunks),
        "relevant_chunks":      len(relevant),
        "discarded_chunks":     len(discarded),
        "avg_similarity_score": avg_score,
        "citations":            [],
    }

    existing_trace = list(state.get("execution_trace", []))
    existing_trace.append(trace_entry)

    return {
        "relevant_chunks":  relevant,
        "discarded_chunks": discarded,
        "execution_trace":  existing_trace,
        "total_tokens":     state.get("total_tokens", 0) + total_tokens,
    }


def route_after_grading(state: GraphState) -> str:
    relevant = state.get("relevant_chunks", [])
    return "generate_from_context" if relevant else "no_answer"
