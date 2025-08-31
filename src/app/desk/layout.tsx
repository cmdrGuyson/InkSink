import { Header } from "@/components/header";
import { StoreProvider } from "@/providers/store.provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StoreProvider>
      <div className="h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </StoreProvider>
  );
}
