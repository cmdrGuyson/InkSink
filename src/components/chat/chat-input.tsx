"use client";

import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SendHorizonal, Library, Palette } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Types
interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: (message: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  creditCount: number;
  onPromptLibraryOpen: () => void;
}

// Text Input Area Component
const TextInputArea = ({
  input,
  setInput,
  onKeyPress,
  isLoading,
}: {
  input: string;
  setInput: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
}) => (
  <div className="mb-3">
    <Textarea
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyPress={onKeyPress}
      placeholder="Type your message..."
      className="border-0 p-0 h-auto min-h-[24px] focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent shadow-none"
      autoResize
      minRows={2}
      maxRows={16}
      disabled={isLoading}
    />
  </div>
);

// Action Buttons Component
const ActionButtons = ({
  onPromptLibraryOpen,
}: {
  onPromptLibraryOpen: () => void;
}) => (
  <div className="flex items-center">
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-7 px-2 text-xs"
      onClick={onPromptLibraryOpen}
    >
      <Library className="h-3 w-3 mr-1" />
      Prompt Library
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-7 px-2 text-xs"
      onClick={() => toast.info("This feature will be available soon")}
    >
      <Palette className="h-3 w-3 mr-1" />
      Style
    </Button>
  </div>
);

// Send Button Component
const SendButton = ({
  input,
  isLoading,
  creditCount,
}: {
  input: string;
  isLoading: boolean;
  creditCount: number;
}) => {
  const isDisabled = !input.trim() || isLoading || creditCount < 1;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-block">
          <Button
            type="submit"
            disabled={isDisabled}
            size="icon"
            className="h-8 w-8 rounded-full"
          >
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {creditCount < 1 ? (
          <p>You do not have any remaining credits</p>
        ) : (
          <p>Send message</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
};

// Action Bar Component
const ActionBar = ({
  input,
  isLoading,
  creditCount,
  onPromptLibraryOpen,
}: {
  input: string;
  isLoading: boolean;
  creditCount: number;
  onPromptLibraryOpen: () => void;
}) => (
  <div className="flex items-center justify-between text-muted-foreground text-sm">
    <ActionButtons onPromptLibraryOpen={onPromptLibraryOpen} />
    <SendButton input={input} isLoading={isLoading} creditCount={creditCount} />
  </div>
);

// Main Chat Input Component
export const ChatInput = ({
  input,
  setInput,
  onSendMessage,
  onKeyPress,
  isLoading,
  creditCount,
  onPromptLibraryOpen,
}: ChatInputProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && creditCount >= 1) {
      onSendMessage(input);
      setInput("");
    }
  };

  return (
    <div className="p-4 bg-background">
      <form
        onSubmit={handleSubmit}
        className="relative border rounded-lg p-3 bg-background"
      >
        <TextInputArea
          input={input}
          setInput={setInput}
          onKeyPress={onKeyPress}
          isLoading={isLoading}
        />
        <ActionBar
          input={input}
          isLoading={isLoading}
          creditCount={creditCount}
          onPromptLibraryOpen={onPromptLibraryOpen}
        />
      </form>
    </div>
  );
};
