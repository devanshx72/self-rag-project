// API client for RAG backend
import type { DocumentMeta, HistoryEntry, ExecutionResult } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ─── Documents ─────────────────────────────────────────────────────────────────

export async function uploadDocument(file: File): Promise<{
  document_id: string;
  filename: string;
  chunk_count: number;
  message: string;
}> {
  const form = new FormData();
  form.append("file", file);

  const headers: Record<string, string> = {};
  const customKey = typeof window !== "undefined" ? localStorage.getItem("mistral_api_key") : null;
  if (customKey) {
    headers["X-Mistral-API-Key"] = customKey;
  }

  const res = await fetch(`${BASE_URL}/upload`, { 
    method: "POST", 
    body: form,
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

export async function fetchDocuments(): Promise<DocumentMeta[]> {
  const res = await fetch(`${BASE_URL}/documents`);
  if (!res.ok) throw new Error("Failed to fetch documents");
  const data = await res.json();
  return data.documents;
}

export async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/documents/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete document");
}

// ─── History ──────────────────────────────────────────────────────────────────

export async function fetchHistory(): Promise<HistoryEntry[]> {
  const res = await fetch(`${BASE_URL}/history`);
  if (!res.ok) throw new Error("Failed to fetch history");
  const data = await res.json();
  return data.history;
}

export async function fetchHistoryEntry(sessionId: string): Promise<ExecutionResult> {
  const res = await fetch(`${BASE_URL}/history/${sessionId}`);
  if (!res.ok) throw new Error("Failed to fetch history entry");
  return res.json();
}

// ─── Query (SSE stream) ────────────────────────────────────────────────────────

export function startQueryStream(question: string, sessionId?: string): EventSource {
  // We use POST, so we need fetch with ReadableStream instead of EventSource
  throw new Error("Use fetchQueryStream instead");
}

export async function* streamQuery(
  question: string,
  sessionId?: string,
  signal?: AbortSignal
): AsyncGenerator<Record<string, unknown>, void, unknown> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const customKey = typeof window !== "undefined" ? localStorage.getItem("mistral_api_key") : null;
  if (customKey) {
    headers["X-Mistral-API-Key"] = customKey;
  }

  const res = await fetch(`${BASE_URL}/query`, {
    method: "POST",
    headers,
    body: JSON.stringify({ question, session_id: sessionId }),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Query failed" }));
    throw new Error(err.detail || "Query failed");
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const raw = line.slice(6).trim();
        if (!raw) continue;
        try {
          yield JSON.parse(raw);
        } catch {
          // skip malformed
        }
      }
    }
  }
}
