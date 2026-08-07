"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Events", href: "/#events", matches: (pathname: string) => pathname === "/" || pathname.startsWith("/events/") },
  { label: "Guides", href: "/guides", matches: (pathname: string) => pathname === "/guides" },
  { label: "AEs", href: "/ae", matches: (pathname: string) => pathname === "/ae" },
  { label: "SDRs", href: "/sdr", matches: (pathname: string) => pathname === "/sdr" },
  { label: "Marketing", href: "/marketing", matches: (pathname: string) => pathname === "/marketing" },
  { label: "Leaders", href: "/leadership", matches: (pathname: string) => pathname === "/leadership" },
  { label: "Search", href: "/search", matches: (pathname: string) => pathname === "/search" },
] as const;

export function SiteNav() {
  const pathname = usePathname();
  return <nav aria-label="Primary navigation">
    {links.map((item) => {
      const current = item.matches(pathname);
      const className = [item.label === "Events" ? "events-nav-link" : "", item.label === "Search" ? "search-nav-link" : "", current ? "is-current" : ""].filter(Boolean).join(" ") || undefined;
      return <Link key={item.href} href={item.href} className={className} aria-current={current ? "page" : undefined}>{item.label}</Link>;
    })}
  </nav>;
}
