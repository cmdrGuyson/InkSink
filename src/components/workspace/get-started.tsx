"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FolderOpen, FileText } from "lucide-react";
import { observer } from "mobx-react-lite";
import { useDocumentManagement } from "@/hooks/use-document-management";
import { OpenDocumentsModal } from "./open-documents-modal";

export const GetStarted = observer(() => {
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

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-sm shadow-lg">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-lg font-semibold font-mono">
              Welcome to InkSink
            </CardTitle>
            <CardDescription className="text-sm">
              Start writing or open an existing document to continue your work
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pb-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-9 text-sm"
              onClick={openDocumentsModal}
            >
              <FolderOpen className="h-3 w-3 mr-2" />
              Open Recent Document
            </Button>
            <Button
              size="sm"
              className="w-full h-9 text-sm"
              onClick={createNewDocument}
              disabled={isCreatingDocument}
            >
              <FileText className="h-3 w-3 mr-2" />
              {isCreatingDocument ? "Creating..." : "Create New Document"}
            </Button>
          </CardContent>
        </Card>
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
});
