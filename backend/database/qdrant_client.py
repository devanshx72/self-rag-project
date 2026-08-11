"""Qdrant client initialization."""
import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

_client: QdrantClient | None = None


def get_qdrant_client() -> QdrantClient:
    global _client
    if _client is None:
        load_dotenv()
        url = os.environ.get("QDRANT_URL")
        api_key = os.environ.get("QDRANT_API_KEY")
        if not url:
            raise ValueError("QDRANT_URL environment variable is not configured.")
        _client = QdrantClient(
            url=url,
            api_key=api_key,
            cloud_inference=True
        )
    return _client


def init_collection(name: str = "documents") -> None:
    client = get_qdrant_client()
    if not client.collection_exists(collection_name=name):
        client.create_collection(
            collection_name=name,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE),
        )
