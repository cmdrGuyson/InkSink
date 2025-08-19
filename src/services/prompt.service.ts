import { createClient } from "@/lib/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";

export type Prompt = Tables<"user_prompt">;
export type PromptInsert = TablesInsert<"user_prompt">;
export type PromptUpdate = TablesUpdate<"user_prompt">;

// Error types for better error handling
export class PromptServiceError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "PromptServiceError";
  }
}

const supabase = createClient();

export class PromptService {
  /**
   * Create a new prompt
   * @param promptData - Prompt data to insert
   * @returns Created prompt
   */
  static async createPrompt(
    promptData: Omit<PromptInsert, "user_id" | "created_at" | "updated_at">
  ): Promise<Prompt> {
    try {
      const insertData: PromptInsert = {
        ...promptData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("user_prompt")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw new PromptServiceError(
          `Failed to create prompt: ${error.message}`,
          error.code
        );
      }

      if (!data) {
        throw new PromptServiceError("No data returned after prompt creation");
      }

      return data;
    } catch (error) {
      if (error instanceof PromptServiceError) {
        throw error;
      }
      throw new PromptServiceError(
        `Unexpected error creating prompt: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get a prompt by ID
   * @param promptId - Prompt ID to retrieve
   * @returns Prompt data
   */
  static async getPromptById(promptId: string): Promise<Prompt> {
    try {
      const { data, error } = await supabase
        .from("user_prompt")
        .select("*")
        .eq("id", promptId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          throw new PromptServiceError("Prompt not found", "NOT_FOUND");
        }
        throw new PromptServiceError(
          `Failed to retrieve prompt: ${error.message}`,
          error.code
        );
      }

      if (!data) {
        throw new PromptServiceError("Prompt not found", "NOT_FOUND");
      }

      return data;
    } catch (error) {
      if (error instanceof PromptServiceError) {
        throw error;
      }
      throw new PromptServiceError(
        `Unexpected error retrieving prompt: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get all prompts for the current user
   * @returns Array of prompts
   */
  static async getAllUserPrompts(): Promise<Prompt[]> {
    try {
      const { data, error } = await supabase
        .from("user_prompt")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new PromptServiceError(
          `Failed to retrieve prompts: ${error.message}`,
          error.code
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof PromptServiceError) {
        throw error;
      }
      throw new PromptServiceError(
        `Unexpected error retrieving prompts: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Update a prompt by ID
   * @param promptId - Prompt ID to update
   * @param updateData - Data to update
   * @returns Updated prompt
   */
  static async updatePrompt(
    promptId: string,
    updateData: Partial<Pick<PromptUpdate, "title" | "content" | "description">>
  ): Promise<Prompt> {
    try {
      const updatePayload: PromptUpdate = {
        ...updateData,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("user_prompt")
        .update(updatePayload)
        .eq("id", promptId)
        .select()
        .single();

      if (error) {
        throw new PromptServiceError(
          `Failed to update prompt: ${error.message}`,
          error.code
        );
      }

      if (!data) {
        throw new PromptServiceError("No data returned after prompt update");
      }

      return data;
    } catch (error) {
      if (error instanceof PromptServiceError) {
        throw error;
      }
      throw new PromptServiceError(
        `Unexpected error updating prompt: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete a prompt by ID
   * @param promptId - Prompt ID to delete
   * @returns Success status
   */
  static async deletePrompt(promptId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("user_prompt")
        .delete()
        .eq("id", promptId);

      if (error) {
        throw new PromptServiceError(
          `Failed to delete prompt: ${error.message}`,
          error.code
        );
      }

      return true;
    } catch (error) {
      if (error instanceof PromptServiceError) {
        throw error;
      }
      throw new PromptServiceError(
        `Unexpected error deleting prompt: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
