/* eslint-disable @typescript-eslint/no-explicit-any */
import { usePostHog } from "posthog-js/react";
import { useAuth } from "@/providers/auth.provider";

export function usePostHogTracking() {
  const posthog = usePostHog();
  const { user, profile } = useAuth();

  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (posthog) {
      posthog.capture(eventName, {
        ...properties,
        user_id: user?.id,
        profile_id: profile?.id,
        email: user?.email,
        tier: profile?.tier,
        credit_count: profile?.credit_count,
      });
    }
  };

  const trackFeatureUsage = (
    featureName: string,
    properties?: Record<string, any>
  ) => {
    trackEvent("feature_used", {
      feature_name: featureName,
      ...properties,
    });
  };

  const trackDocumentAction = (
    action: string,
    documentId?: string,
    properties?: Record<string, any>
  ) => {
    trackEvent("document_action", {
      action,
      document_id: documentId,
      ...properties,
    });
  };

  const trackChatAction = (
    action: string,
    chatId?: string,
    properties?: Record<string, any>
  ) => {
    trackEvent("chat_action", {
      action,
      chat_id: chatId,
      ...properties,
    });
  };

  const trackCreditUsage = (
    action: string,
    properties?: Record<string, any>
  ) => {
    trackEvent("credit_used", {
      action,
      previous_credit_count: profile?.credit_count,
      ...properties,
    });
  };

  return {
    trackEvent,
    trackFeatureUsage,
    trackDocumentAction,
    trackChatAction,
    trackCreditUsage,
  };
}
