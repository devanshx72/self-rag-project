"""Mistral AI embeddings wrapper."""
import os
from dotenv import load_dotenv
from langchain_mistralai import MistralAIEmbeddings
from rag.nodes.base import mistral_api_key_var

_embeddings_cache: dict[str, MistralAIEmbeddings] = {}


def get_embedder() -> MistralAIEmbeddings:
    load_dotenv()
    custom_key = mistral_api_key_var.get()
    api_key = custom_key or os.environ.get("MISTRAL_API_KEY")
    if not api_key:
        raise ValueError(
            "Mistral API key is not configured. Please add a key in the settings "
            "or set the MISTRAL_API_KEY environment variable on the server."
        )

    if api_key not in _embeddings_cache:
        _embeddings_cache[api_key] = MistralAIEmbeddings(
            model="mistral-embed",
            api_key=api_key,
        )
    return _embeddings_cache[api_key]


def embed_texts(texts: list[str]) -> list[list[float]]:
    return get_embedder().embed_documents(texts)


def embed_query(text: str) -> list[float]:
    return get_embedder().embed_query(text)
