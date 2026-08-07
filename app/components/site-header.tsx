import Link from "next/link";
import Image from "next/image";
import { siteStatus } from "../data/site-status";

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
      <Link href="/" className="brand" aria-label="TeamSimple Event Basecamp home" title="Go to the Event Basecamp home page">
        <span className="brand-mark" aria-hidden="true"><Image src="/simple-mark.svg" width={19} height={24} alt="" /></span>
        <span className="brand-copy"><strong>TeamSimple</strong><small>Event Basecamp&nbsp;·&nbsp;2026–27</small></span>
      </Link>
      <time className="updated-stamp" dateTime={siteStatus.contentUpdatedAt} aria-label={`Last updated ${siteStatus.contentUpdatedLabel}`}>
        <span>Last updated</span>
        <strong>{siteStatus.contentUpdatedLabel}</strong>
      </time>
      <nav aria-label="Primary navigation">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className={label === "Events" ? "events-nav-link" : label === "Search" ? "search-nav-link" : undefined}>{label}</Link>
        ))}
      </nav>
    </header>
  );
}
