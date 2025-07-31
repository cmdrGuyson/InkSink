"use client";

import Editor from "./editor";

interface LeftPanelProps {
  documentId?: string;
}

export const LeftPanel = ({ documentId }: LeftPanelProps) => {
  return (
    <div className="h-full">
      <Editor documentId={documentId} />
    </div>
  );
};
