"""Shared LLM instances and utility helpers for all Self-RAG nodes using Mistral AI."""
import os
import time
from datetime import datetime, timezone
from typing import Any

from dotenv import load_dotenv
from langchain_mistralai import ChatMistralAI

MODEL_SMALL = "mistral-small-latest"
MODEL_MEDIUM = "mistral-medium-latest"

_llms: dict[str, ChatMistralAI] = {}


def get_llm(model: str = MODEL_SMALL) -> ChatMistralAI:
    """Get or initialize a ChatMistralAI instance for the specified model."""
    if model not in _llms:
        load_dotenv()
        api_key = os.environ.get("MISTRAL_API_KEY")
        if not api_key:
            raise ValueError("MISTRAL_API_KEY environment variable is not set. Please check your .env file.")
        _llms[model] = ChatMistralAI(
            model=model,
            temperature=0.3,
            api_key=api_key,
        )
    return _llms[model]


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
