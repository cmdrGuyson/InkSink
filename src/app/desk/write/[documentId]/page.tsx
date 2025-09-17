import { Workspace } from "@/components/workspace";

interface PageProps {
  params: Promise<{
    documentId: string;
  }>;
}

const MainApp = async ({ params }: PageProps) => {
  const { documentId } = await params;

  return (
    <div className="flex-1 overflow-hidden px-0 py-0 md:px-24 md:py-12 h-full">
      <Workspace documentId={documentId} />
    </div>
  );
};

export default MainApp;
