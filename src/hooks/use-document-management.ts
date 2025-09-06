import { useState } from "react";
import { useRouter } from "next/navigation";
import { documentStore } from "@/stores/document.store";
import { toast } from "sonner";
import { useLogger } from "@/hooks/use-logger";

export const useDocumentManagement = () => {
  const router = useRouter();
  const { logError } = useLogger();
  const [isOpenDocumentsModalOpen, setIsOpenDocumentsModalOpen] =
    useState(false);
  const [isCreatingDocument, setIsCreatingDocument] = useState(false);

  const createNewDocument = async () => {
    try {
      setIsCreatingDocument(true);
      const newDocument = await documentStore.createDocument({
        title: "Untitled Document",
        content: "",
      });

      if (newDocument) {
        router.push(`/desk/write/${newDocument.id}`);
      }
    } catch (error) {
      logError("Failed to create document", error, {
        action: "create_document",
      });
      toast.error("Failed to create document. Please try again.");
    } finally {
      setIsCreatingDocument(false);
    }
  };

  const openDocument = (documentId: string) => {
    router.push(`/desk/write/${documentId}`);
    setIsOpenDocumentsModalOpen(false);
  };

  const openDocumentsModal = () => {
    setIsOpenDocumentsModalOpen(true);
  };

  const closeDocumentsModal = () => {
    setIsOpenDocumentsModalOpen(false);
  };

  return {
    // State
    isOpenDocumentsModalOpen,
    documents: documentStore.documents,
    isCreatingDocument,
    isLoadingDocuments: documentStore.loading,

    // Actions
    createNewDocument,
    openDocument,
    openDocumentsModal,
    closeDocumentsModal,
  };
};
