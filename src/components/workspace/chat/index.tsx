"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
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
import { ChatService } from "@/services/chat.service";
import type { Editor as TiptapEditor } from "@tiptap/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import dayjs from "dayjs";
import { toast } from "sonner";
import { PromptLibraryDialog } from "./prompt-library-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ChatProps {
  documentId?: string;
  editor?: TiptapEditor | null;
}

type ChatMetadata = Omit<ChatType, "messages">;

export const Chat = observer(({ documentId, editor }: ChatProps) => {
  const { chatStore } = useStores();
  const params = useParams();
  const [recentChats, setRecentChats] = useState<ChatMetadata[]>([]);
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false);

  // Get documentId from props or params
  const currentDocumentId = documentId || (params.documentId as string);

  // Load recent chats for the dropdown (metadata only, no messages)
  const loadRecentChats = useCallback(async () => {
    if (!currentDocumentId) return;
    try {
      const chatMetadata =
        await chatStore.loadChatMetadataForDocument(currentDocumentId);
      setRecentChats(chatMetadata.slice(0, 10)); // Get only the 10 most recent
    } catch (error) {
      console.error("Failed to load recent chats:", error);
    }
  }, [currentDocumentId, chatStore]);

  // Load the most recent chat when component mounts or documentId changes
  useEffect(() => {
    if (currentDocumentId) {
      chatStore.loadMostRecentChat(currentDocumentId);
      loadRecentChats();
    } else {
      chatStore.clearCurrentChat();
    }
  }, [currentDocumentId, chatStore, loadRecentChats]);

  const handleSelectPrompt = (content: string) => {
    // Create a synthetic event to update the useChat input
    const syntheticEvent = {
      target: { value: content },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    handleInputChange(syntheticEvent);
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
    body: {
      content: editor?.getText().trim() || "",
      style: "", // TODO: Implement writing style
    },
  });

  // Save messages when streaming is complete or user sends a message
  useEffect(() => {
    const saveMessages = async () => {
      if (!currentDocumentId || messages.length === 0) return;

      console.log("Running save messages");

      try {
        if (chatStore.hasCurrentChat) {
          await chatStore.updateChat(chatStore.currentChat!.id, {
            messages: messages as unknown as Json,
          });
        } else {
          // Create new chat with all messages only when first message is sent
          // Generate title from the first user message
          const firstUserMessage = messages.find((msg) => msg.role === "user");
          let chatTitle = "New Chat";

          if (firstUserMessage?.content) {
            try {
              chatTitle = await ChatService.generateTitle(
                firstUserMessage.content
              );
            } catch (error) {
              console.error("Failed to generate chat title:", error);
              // Fall back to "New Chat" if title generation fails
            }
          }

          await chatStore.createChat({
            document_id: currentDocumentId,
            messages: messages as unknown as Json,
            title: chatTitle,
          });
          // Reload recent chats after creating a new one
          await loadRecentChats();
        }
      } catch (error) {
        console.error("Failed to save messages:", error);
      }
    };

    // Check if messages have actually changed by comparing with previous ref
    const messagesChanged =
      messages.length !== previousMessagesRef.current.length ||
      messages.some((msg, index) => {
        const prevMsg = previousMessagesRef.current[index];
        return (
          !prevMsg || msg.id !== prevMsg.id || msg.content !== prevMsg.content
        );
      });

    // Only save when:
    // 1. Messages have changed
    // 2. Not currently streaming (isLoading is false)
    // 3. There are messages to save
    if (messages.length > 0 && messagesChanged && !isLoading) {
      saveMessages();
      // Update the ref with current messages after saving
      previousMessagesRef.current = [...messages];
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, currentDocumentId, chatStore, isLoading]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousMessagesRef = useRef<Message[]>([]);

  useEffect(() => {
    // Scroll to bottom when recieving messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      handleSubmit();
    }
  };

  const formatDateTime = (date: string | Date) => {
    return dayjs(date).format("MMM D, h:mm A");
  };

  const handleNewChat = () => {
    // Clear current chat to start fresh
    chatStore.clearCurrentChat();
    // Clear messages in the useChat hook
    setMessages([]);
  };

  const handleSelectChat = async (chatId: string) => {
    try {
      // Load the full chat data (including messages) by ID
      const selectedChat = await chatStore.loadChatById(chatId);
      if (selectedChat) {
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
                      {formatDateTime(chat.updated_at)}
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
              {message.role === "user" ? (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              ) : (
                <div className="chat-markdown">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Customize links to open in new tab
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
                </div>
              )}
              <p
                className={`text-xs mt-1 ${
                  message.role === "user"
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                }`}
              >
                {formatDateTime(message.createdAt || new Date().toISOString())}
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
              autoResize
              minRows={2}
              maxRows={16}
              disabled={isLoading}
            />
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between text-muted-foreground text-sm">
            <div className="flex items-center">
              {/* <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button> */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setIsPromptLibraryOpen(true)}
              >
                <Library className="h-3 w-3 mr-1" />
                Prompt Library
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() =>
                  toast.info("This feature will be available soon")
                }
              >
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

      {/* Prompt Library Dialog */}
      <PromptLibraryDialog
        isOpen={isPromptLibraryOpen}
        onClose={() => setIsPromptLibraryOpen(false)}
        onSelectPrompt={handleSelectPrompt}
      />
    </div>
  );
});
