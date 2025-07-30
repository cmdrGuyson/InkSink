import { Header } from "@/components/header";
import { Workspace } from "@/components/workspace";

const MainApp = () => {
  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 overflow-hidden px-24 py-12">
        <Workspace />
      </div>
    </div>
  );
};

export default MainApp;
