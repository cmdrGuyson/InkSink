"use client";

import React, { useRef, useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Clock,
  SendHorizonal,
  Library,
  Palette,
  Trash2,
} from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { observer } from "mobx-react-lite";
import { useStores } from "@/providers/store.provider";
import { useParams } from "next/navigation";
import { Message } from "ai";
import { Json } from "@/types/supabase";
import type { Chat as ChatType } from "@/services/chat.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ChatProps {
  documentId?: string;
}

export const Chat = observer(({ documentId }: ChatProps) => {
  const { chatStore } = useStores();
  const params = useParams();
  const [recentChats, setRecentChats] = useState<ChatType[]>([]);

  // Get documentId from props or params
  const currentDocumentId = documentId || (params.documentId as string);

  // Load the most recent chat when component mounts or documentId changes
  useEffect(() => {
    if (currentDocumentId) {
      chatStore.loadMostRecentChat(currentDocumentId);
      loadRecentChats();
    } else {
      chatStore.clearCurrentChat();
    }
  }, [currentDocumentId, chatStore]);

  // Load recent chats for the dropdown
  const loadRecentChats = async () => {
    if (!currentDocumentId) return;
    try {
      const chats = await chatStore.loadAllChatsForDocument(currentDocumentId);
      setRecentChats(chats.slice(0, 10)); // Get only the 10 most recent
    } catch (error) {
      console.error("Failed to load recent chats:", error);
    }
  };

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
  } = useChat({
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
          // Create new chat with all messages only when first message is sent
          await chatStore.createChat({
            document_id: currentDocumentId,
            messages: messages as unknown as Json,
            title: "New Chat",
          });
          // Reload recent chats after creating a new one
          await loadRecentChats();
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleNewChat = () => {
    // Clear current chat to start fresh
    chatStore.clearCurrentChat();
    // Clear messages in the useChat hook
    setMessages([]);
  };

  const handleSelectChat = async (chatId: string) => {
    try {
      // Find the chat in recent chats
      const selectedChat = recentChats.find((chat) => chat.id === chatId);
      if (selectedChat) {
        chatStore.currentChat = selectedChat;
        // Update the useChat hook with the selected chat's messages
        setMessages(selectedChat.messages as unknown as Message[]);
      }
    } catch (error) {
      console.error("Failed to select chat:", error);
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the select chat action
    try {
      // Check if the deleted chat is the current chat
      const isCurrentChat = chatStore.currentChat?.id === chatId;

      await chatStore.deleteChat(chatId);

      // If the deleted chat was the current chat, clear the chat state
      if (isCurrentChat) {
        setMessages([]);
      }

      // Reload recent chats after deletion
      await loadRecentChats();
    } catch (error) {
      console.error("Failed to delete chat:", error);
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Recent Chats"
            >
              <Clock className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
              Recent Chats
            </div>
            <DropdownMenuSeparator />
            {recentChats.length === 0 ? (
              <div className="px-2 py-2 text-sm text-muted-foreground">
                No recent chats
              </div>
            ) : (
              recentChats.map((chat) => (
                <DropdownMenuItem
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className="flex items-center justify-between w-full cursor-pointer group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {chat.title || "Untitled Chat"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(chat.updated_at)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    title="Delete chat"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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
