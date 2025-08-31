"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Save } from "lucide-react";

interface AppPreferencesProps {
  openAiKey: string;
  setOpenAiKey: (value: string) => void;
  showOpenAiKey: boolean;
  setShowOpenAiKey: (value: boolean) => void;
  handleSaveApiKey: () => void;
}

const AppPreferences = ({
  openAiKey,
  setOpenAiKey,
  showOpenAiKey,
  setShowOpenAiKey,
  handleSaveApiKey,
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

      <Button onClick={handleSaveApiKey} className="w-fit">
        <Save className="h-4 w-4 mr-2" />
        Save API Key
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

export default AppPreferences;
