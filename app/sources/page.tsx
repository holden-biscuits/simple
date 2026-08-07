import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../components/site-header";
import { Footer } from "../components/footer";
import { BackToTop, PageContents } from "../components/page-contents";
import { events, getProgramDate, sourceLinks } from "../data/events";
import { getEventCatalogHealth } from "../data/event-contract";
import { crmAttributionAudit } from "../data/crm-attribution";
import { audienceViews, connectorCapabilities, dataStreams, eventKeyRollout, eventUpdateRoutes, fieldOwners, operatingRoadmap, sourceFlow, stewardshipRoles, writebackQueue } from "../data/source-governance";
import { siteStatus } from "../data/site-status";
import { freshnessPolicies } from "../data/source-freshness";
import { getProgramSystemLinkage } from "../data/system-linkage";
import { sourceReceiptStates, sourceScanContract } from "../data/source-scan";

export const metadata: Metadata = {
  title: "About this site’s sources · Event Basecamp",
  description: "What controls the TeamSimple event data, what the recurring scan checks, and which conflicts need a decision.",
};

export default function SourcesPage() {
  const conflicts = events.filter((event) => event.notes.toLowerCase().startsWith("source conflict:"));
  const catalogHealth = getEventCatalogHealth(events);
  const monitor = siteStatus.sourceMonitor;
  const linkage = getProgramSystemLinkage(events, getProgramDate());
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
        { id: "quick-update-routes", label: "Make an update" },
        { id: "source-monitor", label: "Source monitor" },
        { id: "freshness-policy", label: "Freshness policy" },
        { id: "canonical-event-key", label: "Canonical Event key" },
        { id: "data-flow", label: "How data moves" },
        { id: "scan-contract", label: "Scan contract" },
        { id: "data-streams", label: "Feeds and write-back" },
        { id: "operating-roadmap", label: "Build order" },
        { id: "field-ownership", label: "Where to update" },
        { id: "stewardship", label: "Who updates it" },
        { id: "crm-attribution", label: "CRM attribution" },
        { id: "writeback-queue", label: "Write-back queue" },
        { id: "protected-decisions", label: "Direct decisions" },
        { id: "change-log", label: "Change log" },
        { id: "approval-queue", label: "Approval queue" },
        { id: "source-hierarchy", label: "Source hierarchy" },
        { id: "update-rules", label: "Update rules" },
        { id: "source-files", label: "Open source files" },
      ]} />

      <section className="shell quick-update-routes" id="quick-update-routes">
        <div className="section-intro">
          <p className="eyebrow">Make an update</p>
          <h2>Fix the source that owns the fact.</h2>
          <p>Choose what changed. The next source scan will reconcile the update into a review build; the live fieldbook changes only after that build is approved.</p>
        </div>
        <div className="quick-update-grid">
          {eventUpdateRoutes.map((route, index) => <a href={route.url} target="_blank" rel="noreferrer" key={route.id}>
            <header><span>{String(index + 1).padStart(2, "0")}</span><small>{route.scope}</small></header>
            <h3>{route.system}</h3>
            <p>{route.detail}</p>
            <strong>{route.action} ↗</strong>
          </a>)}
        </div>
        <aside className="quick-update-note"><strong>A Slack message or email is evidence—not the final record.</strong><p>Once a change is confirmed, put it in the tracker, event project, Events Drive, or HubSpot. That keeps decisions searchable and prevents the fieldbook from becoming another manual source of truth.</p></aside>
        <BackToTop />
      </section>

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
        <p className="automation-proof"><strong>Verified automation:</strong> <code>{monitor.automationId}</code> is an active {monitor.automationKind.toLowerCase()} targeting this Codex task. Schedule checked {monitor.automationVerifiedAt}. Every receipt must identify whether it came from the scheduled heartbeat or a task review.</p>
        <div className="source-coverage">
          {monitor.sources.map((source) => <article key={source.name}>
            <div><span className={`source-state source-state-${source.state.toLowerCase()}`}>{source.state}</span><small>{source.system}</small></div>
            <h3>{source.name}</h3>
            <p>{source.use}</p>
            <strong className="source-receipt">{source.receipt}</strong>
          </article>)}
        </div>
        <p className="source-governance-note"><strong>Current posture:</strong> four systems are read on a schedule, two are signal-only checks, zero sources push directly into production, and zero upstream changes are written automatically.</p>
        <div className="source-checks" aria-label="Latest source checks">
          <p className="eyebrow">Latest source checks</p>
          {monitor.latestChecks.map((check) => <article key={`${check.system}-${check.checkedAt}-${check.scope}`}>
            <div><strong>{check.system}</strong><span>{check.checkedAt}</span></div>
            <p>{check.scope}</p>
            <p>{check.result}</p>
          </article>)}
        </div>
        <p className="scan-receipt">{monitor.lastSuccessfulScan ? `Latest evidence refresh · ${monitor.lastSuccessfulScanMode}: ${monitor.lastSuccessfulScan}` : "The recurring scan is scheduled, but it has not completed its first run. The checks above were completed in this task while building the fieldbook; the first successful recurring run will add its own labeled receipt here."}</p>
        <div className="freshness-policy" id="freshness-policy">
          <div className="section-intro"><p className="eyebrow">Freshness policy</p><h2>The closer the event, the tighter the check.</h2><p>A connected source is not automatically current. Event cards and pages compare the last verified date with these operating windows.</p></div>
          <div className="freshness-policy-grid">{freshnessPolicies.map((policy) => <article key={policy.window}><span>{policy.window}</span><strong>{policy.cadence}</strong><p>{policy.detail}</p></article>)}</div>
        </div>
        <BackToTop />
      </section>

      <section className="canonical-event-key" id="canonical-event-key">
        <div className="shell">
          <div className="section-intro">
            <p className="eyebrow">Canonical Event key</p>
            <h2>One durable join across every system.</h2>
            <p>The event URL already supplies the key. Carrying that exact value upstream replaces fragile name-and-date matching and makes approved write-back, attribution and leadership rollups dependable.</p>
          </div>
          <div className="event-key-example"><span>Example</span><code>genesys-xperience</code><p>Stable even if the display name, dates or venue change.</p></div>
          <div className="linkage-coverage" aria-label="Cross-system event coverage">
            <article><span>Fieldbook keys</span><strong>{linkage.stableFieldbookKeys} / {linkage.totalEvents}</strong><p>Every published event has a stable key.</p></article>
            <article><span>Active Notion projects</span><strong>{linkage.activeNotionProjects} / {linkage.activeEvents}</strong><p>{linkage.activeNotionMissing.length} active event workspaces still need a link.</p></article>
            <article><span>Active Drive folders</span><strong>{linkage.activeDriveFolders} / {linkage.activeEvents}</strong><p>No event-specific folder is stored in the governed record yet.</p></article>
            <article><span>Active CRM joins</span><strong>{linkage.activeCrmEvents} / {linkage.activeEvents}</strong><p>One past event has a controlled legacy join; active-event attribution still needs setup.</p></article>
          </div>
          {linkage.activeNotionMissing.length ? <div className="linkage-gap-list"><span>Active workspaces still missing</span><p>{linkage.activeNotionMissing.map((event) => event.name).join(" · ")}</p></div> : null}
          <div className="source-route-table-wrap">
            <table className="source-route-table event-key-table">
              <thead><tr><th>System</th><th>Field or convention</th><th>Status</th><th>Implementation rule</th></tr></thead>
              <tbody>{eventKeyRollout.map((item) => <tr key={item.system}>
                <th scope="row">{item.system}</th>
                <td data-label="Field or convention">{item.field}</td>
                <td data-label="Status"><span className={`event-key-state event-key-state-${item.state.toLowerCase().replaceAll(" ", "-")}`}>{item.state}</span></td>
                <td data-label="Implementation rule">{item.rule}</td>
              </tr>)}</tbody>
            </table>
          </div>
          <BackToTop />
        </div>
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
          <div className="catalog-health" aria-label="Event data publish checks">
            <article><span>Stable event keys</span><strong>{catalogHealth.eventKeys}</strong><p>Unique IDs ready to carry into Sheets, Notion and HubSpot.</p></article>
            <article><span>Blocking errors</span><strong>{catalogHealth.errors.length}</strong><p>Duplicate keys, broken dates or invalid source links stop a build.</p></article>
            <article><span>Rosters to name</span><strong>{catalogHealth.unnamedRosters}</strong><p>Attendance is planned, but the people are not yet recorded.</p></article>
            <article><span>Source conflicts</span><strong>{catalogHealth.sourceConflicts}</strong><p>Contradictory facts remain in the approval queue.</p></article>
          </div>
          <BackToTop />
        </div>
      </section>

      <section className="shell scan-contract" id="scan-contract">
        <div className="section-intro">
          <p className="eyebrow">Automation contract</p>
          <h2>Every scan becomes one auditable batch.</h2>
          <p>A connector result is not allowed to edit the fieldbook directly. Every finding must pass through the same identity, ownership, evidence and approval gates.</p>
        </div>
        <div className="scan-contract-grid">
          {sourceScanContract.map((item) => <article key={item.step}><span>{item.step}</span><h3>{item.title}</h3><p>{item.detail}</p></article>)}
        </div>
        <div className="scan-contract-output">
          <div><span>Review build</span><p>Only “apply to review” records may change the saved site version.</p></div>
          <div><span>Human queue</span><p>Conflicts, message-only findings and protected decisions stay visible with evidence.</p></div>
          <div><span>Run receipt</span><p>Checked, unavailable and not-due sources stay visible alongside no-change and rejected findings.</p></div>
          <div><span>Write-back plan</span><p>Every valid correction is grouped by its owning destination; no upstream write runs without exact approval.</p></div>
        </div>
        <div className="source-receipt-contract">
          <header><span>Required source receipts</span><h3>No silent omissions.</h3><p>A review build cannot clear the scan gate unless the batch records what it checked, what it could not reach, and what was not due under the freshness policy.</p></header>
          <div>{sourceReceiptStates.map((receipt) => <article key={receipt.state}><strong>{receipt.state}</strong><p>{receipt.detail}</p></article>)}</div>
        </div>
        <BackToTop />
      </section>

      <section className="shell data-streams" id="data-streams">
        <div className="section-intro">
          <p className="eyebrow">Feeds and write-back</p>
          <h2>Connected does not mean live.</h2>
          <p>No source pushes directly into the production site today. The fieldbook is a versioned read model: a scheduled job reads available sources, reconciles them, saves a review build and waits for deployment approval.</p>
        </div>
        <div className="connector-capabilities" aria-label="Verified connector access and operating boundaries">
          <header><span>Verified access · Aug 7</span><p>Technical access and operating permission are separate. A connector may support a write that this workflow still requires a person to approve.</p></header>
          <div>{connectorCapabilities.map((item) => <article key={item.system}>
            <span>{item.access}</span>
            <h3>{item.system}</h3>
            <p>{item.detail}</p>
            <small><strong>Boundary</strong>{item.boundary}</small>
          </article>)}</div>
        </div>
        <div className="source-route-table-wrap">
          <table className="source-route-table data-stream-table">
            <thead><tr><th>System</th><th>Connection</th><th>Refresh</th><th>What it feeds</th><th>Can we write back?</th></tr></thead>
            <tbody>{dataStreams.map((stream) => <tr key={stream.system}>
              <th scope="row">{stream.system}</th>
              <td data-label="Connection"><span className={`stream-state stream-state-${stream.state.toLowerCase().replaceAll(" ", "-")}`}>{stream.state}</span></td>
              <td data-label="Refresh">{stream.refresh}</td>
              <td data-label="What it feeds">{stream.feeds}</td>
              <td data-label="Can we write back?">{stream.writeback}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <div className="audience-views" aria-label="Fieldbook views by audience">
          {audienceViews.map((item) => <article key={item.audience}><span>{item.audience}</span><h3>{item.view}</h3><p>{item.detail}</p></article>)}
        </div>
        <p className="source-governance-note"><strong>Best next infrastructure move:</strong> add the existing Event key to the tracker, Notion projects and HubSpot records. That turns fragile name-and-date matching into a dependable join and makes safe rollups and approved write-back possible.</p>
        <BackToTop />
      </section>

      <section className="operating-roadmap" id="operating-roadmap">
        <div className="shell">
          <div className="section-intro">
            <p className="eyebrow">Build order</p>
            <h2>Make the joins trustworthy before adding more dashboards.</h2>
            <p>The current feeds are enough to run a disciplined review loop. Long-term usefulness depends on fixing identity and ownership first, then CRM capture, then leadership reporting.</p>
          </div>
          <div className="operating-roadmap-grid">
            {operatingRoadmap.map((item) => <article key={item.phase}>
              <span>{item.phase}</span>
              <h3>{item.title}</h3>
              <p>{item.work}</p>
              <dl><div><dt>Unlocks</dt><dd>{item.unlocks}</dd></div><div><dt>Done when</dt><dd>{item.doneWhen}</dd></div></dl>
            </article>)}
          </div>
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

      <section className="stewardship" id="stewardship">
        <div className="shell">
          <div className="section-intro">
            <p className="eyebrow">Operating responsibility</p>
            <h2>Keep the work with the person closest to it.</h2>
            <p>Field teams record the interaction. Event owners maintain the plan. Operations maintains the joins. Leadership sees only the decisions that require judgment.</p>
          </div>
          <div className="stewardship-grid">
            {stewardshipRoles.map((item, index) => <article key={item.role}>
              <header><span>{String(index + 1).padStart(2, "0")}</span><time>{item.timing}</time></header>
              <h3>{item.role}</h3>
              <p className="stewardship-owns">{item.owns}</p>
              <dl><div><dt>Update</dt><dd>{item.destination}</dd></div><div><dt>Rule</dt><dd>{item.rule}</dd></div></dl>
              <a href={item.url} target={item.url.startsWith("http") ? "_blank" : undefined} rel={item.url.startsWith("http") ? "noreferrer" : undefined}>Open destination ↗</a>
            </article>)}
          </div>
          <div className="stewardship-boundary" aria-label="Operating boundary">
            <div><span>Routine correction</span><p>The source owner fixes it without escalating a normal data-entry task.</p></div>
            <div><span>Material decision</span><p>Participation, investment or customer commitments move to leadership.</p></div>
            <div><span>Published receipt</span><p>The scan records what changed, the evidence and the review version.</p></div>
          </div>
          <BackToTop />
        </div>
      </section>

      <section className="crm-attribution" id="crm-attribution">
        <div className="shell">
          <div className="section-intro">
            <p className="eyebrow">CRM attribution</p>
            <h2>Only publish outcomes the CRM can prove.</h2>
            <p>HubSpot is the outcome system of record. Today, the deal data supports one event-level result; meeting activity needs a cleaner join and an outcome pass before it can support leadership reporting.</p>
          </div>
          <div className="crm-health-grid" aria-label="HubSpot event attribution health">
            <article><span>Exact event deals</span><strong>{crmAttributionAudit.exactDeals}</strong><p>All resolve to {crmAttributionAudit.representedEventLabel} through controlled deal-source fields.</p></article>
            <article><span>Events represented</span><strong>{crmAttributionAudit.representedEvents}</strong><p>The controlled Deal Source Detail list names only one event.</p></article>
            <article><span>Meeting records to QA</span><strong>{crmAttributionAudit.meetingWindow.possibleEventMeetings}</strong><p>{crmAttributionAudit.meetingWindow.outcomeNote}</p></article>
            <article><span>Marketing Events</span><strong>{crmAttributionAudit.marketingEvents}</strong><p>No canonical event objects are available yet; writes require HubSpot reauthorization.</p></article>
          </div>
          <aside className="crm-audit-alert">
            <span>Needs RevOps review · {crmAttributionAudit.sourceMismatch.count} record</span>
            <p>{crmAttributionAudit.sourceMismatch.note}</p>
            <a href={crmAttributionAudit.sourceMismatch.url} target="_blank" rel="noreferrer">Open {crmAttributionAudit.sourceMismatch.dealName} in HubSpot ↗</a>
          </aside>
          <div className="crm-rule-grid">
            {crmAttributionAudit.rules.map((rule) => <article key={rule.label}>
              <span>{rule.label}</span>
              <h3>{rule.title}</h3>
              <p>{rule.detail}</p>
            </article>)}
          </div>
          <div className="crm-operating-model">
            <div><span>Book</span><p>Add the meeting in HubSpot before the event day ends. Record owner, account, next action, outcome and the canonical Event key.</p></div>
            <div><span>Roll up</span><p>Deals and meetings with an exact Event key feed the event page. Text-only matches stay in the review queue.</p></div>
            <div><span>Report</span><p>Leadership sees meetings held, demos, qualified pipeline and revenue—not calendar records that happen to fall during event week.</p></div>
          </div>
          <a className="inline-link" href={crmAttributionAudit.hubspotUrl} target="_blank" rel="noreferrer">Open the audited HubSpot deal view ↗</a>
          <BackToTop />
        </div>
      </section>

      <section className="writeback-section" id="writeback-queue">
        <div className="shell">
          <div className="section-intro">
            <p className="eyebrow">Write-back queue</p>
            <h2>Changes that belong upstream.</h2>
            <p>These are known mismatches or setup jobs. Event-specific items also appear on the relevant event page. Nothing in this queue writes to an external system until the exact change is approved.</p>
          </div>
          <div className="writeback-grid">
            {writebackQueue.map((item) => <article key={`${item.system}-${item.scope}`}>
              <header><span>{item.system}</span><b className={`writeback-state writeback-state-${item.state.toLowerCase().replaceAll(" ", "-")}`}>{item.state}</b></header>
              <h3>{item.scope}</h3>
              <dl className="writeback-diff"><div><dt>Current</dt><dd>{item.current}</dd></div><div><dt>Proposed</dt><dd>{item.proposed}</dd></div></dl>
              <p className="writeback-evidence">Evidence · {item.evidence}{item.evidenceUrl ? <Link href={item.evidenceUrl}> View →</Link> : null}</p>
              <a className="writeback-destination" href={item.url} target={item.url.startsWith("http") ? "_blank" : undefined} rel={item.url.startsWith("http") ? "noreferrer" : undefined}>Open destination ↗</a>
            </article>)}
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
