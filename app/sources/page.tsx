import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "../components/site-header";
import { Footer } from "../components/footer";
import { BackToTop, PageContentsLayout } from "../components/page-contents";
import { events, getProgramDate, sourceLinks } from "../data/events";
import { getEventCatalogHealth } from "../data/event-contract";
import { crmAttributionAudit } from "../data/crm-attribution";
import { audienceViews, connectorCapabilities, dataStreams, eventKeyRollout, eventUpdateRoutes, fieldOwners, operatingRoadmap, sourceFlow, stewardshipRoles, writebackQueue } from "../data/source-governance";
import { siteStatus } from "../data/site-status";
import { freshnessPolicies } from "../data/source-freshness";
import { getProgramSystemLinkage } from "../data/system-linkage";
import { sourceReceiptStates, sourceScanContract } from "../data/source-scan";
import { audienceSegmentContract, getAudienceSegmentRegistry } from "../data/audience-segment-registry";
import { latestSourceScan } from "../data/latest-source-scan";
import { eventPipelineSnapshot } from "../data/event-pipeline";
import { marketingEventCoverage } from "../data/marketing-events";
import { actionBriefingPolicy, getActionBriefing, isExternalAction } from "../data/action-briefing";

export const metadata: Metadata = {
  title: "About this site’s sources · Event Basecamp",
  description: "What controls the TeamSimple event data, what the recurring scan checks, and which conflicts need a decision.",
};

