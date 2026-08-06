import Link from "next/link";

const links = [
  ["Events", "/#events"],
  ["Guides", "/guides"],
  ["AEs", "/ae"],
  ["SDRs", "/sdr"],
  ["Marketing", "/marketing"],
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="Events Hub home">
        <span className="brand-mark"><span>TS</span><b>▲</b></span>
        <span>Event Basecamp <small>2026</small></span>
      </Link>
      <nav aria-label="Primary navigation">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className={label === "Events" ? "events-nav-link" : undefined}>{label}</Link>
        ))}
      </nav>
    </header>
  );
}
