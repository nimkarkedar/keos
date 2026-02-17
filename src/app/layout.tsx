import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KEOS - Repurpose Content",
  description:
    "Upload your podcast transcript and instantly repurpose it into learnings, Q&As, and more. Powered by Claude.",
  keywords: ["KEOS", "repurpose content", "podcast transcript", "The Gyaan Project", "content generation", "Claude AI"],
  openGraph: {
    title: "KEOS - Repurpose Content",
    description: "Upload your podcast transcript and instantly repurpose it into learnings, Q&As, and more.",
    siteName: "KEOS",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "KEOS - Repurpose Content",
    description: "Upload your podcast transcript and instantly repurpose it into learnings, Q&As, and more.",
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
        {children}
      </body>
    </html>
  );
}
