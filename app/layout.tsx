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
  const host = incoming.get("x-forwarded-host") ?? incoming.get("host") ?? "event-basecamp-demo.example.com";
  const protocol = incoming.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = new URL(`${protocol}://${host}`);
  const image = new URL("/og-2026-2027.png", origin).toString();
  return {
    metadataBase: origin,
    title: "TeamSimple Event Basecamp · Public Demo",
    description: "A public product demo using synthetic event operations data.",
    alternates: { canonical: "/" },
    openGraph: {
      title: "TeamSimple Event Basecamp · Public Demo",
      description: "Explore the event-operations workflow with safe, synthetic records.",
      url: "/",
      siteName: "TeamSimple Event Basecamp",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: "TeamSimple Event Basecamp · Public Demo",
      description: "Explore the event-operations workflow with safe, synthetic records.",
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
