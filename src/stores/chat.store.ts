import { ChatInsert, ChatService, Chat } from "@/services/chat.service";
import { Json } from "@/types/supabase";
import { makeAutoObservable, runInAction } from "mobx";

class ChatStore {
  loading: boolean = false;
  error: string | null = null;
  currentChat: Chat | null = null;
  documentChats: Chat[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  async loadMostRecentChat(documentId: string) {
    this.loading = true;
    this.error = null;
    try {
      const chat = await ChatService.getMostRecentChatByDocumentId(documentId);
      runInAction(() => {
        this.currentChat = chat;
        this.loading = false;
      });
      return chat;
    } catch (e: unknown) {
      runInAction(() => {
        this.error = e instanceof Error ? e.message : "Failed to load chat";
        this.loading = false;
      });
      throw e;
    }
  }

  async loadAllChatsForDocument(documentId: string) {
    this.loading = true;
    this.error = null;
    try {
      const chats = await ChatService.getChatsByDocumentId(documentId);
      runInAction(() => {
        this.documentChats = chats;
        this.loading = false;
      });
      return chats;
    } catch (e: unknown) {
      runInAction(() => {
        this.error = e instanceof Error ? e.message : "Failed to load chats";
        this.loading = false;
      });
      throw e;
    }
  }

  async createChat(data: Omit<ChatInsert, "id" | "created_at" | "updated_at">) {
    this.error = null;
    try {
      const chat = await ChatService.createChat(data);
      runInAction(() => {
        this.currentChat = chat;
        // Add to the beginning of the chats list
        this.documentChats.unshift(chat);
      });
      return chat;
    } catch (e: unknown) {
      runInAction(() => {
        this.error = e instanceof Error ? e.message : "Failed to create chat";
      });
      throw e;
    }
  }

  async updateChat(chatId: string, data: { messages?: Json; title?: string }) {
    this.error = null;
    try {
      const updatedChat = await ChatService.updateChat(chatId, data);

      runInAction(() => {
        // Update current chat if it's the one being updated
        if (this.currentChat?.id === chatId) {
          this.currentChat = updatedChat;
        }

        // Update chat in the document chats list
        const chatIndex = this.documentChats.findIndex(
          (chat) => chat.id === chatId
        );
        if (chatIndex !== -1) {
          this.documentChats[chatIndex] = updatedChat;
        }
      });

      return updatedChat;
    } catch (e: unknown) {
      runInAction(() => {
        this.error = e instanceof Error ? e.message : "Failed to update chat";
      });
      throw e;
    }
  }

  async deleteChat(chatId: string) {
    this.error = null;
    try {
      await ChatService.deleteChat(chatId);
      runInAction(() => {
        // Remove from current chat if it's the one being deleted
        if (this.currentChat?.id === chatId) {
          this.currentChat = null;
        }

        // Remove from document chats list
        this.documentChats = this.documentChats.filter(
          (chat) => chat.id !== chatId
        );
      });
    } catch (e: unknown) {
      runInAction(() => {
        this.error = e instanceof Error ? e.message : "Failed to delete chat";
      });
      throw e;
    }
  }

  // Helper method to get messages from current chat
  get currentMessages() {
    return this.currentChat?.messages || [];
  }

  // Helper method to check if there's a current chat
  get hasCurrentChat() {
    return this.currentChat !== null;
  }

  // Clear current chat (useful when switching documents)
  clearCurrentChat() {
    this.currentChat = null;
  }

  // Clear all chats (useful when logging out or switching users)
  clearAllChats() {
    this.currentChat = null;
    this.documentChats = [];
  }
}

export const chatStore = new ChatStore();
