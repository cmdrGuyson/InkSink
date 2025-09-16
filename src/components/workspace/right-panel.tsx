import { Chat } from "@/components/chat";
import type { Editor as TiptapEditor } from "@tiptap/react";

interface RightPanelProps {
  documentId?: string;
  editor: TiptapEditor | null;
}

export const RightPanel = ({ documentId, editor }: RightPanelProps) => {
  return (
    <div className="h-full bg-background ">
      <Chat documentId={documentId} editor={editor} />
    </div>
  );
};
