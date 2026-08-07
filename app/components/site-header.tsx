import Link from "next/link";
import Image from "next/image";
import { Fragment } from "react";
import { siteStatus } from "../data/site-status";
import { SiteNav } from "./site-nav";

export function SiteHeader() {
  return (
    <Fragment>
      <header className="site-header">
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Link href="/" className="brand" aria-label="TeamSimple Event Basecamp home" title="Go to the Event Basecamp home page">
          <span className="brand-mark" aria-hidden="true"><Image src="/simple-mark.svg" width={19} height={24} alt="" /></span>
          <span className="brand-copy"><strong>TeamSimple</strong><small>Event Basecamp&nbsp;·&nbsp;2026–27</small></span>
        </Link>
        <time className="updated-stamp" dateTime={siteStatus.contentUpdatedAt} aria-label={`Last updated ${siteStatus.contentUpdatedLabel}`}>
          <span>Last updated</span>
          <strong>{siteStatus.contentUpdatedLabel}</strong>
        </time>
        <SiteNav />
      </header>
      <span id="main-content" className="content-start" tabIndex={-1} />
    </Fragment>
  );
}
