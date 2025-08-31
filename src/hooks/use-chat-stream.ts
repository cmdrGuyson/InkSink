"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  createdAt: string;
}

interface UseChatStreamOptions {
  content?: string;
  endpoint?: string;
  initialMessages?: ChatMessage[];
  onFinishStreaming?: (finalMessages: ChatMessage[]) => void;
}

interface UseChatStreamApi {
  messages: ChatMessage[];
  isLoading: boolean;
  isThinking: boolean;
  error?: string;
  onSendMessage: (message: string) => Promise<void>;
  stopStreaming: () => void;
  resetChat: () => void;
  setMessages: (messages: ChatMessage[]) => void;
}

function mapChatToPayload(messages: ChatMessage[]) {
  return messages.map((m) => ({ role: m.role, content: m.content }));
}

function parseEventLine(line: string) {
  const idx = line.indexOf(":");
  if (idx === -1) return { key: line.trim(), value: "" };
  const key = line.slice(0, idx).trim();
  const value = line.slice(idx + 1).trimStart();
  return { key, value };
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export type AgentOutputTextDelta = {
  type: "text-delta";
  from: string;
  payload: { text: string };
};

export type AgentOutputFinish = {
  type: "finish";
  from: string;
  payload: {
    usage?: TokenUsage;
    providerMetadata?: unknown;
    totalUsage?: TokenUsage;
  };
};

export type AgentStreamOutput =
  | AgentOutputTextDelta
  | AgentOutputFinish
  | {
      type: string;
      from: string;
      payload: unknown;
    };

export type WorkflowStreamEvent =
  | {
      type: "start";
      runId: string;
      from: string;
      payload: Record<string, never>;
    }
  | {
      type: "step-start";
      runId: string;
      from: string;
      payload: {
        stepName: string;
        args?: unknown;
        stepCallId: string;
        startedAt?: number;
        status?: string;
      };
    }
  | {
      type: "step-output";
      runId: string;
      from: string;
      payload: {
        output: AgentStreamOutput;
        stepCallId: string;
        stepName: string;
      };
    }
  | {
      type: "step-result";
      runId: string;
      from: string;
      payload: {
        stepName: string;
        result?: { result?: string; text?: string } | unknown;
        stepCallId: string;
        status?: string;
        endedAt?: number;
      };
    }
  | {
      type: "finish";
      runId: string;
      from: string;
      payload: { totalUsage?: TokenUsage };
    };

function isWorkflowStreamEvent(value: unknown): value is WorkflowStreamEvent {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (
    typeof v.type !== "string" ||
    typeof v.runId !== "string" ||
    typeof v.from !== "string" ||
    !("payload" in v)
  )
    return false;

  if (v.type === "step-output") {
    const payload = v.payload as Record<string, unknown>;
    if (!payload || typeof payload !== "object") return false;
    if (
      !("output" in payload) ||
      !("stepCallId" in payload) ||
      !("stepName" in payload)
    )
      return false;
  }
  return true;
}

function extractDeltaFromChunk(chunk: WorkflowStreamEvent): string {
  if (chunk.type === "step-output") {
    const output = (chunk.payload as { output: AgentStreamOutput }).output;
    if (output && typeof output === "object" && "type" in output) {
      if (output.type === "text-delta") {
        return (output.payload as { text?: string }).text ?? "";
      }
    }
  }
  return "";
}

export function useChatStream(
  options: UseChatStreamOptions = {}
): UseChatStreamApi {
  const endpoint = options.endpoint ?? "/api/chat";
  const onFinishStreaming = options.onFinishStreaming;
  const [messages, setMessages] = useState<ChatMessage[]>(
    options.initialMessages ?? []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<ChatMessage[]>(messages);
  const hasStartedRef = useRef<boolean>(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const stopStreaming = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const resetChat = useCallback(() => {
    stopStreaming();
    setMessages([]);
    setError(undefined);
  }, [stopStreaming]);

  const buildMessagesPayload = useCallback(
    (next: ChatMessage[]) => mapChatToPayload(next),
    []
  );

  const onSendMessage = useCallback<UseChatStreamApi["onSendMessage"]>(
    async (message: string) => {
      if (!message?.trim()) return;
      if (isLoading) return; // prevent concurrent sends

      setError(undefined);

      const userMessage: ChatMessage = {
        role: "user",
        content: message,
        createdAt: new Date().toISOString(),
      };
      // Append only user; assistant will appear on first token
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setIsThinking(true);
      hasStartedRef.current = false;

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const current = [...messages, userMessage];
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: buildMessagesPayload(current),
            content: options.content,
          }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          const errText = await response.text().catch(() => "");
          throw new Error(errText || `Request failed with ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        // SSE framing state
        let currentEvent: string | null = null;
        let currentData: string[] = [];

        const flushEvent = () => {
          if (!currentEvent) return;
          const raw = currentData.join("\n");
          if (currentEvent === "message") {
            try {
              const parsed: unknown = JSON.parse(raw);
              if (!isWorkflowStreamEvent(parsed)) {
                // Unknown event shape
              } else {
                const evt: WorkflowStreamEvent = parsed;
                const delta = extractDeltaFromChunk(evt);
                if (delta) {
                  if (!hasStartedRef.current) {
                    hasStartedRef.current = true;
                    setIsThinking(false);
                  }
                  setMessages((prev) => {
                    const updated = [...prev];
                    const lastIndex = updated.length - 1;
                    if (
                      lastIndex >= 0 &&
                      updated[lastIndex].role === "assistant"
                    ) {
                      updated[lastIndex] = {
                        ...updated[lastIndex],
                        content: updated[lastIndex].content + delta,
                      };
                    } else {
                      updated.push({
                        role: "assistant",
                        content: delta,
                        createdAt: new Date().toISOString(),
                      });
                    }
                    return updated;
                  });
                }

                // If step-result contains final text, set it
                if (evt.type === "step-result") {
                  const r = (
                    evt.payload as {
                      result?: { result?: string; text?: string };
                    }
                  ).result;
                  const final = r?.text ?? r?.result;
                  if (typeof final === "string" && final.length > 0) {
                    if (!hasStartedRef.current) {
                      hasStartedRef.current = true;
                      setIsThinking(false);
                    }
                    setMessages((prev) => {
                      const updated = [...prev];
                      const lastIndex = updated.length - 1;
                      if (
                        lastIndex >= 0 &&
                        updated[lastIndex].role === "assistant"
                      ) {
                        updated[lastIndex] = {
                          ...updated[lastIndex],
                          content: final,
                        };
                      } else {
                        updated.push({
                          role: "assistant",
                          content: final,
                          createdAt: new Date().toISOString(),
                        });
                      }
                      return updated;
                    });
                  }
                }
              }
            } catch {
              // ignore malformed chunk
            }
          } else if (currentEvent === "result") {
            // Optionally finalize content using the result payload
            try {
              const resultObj: unknown = JSON.parse(raw);
              const resultAny = resultObj as {
                result?: { text?: string; result?: string };
              };
              const finalText =
                resultAny.result?.text ?? resultAny.result?.result ?? "";
              if (finalText) {
                if (!hasStartedRef.current) {
                  hasStartedRef.current = true;
                  setIsThinking(false);
                }
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIndex = updated.length - 1;
                  if (
                    lastIndex >= 0 &&
                    updated[lastIndex].role === "assistant"
                  ) {
                    updated[lastIndex] = {
                      ...updated[lastIndex],
                      content: finalText,
                    };
                  } else {
                    updated.push({
                      role: "assistant",
                      content: finalText,
                      createdAt: new Date().toISOString(),
                    });
                  }
                  return updated;
                });
              }
            } catch {
              // ignore parse errors
            }
          } else if (currentEvent === "error") {
            try {
              const err: unknown = JSON.parse(raw);
              const m = (err as { message?: string })?.message;
              setError(typeof m === "string" ? m : "Stream error");
            } catch {
              setError("Stream error");
            }
          }

          // reset for next event
          currentEvent = null;
          currentData = [];
        };

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let lineBreakIdx: number;
          while ((lineBreakIdx = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, lineBreakIdx);
            buffer = buffer.slice(lineBreakIdx + 1);

            if (!line) {
              flushEvent();
              continue;
            }

            const { key, value: lineValue } = parseEventLine(line);
            if (key === "event") {
              currentEvent = lineValue;
            } else if (key === "data") {
              currentData.push(lineValue);
            }
          }
        }

        // flush remaining buffered event if any
        if (buffer.trim().length > 0) {
          const lines = buffer.split(/\n/);
          for (const l of lines) {
            if (!l) {
              flushEvent();
            } else {
              const { key, value: lineValue } = parseEventLine(l);
              if (key === "event") currentEvent = lineValue;
              if (key === "data") currentData.push(lineValue);
            }
          }
          flushEvent();
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Request failed";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
        setIsThinking(false);
        abortRef.current = null;
        if (onFinishStreaming) onFinishStreaming(messagesRef.current);
      }
    },
    [
      buildMessagesPayload,
      endpoint,
      isLoading,
      messages,
      onFinishStreaming,
      options.content,
    ]
  );

  const api = useMemo<UseChatStreamApi>(
    () => ({
      messages,
      isLoading,
      isThinking,
      error,
      onSendMessage,
      stopStreaming,
      resetChat,
      setMessages,
    }),
    [
      messages,
      isLoading,
      isThinking,
      error,
      onSendMessage,
      stopStreaming,
      resetChat,
    ]
  );

  return api;
}
