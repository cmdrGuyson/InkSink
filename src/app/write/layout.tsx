import { Header } from "@/components/header";
import { AuthProvider } from "../../providers/auth.provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <div className="h-screen flex flex-col bg-background">
        <Header />
        {children}
      </div>
    </AuthProvider>
  );
}
