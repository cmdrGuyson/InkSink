import { createClient } from "@/lib/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";

// Type definitions for better type safety
export type Chat = Tables<"chat">;
export type ChatInsert = TablesInsert<"chat">;
export type ChatUpdate = TablesUpdate<"chat">;

// Error types for better error handling
export class ChatServiceError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ChatServiceError";
  }
}

// Create client once per file
const supabase = createClient();

export class ChatService {
  /**
   * Create a new chat
   * @param chatData - Chat data to insert
   * @returns Created chat
   */
  static async createChat(
    chatData: Omit<ChatInsert, "id" | "created_at" | "updated_at">
  ): Promise<Chat> {
    try {
      const insertData: ChatInsert = {
        ...chatData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("chat")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw new ChatServiceError(
          `Failed to create chat: ${error.message}`,
          error.code
        );
      }

      if (!data) {
        throw new ChatServiceError("No data returned after chat creation");
      }

      return data;
    } catch (error) {
      if (error instanceof ChatServiceError) {
        throw error;
      }
      throw new ChatServiceError(
        `Unexpected error creating chat: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get the most recent chat for a document
   * @param documentId - Document ID to get chat for
   * @returns Most recent chat or null if none exists
   */
  static async getMostRecentChatByDocumentId(
    documentId: string
  ): Promise<Chat | null> {
    try {
      const { data, error } = await supabase
        .from("chat")
        .select("*")
        .eq("document_id", documentId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No chat found for this document
          return null;
        }
        throw new ChatServiceError(
          `Failed to retrieve chat: ${error.message}`,
          error.code
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ChatServiceError) {
        throw error;
      }
      throw new ChatServiceError(
        `Unexpected error retrieving chat: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get all chats for a document
   * @param documentId - Document ID to get chats for
   * @returns Array of chats ordered by most recent first
   */
  static async getChatsByDocumentId(documentId: string): Promise<Chat[]> {
    try {
      const { data, error } = await supabase
        .from("chat")
        .select("*")
        .eq("document_id", documentId)
        .order("updated_at", { ascending: false });

      if (error) {
        throw new ChatServiceError(
          `Failed to retrieve chats: ${error.message}`,
          error.code
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof ChatServiceError) {
        throw error;
      }
      throw new ChatServiceError(
        `Unexpected error retrieving chats: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get chat metadata (without messages) for a document
   * @param documentId - Document ID to get chats for
   * @returns Array of chat metadata ordered by most recent first
   */
  static async getChatMetadataByDocumentId(
    documentId: string
  ): Promise<Omit<Chat, "messages">[]> {
    try {
      const { data, error } = await supabase
        .from("chat")
        .select("id, title, created_at, updated_at, document_id, user_id")
        .eq("document_id", documentId)
        .order("updated_at", { ascending: false });

      if (error) {
        throw new ChatServiceError(
          `Failed to retrieve chat metadata: ${error.message}`,
          error.code
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof ChatServiceError) {
        throw error;
      }
      throw new ChatServiceError(
        `Unexpected error retrieving chat metadata: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get a specific chat by ID with all data including messages
   * @param chatId - Chat ID to retrieve
   * @returns Chat with messages or null if not found
   */
  static async getChatById(chatId: string): Promise<Chat | null> {
    try {
      const { data, error } = await supabase
        .from("chat")
        .select("*")
        .eq("id", chatId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No chat found with this ID
          return null;
        }
        throw new ChatServiceError(
          `Failed to retrieve chat: ${error.message}`,
          error.code
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ChatServiceError) {
        throw error;
      }
      throw new ChatServiceError(
        `Unexpected error retrieving chat: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Update a chat by ID
   * @param chatId - Chat ID to update
   * @param updateData - Data to update
   * @returns Updated chat
   */
  static async updateChat(
    chatId: string,
    updateData: Partial<Pick<ChatUpdate, "messages" | "title">>
  ): Promise<Chat> {
    try {
      const updatePayload: ChatUpdate = {
        ...updateData,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("chat")
        .update(updatePayload)
        .eq("id", chatId)
        .select()
        .single();

      if (error) {
        throw new ChatServiceError(
          `Failed to update chat: ${error.message}`,
          error.code
        );
      }

      if (!data) {
        throw new ChatServiceError("No data returned after chat update");
      }

      return data;
    } catch (error) {
      if (error instanceof ChatServiceError) {
        throw error;
      }
      throw new ChatServiceError(
        `Unexpected error updating chat: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete a chat by ID
   * @param chatId - Chat ID to delete
   */
  static async deleteChat(chatId: string): Promise<void> {
    try {
      const { error } = await supabase.from("chat").delete().eq("id", chatId);

      if (error) {
        throw new ChatServiceError(
          `Failed to delete chat: ${error.message}`,
          error.code
        );
      }
    } catch (error) {
      if (error instanceof ChatServiceError) {
        throw error;
      }
      throw new ChatServiceError(
        `Unexpected error deleting chat: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Generate a title for a chat based on the first message
   * @param message - The first message content to generate title from
   * @returns Generated title
   */
  static async generateTitle(message: string): Promise<string> {
    try {
      const response = await fetch("/api/chat-title", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new ChatServiceError(
          `Failed to generate title: ${response.statusText}`,
          response.status.toString()
        );
      }

      const data = await response.json();

      if (!data.title) {
        throw new ChatServiceError("No title received from API");
      }

      return data.title;
    } catch (error) {
      if (error instanceof ChatServiceError) {
        throw error;
      }
      throw new ChatServiceError(
        `Unexpected error generating title: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
