import { Chat } from "./chat";

interface RightPanelProps {
  documentId?: string;
}

export const RightPanel = ({ documentId }: RightPanelProps) => {
  return (
    <div className="h-full bg-background ">
      <Chat documentId={documentId} />
    </div>
  );
};
