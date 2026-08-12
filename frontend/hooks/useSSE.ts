import { useState, useCallback } from "react";
import { streamQuery } from "@/lib/api";
import { useExecutionStore } from "@/store/useExecutionStore";
import { useChatStore } from "@/store/useChatStore";
import { Citation, NodeTrace } from "@/types";

export function useSSE() {
  const [isQuerying, setIsQuerying] = useState(false);
  const { updateNodeStatus, addTrace, resetGraph, setRunning } = useExecutionStore();
  const { addMessage, updateLastMessage, loadHistory } = useChatStore();

  const runQuery = useCallback(
    async (question: string) => {
      setIsQuerying(true);
      resetGraph();
      setRunning(true);

      const timestamp = new Date().toISOString();
      const userMsgId = `user-${Date.now()}`;
      const assistantMsgId = `assistant-${Date.now()}`;

      // Add User Message
      addMessage({
        id: userMsgId,
        role: "user",
        content: question,
        timestamp,
      });

      // Add initial Assistant message placeholder
      addMessage({
        id: assistantMsgId,
        role: "assistant",
        content: "Reasoning and evaluating pipeline steps...",
        isStreaming: true,
        timestamp,
      });

      try {
        for await (const event of streamQuery(question)) {
          if (event.event === "node_start") {
            // Immediately mark node as running for live graph animation
            updateNodeStatus(event.node_id as string, "running");
          } else if (event.event === "node_complete") {
            const trace = event as unknown as NodeTrace;
            updateNodeStatus(trace.node_id, "completed", trace);
            addTrace(trace);
          } else if (event.event === "graph_complete") {
            const answer = (event.answer as string) || "No response generated.";
            const citations = (event.citations as Citation[]) || [];

            updateLastMessage({
              content: answer,
              citations,
              isStreaming: false,
            });

            setRunning(false);
            loadHistory();
          } else if (event.event === "graph_error") {
            updateLastMessage({
              content: `Error executing reasoning pipeline: ${event.message}`,
              isStreaming: false,
            });
            setRunning(false);
          }
        }
      } catch (err: any) {
        updateLastMessage({
          content: `Connection error: ${err.message || "Pipeline execution failed"}`,
          isStreaming: false,
        });
        setRunning(false);
      } finally {
        setIsQuerying(false);
      }
    },
    [addMessage, updateLastMessage, updateNodeStatus, addTrace, resetGraph, setRunning, loadHistory]
  );

  return { runQuery, isQuerying };
}
