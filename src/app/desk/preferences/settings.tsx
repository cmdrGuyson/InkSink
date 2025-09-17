"use client";

import { useState, Suspense } from "react";
import { observer } from "mobx-react-lite";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Key, User, Settings as SettingsIcon, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth.provider";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import AppPreferences from "./app-preferences";
import AccountPreferences from "./account-preferences";
import Usage from "./usage-preferences";
import Logger from "@/lib/logger";

type SettingsSection = "app" | "account" | "usage";

// Separate component that uses useSearchParams
const SettingsContent = observer(() => {
  const { user } = useAuth();
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get active section from URL params with fallback to "account"
  const activeSection =
    (searchParams.get("section") as SettingsSection) || "account";

  // Helper function to update the active section
  const updateSection = (section: SettingsSection) => {
    const params = new URLSearchParams(searchParams);
    params.set("section", section);
    router.push(`${pathname}?${params.toString()}`);
  };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [openAiKey, setOpenAiKey] = useState("");
  const [showOpenAiKey, setShowOpenAiKey] = useState(false);

  const handleSaveApiKey = async () => {
    // Implement
  };

  const handleResetPassword = async () => {
    if (!user) {
      setPasswordError("You must be logged in to change your password");
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    setIsResettingPassword(true);
    setPasswordError(null);

    try {
      // First, re-authenticate the user with their current password
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      });

      if (reauthError) {
        setPasswordError("Current password is incorrect");
        return;
      }

      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setPasswordError(updateError.message || "Failed to update password");
        return;
      }

      // Clear form and show success message
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully!");
    } catch (error) {
      Logger.error("Password reset error", error, {
        email: user?.email,
        action: "password_reset",
      });
      setPasswordError("An unexpected error occurred. Please try again.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <Card className="min-h-[600px] shadow-lg border mx-24">
      <div className="h-full bg-background flex">
        {/* Sidebar */}
        <div className="w-64 border-r p-4 flex-shrink-0">
          <div className="flex items-center gap-3 mb-6">
            <SettingsIcon className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Settings</h1>
          </div>

          <nav className="space-y-2">
            {/* <Button
              variant={activeSection === "app" ? "default" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => updateSection("app")}
            >
              <Key className="h-4 w-4" />
              App Preferences
            </Button> */}

            <Button
              variant={activeSection === "account" ? "default" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => updateSection("account")}
            >
              <User className="h-4 w-4" />
              Account Preferences
            </Button>

            <Button
              variant={activeSection === "usage" ? "default" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => updateSection("usage")}
            >
              <BarChart3 className="h-4 w-4" />
              Usage
            </Button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-120">
          <div className="w-full h-full p-6 overflow-y-auto">
            <div className="w-full max-w-3xl h-full mx-auto">
              {activeSection === "app" && (
                <div className="w-full h-full flex flex-col">
                  <div className="mb-6 flex-shrink-0">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Key className="h-5 w-5 text-primary" />
                      App Preferences
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configure your AI service API keys and application
                      settings
                    </p>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <AppPreferences
                      setOpenAiKey={setOpenAiKey}
                      openAiKey={openAiKey}
                      setShowOpenAiKey={setShowOpenAiKey}
                      showOpenAiKey={showOpenAiKey}
                      handleSaveApiKey={handleSaveApiKey}
                    />
                  </div>
                </div>
              )}

              {activeSection === "account" && (
                <div className="w-full h-full flex flex-col">
                  <div className="mb-6 flex-shrink-0">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Account Preferences
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Manage your account settings and security preferences
                    </p>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <AccountPreferences
                      currentPassword={currentPassword}
                      setCurrentPassword={setCurrentPassword}
                      newPassword={newPassword}
                      setNewPassword={setNewPassword}
                      confirmPassword={confirmPassword}
                      setConfirmPassword={setConfirmPassword}
                      showNewPassword={showNewPassword}
                      setShowNewPassword={setShowNewPassword}
                      showConfirmPassword={showConfirmPassword}
                      setShowConfirmPassword={setShowConfirmPassword}
                      handleResetPassword={handleResetPassword}
                      isResettingPassword={isResettingPassword}
                      passwordError={passwordError}
                    />
                  </div>
                </div>
              )}

              {activeSection === "usage" && (
                <div className="w-full h-full flex flex-col">
                  <Usage />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
});

// Skeletal loader component
const SkeletalLoader = () => (
  <Card className="min-h-[600px] shadow-lg border mx-24">
    <div className="h-full bg-background flex">
      {/* Sidebar skeleton */}
      <div className="w-64 border-r p-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-5 w-5 bg-muted rounded animate-pulse"></div>
          <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
        </div>

        <nav className="space-y-2">
          <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
          <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
        </nav>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col min-w-120">
        <div className="w-full h-full p-6">
          <div className="w-full max-w-3xl h-full mx-auto">
            {/* Header skeleton */}
            <div className="mb-6 flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-5 w-5 bg-muted rounded animate-pulse"></div>
                <div className="h-6 w-48 bg-muted rounded animate-pulse"></div>
              </div>
              <div className="h-4 w-96 bg-muted rounded animate-pulse"></div>
            </div>

            {/* Content skeleton */}
            <div className="space-y-6">
              <div className="h-32 bg-muted rounded-lg animate-pulse"></div>
              <div className="h-24 bg-muted rounded-lg animate-pulse"></div>
              <div className="h-40 bg-muted rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Card>
);

// Loading fallback component
const SettingsFallback = () => <SkeletalLoader />;

// Main Settings component wrapped in Suspense
const Settings = () => {
  return (
    <Suspense fallback={<SettingsFallback />}>
      <SettingsContent />
    </Suspense>
  );
};

export default Settings;
