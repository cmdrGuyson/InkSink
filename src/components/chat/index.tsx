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
  Loader2,
} from "lucide-react";
import { CopyIcon } from "@radix-ui/react-icons";
import { ChatMessage, useChatStream } from "@/hooks/use-chat-stream";
import { observer } from "mobx-react-lite";
import { useStores } from "@/providers/store.provider";
import { useParams } from "next/navigation";
import type { Chat as ChatType } from "@/services/chat.service";
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
import { fromJson } from "@/lib/utils";
import { ChatService } from "@/services/chat.service";
import type { Json } from "@/types/supabase";
import { useAuth } from "@/providers/auth.provider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Logger from "@/lib/logger";

interface ChatProps {
  documentId?: string;
  editor?: TiptapEditor | null;
}

type ChatMetadata = Omit<ChatType, "messages">;

const formatDateTime = (date: string | Date) => {
  return dayjs(date).format("MMM D, h:mm A");
};

export const Chat = observer(({ documentId, editor }: ChatProps) => {
  const { chatStore } = useStores();
  const { spendCredit, profile } = useAuth();

  const params = useParams();

  const [recentChats, setRecentChats] = useState<ChatMetadata[]>([]);
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);

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
      Logger.error("Failed to load recent chats", error, {
        documentId,
        action: "load_recent_chats",
      });
    }
  }, [currentDocumentId, chatStore, documentId]);

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

  const onFinishStreaming = async (finalMessages: ChatMessage[]) => {
    if (!currentDocumentId || finalMessages.length === 0) return;

    try {
      const persistedMessages = finalMessages.map((m) => ({
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })) as unknown as Json;

      if (chatStore.hasCurrentChat) {
        await chatStore.updateChat(chatStore.currentChat!.id, {
          messages: persistedMessages,
        });
      } else {
        const firstUserMessage = finalMessages.find(
          (msg) => msg.role === "user"
        );
        let chatTitle = "New Chat";

        if (firstUserMessage?.content) {
          try {
            chatTitle = await ChatService.generateTitle(
              firstUserMessage.content
            );
          } catch (error) {
            Logger.error("Failed to generate chat title", error, {
              documentId: currentDocumentId,
              action: "generate_chat_title",
            });
          }
        }

        await chatStore.createChat({
          document_id: currentDocumentId,
          messages: persistedMessages,
          title: chatTitle,
        });

        await loadRecentChats();
      }

      // Spend a credit
      spendCredit();
    } catch (error) {
      Logger.error("Failed to save messages", error, {
        documentId: currentDocumentId,
        messageCount: finalMessages.length,
        action: "save_messages",
      });
    }
  };

  const {
    messages,
    isLoading,
    error: streamError,
    onSendMessage,
    setMessages,

    // resetChat,
    // stopStreaming,
    isThinking,
  } = useChatStream({
    initialMessages: fromJson(chatStore.currentMessages),
    onFinishStreaming,
    content: editor?.getText(),
  });

  // Load the most recent chat when component mounts or documentId changes
  useEffect(() => {
    const loadChat = async () => {
      if (currentDocumentId) {
        const mostRecentChat =
          await chatStore.loadMostRecentChat(currentDocumentId);
        if (mostRecentChat) {
          setMessages(fromJson(mostRecentChat.messages));
        }
        await loadRecentChats();
      } else {
        chatStore.clearCurrentChat();
      }
    };

    loadChat();
  }, [currentDocumentId, chatStore, loadRecentChats, setMessages]);

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

  const handleNewChat = () => {
    // Clear current chat to start fresh
    chatStore.clearCurrentChat();
    // Clear messages in the chat stream hook
    setMessages([]);
  };

  const handleSelectChat = async (chatId: string) => {
    try {
      // Load the full chat data (including messages) by ID
      const selectedChat = await chatStore.loadChatById(chatId);
      if (selectedChat) {
        // Update the workflow stream hook with the selected chat's messages
        setMessages(fromJson(selectedChat.messages));
      }
    } catch (error) {
      Logger.error("Failed to select chat", error, {
        chatId,
        action: "select_chat",
      });
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
      Logger.error("Failed to delete chat", error, {
        chatId,
        action: "delete_chat",
      });
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
        {(chatStore.error || streamError) && (
          <div className="flex justify-center">
            <p className="text-destructive text-sm">
              Error: {chatStore.error || streamError}
            </p>
          </div>
        )}
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 group ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {message.role === "user" ? (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              ) : (
                <div className="chat-markdown">
                  {isThinking &&
                  idx === messages.length - 1 &&
                  message.content === "" ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>InkSink is thinking...</span>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between mt-1">
                <p
                  className={`text-xs ${
                    message.role === "user"
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {formatDateTime(message.createdAt)}
                </p>
                {message.role !== "user" && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tooltip delayDuration={0} open={copiedMessageId === idx}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          onClick={() =>
                            handleCopyMessage(message.content, idx)
                          }
                        >
                          <CopyIcon className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {copiedMessageId === idx ? "Copied!" : "Copy"}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isThinking &&
          messages.length > 0 &&
          messages[messages.length - 1]?.role === "user" && (
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
          )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Input at Bottom */}
      <div className="p-4 bg-background">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim() && (profile?.credit_count ?? 0) >= 1) {
              onSendMessage(input);
              setInput("");
            }
          }}
          className="relative border rounded-lg p-3 bg-background"
        >
          {/* Text Input Area */}
          <div className="mb-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
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
            {/* Send Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-block">
                  <Button
                    type="submit"
                    disabled={
                      !input.trim() ||
                      isLoading ||
                      (profile?.credit_count ?? 0) < 1
                    }
                    size="icon"
                    className="h-8 w-8 rounded-full"
                  >
                    <SendHorizonal className="h-4 w-4" />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {(profile?.credit_count ?? 0) < 1 ? (
                  <p>You do not have any remaining credits</p>
                ) : (
                  <p>Send message</p>
                )}
              </TooltipContent>
            </Tooltip>
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
