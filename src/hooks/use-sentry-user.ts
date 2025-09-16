import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { User } from "@supabase/supabase-js";
import { Profile } from "@/services/profile.service";

interface UseSentryUserProps {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

/**
 * Hook to set Sentry user context based on Supabase authentication state
 */
export function useSentryUser({ user, profile, loading }: UseSentryUserProps) {
  useEffect(() => {
    // Don't set user context while loading
    if (loading) {
      return;
    }

    if (user && profile) {
      // Set user context with both Supabase user data and profile data
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.user_metadata?.username || user.user_metadata?.full_name,
        // Include additional profile data as extra context
        extra: {
          tier: profile.tier,
          credit_count: profile.credit_count,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          credit_reset_at: profile.credit_reset_at,
        },
      });

      // Set additional tags for better filtering
      Sentry.setTag("user_tier", profile.tier);
    } else {
      // Clear user context when user logs out
      Sentry.setUser(null);
      Sentry.setTag("user_tier", undefined);
    }
  }, [user, profile, loading]);
}
