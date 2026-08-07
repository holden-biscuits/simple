import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../components/site-header";
import { Footer } from "../components/footer";
import { BackToTop, PageContents } from "../components/page-contents";
import { events, sourceLinks } from "../data/events";
import { siteStatus } from "../data/site-status";

export const metadata: Metadata = {
  title: "About this site’s sources · Event Basecamp",
  description: "What controls the TeamSimple event data, what the recurring scan checks, and which conflicts need a decision.",
};

export default function SourcesPage() {
  const conflicts = events.filter((event) => event.notes.toLowerCase().startsWith("source conflict:"));
  const monitor = siteStatus.sourceMonitor;

  return (
    <main id="page-top">
      <SiteHeader />
      <section className="role-hero sources-hero">
        <p className="eyebrow">About this site’s sources</p>
        <h1>Where the event data comes from.</h1>
        <p className="lede">See what controls the site, what the recurring scan checks, and which disagreements still need a decision.</p>
      </section>
      <PageContents items={[
        { id: "source-monitor", label: "Source monitor" },
        { id: "approval-queue", label: "Approval queue" },
        { id: "source-hierarchy", label: "Source hierarchy" },
        { id: "update-rules", label: "Update rules" },
        { id: "source-files", label: "Open source files" },
      ]} />

      <section className="shell source-monitor" id="source-monitor">
        <div className="section-intro">
          <p className="eyebrow">Source monitor</p>
          <h2>What gets checked.</h2>
          <p>The recurring review is active. Connected means this task can read the source; it does not mean every record is complete or current.</p>
        </div>
        <div className="monitor-summary">
          <article><span>Automation</span><strong>{monitor.automationState}{monitor.lastSuccessfulScan ? "" : " · first run pending"}</strong></article>
          <article><span>Cadence</span><strong>{monitor.cadence}</strong></article>
          <article><span>Delivery</span><strong>{monitor.delivery}</strong></article>
          <article><span>Last connection check</span><strong>{monitor.connectionCheckedLabel}</strong></article>
        </div>
        <div className="source-coverage">
          {monitor.sources.map((source) => <article key={source.name}>
            <div><span className={`source-state source-state-${source.state.toLowerCase()}`}>{source.state}</span><small>{source.system}</small></div>
            <h3>{source.name}</h3>
            <p>{source.use}</p>
          </article>)}
        </div>
        <div className="source-checks" aria-label="Latest source checks">
          <p className="eyebrow">Latest applied checks</p>
          {monitor.latestChecks.map((check) => <article key={`${check.system}-${check.checkedAt}-${check.scope}`}>
            <div><strong>{check.system}</strong><span>{check.checkedAt}</span></div>
            <p>{check.scope}</p>
            <p>{check.result}</p>
          </article>)}
        </div>
        <p className="scan-receipt">{monitor.lastSuccessfulScan ? `Last completed scan: ${monitor.lastSuccessfulScan}` : "The recurring scan is scheduled, but it has not completed its first run. The checks above were completed manually while building the fieldbook; the first successful recurring run will add its own receipt here."}</p>
        <BackToTop />
      </section>

      <section className="approval-queue" id="approval-queue">
        <div className="shell">
          <div className="section-intro">
            <p className="eyebrow">Approval queue</p>
            <h2>Conflicts the site will not guess through.</h2>
            <p>When authoritative sources disagree, the conservative value stays in place until the records are reconciled.</p>
          </div>
          {conflicts.length ? <div className="conflict-list">{conflicts.map((event, index) => <Link href={`/events/${event.slug}`} key={event.slug}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div><h3>{event.name}</h3><p>{event.notes.replace(/^Source conflict:\s*/i, "")}</p></div>
            <b aria-hidden="true">↗</b>
          </Link>)}</div> : <p className="empty-state">No unresolved source conflicts are recorded.</p>}
          <BackToTop />
        </div>
      </section>

      <section className="shell guide-layout sources-layout">
        <article className="guide-panel source-order" id="source-hierarchy">
          <p className="eyebrow">Source hierarchy</p>
          <h2>Use the right source.</h2>
          <ol>
            <li><strong>Conference tracker</strong><span>Controls the event roster, dates, status and topline staffing.</span></li>
            <li><strong>Events in Notion</strong><span>Controls execution detail for active event projects.</span></li>
            <li><strong>Events Drive</strong><span>Stores contracts, creative, attendee files and post-event artifacts.</span></li>
            <li><strong>HubSpot</strong><span>Controls event-attributed meetings, demos, deals and pipeline when the source fields are complete.</span></li>
            <li><strong>Slack and Gmail</strong><span>Supply new signals. A message does not override the tracker or Notion until the decision is confirmed.</span></li>
            <li><strong>Event page</strong><span>Publishes the reconciled view and links back to the working sources.</span></li>
          </ol>
          <div className="update-rules" id="update-rules">
            <div><span>Applied automatically</span><p>Direct, high-confidence changes supported by the controlling source: dates, venue details, confirmed deliverables, named owners and clearly attributed outcomes.</p></div>
            <div><span>Held for review</span><p>Conflicting participation status, ambiguous staffing, unattributed CRM activity, uncertain meeting counts, or a decision found only in conversation.</p></div>
            <div><span>Run receipt</span><p>Each scan reports the sources checked, the old and new values for applied changes, links to supporting evidence, and the items still waiting for a decision.</p></div>
          </div>
          <div className="source-links vertical" id="source-files">
            <a href={sourceLinks.sheet} target="_blank" rel="noreferrer">Open tracker ↗</a>
            <a href={sourceLinks.notion} target="_blank" rel="noreferrer">Open Notion ↗</a>
            <a href={sourceLinks.eventsDrive} target="_blank" rel="noreferrer">Open Events Drive ↗</a>
            <a href={sourceLinks.ccwPlan} target="_blank" rel="noreferrer">Open Vegas reference ↗</a>
          </div>
          <BackToTop />
        </article>
      </section>
      <Footer />
    </main>
  );
}
