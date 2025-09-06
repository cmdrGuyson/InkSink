"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useAuth } from "./auth.provider";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

function PostHogTracker() {
  const { user, profile } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
      api_host: "/ingest", // Use the reverse proxy endpoint
      ui_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      person_profiles: "identified_only",
      defaults: "2025-05-24",
    });
  }, []);

  // Track page views
  useEffect(() => {
    if (posthog && pathname) {
      posthog.capture("$pageview", {
        path: pathname,
        search: searchParams?.toString(),
        user_id: user?.id,
        email: user?.email,
        name: user?.user_metadata?.full_name || user?.user_metadata?.name,
        credit_count: profile?.credit_count,
        tier: profile?.tier,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // Identify user in PostHog when they sign in
  useEffect(() => {
    if (user && posthog) {
      posthog.identify(user.id, {
        email: user.email,
        name: user?.user_metadata?.full_name || user?.user_metadata?.name,
        avatar_url: user?.user_metadata?.avatar_url,
        profile_id: profile?.id,
        created_at: user.created_at,
        last_sign_in: user.last_sign_in_at,
        credit_count: profile?.credit_count,
        tier: profile?.tier,
        profile_created_at: profile?.created_at,
        profile_updated_at: profile?.updated_at,
        credit_reset_at: profile?.credit_reset_at,
      });
    } else if (!user && posthog) {
      // Reset identification when user signs out
      posthog.reset();
    }
  }, [user, profile]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogTracker />
      </Suspense>
      {children}
    </PHProvider>
  );
}
