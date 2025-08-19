"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Search, Plus, MessageSquare } from "lucide-react";
import { observer } from "mobx-react-lite";
import { useStores } from "@/providers/store.provider";
import { toast } from "sonner";
import { Prompt } from "@/services/prompt.service";

interface PromptLibraryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (content: string) => void;
}

export const PromptLibraryDialog = observer(
  ({ isOpen, onClose, onSelectPrompt }: PromptLibraryDialogProps) => {
    const { promptStore } = useStores();
    const [searchQuery, setSearchQuery] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newPrompt, setNewPrompt] = useState({
      title: "",
      description: "",
      content: "",
    });

    const filteredPrompts = useMemo(() => {
      if (!searchQuery.trim()) return promptStore.prompts;
      return promptStore.prompts.filter(
        (prompt) =>
          prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prompt.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          prompt.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [promptStore.prompts, searchQuery]);

    const formatRelativeDate = (dateString: string) => {
      try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

        if (diffInDays > 0) {
          return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
        } else if (diffInHours > 0) {
          return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
        } else if (diffInMinutes > 0) {
          return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
        } else {
          return "Just now";
        }
      } catch {
        return "Unknown";
      }
    };

    const handleCreatePrompt = async () => {
      if (!newPrompt.title.trim() || !newPrompt.content.trim()) {
        toast.error("Title and content are required");
        return;
      }

      try {
        await promptStore.createPrompt({
          title: newPrompt.title,
          description: newPrompt.description,
          content: newPrompt.content,
        });

        toast.success("Prompt created successfully");
        setNewPrompt({ title: "", description: "", content: "" });
        setShowCreateForm(false);
      } catch {
        toast.error("Failed to create prompt");
      }
    };

    const handleSelectPrompt = (prompt: Prompt) => {
      onSelectPrompt(prompt.content);
      onClose();
    };

    const handleClose = () => {
      setShowCreateForm(false);
      setNewPrompt({ title: "", description: "", content: "" });
      setSearchQuery("");
      onClose();
    };

    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Prompt Library
            </DialogTitle>
            <DialogDescription>
              Select a prompt to use in your chat or create a new one
            </DialogDescription>
          </DialogHeader>

          {!showCreateForm ? (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search prompts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    New Prompt
                  </Button>
                </div>

                <div className="space-y-0 max-h-80 overflow-y-auto">
                  {promptStore.loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : filteredPrompts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>
                        {searchQuery
                          ? "No prompts match your search"
                          : "No prompts found"}
                      </p>
                      <p className="text-sm">
                        {searchQuery
                          ? "Try a different search term"
                          : "Create your first prompt to get started"}
                      </p>
                    </div>
                  ) : (
                    filteredPrompts.map((prompt, index) => (
                      <div
                        key={prompt.id}
                        className={`cursor-pointer hover:bg-accent/50 transition-colors px-3 py-3 ${
                          index !== filteredPrompts.length - 1
                            ? "border-b border-border/50"
                            : ""
                        }`}
                        onClick={() => handleSelectPrompt(prompt)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">
                              {prompt.title}
                            </h3>
                            {prompt.description && (
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {prompt.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  Created{" "}
                                  {formatRelativeDate(prompt.created_at)}
                                </span>
                              </div>
                              {prompt.updated_at && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    Updated{" "}
                                    {formatRelativeDate(prompt.updated_at)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <MessageSquare className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter prompt title..."
                    value={newPrompt.title}
                    onChange={(e) =>
                      setNewPrompt((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    placeholder="Enter prompt description..."
                    value={newPrompt.description}
                    onChange={(e) =>
                      setNewPrompt((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter prompt content..."
                    value={newPrompt.content}
                    onChange={(e) =>
                      setNewPrompt((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    autoResize
                    minRows={6}
                    maxRows={20}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreatePrompt}>Create Prompt</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  }
);
