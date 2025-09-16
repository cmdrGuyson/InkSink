import { fromJson } from "@/lib/utils";
import { useStores } from "@/providers/store.provider";
import { ChatService, type Chat as ChatType } from "@/services/chat.service";
import { useCallback, useEffect, useState } from "react";
import { ChatMessage, useChatStream } from "./use-chat-stream";
import Logger from "@/lib/logger";
import { Json } from "@/types/supabase";
import { useAuth } from "@/providers/auth.provider";

export type ChatMetadata = Omit<ChatType, "messages">;

const useChat = (documentId?: string, editorText?: string) => {
  const { chatStore } = useStores();
  const { spendCredit } = useAuth();

  const [recentChats, setRecentChats] = useState<ChatMetadata[]>([]);

  // Load recent chats for the dropdown (metadata only, no messages)
  const loadRecentChats = useCallback(async () => {
    if (!documentId) return;
    try {
      const chatMetadata =
        await chatStore.loadChatMetadataForDocument(documentId);
      setRecentChats(chatMetadata.slice(0, 10)); // Get only the 10 most recent
    } catch (error) {
      Logger.error("Failed to load recent chats", error, {
        documentId,
        action: "load_recent_chats",
      });
    }
  }, [documentId, chatStore]);

  const onFinishStreaming = async (finalMessages: ChatMessage[]) => {
    if (!documentId || finalMessages.length === 0) return;

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
              documentId: documentId,
              action: "generate_chat_title",
            });
          }
        }

        await chatStore.createChat({
          document_id: documentId,
          messages: persistedMessages,
          title: chatTitle,
        });

        await loadRecentChats();
      }

      // Spend a credit
      spendCredit();
    } catch (error) {
      Logger.error("Failed to save messages", error, {
        documentId: documentId,
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
    content: editorText,
  });

  // Load the most recent chat when component mounts or documentId changes
  useEffect(() => {
    const loadChat = async () => {
      if (documentId) {
        const mostRecentChat = await chatStore.loadMostRecentChat(documentId);
        if (mostRecentChat) {
          setMessages(fromJson(mostRecentChat.messages));
        }
        await loadRecentChats();
      } else {
        chatStore.clearCurrentChat();
      }
    };

    loadChat();
  }, [documentId, chatStore, loadRecentChats, setMessages]);

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

  return {
    chat: null,
    isLoading,
    error: streamError,
    onSendMessage,
    setMessages,
    isThinking,
    messages,
    recentChats,
    loadRecentChats,
    handleSelectChat,
    handleDeleteChat,
    handleNewChat,
  };
};

export default useChat;
