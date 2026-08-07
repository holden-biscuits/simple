import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../components/site-header";
import { Footer } from "../components/footer";
import { BackToTop, PageContents } from "../components/page-contents";
import { events, sourceLinks } from "../data/events";
import { fieldOwners, sourceFlow, writebackQueue } from "../data/source-governance";
import { siteStatus } from "../data/site-status";

export const metadata: Metadata = {
  title: "About this site’s sources · Event Basecamp",
  description: "What controls the TeamSimple event data, what the recurring scan checks, and which conflicts need a decision.",
};

export default function SourcesPage() {
  const conflicts = events.filter((event) => event.notes.toLowerCase().startsWith("source conflict:"));
  const monitor = siteStatus.sourceMonitor;
  const changeStates = (["Applied", "Needs review", "No change"] as const).map((state) => ({
    state,
    count: monitor.changeLog.filter((change) => change.state === state).length,
  }));

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
        { id: "data-flow", label: "How data moves" },
        { id: "field-ownership", label: "Where to update" },
        { id: "writeback-queue", label: "Write-back queue" },
        { id: "protected-decisions", label: "Direct decisions" },
        { id: "change-log", label: "Change log" },
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
            <strong className="source-receipt">{source.receipt}</strong>
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

      <section className="source-governance" id="data-flow">
        <div className="shell">
          <div className="section-intro">
            <p className="eyebrow">Current data flow</p>
            <h2>A scheduled snapshot, not a live database.</h2>
            <p>The deployed site cannot read private GTM systems from a visitor’s browser. A scheduled Codex task reads the connected sources, reconciles the facts, updates a review build and waits for publication approval.</p>
          </div>
          <div className="source-flow-grid">
            {sourceFlow.map((step) => <article key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
            </article>)}
          </div>
          <p className="source-governance-note"><strong>The missing join:</strong> each system needs the same stable Event key. The fieldbook already has one in every event URL; Sheets, Notion and HubSpot do not yet share it.</p>
          <BackToTop />
        </div>
      </section>

      <section className="shell field-ownership" id="field-ownership">
        <div className="section-intro">
          <p className="eyebrow">Field ownership</p>
          <h2>Update the system that owns the fact.</h2>
          <p>The fieldbook is the place to read the whole plan. It is not the place to originate every fact.</p>
        </div>
        <div className="source-route-table-wrap">
          <table className="source-route-table">
            <thead><tr><th>Data</th><th>System of record</th><th>How it gets here</th><th>Where corrections go</th><th>Automation rule</th></tr></thead>
            <tbody>{fieldOwners.map((route) => <tr key={route.data}>
              <th scope="row">{route.data}</th>
              <td data-label="System of record">{route.owner}</td>
              <td data-label="How it gets here">{route.intake}</td>
              <td data-label="Where corrections go">{route.correction}</td>
              <td data-label="Automation rule">{route.automation}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <BackToTop />
      </section>

      <section className="writeback-section" id="writeback-queue">
        <div className="shell">
          <div className="section-intro">
            <p className="eyebrow">Write-back queue</p>
            <h2>Changes that belong upstream.</h2>
            <p>These are known mismatches or setup jobs. Nothing in this queue writes to an external system until the exact change is approved.</p>
          </div>
          <div className="writeback-grid">
            {writebackQueue.map((item) => <a href={item.url} target={item.url.startsWith("http") ? "_blank" : undefined} rel={item.url.startsWith("http") ? "noreferrer" : undefined} key={`${item.system}-${item.scope}`}>
              <header><span>{item.system}</span><b className={`writeback-state writeback-state-${item.state.toLowerCase().replaceAll(" ", "-")}`}>{item.state}</b></header>
              <h3>{item.scope}</h3>
              <p>{item.action}</p>
              <strong>Open destination ↗</strong>
            </a>)}
          </div>
          <BackToTop />
        </div>
      </section>

      <section className="shell protected-decisions" id="protected-decisions">
        <div className="section-intro">
          <p className="eyebrow">Direct decisions</p>
          <h2>Do not let stale sources undo these.</h2>
          <p>These values were confirmed directly in this task. The recurring scan keeps them in place until a newer direct correction or clearly superseding source update is recorded.</p>
        </div>
        <div className="protected-decision-grid">
          {monitor.protectedOverrides.map((override) => <Link href={`/events/${override.eventSlug}`} key={override.id}>
            <header><span>{override.field}</span><time>{override.confirmedAt}</time></header>
            <h3>{override.eventName}</h3>
            <p>{override.value}</p>
            <b>Open event →</b>
          </Link>)}
        </div>
        <BackToTop />
      </section>

      <section className="shell change-log" id="change-log">
        <div className="section-intro">
          <p className="eyebrow">Change log</p>
          <h2>What changed, and why.</h2>
          <p>Each scan leaves a structured receipt. Applied changes show the previous and published values; disagreements stay visible until a person resolves them.</p>
        </div>
        <div className="change-log-summary" aria-label="Change log status counts">
          {changeStates.map(({ state, count }) => <article key={state}><span>{state}</span><strong>{count}</strong></article>)}
        </div>
        <div className="change-log-list">
          {monitor.changeLog.map((change) => {
            const firstLabel = change.state === "Applied" ? "Before" : change.state === "Needs review" ? "Controlling source" : "Checked";
            const secondLabel = change.state === "Applied" ? "Published" : change.state === "Needs review" ? "Conflicting source" : "Result";
            return <article key={change.id} className={`change-record change-record-${change.state.toLowerCase().replace(" ", "-")}`}>
              <header><span>{change.state}</span><time>{change.checkedAt}</time></header>
              <div className="change-record-title"><p>{change.field}</p><h3>{change.title}</h3></div>
              <dl>
                <div><dt>{firstLabel}</dt><dd>{change.before}</dd></div>
                <div><dt>{secondLabel}</dt><dd>{change.after}</dd></div>
              </dl>
              <footer>
                {change.sourceUrl ? <a href={change.sourceUrl} target="_blank" rel="noreferrer">{change.source} ↗</a> : <span>{change.source}</span>}
                {change.eventSlug ? <Link href={`/events/${change.eventSlug}`}>Open event →</Link> : null}
              </footer>
            </article>;
          })}
        </div>
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
            <li><strong>Direct confirmation</strong><span>Controls explicit participation decisions, roster corrections and factual clarifications made by Holden in this task until a newer decision supersedes them.</span></li>
            <li><strong>Conference tracker</strong><span>Controls the event roster, dates, status and topline staffing.</span></li>
            <li><strong>Events in Notion</strong><span>Controls execution detail for active event projects.</span></li>
            <li><strong>Events Drive</strong><span>Stores contracts, creative, attendee files and post-event artifacts.</span></li>
            <li><strong>HubSpot</strong><span>Controls event-attributed meetings, demos, deals and pipeline when the source fields are complete.</span></li>
            <li><strong>Slack and Gmail</strong><span>Supply new signals. A message does not override the tracker or Notion until the decision is confirmed.</span></li>
            <li><strong>Event page</strong><span>Publishes the reconciled view and links back to the working sources.</span></li>
          </ol>
          <div className="update-rules" id="update-rules">
            <div><span>Protected override</span><p>A direct correction stays in force when a tracker, Notion page, email or Slack message still contains the older value. The scan reports the disagreement instead of reverting the site.</p></div>
            <div><span>Applied automatically</span><p>Direct, high-confidence changes supported by the controlling source: dates, venue details, confirmed deliverables, named owners and clearly attributed outcomes.</p></div>
            <div><span>Held for review</span><p>Conflicting participation status, ambiguous staffing, unattributed CRM activity, uncertain meeting counts, or a decision found only in conversation.</p></div>
            <div><span>Run receipt</span><p>Each scan reports the sources checked, the old and new values for applied changes, links to supporting evidence, and the items still waiting for a decision.</p></div>
            <div><span>Publication gate</span><p>A successful scan may save a review version, but it does not change the live fieldbook until Holden explicitly approves deployment.</p></div>
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
