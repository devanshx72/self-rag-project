"""Shared LLM instances and utility helpers for all Self-RAG nodes using Mistral AI."""
import os
import time
from datetime import datetime, timezone
from contextvars import ContextVar
from typing import Any, Optional

from dotenv import load_dotenv
from langchain_mistralai import ChatMistralAI

MODEL_SMALL = "mistral-small-latest"
MODEL_MEDIUM = "mistral-medium-latest"

# Request-local context variable for the custom user-supplied Mistral API key
mistral_api_key_var: ContextVar[Optional[str]] = ContextVar("mistral_api_key_var", default=None)

_llms: dict[str, ChatMistralAI] = {}


def get_llm(model: str = MODEL_SMALL) -> ChatMistralAI:
    """Get or initialize a ChatMistralAI instance for the specified model."""
    load_dotenv()
    custom_key = mistral_api_key_var.get()
    api_key = custom_key or os.environ.get("MISTRAL_API_KEY")
    if not api_key:
        raise ValueError(
            "Mistral API key is not configured. Please add a key in the settings "
            "or set the MISTRAL_API_KEY environment variable on the server."
        )

    cache_key = f"{model}:{api_key}"
    if cache_key not in _llms:
        _llms[cache_key] = ChatMistralAI(
            model=model,
            temperature=0.3,
            api_key=api_key,
        )
    return _llms[cache_key]


def get_small_llm() -> ChatMistralAI:
    """LLM instance for lightweight tasks (grading, decide retrieval, verification)."""
    return get_llm(MODEL_SMALL)


def get_answering_llm() -> ChatMistralAI:
    """LLM instance for answering tasks (generate from context, direct generate, revise answer)."""
    return get_llm(MODEL_MEDIUM)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def extract_usage(ai_message: Any) -> tuple[int, int, int]:
    """Extract (prompt_tokens, completion_tokens, total) from AIMessage."""
    meta = getattr(ai_message, "usage_metadata", None) or {}
    prompt_tokens      = meta.get("input_tokens", 0)
    completion_tokens  = meta.get("output_tokens", 0)
    total              = meta.get("total_tokens", prompt_tokens + completion_tokens)
    return prompt_tokens, completion_tokens, total
