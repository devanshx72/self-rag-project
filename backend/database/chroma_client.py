"""ChromaDB persistent client singleton."""
import os
import chromadb
from chromadb.config import Settings

_client: chromadb.ClientAPI | None = None
CHROMA_PATH = os.path.join(os.path.dirname(__file__), "../../chromadb")


def get_chroma_client() -> chromadb.ClientAPI:
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(
            path=os.path.abspath(CHROMA_PATH),
            settings=Settings(anonymized_telemetry=False),
        )
    return _client


def get_or_create_collection(name: str = "documents") -> chromadb.Collection:
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=name,
        metadata={"hnsw:space": "cosine"},
    )
