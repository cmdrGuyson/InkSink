import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { Tables } from "@/types/supabase";

export type Profile = Tables<"profile">;

// Error types for better error handling
export class CreditServiceError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "CreditServiceError";
  }
}

export class CreditService {
  /**
   * Get the number of credits for a user
   * @param userId - User ID to check
   * @returns the number of credits for the user
   */
  static async getCredits(userId: string): Promise<number> {
    const supabase = await createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("profile")
      .select("credit_count")
      .eq("id", userId)
      .single();

    if (error) {
      throw new CreditServiceError(
        `Failed to retrieve profile: ${error.message}`,
        error.code
      );
    }

    if (!data) {
      throw new CreditServiceError("Profile not found", "NOT_FOUND");
    }

    return data.credit_count;
  }

  /**
   * Deduct one credit from user
   * @param userId - User ID to deduct credit from
   * @returns Boolean for success or failure
   */
  static async deductCredit(
    userId: string,
    creditCount: number
  ): Promise<boolean> {
    const supabase = createAdminSupabaseClient();

    // Deduct one credit
    const { error } = await supabase
      .from("profile")
      .update({ credit_count: creditCount - 1 })
      .eq("id", userId)
      .select();

    if (error) {
      throw new CreditServiceError(
        `Failed to update profile: ${error.message}`,
        error.code
      );
    }
    return true;
  }
}
