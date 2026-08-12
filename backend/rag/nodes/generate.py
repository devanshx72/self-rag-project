"""Node: generate — context-based answer generation."""
import time
from langchain_core.prompts import ChatPromptTemplate

from rag.graph.state import GraphState
from rag.retriever.retriever import RetrievedChunk
from rag.nodes.base import get_answering_llm, now_iso, extract_usage

NODE_ID    = "generate_from_context"
NODE_LABEL = "Generate Answer"

SYSTEM = (
    "You are a helpful RAG assistant. You will receive relevant document chunks as CONTEXT.\n\n"
    "Task: Answer the question accurately based ONLY on the provided context.\n"
    "Rules:\n"
    "- Do NOT introduce information not present in the context.\n"
    "- Do NOT mention that you are using a context block.\n"
    "- If context is insufficient, say what you do know from it.\n"
    "- Include inline citations like [1], [2] referencing the chunk numbers provided.\n"
    "- Be comprehensive but concise."
)

prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM),
    ("human", "Question:\n{question}\n\nContext:\n{context}"),
])


def _build_context(chunks: list[RetrievedChunk]) -> str:
    parts = []
    for i, c in enumerate(chunks, 1):
        parts.append(
            f"[{i}] Source: {c.document_name} | Page: {c.page_number} | "
            f"Score: {c.similarity_score}\n{c.content}"
        )
    return "\n\n---\n\n".join(parts)


def _build_citations(chunks: list[RetrievedChunk]) -> list[dict]:
    return [
        {
            "ref_number":       i,
            "chunk_id":         c.chunk_id,
            "document_name":    c.document_name,
            "page_number":      c.page_number,
            "excerpt":          c.content[:300],
            "similarity_score": c.similarity_score,
        }
        for i, c in enumerate(chunks, 1)
    ]


async def generate_from_context(state: GraphState) -> dict:
    t0 = time.perf_counter()
    ts = now_iso()

    llm = get_answering_llm()
    relevant: list[RetrievedChunk] = state.get("relevant_chunks", [])

    if not relevant:
        return {
            "answer": "No relevant documents found to answer this question.",
            "context": "",
        }

    context = _build_context(relevant)
    messages = prompt.format_messages(question=state["question"], context=context)
    prompt_str = "\n".join(m.content for m in messages)

    response = await llm.ainvoke(messages)
    latency_ms = round((time.perf_counter() - t0) * 1000, 2)

    prompt_tokens, completion_tokens, total_tokens = extract_usage(response)
    citations = _build_citations(relevant)

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
            "question":      state["question"],
            "context_chunks": len(relevant),
        },
        "node_output":          {"answer": response.content},
        "decision":             f"Generated answer from {len(relevant)} relevant chunks",
        "retrieved_chunks":     len(state.get("retrieved_chunks", [])),
        "relevant_chunks":      len(relevant),
        "discarded_chunks":     len(state.get("discarded_chunks", [])),
        "avg_similarity_score": (
            round(sum(c.similarity_score for c in relevant) / len(relevant), 4)
            if relevant else 0.0
        ),
        "citations": citations,
    }

    existing_trace = list(state.get("execution_trace", []))
    existing_trace.append(trace_entry)

    return {
        "answer":          response.content,
        "context":         context,
        "execution_trace": existing_trace,
        "total_tokens":    state.get("total_tokens", 0) + total_tokens,
    }
