"use client";

import React, { useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Clock, SendHorizonal, Library, Palette } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { observer } from "mobx-react-lite";
import { useStores } from "@/providers/store.provider";
import { useParams } from "next/navigation";
import { Message } from "ai";
import { Json } from "@/types/supabase";

interface ChatProps {
  documentId?: string;
}

export const Chat = observer(({ documentId }: ChatProps) => {
  const { chatStore } = useStores();
  const params = useParams();

  // Get documentId from props or params
  const currentDocumentId = documentId || (params.documentId as string);

  // Load the most recent chat when component mounts or documentId changes
  useEffect(() => {
    if (currentDocumentId) {
      chatStore.loadMostRecentChat(currentDocumentId);
    } else {
      chatStore.clearCurrentChat();
    }
  }, [currentDocumentId, chatStore]);

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
      initialMessages: chatStore.currentMessages as unknown as Message[],
    });

  // Save messages whenever they change
  useEffect(() => {
    const saveMessages = async () => {
      if (!currentDocumentId || messages.length === 0) return;

      try {
        if (chatStore.hasCurrentChat) {
          await chatStore.updateChat(chatStore.currentChat!.id, {
            messages: messages as unknown as Json,
          });
        } else {
          // Create new chat with all messages
          await chatStore.createChat({
            document_id: currentDocumentId,
            messages: messages as unknown as Json,
            title: "New Chat",
          });
        }
      } catch (error) {
        console.error("Failed to save messages:", error);
      }
    };

    // Only save if we have messages and they're different from stored messages
    const storedMessages = chatStore.currentMessages as unknown as Message[];
    const messagesChanged =
      JSON.stringify(messages) !== JSON.stringify(storedMessages);

    if (messages.length > 0 && messagesChanged) {
      saveMessages();
    }
  }, [messages, currentDocumentId, chatStore]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between h-10 border-b px-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            if (currentDocumentId) {
              chatStore.createChat({
                document_id: currentDocumentId,
                messages: [],
                title: "New Chat",
              });
            }
          }}
          title="New Chat"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Clock className="h-4 w-4" />
        </Button>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {chatStore.loading && (
          <div className="flex justify-center">
            <p className="text-muted-foreground text-sm">Loading chat...</p>
          </div>
        )}
        {chatStore.error && (
          <div className="flex justify-center">
            <p className="text-destructive text-sm">Error: {chatStore.error}</p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.role === "user"
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                }`}
              >
                {formatTime(new Date())}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Input at Bottom */}
      <div className="p-4 bg-background">
        <form
          onSubmit={handleSubmit}
          className="relative border rounded-lg p-3 bg-background"
        >
          {/* Text Input Area */}
          <div className="mb-3">
            <Textarea
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="border-0 p-0 h-auto min-h-[24px] focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent shadow-none"
              rows={2}
              disabled={isLoading}
            />
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between text-muted-foreground text-sm">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                <Library className="h-3 w-3 mr-1" />
                Prompt Library
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                <Palette className="h-3 w-3 mr-1" />
                Style
              </Button>
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
});
