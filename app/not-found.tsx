import Link from "next/link";
import { Footer } from "./components/footer";
import { SiteHeader } from "./components/site-header";

export default function NotFoundPage() {
  return (
    <main id="page-top" className="not-found-page">
      <SiteHeader />
      <section className="not-found-hero">
        <div className="not-found-code" aria-hidden="true"><span>4</span><b>0</b><span>4</span></div>
        <div>
          <p className="eyebrow">Page not found</p>
          <h1>That page isn’t in the fieldbook.</h1>
          <p className="lede">The link may be old, or the event name may have changed. Search the full fieldbook or return to the event directory.</p>
          <div className="not-found-actions">
            <Link className="button" href="/search">Search the fieldbook <span>↗</span></Link>
            <Link className="not-found-secondary" href="/#events">Browse every event →</Link>
          </div>
        </div>
      </section>
      <section className="shell not-found-routes" aria-label="Useful destinations">
        <Link href="/#events"><span>Event brief</span><h2>Find the dates, team, plan, and links.</h2><b>Open events →</b></Link>
        <Link href="/guides"><span>Standard process</span><h2>Check the planning and onsite rules.</h2><b>Open guides →</b></Link>
        <Link href="/sources"><span>Data question</span><h2>See what changed and where to update it.</h2><b>Open sources →</b></Link>
      </section>
      <Footer />
    </main>
  );
}
