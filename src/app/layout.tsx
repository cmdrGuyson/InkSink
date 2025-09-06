import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/providers/auth.provider";
import { PostHogProvider } from "@/providers/posthog.provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InkSink - The Kitchen Sink for Writing Content",
  description: "The Kitchen Sink for Writing Content",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "InkSink - The Kitchen Sink for Writing Content",
    description: "The Kitchen Sink for Writing Content",
    url: "https://inksink.com",
    siteName: "InkSink",
    images: [
      {
        url: "/og_image.png",
        width: 1200,
        height: 630,
        alt: "InkSink - The Kitchen Sink for Writing Content",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InkSink - The Kitchen Sink for Writing Content",
    description: "The Kitchen Sink for Writing Content",
    images: ["/og_image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <PostHogProvider>
            {children}
            <Toaster position="top-center" />
          </PostHogProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
