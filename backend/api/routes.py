"""FastAPI route definitions."""
import json
import uuid
import time
from typing import AsyncGenerator

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse

from models.schemas import (
    UploadResponse,
    DocumentListResponse,
    DeleteResponse,
    HistoryListResponse,
    QueryRequest,
)
from services.document_service import (
    ingest_document,
    list_documents,
    delete_document,
)
from services.history_service import (
    save_execution,
    list_history,
    get_history_entry,
)
from rag.graph.builder import rag_graph
from rag.nodes.generate import _build_citations

router = APIRouter()

ALLOWED_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/markdown",
    "text/x-markdown",
}
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md", ".markdown"}


# ─── Documents ──────────────────────────────────────────────────────────────────

@router.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    from pathlib import Path
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: PDF, DOCX, TXT, MD",
        )

    content = await file.read()
    if len(content) > 50 * 1024 * 1024:  # 50 MB limit
        raise HTTPException(status_code=413, detail="File too large (max 50 MB)")

    try:
        doc_meta = await ingest_document(content, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return UploadResponse(
        document_id=doc_meta["id"],
        filename=doc_meta["filename"],
        chunk_count=doc_meta["chunk_count"],
        message=f"Successfully ingested {doc_meta['chunk_count']} chunks.",
    )


@router.get("/documents", response_model=DocumentListResponse)
async def get_documents():
    return DocumentListResponse(documents=list_documents())


@router.delete("/documents/{doc_id}", response_model=DeleteResponse)
async def remove_document(doc_id: str):
    success = await delete_document(doc_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return DeleteResponse(message="Document deleted successfully")


# ─── Query (SSE streaming) ────────────────────────────────────────────────────

async def _run_graph_stream(question: str, session_id: str) -> AsyncGenerator[str, None]:
    """Run the LangGraph and stream SSE events for each node completion."""

    initial_state = {
        "question":         question,
        "session_id":       session_id,
        "need_retrieval":   False,
        "retrieved_chunks": [],
        "relevant_chunks":  [],
        "discarded_chunks": [],
        "context":          "",
        "answer":           "",
        "issup":            "no_support",
        "evidence":         [],
        "retries":          0,
        "isuse":            "not_useful",
        "use_reason":       "",
        "execution_trace":  [],
        "total_tokens":     0,
    }

    t_start = time.perf_counter()
    seen_trace_len = 0
    accumulated_state = dict(initial_state)

    try:
        # Stream node-by-node updates
        for chunk_state in rag_graph.stream(initial_state):
            # chunk_state is a dict of {node_name: partial_state}
            for node_name, partial in chunk_state.items():
                if not isinstance(partial, dict):
                    continue
                accumulated_state.update(partial)
                trace = partial.get("execution_trace", [])
                # Emit new trace entries as SSE events
                for entry in trace[seen_trace_len:]:
                    event = {
                        "event":                "node_complete",
                        "node_id":              entry["node_id"],
                        "node_label":           entry["node_label"],
                        "status":               entry["status"],
                        "timestamp":            entry["timestamp"],
                        "latency_ms":           entry["latency_ms"],
                        "prompt_tokens":        entry["prompt_tokens"],
                        "completion_tokens":    entry["completion_tokens"],
                        "total_tokens":         entry["total_tokens"],
                        "prompt_used":          entry["prompt_used"],
                        "raw_llm_output":       entry["raw_llm_output"],
                        "node_input":           entry["node_input"],
                        "node_output":          entry["node_output"],
                        "decision":             entry["decision"],
                        "retrieved_chunks":     entry["retrieved_chunks"],
                        "relevant_chunks":      entry["relevant_chunks"],
                        "discarded_chunks":     entry["discarded_chunks"],
                        "avg_similarity_score": entry["avg_similarity_score"],
                        "citations":            entry.get("citations", []),
                    }
                    seen_trace_len += 1
                    yield f"data: {json.dumps(event)}\n\n"

    except Exception as e:
        yield f"data: {json.dumps({'event': 'graph_error', 'message': str(e)})}\n\n"
        return

    total_latency_ms = round((time.perf_counter() - t_start) * 1000, 2)

    # Build final citations from relevant chunks in the last known state
    # (We pass them through the last generate node's trace)
    citations = []
    for entry in (accumulated_state.get("execution_trace") or []):
        if entry.get("citations"):
            citations = entry["citations"]

    complete_event = {
        "event":              "graph_complete",
        "session_id":         session_id,
        "question":           question,
        "answer":             accumulated_state.get("answer", ""),
        "citations":          citations,
        "execution_trace":    accumulated_state.get("execution_trace", []),
        "total_latency_ms":   total_latency_ms,
        "total_tokens":       accumulated_state.get("total_tokens", 0),
    }

    # Save to history
    save_execution(session_id, {
        **complete_event,
        "total_latency_ms":   total_latency_ms,
        "total_tokens":       accumulated_state.get("total_tokens", 0),
    })

    yield f"data: {json.dumps(complete_event)}\n\n"


@router.post("/query")
async def query(request: QueryRequest):
    session_id = request.session_id or str(uuid.uuid4())
    return StreamingResponse(
        _run_graph_stream(request.question, session_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control":              "no-cache",
            "X-Accel-Buffering":          "no",
            "Access-Control-Allow-Origin": "*",
        },
    )


# ─── History ─────────────────────────────────────────────────────────────────────

@router.get("/history", response_model=HistoryListResponse)
async def get_history():
    return HistoryListResponse(history=list_history())


@router.get("/history/{session_id}")
async def get_history_detail(session_id: str):
    entry = get_history_entry(session_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Session not found")
    return entry
