import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/types/supabase";

export type Profile = Tables<"profile">;

// Error types for better error handling
export class ProfileServiceError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ProfileServiceError";
  }
}

const supabase = createClient();

export class ProfileService {
  /**
   * Get a user profile by ID
   * @param userId - User ID to retrieve
   * @returns Profile data
   */
  static async getUserProfile(userId: string): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          throw new ProfileServiceError("Profile not found", "NOT_FOUND");
        }
        throw new ProfileServiceError(
          `Failed to retrieve profile: ${error.message}`,
          error.code
        );
      }

      if (!data) {
        throw new ProfileServiceError("Profile not found", "NOT_FOUND");
      }

      return data;
    } catch (error) {
      if (error instanceof ProfileServiceError) {
        throw error;
      }
      throw new ProfileServiceError(
        `Unexpected error retrieving profile: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
