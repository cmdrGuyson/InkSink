"use client";

import { MinimalTiptapEditor } from "../ui/minimal-tiptap";
import { DocumentName } from "./document-name";
import type { Editor as TiptapEditor } from "@tiptap/react";
import { observer } from "mobx-react-lite";

interface EditorProps {
  documentId?: string;
  editor: TiptapEditor | null;
  title: string;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  isLoading: boolean;
  error: string | null;
  onTitleChange: (newTitle: string) => void;
}

const Editor = observer(
  ({
    editor,
    title,
    isSaving,
    hasUnsavedChanges,
    isLoading,
    error,
    onTitleChange,
  }: EditorProps) => {
    if (isLoading) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading document...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading document</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col">
        <DocumentName initialName={title} onNameChange={onTitleChange} />
        <div className="flex-1 relative">
          <MinimalTiptapEditor
            editor={editor}
            className="h-full flex flex-col border-0 shadow-none rounded-none"
            editorContentClassName="flex-1 overflow-y-auto p-5 min-h-0"
          />
          {/* Save indicator */}
          {(isSaving || hasUnsavedChanges) && (
            <div className="absolute top-2 right-2 flex items-center space-x-1 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm border text-xs">
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-2 w-2 border-b border-blue-600"></div>
                  <span className="text-gray-500">Saving</span>
                </>
              ) : (
                <span className="text-gray-500">Unsaved changes</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default Editor;
