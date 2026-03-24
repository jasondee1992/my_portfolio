import type { Metadata } from "next";
import "./globals.css";
import ChatbotWidget from "@/components/ChatbotWidget";

export const metadata: Metadata = {
  title: "JasonD — Portfolio",
  description: "Jasond Delos Santos | Python Developer • Data Engineer • Automation Builder",
  icons: {
    icon: "/images/profile/profile.jpeg",
    shortcut: "/images/profile/profile.jpeg",
    apple: "/images/profile/profile.jpeg",
  },
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
