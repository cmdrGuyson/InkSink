"use client";

import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { observer } from "mobx-react-lite";
import { useStores } from "@/providers/store.provider";
import type { Editor as TiptapEditor } from "@tiptap/react";
import { PromptLibraryDialog } from "./prompt-library-dialog";
import { useAuth } from "@/providers/auth.provider";
import Logger from "@/lib/logger";
import useChat from "@/hooks/use-chat";
import PreviousChats from "./previous-chats";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";

interface ChatProps {
  documentId?: string;
  editor?: TiptapEditor | null;
}

export const Chat = observer(({ documentId, editor }: ChatProps) => {
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);

  const { profile } = useAuth();

  const {
    messages,
    onSendMessage,
    recentChats,
    isLoading,
    isThinking,
    error: streamError,
    handleDeleteChat,
    handleNewChat,
    handleSelectChat,
  } = useChat(documentId, editor?.getText());

  const { chatStore } = useStores();

  const handleSelectPrompt = (content: string) => {
    setInput(content);
  };

  const handleCopyMessage = async (content: string, messageId: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      Logger.error("Failed to copy message", error, {
        messageId,
        action: "copy_message",
      });
    }
  };

  const [input, setInput] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when recieving messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && (profile?.credit_count ?? 0) >= 1) {
        onSendMessage(input);
        setInput("");
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between h-10 border-b px-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleNewChat}
          title="New Chat"
        >
          <Plus className="h-4 w-4" />
        </Button>

        <PreviousChats
          recentChats={recentChats}
          handleDeleteChat={handleDeleteChat}
          handleSelectChat={handleSelectChat}
        />
      </div>

      {/* Chat Messages Area */}
      <ChatMessages
        messages={messages}
        isThinking={isThinking}
        loading={chatStore.loading}
        error={chatStore.error}
        streamError={streamError}
        copiedMessageId={copiedMessageId}
        onCopyMessage={handleCopyMessage}
        messagesEndRef={messagesEndRef}
      />

      {/* Floating Input at Bottom */}
      <ChatInput
        input={input}
        setInput={setInput}
        onSendMessage={onSendMessage}
        onKeyPress={handleKeyPress}
        isLoading={isLoading}
        creditCount={profile?.credit_count ?? 0}
        onPromptLibraryOpen={() => setIsPromptLibraryOpen(true)}
      />

      {/* Prompt Library Dialog */}
      <PromptLibraryDialog
        isOpen={isPromptLibraryOpen}
        onClose={() => setIsPromptLibraryOpen(false)}
        onSelectPrompt={handleSelectPrompt}
      />
    </div>
  );
});
