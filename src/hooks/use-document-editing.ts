import { useState, useEffect, useCallback, useRef } from "react";
import { Content } from "@tiptap/react";
import { documentStore } from "@/stores/document.store";
import { toast } from "sonner";
import { autorun } from "mobx";

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
  const titleSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Load document when documentId changes
  useEffect(() => {
    if (documentId) {
      documentStore.getDocumentById(documentId);
    }
  }, [documentId]);

  // Update local state when selected document changes using MobX autorun
  useEffect(() => {
    const disposer = autorun(() => {
      const selectedDocument = documentStore.selectedDocument;
      if (selectedDocument && selectedDocument.id === documentId) {
        setTitle(selectedDocument.title);
        // Parse content if it exists, otherwise use empty content
        if (selectedDocument.content) {
          try {
            const parsedContent = JSON.parse(selectedDocument.content);
            setContent(parsedContent);
          } catch {
            // If content is not valid JSON, treat it as plain text
            setContent({
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: selectedDocument.content }],
                },
              ],
            });
          }
        } else {
          setContent(undefined);
        }
        setHasUnsavedChanges(false);
      }
    });

    return () => disposer();
  }, [documentId]);

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
            content: JSON.stringify(newContent),
          });
          setHasUnsavedChanges(false);
        } catch (error) {
          console.error("Failed to save content:", error);
          toast.error("Failed to save document. Please try again.");
        } finally {
          setIsSaving(false);
        }
      }, 1000); // 1 second debounce
    },
    [documentId]
  );

  // Debounced save function for title
  const debouncedSaveTitle = useCallback(
    (newTitle: string) => {
      if (!documentId) return;

      // Clear existing timeout
      if (titleSaveTimeoutRef.current) {
        clearTimeout(titleSaveTimeoutRef.current);
      }

      // Set new timeout
      titleSaveTimeoutRef.current = setTimeout(async () => {
        try {
          setIsSaving(true);
          await documentStore.updateDocument(documentId, {
            title: newTitle,
          });
          setHasUnsavedChanges(false);
        } catch (error) {
          console.error("Failed to save title:", error);
          toast.error("Failed to save document title. Please try again.");
        } finally {
          setIsSaving(false);
        }
      }, 500); // 500ms debounce for title (faster than content)
    },
    [documentId]
  );

  // Handle content changes
  const handleContentChange = useCallback(
    (newContent: Content) => {
      setContent(newContent);
      setHasUnsavedChanges(true);
      debouncedSaveContent(newContent);
    },
    [debouncedSaveContent]
  );

  // Handle title changes
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setTitle(newTitle);
      setHasUnsavedChanges(true);
      debouncedSaveTitle(newTitle);
    },
    [debouncedSaveTitle]
  );

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (contentSaveTimeoutRef.current) {
        clearTimeout(contentSaveTimeoutRef.current);
      }
      if (titleSaveTimeoutRef.current) {
        clearTimeout(titleSaveTimeoutRef.current);
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
  };
};
