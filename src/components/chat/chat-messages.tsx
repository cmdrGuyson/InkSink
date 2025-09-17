"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { CopyIcon } from "@radix-ui/react-icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDateTime } from "@/lib/utils";

// Types
interface Message {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isThinking: boolean;
  loading: boolean;
  error?: string | null;
  streamError?: string | null;
  copiedMessageId: number | null;
  onCopyMessage: (content: string, messageId: number) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  showCopyAlways?: boolean;
}

// Loading Indicator Component
const LoadingIndicator = () => (
  <div className="flex justify-center">
    <p className="text-muted-foreground text-sm">Loading chat...</p>
  </div>
);

// Error Display Component
const ErrorDisplay = ({ error }: { error: string }) => (
  <div className="flex justify-center">
    <p className="text-destructive text-sm">Error: {error}</p>
  </div>
);

// User Message Component
const UserMessage = ({ message }: { message: Message }) => (
  <div className="flex justify-end">
    <div className="max-w-[80%] rounded-lg px-4 py-2 bg-primary text-primary-foreground group">
      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-primary-foreground/70">
          {formatDateTime(message.createdAt)}
        </p>
      </div>
    </div>
  </div>
);

// Assistant Message Component
const AssistantMessage = ({
  message,
  messageId,
  isThinking,
  isLastMessage,
  copiedMessageId,
  onCopyMessage,
  showCopyAlways,
}: {
  message: Message;
  messageId: number;
  isThinking: boolean;
  isLastMessage: boolean;
  copiedMessageId: number | null;
  onCopyMessage: (content: string, messageId: number) => void;
  showCopyAlways?: boolean;
}) => {
  const showThinkingIndicator =
    isThinking && isLastMessage && message.content === "";

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted text-foreground group">
        <div className="chat-markdown">
          {showThinkingIndicator ? (
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>InkSink is thinking...</span>
            </div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ children, href, ...props }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">
            {formatDateTime(message.createdAt)}
          </p>
          <div
            className={
              showCopyAlways
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100 transition-opacity"
            }
          >
            <Tooltip delayDuration={0} open={copiedMessageId === messageId}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  onClick={() => onCopyMessage(message.content, messageId)}
                >
                  <CopyIcon className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {copiedMessageId === messageId ? "Copied!" : "Copy"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

// Thinking Indicator Component (for when assistant is thinking after user message)
const ThinkingIndicator = () => (
  <div className="flex justify-start">
    <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted text-foreground">
      <div className="flex items-center gap-2 text-sm">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>InkSink is thinking...</span>
      </div>
      <p className="text-xs mt-1 text-muted-foreground">
        {formatDateTime(new Date())}
      </p>
    </div>
  </div>
);

// Main Chat Messages Component
export const ChatMessages = ({
  messages,
  isThinking,
  loading,
  error,
  streamError,
  copiedMessageId,
  onCopyMessage,
  messagesEndRef,
  showCopyAlways,
}: ChatMessagesProps) => {
  const hasError = error || streamError;
  const shouldShowThinkingIndicator =
    isThinking &&
    messages.length > 0 &&
    messages[messages.length - 1]?.role === "user";

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
      {loading && <LoadingIndicator />}

      {hasError && <ErrorDisplay error={hasError} />}

      {messages.map((message, idx) => {
        const isLastMessage = idx === messages.length - 1;

        return message.role === "user" ? (
          <UserMessage key={idx} message={message} />
        ) : (
          <AssistantMessage
            key={idx}
            message={message}
            messageId={idx}
            isThinking={isThinking}
            isLastMessage={isLastMessage}
            copiedMessageId={copiedMessageId}
            onCopyMessage={onCopyMessage}
            showCopyAlways={showCopyAlways}
          />
        );
      })}

      {shouldShowThinkingIndicator && <ThinkingIndicator />}

      <div ref={messagesEndRef} />
    </div>
  );
};
