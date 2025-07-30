"use client";

import { useState } from "react";
import { MinimalTiptapEditor } from "../ui/minimal-tiptap";
import { Content } from "@tiptap/react";
import { DocumentName } from "./document-name";

const Editor = () => {
  const [value, setValue] = useState<Content>("");
  const [documentName, setDocumentName] = useState("Untitled Document");

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
};

export default Editor;
