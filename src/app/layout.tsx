import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import "./globals.css";
import ChatbotWidget from "@/components/ChatbotWidget";
import SiteVisitTracker from "@/components/SiteVisitTracker";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-ubuntu",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const socialImagePath = "/images/profile/profile.jpeg";
const socialTitle = "JasonD";
const socialDescription =
  "Jasond Delos Santos | Python Developer • Data Engineer • Automation Builder";

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: socialTitle,
  description: socialDescription,
  icons: {
    icon: "/favicon.ico?v=2",
    shortcut: "/favicon.ico?v=2",
    apple: "/apple-icon.png?v=2",
  },
  openGraph: {
    title: socialTitle,
    description: socialDescription,
    type: "website",
    url: siteUrl || "/",
    images: [
      {
        url: socialImagePath,
        width: 1200,
        height: 630,
        alt: "Jasond Delos Santos profile photo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: socialDescription,
    images: [socialImagePath],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${ubuntu.variable} min-h-screen antialiased`}>
        {children}
        <SiteVisitTracker />
        <ChatbotWidget />
      </body>
    </html>
  );
}
