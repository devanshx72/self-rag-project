"""ChromaDB retriever — semantic search with metadata + similarity scores."""
from dataclasses import dataclass
from database.chroma_client import get_or_create_collection
from rag.embeddings.embedder import embed_query


@dataclass
class RetrievedChunk:
    chunk_id: str
    content: str
    document_name: str
    document_id: str
    page_number: int
    similarity_score: float   # 1 - cosine_distance (higher = more similar)


def retrieve_chunks(question: str, top_k: int = 8) -> list[RetrievedChunk]:
    """Query ChromaDB for the top-k most similar chunks."""
    collection = get_or_create_collection()

    if collection.count() == 0:
        return []

    query_embedding = embed_query(question)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(top_k, collection.count()),
        include=["documents", "metadatas", "distances"],
    )

    chunks: list[RetrievedChunk] = []
    for i, (doc, meta, dist) in enumerate(
        zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        )
    ):
        # ChromaDB cosine distance: 0 = identical, 2 = opposite
        # Convert to similarity: 1 - dist/2  →  range [0, 1]
        similarity = round(1.0 - dist / 2.0, 4)
        chunks.append(
            RetrievedChunk(
                chunk_id=results["ids"][0][i],
                content=doc,
                document_name=meta.get("filename", "unknown"),
                document_id=meta.get("document_id", ""),
                page_number=meta.get("page_number", 0),
                similarity_score=similarity,
            )
        )

    return chunks
