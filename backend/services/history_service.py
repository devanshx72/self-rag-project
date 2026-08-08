"""Execution history service — JSON file store."""
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

LOGS_DIR = Path(__file__).parent.parent.parent / "logs"
LOGS_DIR.mkdir(parents=True, exist_ok=True)
HISTORY_FILE = LOGS_DIR / "history.json"


def _load() -> list[dict]:
    if HISTORY_FILE.exists():
        return json.loads(HISTORY_FILE.read_text())
    return []


def _save(data: list[dict]) -> None:
    HISTORY_FILE.write_text(json.dumps(data, indent=2))


def save_execution(session_id: str, result: dict) -> None:
    history = _load()
    entry = {
        "session_id":         session_id,
        "question":           result.get("question", ""),
        "answer":             result.get("answer", ""),
        "created_at":         datetime.now(timezone.utc).isoformat(),
        "total_latency_ms":   result.get("total_latency_ms", 0),
        "total_tokens":       result.get("total_tokens", 0),
        # Full trace stored for replay
        "execution_trace":    result.get("execution_trace", []),
        "citations":          result.get("citations", []),
    }
    history.insert(0, entry)
    history = history[:100]  # keep last 100
    _save(history)


def list_history() -> list[dict]:
    history = _load()
    # Return summary (no full trace)
    return [
        {
            "session_id":         h["session_id"],
            "question":           h["question"],
            "answer":             h["answer"][:200] + "..." if len(h.get("answer", "")) > 200 else h.get("answer", ""),
            "created_at":         h["created_at"],
            "total_latency_ms":   h.get("total_latency_ms", 0),
            "total_tokens":       h.get("total_tokens", 0),
        }
        for h in history
    ]


def get_history_entry(session_id: str) -> Optional[dict]:
    for h in _load():
        if h["session_id"] == session_id:
            return h
    return None
