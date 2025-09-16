import { useState, useEffect, useCallback, useRef } from "react";
import { Content } from "@tiptap/react";
import { documentStore } from "@/stores/document.store";
import { toast } from "sonner";
import Logger from "@/lib/logger";

interface UseDocumentEditingProps {
  documentId?: string;
}

export const useDocumentEditing = ({ documentId }: UseDocumentEditingProps) => {
  const [content, setContent] = useState<Content>();
  const [title, setTitle] = useState("Untitled Document");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Debounce refs
  const contentSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const loadDocument = useCallback(async () => {
    if (!documentId) {
      return;
    }
    const document = await documentStore.getDocumentById(documentId);
    if (!document) {
      return;
    }

    setTitle(document.title);
    setContent(document.content);
  }, [documentId]);

  // Load document when documentId changes
  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  // Debounced save function for content
  const debouncedSaveContent = useCallback(
    (newContent: Content) => {
      if (!documentId) return;

      // Clear existing timeout
      if (contentSaveTimeoutRef.current) {
        clearTimeout(contentSaveTimeoutRef.current);
      }

      // Set new timeout
      contentSaveTimeoutRef.current = setTimeout(async () => {
        try {
          setIsSaving(true);
          await documentStore.updateDocument(documentId, {
            content: newContent as string,
          });
          setHasUnsavedChanges(false);
        } catch (error) {
          Logger.error("Failed to save content", error, {
            documentId,
            action: "save_document_content",
          });
          toast.error("Failed to save document. Please try again.");
        } finally {
          setIsSaving(false);
        }
      }, 1000);
    },
    [documentId]
  );

  // Immediate save function for title (called on blur)
  const saveTitleImmediately = useCallback(
    async (newTitle: string) => {
      if (!documentId) return;

      try {
        setIsSaving(true);
        await documentStore.updateDocument(documentId, {
          title: newTitle,
        });
        setHasUnsavedChanges(false);
      } catch (error) {
        Logger.error("Failed to save title", error, {
          documentId,
          title: newTitle,
          action: "save_document_title",
        });
        toast.error("Failed to save document title. Please try again.");
      } finally {
        setIsSaving(false);
      }
    },
    [documentId]
  );

  // Handle content changes
  const handleContentChange = useCallback(
    (newContent: Content) => {
      setHasUnsavedChanges(true);
      debouncedSaveContent(newContent);
    },
    [debouncedSaveContent]
  );

  // Handle title changes (only updates local state, doesn't save)
  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    setHasUnsavedChanges(true);
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (contentSaveTimeoutRef.current) {
        clearTimeout(contentSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    content,
    title,
    isSaving,
    hasUnsavedChanges,
    isLoading: documentStore.loadingSelectedDocument,
    error: documentStore.error,

    // Actions
    handleContentChange,
    handleTitleChange,
    saveTitleImmediately,
  };
};
