"""Mistral AI embeddings wrapper."""
import os
from dotenv import load_dotenv
from langchain_mistralai import MistralAIEmbeddings

_embeddings: MistralAIEmbeddings | None = None


def get_embedder() -> MistralAIEmbeddings:
    global _embeddings
    if _embeddings is None:
        load_dotenv()
        api_key = os.environ.get("MISTRAL_API_KEY")
        if not api_key:
            raise ValueError("MISTRAL_API_KEY environment variable is not set. Please check your .env file.")
        _embeddings = MistralAIEmbeddings(
            model="mistral-embed",
            api_key=api_key,
        )
    return _embeddings


def embed_texts(texts: list[str]) -> list[list[float]]:
    return get_embedder().embed_documents(texts)


def embed_query(text: str) -> list[float]:
    return get_embedder().embed_query(text)
