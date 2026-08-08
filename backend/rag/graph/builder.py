"""LangGraph Self-RAG graph builder."""
from langgraph.graph import StateGraph, START, END

from rag.graph.state import GraphState
from rag.nodes.decide_retrieval    import decide_retrieval, route_after_decide
from rag.nodes.generate_direct     import generate_direct
from rag.nodes.retrieve            import retrieve
from rag.nodes.grade_documents     import grade_documents, route_after_grading
from rag.nodes.generate            import generate_from_context
from rag.nodes.verify_groundedness import verify_groundedness, route_after_groundedness
from rag.nodes.revise_answer       import revise_answer
from rag.nodes.verify_usefulness   import verify_usefulness, route_after_usefulness
from rag.nodes.no_answer           import no_answer


def build_graph():
    """Build and compile the Self-RAG LangGraph."""
    graph = StateGraph(GraphState)

    # ── Add nodes ───────────────────────────────────────────────────────────────
    graph.add_node("decide_retrieval",    decide_retrieval)
    graph.add_node("generate_direct",     generate_direct)
    graph.add_node("retrieve",            retrieve)
    graph.add_node("grade_documents",     grade_documents)
    graph.add_node("generate_from_context", generate_from_context)
    graph.add_node("verify_groundedness", verify_groundedness)
    graph.add_node("revise_answer",       revise_answer)
    graph.add_node("verify_usefulness",   verify_usefulness)
    graph.add_node("no_answer",           no_answer)

    # ── Entry ────────────────────────────────────────────────────────────────────
    graph.add_edge(START, "decide_retrieval")

    # ── Retrieval decision ────────────────────────────────────────────────────────
    graph.add_conditional_edges(
        "decide_retrieval",
        route_after_decide,
        {
            "generate_direct": "generate_direct",
            "retrieve":        "retrieve",
        },
    )

    # ── Direct answer → end ───────────────────────────────────────────────────────
    graph.add_edge("generate_direct", END)

    # ── Retrieval → grading ───────────────────────────────────────────────────────
    graph.add_edge("retrieve", "grade_documents")

    # ── Grading → generate or no-answer ─────────────────────────────────────────
    graph.add_conditional_edges(
        "grade_documents",
        route_after_grading,
        {
            "generate_from_context": "generate_from_context",
            "no_answer":             "no_answer",
        },
    )

    # ── Generation → groundedness ─────────────────────────────────────────────────
    graph.add_edge("generate_from_context", "verify_groundedness")

    # ── Groundedness → revise or usefulness ──────────────────────────────────────
    graph.add_conditional_edges(
        "verify_groundedness",
        route_after_groundedness,
        {
            "revise_answer":    "revise_answer",
            "verify_usefulness": "verify_usefulness",
        },
    )

    # ── Revision loops back to groundedness ───────────────────────────────────────
    graph.add_edge("revise_answer", "verify_groundedness")

    # ── Usefulness → end or no-answer ────────────────────────────────────────────
    graph.add_conditional_edges(
        "verify_usefulness",
        route_after_usefulness,
        {
            "END":       END,
            "no_answer": "no_answer",
        },
    )

    # ── No-answer → end ───────────────────────────────────────────────────────────
    graph.add_edge("no_answer", END)

    return graph.compile()


# Compiled graph singleton
rag_graph = build_graph()
