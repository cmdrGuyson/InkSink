import { createClient } from "@/lib/supabase/client";
import { Tables, TablesInsert } from "@/types/supabase";

export type WaitlistEntry = Tables<"waitlist">;
export type WaitlistEntryInsert = TablesInsert<"waitlist">;

// Error types for better error handling
export class WaitlistServiceError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "WaitlistServiceError";
  }
}

const supabase = createClient();

export class WaitlistService {
  /**
   * Add a new waitlist entry
   * @param entryData - Waitlist entry data to insert
   * @returns Created waitlist entry
   */
  static async addWaitlistEntry(
    entryData: Omit<WaitlistEntryInsert, "id" | "created_at" | "updated_at">
  ): Promise<boolean> {
    try {
      const insertData: WaitlistEntryInsert = {
        ...entryData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("waitlist").insert(insertData);

      if (error) {
        throw new WaitlistServiceError(
          `Failed to add waitlist entry: ${error.message}`,
          error.code
        );
      }

      return true;
    } catch (error) {
      if (error instanceof WaitlistServiceError) {
        throw error;
      }
      throw new WaitlistServiceError(
        `Unexpected error adding waitlist entry: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
