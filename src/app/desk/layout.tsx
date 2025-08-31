import { Header } from "@/components/header";
import { StoreProvider } from "@/providers/store.provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StoreProvider>
      <div className="h-screen flex flex-col bg-background">
        {/* Small screen warning - hidden on screens >= 1200px */}
        <div className="max-[1200px]:flex min-[1200px]:hidden flex-col items-center justify-center h-full p-6 text-center">
          <div className="max-w-md space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground font-mono">
                {`Sorry :<`}
              </h1>
              <h2 className="text-md font-bold text-foreground font-mono">
                InkSink does not currently work on small screens
              </h2>
              <p className="text-muted-foreground mt-4">
                Please use a larger screen to access the full InkSink
                experience.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/">Go Back Home</Link>
            </Button>
          </div>
        </div>

        {/* Desktop layout - hidden on screens < 1200px */}
        <div className="min-[1200px]:flex max-[1200px]:hidden flex-col h-full">
          <Header />
          <div className="flex-1 overflow-hidden">{children}</div>
        </div>
      </div>
    </StoreProvider>
  );
}