export default function SourcesPage() {
  const conflicts = events.filter((event) => event.notes.toLowerCase().startsWith("source conflict:"));
  const catalogHealth = getEventCatalogHealth(events);
  const monitor = siteStatus.sourceMonitor;
  const programDate = getProgramDate();
  const linkage = getProgramSystemLinkage(events, programDate);
  const audienceSegments = getAudienceSegmentRegistry(events, programDate);
  const autoUpdates = monitor.changeLog.filter((change) => change.state === "Applied" && change.checkedAt === siteStatus.contentUpdatedLabel);
  const briefing = getActionBriefing({ events, changes: monitor.changeLog, writebacks: writebackQueue, programDate, limit: actionBriefingPolicy.maxActions });
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
      <PageContentsLayout groups={[
        { label: "Start here", items: [
          { id: "quick-update-routes", label: "Make an update" },
          { id: "action-briefing", label: "Daily action briefing" },
          { id: "source-monitor", label: "Source monitor" },
          { id: "latest-scan", label: "Latest scan" },
          { id: "freshness-policy", label: "Freshness policy" },
        ] },
        { label: "Data plumbing", items: [
          { id: "canonical-event-key", label: "Canonical Event key" },
          { id: "data-flow", label: "How data moves" },
          { id: "scan-contract", label: "Scan contract" },
          { id: "data-streams", label: "Feeds and write-back" },
          { id: "operating-roadmap", label: "Build order" },
        ] },
        { label: "Governance", items: [
          { id: "field-ownership", label: "Where to update" },
          { id: "stewardship", label: "Who updates it" },
          { id: "marketing-event-role", label: "Marketing Event role" },
          { id: "crm-attribution", label: "CRM attribution" },
          { id: "audience-segments", label: "Audience segments" },
          { id: "writeback-queue", label: "Write-back queue" },
          { id: "protected-decisions", label: "Direct decisions" },
          { id: "change-log", label: "Change log" },
          { id: "approval-queue", label: "Approval queue" },
        ] },
        { label: "Reference", items: [
          { id: "source-hierarchy", label: "Source hierarchy" },
          { id: "update-rules", label: "Update rules" },
          { id: "source-files", label: "Open source files" },
        ] },
      ]}>

      <section className="shell quick-update-routes" id="quick-update-routes">
        <div className="section-intro">
          <p className="eyebrow">Make an update</p>
          <h2>Fix the source that owns the fact.</h2>
          <p>Choose what changed. The next source scan will reconcile the update into a review build; the live site changes only after that build is approved.</p>
        </div>
        <div className="quick-update-grid">
          {eventUpdateRoutes.map((route, index) => <a href={route.url} target="_blank" rel="noreferrer" key={route.id}>
            <header><span>{String(index + 1).padStart(2, "0")}</span><small>{route.scope}</small></header>
            <h3>{route.system}</h3>
            <p>{route.detail}</p>
            <strong>{route.action} ↗</strong>
          </a>)}
        </div>
        <aside className="quick-update-note"><strong>A Slack message or email is evidence—not the final record.</strong><p>Once a change is confirmed, put it in the tracker, event project, Events Drive, or HubSpot. That keeps decisions searchable and prevents Event Basecamp from becoming another manual source of truth.</p></aside>
        <BackToTop />
      </section>

      <section className="action-briefing" id="action-briefing">
        <div className="shell">
          <div className="section-intro">
            <p className="eyebrow">Daily action briefing</p>
            <h2>Ping me only when I need to act.</h2>
            <p>The 9:00 AM source scan now sends a private Slack briefing when a decision, overdue task, exact write-back approval, or time-sensitive source blocker needs your attention. No action means no Slack noise.</p>
          </div>
          <div className="briefing-delivery" aria-label="Action briefing delivery rules">
            <article><span>Channel</span><strong>Private Slack DM</strong><p>Email stays off until you choose it as a fallback.</p></article>
            <article><span>Trigger</span><strong>Action required</strong><p>{actionBriefingPolicy.deliverySummary}</p></article>
            <article><span>Reply loop</span><strong>Answer in the DM</strong><p>Reply with the item number and answer. The next scan captures the decision and routes the owning-system correction.</p></article>
          </div>
          <div className="briefing-metrics" aria-label="Current briefing queue">
            <article><span>Decisions</span><strong>{briefing.counts.decisions}</strong><p>Conflicts or missing facts that need judgment.</p></article>
            <article><span>Due now</span><strong>{briefing.counts.dueNow}</strong><p>Open structured tasks due today or earlier.</p></article>
            <article><span>Write approvals</span><strong>{briefing.counts.approvals}</strong><p>Exact upstream corrections waiting for approval.</p></article>
            <article><span>Auto-updated</span><strong>{autoUpdates.length}</strong><p>Accepted facts already included in the current review build.</p></article>
          </div>
          <div className="briefing-actions">
            <header><span>What the next briefing would ask</span><small>Highest-priority {actionBriefingPolicy.maxActions} · full queues stay on this page</small></header>
            {briefing.items.length ? briefing.items.map((item, index) => isExternalAction(item) ? <a href={item.href} target="_blank" rel="noreferrer" key={item.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><small>{item.label} · {item.event}</small><strong>{item.title}</strong><p>{item.detail}</p><em>Open {item.destination} ↗</em></div>
              <b>↗</b>
            </a> : <Link href={item.href} key={item.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><small>{item.label} · {item.event}</small><strong>{item.title}</strong><p>{item.detail}</p><em>Open {item.destination} →</em></div>
              <b>→</b>
            </Link>) : <p className="briefing-clear">Nothing needs your answer right now. The scan will keep checking quietly.</p>}
          </div>
          <p className="briefing-boundary"><strong>Noise boundary:</strong> setup work stays in the full queue and does not create a DM unless it becomes a time-sensitive blocker. Every action links to the owning record where it can be resolved.</p>
          <p className="briefing-boundary"><strong>Safety boundary:</strong> the briefing may update a saved review version from strong evidence. It still cannot deploy production or write to Sheets, Notion, HubSpot, Drive, Slack threads, or Gmail without the applicable approval.</p>
          <BackToTop />
        </div>
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
        <div className="source-checks" aria-label="Source check history">
          <p className="eyebrow">Source check history</p>
          <h3>Current truth first. Older receipts stay for the audit trail.</h3>
          <p className="source-checks-intro">Use records marked <strong>Current</strong> for today’s operating state. Historical records show what a source said when it was checked. Superseded records remain visible, but the replacement evidence is named directly.</p>
          {monitor.latestChecks.map((check) => {
            const state = check.state ?? "Historical";
            return <article className={`source-check source-check-${state.toLowerCase()}`} key={`${check.system}-${check.checkedAt}-${check.scope}`}>
            <div><strong>{check.system}</strong><span><em>{state}</em>{check.checkedAt}</span></div>
            <p>{check.scope}</p>
            <p>{check.result}</p>
            {check.supersededBy ? <small><strong>Replaced by:</strong> {check.supersededBy}.</small> : null}
          </article>;})}
        </div>
        <p className="scan-receipt">{monitor.lastSuccessfulScan ? `Latest evidence refresh · ${monitor.lastSuccessfulScanMode}: ${monitor.lastSuccessfulScan}` : "The recurring scan is scheduled, but it has not completed its first run. The checks above were completed while building Event Basecamp; the first successful recurring run will add its own labeled receipt here."}</p>
        <div className="latest-scan-receipt" id="latest-scan">
          <div className="section-intro">
            <p className="eyebrow">Latest scheduled run</p>
            <h2>What the 9:00 AM scan actually did.</h2>
            <p>The audit passed. It held three Customer Connect fields for review; Holden later accepted Gabby Pring’s answers as fact, so Event Basecamp now reflects them and the Notion write-backs remain queued.</p>
          </div>
          <div className="latest-scan-meta">
            <span>{latestSourceScan.runMode}</span>
            <time dateTime={latestSourceScan.checkedAtISO}>{latestSourceScan.checkedAtLabel}</time>
            <code>{latestSourceScan.scanId}</code>
          </div>
          <div className="latest-scan-summary" aria-label="Latest scan result counts">
            <article><span>Audit</span><strong>{latestSourceScan.audit.complete ? "Complete" : "Incomplete"}</strong></article>
            <article><span>Findings</span><strong>{latestSourceScan.summary.total}</strong></article>
            <article><span>Needs review</span><strong>{latestSourceScan.summary.needsReview}</strong></article>
            <article><span>No change</span><strong>{latestSourceScan.summary.noChange}</strong></article>
            <article><span>Rejected</span><strong>{latestSourceScan.summary.rejected}</strong></article>
          </div>
          <div className="latest-scan-gates" aria-label="Latest scan approval gates">
            <article><span>Review build</span><strong>{latestSourceScan.gates.reviewBuild}</strong></article>
            <article><span>Production</span><strong>{latestSourceScan.gates.production}</strong></article>
            <article><span>Upstream write-back</span><strong>{latestSourceScan.gates.upstreamWriteback}</strong></article>
          </div>
          <div className="latest-scan-sources" aria-label="Latest scan source receipts">
            {latestSourceScan.receipts.map((receipt) => <article className="latest-scan-source" key={receipt.id}>
              <header><strong>{receipt.source}</strong><span className={`scan-receipt-state scan-receipt-state-${receipt.state.toLowerCase().replaceAll(" ", "-")}`}>{receipt.state}</span></header>
              <p>{receipt.scope}</p>
              <small>{receipt.result}</small>
            </article>)}
          </div>
          <div className="latest-scan-findings" aria-label="Latest scan findings">
            <header><span>Finding</span><span>Decision</span><span>Owning destination</span></header>
            {latestSourceScan.findings.map((finding) => <article key={finding.id}>
              <div><strong>{finding.event}</strong><span>{finding.field}</span></div>
              <div><strong>{finding.state}</strong><span>{finding.result}</span></div>
              <div><strong>{finding.destination}</strong><span>{finding.state === "Needs review" ? "Awaiting exact approval" : "Verified; no write needed"}</span></div>
            </article>)}
          </div>
        </div>
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
            <article><span>Published event keys</span><strong>{linkage.stableFieldbookKeys} / {linkage.totalEvents}</strong><p>Every published event has a stable key.</p></article>
            <article><span>Active Notion projects</span><strong>{linkage.activeNotionProjects} / {linkage.activeEvents}</strong><p>{linkage.activeNotionMissing.length} active event workspaces still need a link.</p></article>
            <article><span>Active Drive folders</span><strong>{linkage.activeDriveFolders} / {linkage.activeEvents}</strong><p>No event-specific folder is stored in the governed record yet.</p></article>
            <article><span>Active Marketing Events</span><strong>{linkage.activeMarketingEvents} / {linkage.activeEvents}</strong><p>The CRM identity layer is complete; commercial associations are a separate gate.</p></article>
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
          <p className="source-governance-note"><strong>The remaining joins:</strong> every published page and HubSpot Marketing Event now shares the stable Event key. Sheets, Notion, Drive folders, meetings, and deals still need the same key or an exact governed association.</p>
          <div className="catalog-health" aria-label="Event data publish checks">
            <article><span>Stable event keys</span><strong>{catalogHealth.eventKeys}</strong><p>Unique IDs ready to carry into Sheets, Notion and HubSpot.</p></article>
            <article><span>Blocking errors</span><strong>{catalogHealth.errors.length}</strong><p>Duplicate keys, broken dates or invalid source links stop a build.</p></article>
            <article><span>Passes to assign</span><strong>{catalogHealth.unnamedRosters}</strong><p>Available passes still need attendees assigned.</p></article>
            <article><span>Source conflicts</span><strong>{catalogHealth.sourceConflicts}</strong><p>Contradictory facts remain in the approval queue.</p></article>
          </div>
          <BackToTop />
        </div>
      </section>

      <section className="shell scan-contract" id="scan-contract">
        <div className="section-intro">
          <p className="eyebrow">Automation contract</p>
          <h2>Every scan becomes one auditable batch.</h2>
          <p>A connector result is not allowed to edit Event Basecamp directly. Every finding must pass through the same identity, ownership, evidence and approval gates.</p>
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
          <p>No source pushes directly into production today. Event Basecamp is a versioned read-only view: a scheduled job reads available sources, reconciles them, saves a review build and waits for deployment approval.</p>
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
        <div className="audience-views" aria-label="Event Basecamp views by audience">
          {audienceViews.map((item) => <article key={item.audience}><span>{item.audience}</span><h3>{item.view}</h3><p>{item.detail}</p></article>)}
        </div>
        <p className="source-governance-note"><strong>Best next infrastructure move:</strong> carry the existing Marketing Event key into the tracker, Notion projects, Drive folders, meetings, and deals. That extends the dependable CRM identity layer into execution, cost, and commercial outcomes.</p>
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
          <p>Event Basecamp is where you read the whole plan. Update each fact in the system that owns it.</p>
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

      <section className="crm-attribution" id="marketing-event-role">
        <div className="shell">
          <div className="section-intro">
            <p className="eyebrow">HubSpot Marketing Events</p>
            <h2>The CRM spine—not the planning source.</h2>
            <p>All {marketingEventCoverage.keyedRecords} event records now carry the canonical Event key. The Marketing Event connects people, campaigns, meetings, and deals inside HubSpot without taking ownership away from the tracker, Notion, or the underlying CRM records.</p>
          </div>
          <div className="crm-rule-grid">
            <article><span>Owns</span><h3>CRM event identity</h3><p>Participant state, campaign association, and the HubSpot relationships that connect an event to contacts and commercial records.</p></article>
            <article><span>Mirrors</span><h3>Accepted planning facts</h3><p>Name, dates, participation, staffing, and plan summaries may mirror the tracker or Notion. Correct the owning source first; HubSpot never silently overrules it.</p></article>
            <article><span>Rolls up</span><h3>Associated outcomes</h3><p>Meetings and deals keep their own outcome, amount, and stage. The Marketing Event provides the join; it does not become a second hand-entered outcome ledger.</p></article>
            <article><span>Unlocks</span><h3>CRM activation</h3><p>Campaign reporting, registered/attended/canceled states, maintained audience segments, contact journeys, and event-attributed pipeline once the associations are verified.</p></article>
          </div>
          <aside className="crm-audit-alert"><span>Identity layer complete · association audit next</span><p>{marketingEventCoverage.keyedRecords} of {marketingEventCoverage.totalRecords} Marketing Events have an Event key. Read and write access are available; campaign, participant, meeting, and deal associations still need an exact-record review.</p><div><a href={marketingEventCoverage.indexUrl} target="_blank" rel="noreferrer">Open HubSpot Marketing Events ↗</a></div></aside>
          <BackToTop />
        </div>
      </section>

      <section className="crm-attribution" id="crm-attribution">
        <div className="shell">
          <div className="section-intro">
            <p className="eyebrow">CRM attribution</p>
            <h2>Only publish outcomes the CRM can prove.</h2>
            <p>HubSpot is the outcome system of record. The keyed Marketing Events now provide event identity; meetings and deals still need exact associations and usable outcomes before they can support leadership reporting.</p>
          </div>
          <div className="crm-health-grid" aria-label="HubSpot event attribution health">
            <article><span>Exact event deals</span><strong>{crmAttributionAudit.exactDeals}</strong><p>All resolve to {crmAttributionAudit.representedEventLabel} through controlled deal-source fields.</p></article>
            <article><span>Events represented</span><strong>{crmAttributionAudit.representedEvents}</strong><p>The controlled Deal Source Detail list names only one event.</p></article>
            <article><span>Meeting records to QA</span><strong>{crmAttributionAudit.meetingWindow.possibleEventMeetings}</strong><p>{crmAttributionAudit.meetingWindow.outcomeNote}</p></article>
            <article><span>Keyed Marketing Events</span><strong>{crmAttributionAudit.keyedMarketingEvents}</strong><p>All {crmAttributionAudit.marketingEvents} records carry the canonical Event key; associations remain separately governed.</p></article>
          </div>
          <aside className="crm-portfolio-rollup">
            <div><span>Portfolio opportunity views</span><strong>{eventPipelineSnapshot.opportunities} source-based · {eventPipelineSnapshot.exactQualifyingOpportunities} exact CCW</strong></div>
            <p>The Deal Source search returns {eventPipelineSnapshot.sourceEligibleRecords} records and {eventPipelineSnapshot.opportunities} qualifying opportunities after stage exclusions. The exact source + CCW detail intersection contains {crmAttributionAudit.exactDeals} records and {eventPipelineSnapshot.exactQualifyingOpportunities} qualifying opportunities. All {eventPipelineSnapshot.dealsWithoutAmount} source-based opportunities lack a reportable amount, so open pipeline and closed-won revenue both remain $0.</p>
            <Link href="/marketing#event-pipeline">Open pipeline chart →</Link>
          </aside>
          <aside className="crm-audit-alert">
            <span>Needs RevOps review · {crmAttributionAudit.pairMismatch.count} records</span>
            <p>{crmAttributionAudit.pairMismatch.note}</p>
            <div><a href={crmAttributionAudit.pairMismatch.sourceOnly.url} target="_blank" rel="noreferrer">Open source-only record ↗</a><a href={crmAttributionAudit.pairMismatch.detailOnly.url} target="_blank" rel="noreferrer">Open detail-only record ↗</a></div>
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
          <div className="detail-links"><a className="inline-link" href={crmAttributionAudit.marketingEventUrl} target="_blank" rel="noreferrer">Open HubSpot Marketing Events ↗</a><a className="inline-link" href={crmAttributionAudit.hubspotUrl} target="_blank" rel="noreferrer">Open the audited HubSpot deal view ↗</a></div>
          <BackToTop />
        </div>
      </section>

      <section className="audience-segments" id="audience-segments">
        <div className="shell">
          <div className="section-intro">
            <p className="eyebrow">HubSpot audience registry</p>
            <h2>One maintained segment per active event—once the evidence exists.</h2>
            <p>The event brief defines who to target in ZoomInfo. HubSpot should hold only the contacts tied to a named event signal. This registry keeps a broad target universe from being mislabeled as likely attendance.</p>
          </div>
          <div className="audience-segment-summary" aria-label="HubSpot event audience coverage">
            <article><strong>{audienceSegments.activeEvents}</strong><span>Active events</span><p>Confirmed or in-flight programs that need a governed audience route.</p></article>
            <article><strong>{audienceSegments.specificationsReady}</strong><span>Segment specs ready</span><p>Exact names, gates, membership rules and refresh rules are defined.</p></article>
            <article><strong>{audienceSegments.waitingForOrganizerAudience}</strong><span>Waiting on organizer files</span><p>Matched-account events must use the organizer audience—not a guessed roster.</p></article>
            <article><strong>{audienceSegments.automaticallyMaintained}</strong><span>Automatically maintained</span><p>The connector can read existing segments but cannot create or update them.</p></article>
          </div>
          <aside className="audience-segment-boundary">
            <div><span>Current CRM boundary</span><h3>The specifications are ready. The active segments are not.</h3></div>
            <p>HubSpot segment access is read-only in the connected workflow. Two historical static snapshots are verified; neither is presented as a live audience. Creating the active segments requires one list-write route and the canonical Event key on contacts.</p>
            <a href="https://app.hubspot.com/contacts/245561359/objectLists" target="_blank" rel="noreferrer">Open HubSpot segments ↗</a>
          </aside>
          <div className="audience-segment-contract">
            {audienceSegmentContract.map((item) => <article key={item.step}><span>{item.step}</span><h3>{item.title}</h3><p>{item.detail}</p></article>)}
          </div>
          <div className="source-route-table-wrap audience-segment-table-wrap">
            <table className="source-route-table audience-segment-table">
              <thead><tr><th>Event / segment</th><th>State</th><th>Membership and evidence gate</th><th>Refresh / next move</th></tr></thead>
              <tbody>{audienceSegments.items.map((item) => <tr key={item.eventKey}>
                <th scope="row"><Link href={item.eventHref}>{item.eventName}</Link><small>{item.segmentName}</small></th>
                <td data-label="State"><span className={`audience-segment-state audience-segment-state-${item.state.toLowerCase().replaceAll(" ", "-")}`}>{item.state}</span></td>
                <td data-label="Membership and evidence gate"><strong>{item.membershipRule}</strong><small>{item.sourceGate}</small></td>
                <td data-label="Refresh / next move"><p>{item.refreshRule}</p>{item.hubspotUrl ? <a href={item.hubspotUrl} target="_blank" rel="noreferrer">Open verified snapshot ↗</a> : <Link href={item.eventHref}>{item.nextAction} →</Link>}</td>
              </tr>)}</tbody>
            </table>
          </div>
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
            <li><strong>HubSpot Marketing Event</strong><span>Controls CRM event identity, participant states, campaign association and the relationships to contacts and commercial records. It mirrors accepted planning facts but does not overrule Sheets or Notion.</span></li>
            <li><strong>HubSpot meetings and deals</strong><span>Control activity outcomes, stage, amount, pipeline and revenue. The Marketing Event supplies the join—not a replacement value.</span></li>
            <li><strong>Slack and Gmail</strong><span>Supply new signals. A message does not override the tracker or Notion until the decision is confirmed.</span></li>
            <li><strong>Event page</strong><span>Publishes the reconciled view and links back to the working sources.</span></li>
          </ol>
          <div className="update-rules" id="update-rules">
            <div><span>Protected override</span><p>A direct correction stays in force when a tracker, Notion page, email or Slack message still contains the older value. The scan reports the disagreement instead of reverting the site.</p></div>
            <div><span>Applied automatically</span><p>Direct, high-confidence changes supported by the controlling source: dates, venue details, confirmed deliverables, named owners and clearly attributed outcomes.</p></div>
            <div><span>Held for review</span><p>Conflicting participation status, ambiguous staffing, unattributed CRM activity, uncertain meeting counts, or a decision found only in conversation.</p></div>
            <div><span>Run receipt</span><p>Each scan reports the sources checked, the old and new values for applied changes, links to supporting evidence, and the items still waiting for a decision.</p></div>
            <div><span>Publication gate</span><p>A successful scan may save a review version, but it does not change the live site until Holden explicitly approves deployment.</p></div>
          </div>
          <div className="source-links vertical" id="source-files">
            <a href={sourceLinks.sheet} target="_blank" rel="noreferrer">Open tracker ↗</a>
            <a href={sourceLinks.notion} target="_blank" rel="noreferrer">Open Notion ↗</a>
            <a href={sourceLinks.eventsDrive} target="_blank" rel="noreferrer">Open Events Drive ↗</a>
            <a href={marketingEventCoverage.indexUrl} target="_blank" rel="noreferrer">Open HubSpot Marketing Events ↗</a>
            <a href={sourceLinks.ccwPlan} target="_blank" rel="noreferrer">Open Vegas reference ↗</a>
          </div>
          <BackToTop />
        </article>
      </section>
      </PageContentsLayout>
      <Footer />
    </main>
  );
}
