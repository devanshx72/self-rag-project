"""Qdrant retriever — semantic search with metadata + similarity scores."""
from dataclasses import dataclass
from database.qdrant_client import get_qdrant_client, init_collection


@dataclass
class RetrievedChunk:
    chunk_id: str
    content: str
    document_name: str
    document_id: str
    page_number: int
    similarity_score: float   # 1 - cosine_distance (higher = more similar)


def retrieve_chunks(question: str, top_k: int = 8) -> list[RetrievedChunk]:
    """Query Qdrant Cloud for the top-k most similar chunks."""
    client = get_qdrant_client()
    init_collection("documents")

    collection_info = client.get_collection(collection_name="documents")
    if collection_info.points_count == 0:
        return []

    from qdrant_client.models import Document

    results = client.query_points(
        collection_name="documents",
        query=Document(
            text=question,
            model="sentence-transformers/all-MiniLM-L6-v2",
        ),
        with_payload=True,
        limit=top_k,
    )

    chunks: list[RetrievedChunk] = []
    for point in results.points:
        meta = point.payload or {}
        chunks.append(
            RetrievedChunk(
                chunk_id=str(point.id),
                content=meta.get("content", ""),
                document_name=meta.get("filename", "unknown"),
                document_id=meta.get("document_id", ""),
                page_number=meta.get("page_number", 0),
                similarity_score=point.score,
            )
        )

    return chunks
