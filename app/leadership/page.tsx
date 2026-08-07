import type { Metadata } from "next";
import Link from "next/link";
import { BackToTop, PageContentsLayout } from "../components/page-contents";
import { Footer } from "../components/footer";
import { SiteHeader } from "../components/site-header";
import { events, getProgramDate } from "../data/events";
import { getLeadershipBrief, getLeadershipChangeDigest } from "../data/leadership-brief";
import { siteStatus } from "../data/site-status";
import { measurementReadiness } from "../data/event-measurement";

export const metadata: Metadata = {
  title: "Leadership brief · Event Basecamp",
  description: "TeamSimple’s event portfolio, execution readiness, decisions and attributable outcomes.",
};

export const dynamic = "force-dynamic";

function planLabel(state: "structured" | "priorities-only" | "missing") {
  if (state === "structured") return "Structured plan";
  if (state === "priorities-only") return "Owners + dates needed";
  return "Plan missing";
}

export default function LeadershipPage() {
  const brief = getLeadershipBrief(events, getProgramDate());
  const changeDigest = getLeadershipChangeDigest(events, siteStatus.sourceMonitor.changeLog);
  const sourceConflicts = brief.pulse.attention.filter((item) => item.issues.includes("Source conflict"));
  return (
    <main id="page-top">
      <SiteHeader />
      <section className="role-hero leadership-hero">
        <p className="eyebrow">Leadership brief</p>
        <h1>See the program without losing the source truth.</h1>
        <p className="lede">A portfolio view of commitments, execution readiness, decisions and attributable outcomes. Missing spend or CRM fields stay visible as gaps—not false certainty.</p>
      </section>
      <PageContentsLayout primaryLabel="Brief sections" items={[
        { id: "leadership-snapshot", label: "Snapshot" },
        { id: "leadership-changes", label: "Recent changes" },
        { id: "leadership-portfolio", label: "Portfolio" },
        { id: "leadership-decisions", label: "Decisions" },
        { id: "leadership-operating-model", label: "Operating model" },
        { id: "leadership-outcomes", label: "Outcomes" },
        { id: "leadership-trust", label: "What to trust" },
      ]}>

      <section className="shell leadership-snapshot" id="leadership-snapshot">
        <div className="section-intro">
          <p className="eyebrow">Program snapshot</p>
          <h2>What needs executive attention now.</h2>
          <p>Current as of {siteStatus.contentUpdatedLabel}. Open an event for operating detail; use the source record for evidence, conflicts and write-back status.</p>
        </div>
        <div className="leadership-metrics">
          <article><strong>{brief.pulse.active.length}</strong><span>Active program</span><p>Confirmed, tentative and TBD events that have not ended.</p></article>
          <article><strong>{brief.pulse.next60Days.length}</strong><span>Starting within 60 days</span><p>Near-term commitments that should have owners and dates.</p></article>
          <article><strong>{brief.briefReadiness.ready.length} / {brief.briefReadiness.events.length}</strong><span>Briefs on track</span><p>Decision-critical inputs required for each event’s current planning stage are present.</p></article>
          <article><strong>{brief.pulse.rosterGaps.length}</strong><span>Roster gaps</span><p>Planned headcount exceeds the named attendee list.</p></article>
        </div>
        <div className="leadership-alerts">
          <Link href="/sources#approval-queue"><span>Source conflicts</span><strong>{brief.pulse.sourceConflicts.length}</strong><p>Conflicting facts are held for a decision.</p><b>Review →</b></Link>
          <Link href="/marketing#event-tasks"><span>Plan setup needed</span><strong>{brief.pulse.readiness.planSetupNeeded}</strong><p>Events still need structured owners, deadlines and statuses.</p><b>Open work →</b></Link>
          <Link href="/sources#freshness-policy"><span>Source checks due</span><strong>{brief.pulse.sourceChecksDue.length}</strong><p>Active event briefs outside their freshness window.</p><b>See policy →</b></Link>
          <Link href="/sources#writeback-queue"><span>Upstream queue</span><strong>{brief.writebacks.ready + brief.writebacks.decisions + brief.writebacks.setup}</strong><p>{brief.writebacks.ready} ready · {brief.writebacks.decisions} decision · {brief.writebacks.setup} setup</p><b>Open queue →</b></Link>
        </div>
        <BackToTop />
      </section>

      <section className="leadership-changes" id="leadership-changes">
        <div className="shell">
          <div className="section-intro">
            <p className="eyebrow">Latest source work</p>
            <h2>What changed—and what still needs a decision.</h2>
            <p>{siteStatus.sourceMonitor.lastSuccessfulScan}. Applied records already match Event Basecamp; review records preserve both claims until the source owner decides.</p>
          </div>
          <div className="leadership-change-summary" aria-label="Latest source change summary">
            <article><strong>{changeDigest.applied.length}</strong><span>Applied updates</span><p>Verified values already reflected in Event Basecamp.</p></article>
            <article><strong>{changeDigest.needsReview.length}</strong><span>Needs review</span><p>Contradictory facts held for an explicit decision.</p></article>
          </div>
          <div className="leadership-change-columns">
            <section aria-labelledby="leadership-applied-heading">
              <header><div><span>Applied</span><h3 id="leadership-applied-heading">New governed values</h3></div><Link href="/sources#change-log">Full log →</Link></header>
              <div className="leadership-change-list">{changeDigest.applied.length ? changeDigest.applied.map((change) => <Link href={change.href} key={change.id}>
                <div><span>{change.eventName}</span><time>{change.checkedAt}</time></div>
                <h4>{change.title}</h4>
                <dl><div><dt>{change.field}</dt><dd>{change.after}</dd></div></dl>
                <p>{change.source}</p>
              </Link>) : <p className="leadership-change-empty">No applied updates in the latest source record.</p>}</div>
            </section>
            <section aria-labelledby="leadership-review-heading">
              <header><div><span>Needs review</span><h3 id="leadership-review-heading">Claims that still conflict</h3></div><Link href="/sources#approval-queue">Decision queue →</Link></header>
              <div className="leadership-change-list leadership-change-list-review">{changeDigest.needsReview.length ? changeDigest.needsReview.map((change) => <Link href={change.href} key={change.id}>
                <div><span>{change.eventName}</span><time>{change.checkedAt}</time></div>
                <h4>{change.title}</h4>
                <dl><div><dt>Current record</dt><dd>{change.before}</dd></div><div><dt>Conflicting source</dt><dd>{change.after}</dd></div></dl>
                <p>{change.source}</p>
              </Link>) : <p className="leadership-change-empty">No unresolved source conflicts in the latest source record.</p>}</div>
            </section>
          </div>
          <BackToTop />
        </div>
      </section>

      <section className="leadership-portfolio" id="leadership-portfolio">
        <div className="shell">
          <div className="section-intro">
            <p className="eyebrow">Portfolio</p>
            <h2>Every active commitment and its next move.</h2>
            <p>Sorted by event date. Brief readiness checks the inputs needed at this stage; it does not score the event’s strategic value.</p>
          </div>
          <div className="leadership-table-wrap">
            <table className="leadership-table">
              <thead><tr><th>Event</th><th>Participation</th><th>Activation</th><th>Staffing</th><th>Readiness</th><th>Next move</th></tr></thead>
              <tbody>{brief.portfolio.map((item) => <tr key={item.eventKey}>
                <th scope="row"><Link href={`/events/${item.eventKey}`}>{item.name}</Link><time dateTime={item.dateSort}>{item.dates}</time><small>{item.location}{item.phase === "now" ? " · happening now" : ""}</small></th>
                <td data-label="Participation"><span className={`leadership-status leadership-status-${item.status.toLowerCase()}`}>{item.status}</span></td>
                <td data-label="Activation">{item.activation}</td>
                <td data-label="Staffing"><strong>{item.staffing.summary}</strong>{item.staffing.state === "open" ? <small>{item.staffing.detail}</small> : null}</td>
                <td data-label="Readiness"><strong>{item.briefReadiness.label}</strong><small>{item.briefReadiness.timing} · {item.briefReadiness.issues.length ? `${item.briefReadiness.issues.length} open input${item.briefReadiness.issues.length === 1 ? "" : "s"}` : "required inputs present"} · {planLabel(item.readiness.planState)}</small></td>
                <td data-label="Next move">{item.readiness.nextAction ? <><Link href={item.readiness.nextAction.href}>{item.readiness.nextAction.title}</Link><small>{item.readiness.nextAction.owner ? `Owner · ${item.readiness.nextAction.owner}` : "Owner · Open"} · {item.readiness.nextAction.due ? `Due · ${item.readiness.nextAction.due}` : "Due · Open"}</small></> : <span>Plan complete</span>}</td>
              </tr>)}</tbody>
            </table>
          </div>
          <BackToTop />
        </div>
      </section>

      <section className="shell leadership-decisions" id="leadership-decisions">
        <div className="section-intro">
          <p className="eyebrow">Decisions and risk</p>
          <h2>Where the program still depends on judgment.</h2>
          <p>These are decision-quality gaps, not hidden green status. The site will not resolve them from weak evidence.</p>
        </div>
        <div className="leadership-risk-grid">
          <article><span>01 · Execution coverage</span><h3>{brief.pulse.readiness.planSetupNeeded} active events lack a structured plan.</h3><p>Priorities exist, but complete ownership, due dates and task status do not. This is the largest obstacle to a dependable program forecast.</p><Link href="/marketing#event-tasks">Open event workspaces →</Link></article>
          <article><span>02 · Source conflicts</span><h3>{sourceConflicts.length} event briefs have contradictory facts.</h3><p>{sourceConflicts.length ? sourceConflicts.map((item) => item.name).join(" · ") : "No unresolved source conflicts are recorded."}</p><Link href="/sources#approval-queue">Review decisions →</Link></article>
          <article><span>03 · Spend and ROI</span><h3>{measurementReadiness.normalizedCostEvents} events have a normalized cost record.</h3><p>No normalized event-cost dataset exists yet. The program cannot responsibly rank event ROI until sponsorship, travel, production, paid media, activation and freight share a controlled schema.</p><Link href="/marketing#measurement">Open measurement contract →</Link></article>
          <article><span>04 · Reporting foundation</span><h3>{brief.linkage.activeCrmEvents} of {brief.linkage.activeEvents} active events have an exact CRM join.</h3><p>{brief.linkage.activeNotionProjects} active event workspaces are linked, but event-specific Drive folders and canonical HubSpot associations still need setup. Portfolio pipeline is not yet a trustworthy leadership metric.</p><Link href="/sources#canonical-event-key">Open linkage coverage →</Link></article>
        </div>
        <BackToTop />
      </section>

      <section className="leadership-operating-model" id="leadership-operating-model">
        <div className="shell">
          <div className="section-intro">
            <p className="eyebrow">Operating model</p>
            <h2>Leadership gets decisions, not data-entry work.</h2>
            <p>The upstream queue separates judgment from routine corrections and systems setup, so the escalation surface stays small.</p>
          </div>
          <div className="leadership-queue-grid">
            <article><span>Needs judgment</span><strong>{brief.writebacks.decisions}</strong><h3>Resolve the material ambiguity.</h3><p>Participation, investment, customer commitments or contradictory program facts belong here.</p></article>
            <article><span>Ready to approve</span><strong>{brief.writebacks.ready}</strong><h3>Let the source owner correct it.</h3><p>The evidence and proposed value are already documented. Approval authorizes the exact upstream change.</p></article>
            <article><span>Foundation work</span><strong>{brief.writebacks.setup}</strong><h3>Assign the operating owner.</h3><p>Event keys, Drive folders and CRM objects are systems work—not strategic decisions.</p></article>
          </div>
          <div className="leadership-operating-note"><strong>The rule</strong><p>A field rep records the interaction, the event lead maintains the plan, Marketing Ops maintains program facts, and RevOps maintains attribution. Leadership intervenes only when the correct value depends on a business decision.</p><Link href="/sources#stewardship">See ownership and timing →</Link></div>
          <BackToTop />
        </div>
      </section>

      <section className="leadership-outcomes" id="leadership-outcomes">
        <div className="shell">
          <div className="section-intro">
            <p className="eyebrow">Attributable outcomes</p>
            <h2>What HubSpot can prove today.</h2>
            <p>These figures describe data coverage and explicitly attributed records. They are not an ROI claim.</p>
          </div>
          <div className="leadership-outcome-grid">
            <article><span>Exact event deals</span><strong>{brief.outcomes.exactDeals}</strong><p>All currently resolve to CCW Vegas through controlled deal-source fields.</p></article>
            <article><span>Events represented</span><strong>{brief.outcomes.representedEvents}</strong><p>The controlled CRM setup names only one event.</p></article>
            <article><span>Meeting records to QA</span><strong>{brief.outcomes.meetingRecordsToQa}</strong><p>{brief.outcomes.completedMeetingOutcomes} have a completed outcome; none count as held yet.</p></article>
            <article><span>Marketing Event records</span><strong>{brief.outcomes.marketingEvents}</strong><p>Canonical Marketing Event objects still need to be created.</p></article>
          </div>
          <div className="leadership-caveat"><strong>Pipeline value is not supported.</strong><p>All 29 attributed deals currently have a $0 amount, and none are Closed Won. Leadership should use the stage distribution as follow-up coverage—not as sourced pipeline or revenue.</p><Link href="/events/ccw-vegas#event-results">Open the CCW Vegas record →</Link></div>
          <BackToTop />
        </div>
      </section>

      <section className="shell leadership-trust" id="leadership-trust">
        <div className="section-intro">
          <p className="eyebrow">Decision contract</p>
          <h2>What to trust—and what not to infer.</h2>
        </div>
        <div className="leadership-trust-grid">
          <article><span>Use now</span><h3>Schedule and commitments</h3><p>Tracker-backed dates, participation, activation packages and named rosters, with direct corrections protected from stale upstream data.</p></article>
          <article><span>Use now</span><h3>Execution readiness</h3><p>Structured task coverage, named owners, due dates, source conflicts and freshness status. Open values remain visibly open.</p></article>
          <article><span>Use carefully</span><h3>CRM outcomes</h3><p>Only exact event joins. Scheduled or blank-outcome meetings, text matches and date proximity stay out of completed results.</p></article>
          <article><span>Do not claim yet</span><h3>Portfolio ROI</h3><p>There is no normalized spend model or complete event-key coverage in HubSpot. Until both exist, ROI and event-sourced pipeline totals would be misleading.</p></article>
        </div>
        <div className="leadership-links"><Link href="/sources#data-streams">See the data architecture →</Link><Link href="/sources#writeback-queue">See upstream work →</Link><Link href="/search">Search Event Basecamp →</Link></div>
        <BackToTop />
      </section>
      </PageContentsLayout>
      <Footer />
    </main>
  );
}
