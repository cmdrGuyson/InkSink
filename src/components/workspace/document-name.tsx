"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FolderOpen, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDocumentManagement } from "@/hooks/use-document-management";
import { OpenDocumentsModal } from "./open-documents-modal";

interface DocumentNameProps {
  initialName?: string;
  onNameChange?: (name: string) => void;
  onSaveTitle?: (name: string) => void;
  className?: string;
}

export const DocumentName = ({
  initialName = "Untitled Document",
  onNameChange,
  onSaveTitle,
  className,
}: DocumentNameProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [documentName, setDocumentName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    createNewDocument,
    openDocument,
    openDocumentsModal,
    closeDocumentsModal,
    isOpenDocumentsModalOpen,
    documents,
    isCreatingDocument,
    isLoadingDocuments,
  } = useDocumentManagement();

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
    const newName = e.target.value;
    setDocumentName(newName);
    if (onNameChange) {
      onNameChange(newName);
    }
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    if (onSaveTitle) {
      onSaveTitle(documentName);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      if (onSaveTitle) {
        onSaveTitle(documentName);
      }
    } else if (e.key === "Escape") {
      setDocumentName(initialName);
      setIsEditing(false);
    }
  };

  return (
    <>
      <div className={cn("border-b bg-muted/30 shrink-0", className)}>
        {/* Row 1: Buttons (mobile stacked at top, desktop right-aligned) */}
        <div className="grid grid-cols-2 gap-2 px-3 py-2 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-full justify-center text-xs"
            onClick={openDocumentsModal}
          >
            <FolderOpen className="h-3 w-3 mr-2" />
            Open Recent
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-full justify-center text-xs"
            onClick={createNewDocument}
            disabled={isCreatingDocument}
          >
            <FileText className="h-3 w-3 mr-2" />
            {isCreatingDocument ? "Creating..." : "New Document"}
          </Button>
        </div>

        {/* Divider between buttons and title (mobile only) */}
        <div className="h-px w-full bg-border md:hidden" />

        {/* Row 2: Breadcrumb + Title (mobile full row, desktop left side) */}
        <div className="flex items-center justify-center md:justify-between gap-2 px-5 h-10">
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
                className="h-8 px-2 text-sm font-medium border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-ring text-center md:text-left"
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

          {/* Desktop buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={openDocumentsModal}
            >
              <FolderOpen className="h-3 w-3" />
              Open Recent
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={createNewDocument}
              disabled={isCreatingDocument}
            >
              <FileText className="h-3 w-3" />
              {isCreatingDocument ? "Creating..." : "New Document"}
            </Button>
          </div>
        </div>
      </div>

      <OpenDocumentsModal
        isOpen={isOpenDocumentsModalOpen}
        onClose={closeDocumentsModal}
        onOpenDocument={openDocument}
        documents={documents}
        loading={isLoadingDocuments}
      />
    </>
  );
};
