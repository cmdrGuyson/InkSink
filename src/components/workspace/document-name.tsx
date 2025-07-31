"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FolderOpen, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentNameProps {
  initialName?: string;
  onNameChange?: (name: string) => void;
  className?: string;
}

export const DocumentName = ({
  initialName = "Untitled Document",
  onNameChange,
  className,
}: DocumentNameProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [documentName, setDocumentName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocumentName(e.target.value);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    if (onNameChange) {
      onNameChange(documentName);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      if (onNameChange) {
        onNameChange(documentName);
      }
    } else if (e.key === "Escape") {
      setDocumentName(initialName);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 px-5 h-10 border-b bg-muted/30 shrink-0",
        className
      )}
    >
      <div className="flex items-center">
        <span className="text-sm text-muted-foreground font-medium">
          Writes
        </span>
        <span className="text-sm text-muted-foreground font-medium mx-1">
          /
        </span>
        {isEditing ? (
          <Input
            ref={inputRef}
            value={documentName}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className="h-8 px-2 text-sm font-medium border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Enter document name..."
          />
        ) : (
          <span
            className="text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors px-2 py-1 rounded hover:bg-muted/50"
            onDoubleClick={handleDoubleClick}
          >
            {documentName}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => {
            // Handle open document functionality
            console.log("Open document clicked");
          }}
        >
          <FolderOpen className="h-3 w-3" />
          Open Recent
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => {
            // Handle new document functionality
            console.log("New document clicked");
          }}
        >
          <FileText className="h-3 w-3" />
          New Document
        </Button>
      </div>
    </div>
  );
};
