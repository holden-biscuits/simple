import Link from "next/link";

const links = [
  ["Events", "/#events"],
  ["Guides", "/guides"],
  ["AEs", "/ae"],
  ["SDRs", "/sdr"],
  ["Marketing", "/marketing"],
  ["Search", "/search"],
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="Events Hub home">
        <span className="brand-mark"><span>Team<br />Simple</span><b>▲</b></span>
        <span>Event Basecamp <small>2026</small></span>
      </Link>
      <time className="updated-stamp" dateTime="2026-08-06" aria-label="Last updated August 6, 2026">
        <span>Last updated</span>
        <strong>Aug 06 · 2026</strong>
      </time>
      <nav aria-label="Primary navigation">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className={label === "Events" ? "events-nav-link" : label === "Search" ? "search-nav-link" : undefined}>{label}</Link>
        ))}
      </nav>
    </header>
  );
}
