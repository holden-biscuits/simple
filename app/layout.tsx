import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { HashAnchorSync } from "./components/hash-anchor-sync";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const incoming = await headers();
  const host = incoming.get("x-forwarded-host") ?? incoming.get("host") ?? "teamsimple-events-fieldbook.holden165736.chatgpt.site";
  const protocol = incoming.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const image = new URL("/og-2026-2027.png", `${protocol}://${host}`).toString();
  return {
    title: "TeamSimple Event Basecamp",
    description: "Dates, owners, plans, and follow-up for TeamSimple events.",
    openGraph: {
      title: "TeamSimple Event Basecamp · 2026–2027",
      description: "Luck is what happens when preparation meets opportunity.",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: "TeamSimple Event Basecamp · 2026–2027",
      description: "Luck is what happens when preparation meets opportunity.",
      images: [image],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <HashAnchorSync />
        {children}
      </body>
    </html>
  );
}
