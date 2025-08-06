"use client";

import Editor from "./editor";
import type { Editor as TiptapEditor } from "@tiptap/react";

interface LeftPanelProps {
  documentId?: string;
  editor: TiptapEditor | null;
  title: string;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  isLoading: boolean;
  error: string | null;
  onTitleChange: (newTitle: string) => void;
}

export const LeftPanel = ({
  documentId,
  editor,
  title,
  isSaving,
  hasUnsavedChanges,
  isLoading,
  error,
  onTitleChange,
}: LeftPanelProps) => {
  return (
    <div className="h-full">
      <Editor
        documentId={documentId}
        editor={editor}
        title={title}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        isLoading={isLoading}
        error={error}
        onTitleChange={onTitleChange}
      />
    </div>
  );
};
