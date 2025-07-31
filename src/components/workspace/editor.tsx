"use client";

import { useState, useEffect } from "react";
import { MinimalTiptapEditor } from "../ui/minimal-tiptap";
import { Content } from "@tiptap/react";
import { DocumentName } from "./document-name";
import { documentStore } from "@/stores/document.store";
import { observer } from "mobx-react-lite";

interface EditorProps {
  documentId?: string;
}

const Editor = observer(({ documentId }: EditorProps) => {
  const [value, setValue] = useState<Content>();
  const [documentName, setDocumentName] = useState("Untitled Document");

  // Load document when documentId changes
  useEffect(() => {
    if (documentId) {
      documentStore.getDocumentById(documentId);
    }
  }, [documentId]);

  // Update document name when selected document changes
  useEffect(() => {
    if (documentStore.selectedDocument) {
      setDocumentName(documentStore.selectedDocument.title);
    }
  }, []);

  const handleDocumentNameChange = (name: string) => {
    setDocumentName(name);
    // Here you can add logic to save the document name to your backend or local storage
    console.log("Document name changed to:", name);
  };

  return (
    <div className="h-full flex flex-col">
      <DocumentName
        initialName={documentName}
        onNameChange={handleDocumentNameChange}
      />
      <MinimalTiptapEditor
        value={value}
        onChange={setValue}
        className="h-full flex flex-col border-0 shadow-none rounded-none"
        editorContentClassName="flex-1 overflow-y-auto p-5 min-h-0"
        output="html"
        placeholder="Let's start writing..."
        autofocus={true}
        editable={true}
        editorClassName="h-full"
      />
    </div>
  );
});

export default Editor;
