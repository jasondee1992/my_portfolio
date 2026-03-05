import type { Metadata } from "next";
import "./globals.css";
import ChatbotWidget from "@/components/ChatbotWidget";

export const metadata: Metadata = {
  title: "JasonD — Portfolio",
  description: "Jasond Delos Santos | Python Developer • Data Engineer • Automation Builder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
        <ChatbotWidget />
      </body>
    </html>
  );
}