"use client";

import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Key,
  User,
  Shield,
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
} from "lucide-react";
import { useStores } from "@/providers/store.provider";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth.provider";

type SettingsSection = "app" | "account";

interface AppPreferencesProps {
  openAiKey: string;
  setOpenAiKey: (value: string) => void;
  showOpenAiKey: boolean;
  setShowOpenAiKey: (value: boolean) => void;
  handleSaveApiKey: () => void;
  isSaving: boolean;
  error: string | null;
}

const AppPreferences = ({
  openAiKey,
  setOpenAiKey,
  showOpenAiKey,
  setShowOpenAiKey,
  handleSaveApiKey,
  isSaving,
  error,
}: AppPreferencesProps) => (
  <div className="space-y-6">
    {/* OpenAI API Key */}
    <div className="space-y-3">
      <Label htmlFor="openai-key" className="text-sm font-medium">
        OpenAI API Key
      </Label>
      <div className="relative">
        <Input
          id="openai-key"
          type={showOpenAiKey ? "text" : "password"}
          placeholder="sk-..."
          value={openAiKey}
          onChange={(e) => setOpenAiKey(e.target.value)}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1 h-7 w-7"
          onClick={() => setShowOpenAiKey(!showOpenAiKey)}
        >
          {showOpenAiKey ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Your API key is encrypted and stored securely
      </p>
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      <Button onClick={handleSaveApiKey} disabled={isSaving} className="w-fit">
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? "Saving..." : "Save API Key"}
      </Button>
    </div>

    <Separator />

    {/* Gemini API Key - Coming Soon */}
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">Google Gemini API Key</Label>
        <Badge variant="secondary" className="text-xs">
          Coming Soon
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        Gemini integration will be available in a future update
      </p>
    </div>

    <Separator />

    {/* Claude API Key - Coming Soon */}
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">Anthropic Claude API Key</Label>
        <Badge variant="secondary" className="text-xs">
          Coming Soon
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        Claude integration will be available in a future update
      </p>
    </div>
  </div>
);

interface AccountPreferencesProps {
  currentPassword: string;
  setCurrentPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  showNewPassword: boolean;
  setShowNewPassword: (value: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (value: boolean) => void;
  handleResetPassword: () => void;
  isResettingPassword: boolean;
  passwordError: string | null;
}

const AccountPreferences = ({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  handleResetPassword,
  isResettingPassword,
  passwordError,
}: AccountPreferencesProps) => (
  <div className="space-y-6">
    {/* Password Reset */}
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-primary" />
        <Label className="text-sm font-medium">Reset Password</Label>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="current-password" className="text-sm">
            Current Password
          </Label>
          <Input
            id="current-password"
            type="password"
            placeholder="Enter your current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="new-password" className="text-sm">
            New Password
          </Label>
          <div className="relative mt-1">
            <Input
              id="new-password"
              type={showNewPassword ? "text" : "password"}
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-7 w-7"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="confirm-password" className="text-sm">
            Confirm New Password
          </Label>
          <div className="relative mt-1">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-7 w-7"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {newPassword && confirmPassword && newPassword !== confirmPassword && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            Passwords do not match
          </div>
        )}

        {passwordError && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {passwordError}
          </div>
        )}

        <Button
          onClick={handleResetPassword}
          disabled={
            !currentPassword ||
            !newPassword ||
            !confirmPassword ||
            newPassword !== confirmPassword ||
            isResettingPassword
          }
          className="w-fit"
        >
          <Shield className="h-4 w-4 mr-2" />
          {isResettingPassword ? "Resetting Password..." : "Reset Password"}
        </Button>
      </div>
    </div>
  </div>
);

const Settings = observer(() => {
  const { keyStore } = useStores();
  const { user } = useAuth();
  const supabase = createClient();
  const [activeSection, setActiveSection] = useState<SettingsSection>("app");
  const [openAiKey, setOpenAiKey] = useState("");
  const [showOpenAiKey, setShowOpenAiKey] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Initialize the input with the stored key when component mounts
  useEffect(() => {
    if (keyStore.openAiApiKey) {
      setOpenAiKey(keyStore.openAiApiKey);
    }
  }, [keyStore.openAiApiKey]);

  const handleSaveApiKey = async () => {
    if (!openAiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }

    setIsSaving(true);
    try {
      await keyStore.saveOpenAiApiKey(openAiKey.trim());
      toast.success("API key saved successfully!");
    } catch (error) {
      console.error("Failed to save API key:", error);
      toast.error("Failed to save API key. Please try again.");
    } finally {
      setIsSaving(false);
    }
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
      console.error("Password reset error:", error);
      setPasswordError("An unexpected error occurred. Please try again.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  if (keyStore.loading) return;

  return (
    <Card className="h-[700px] shadow-lg border mx-24">
      <div className="h-full bg-background flex">
        {/* Sidebar */}
        <div className="w-64 border-r p-4 flex-shrink-0">
          <div className="flex items-center gap-3 mb-6">
            <SettingsIcon className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Settings</h1>
          </div>

          <nav className="space-y-2">
            <Button
              variant={activeSection === "app" ? "default" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => setActiveSection("app")}
            >
              <Key className="h-4 w-4" />
              App Preferences
            </Button>
            <Button
              variant={activeSection === "account" ? "default" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => setActiveSection("account")}
            >
              <User className="h-4 w-4" />
              Account Preferences
            </Button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
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
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        🔒 <strong>Privacy First:</strong> Your API keys are
                        encrypted and stored locally in your browser. We never
                        send your keys to our servers or store them in the
                        cloud. The development team has no access to your API
                        tokens.
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <AppPreferences
                      openAiKey={openAiKey}
                      setOpenAiKey={setOpenAiKey}
                      showOpenAiKey={showOpenAiKey}
                      setShowOpenAiKey={setShowOpenAiKey}
                      handleSaveApiKey={handleSaveApiKey}
                      isSaving={isSaving}
                      error={keyStore.error}
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
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
});

export default Settings;
