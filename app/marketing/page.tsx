import Link from "next/link";
import { BackToTop, PageContentsLayout } from "../components/page-contents";
import { Footer } from "../components/footer";
import { EventMarketingWorkspace, MarketingSupportBoard } from "../components/marketing-support-board";
import { SiteHeader } from "../components/site-header";
import { events, getEventPhase, getProgramDate } from "../data/events";
import { measurementFields, measurementReadiness, measurementWindows, metricDefinitions } from "../data/event-measurement";
import { eventPipelineSnapshot } from "../data/event-pipeline";
import { getMarketingProgramReadiness } from "../data/marketing-readiness";

export const dynamic = "force-dynamic";

const operatingLessons = [
  ["One roster", "The tracker and Notion can drift. Name the final team in one place before registration, travel, and booth shifts are locked."],
  ["One capture path", "Badge scans, dinners, sessions, raffles, sponsor lists, and personal notes must land in the same HubSpot workflow with an owner and next step."],
  ["One decision date", "Tentative events need a real go/no-go date. Do not book travel, print, ship, or launch promotion while the decision is still open."],
  ["Program-specific production", "A booth, a seat drop, a client case study, and a workshop are different jobs. The contract language should become a concrete deliverables list."],
  ["Plan the handoff first", "Agree on lead tiers, required notes, routing, and follow-up timing before the team arrives. Reconstructing context after the event costs pipeline."],
  ["Use the local option", "For international events, compare local printing and rentals against shipping before committing. It can reduce customs risk and last-minute failures."],
  ["Keep a gifting kit ready", "Chicago exposed the cost of rebuilding gifting from scratch. Maintain an approved menu, budget bands, vendors, address and consent checks, a delivery owner, and a HubSpot follow-up rule so an account drop can launch without inventing the process again."],
];

const playbook = [
  {
    id: "before",
    label: "Before",
    title: "Make the opportunity legible",
    items: [
      "Write the event objective in one sentence: pipeline, customer expansion, partner development, thought leadership, or a deliberate combination.",
      "Translate the contract into owners, due dates, and acceptance criteria for the booth, speaking slot, meeting package, attendee passes, lead retrieval, and sponsor promotion.",
      "Get the event app onto every attendee’s phone as soon as access opens. Use it to build target-account and person lists, then enrich named contacts in ZoomInfo.",
      "Define the campaign, source detail, QR/form routing, required HubSpot fields, and lead tiers before any asset is printed.",
      "Give each attendee a short account list and a specific ask. General awareness is not a useful onsite instruction.",
    ],
  },
  {
    id: "onsite",
    label: "Onsite",
    title: "Capture context while it is fresh",
    items: [
      "Test every QR code, scanner, form, notification, and routing rule before the floor opens.",
      "Record who the person is, what they are trying to solve, current technology, urgency, and the agreed next step—not just a badge scan.",
      "Review lead counts and missing notes at the end of each day. Fix gaps while the conversation can still be reconstructed.",
      "Collect proof for the recap: session attendance, booth traffic, strong quotes, photos, questions, objections, and partner interactions.",
      "Keep sales and marketing aligned on the same definition of a high-priority lead; do not send every scan into the same follow-up sequence.",
    ],
  },
  {
    id: "after",
    label: "After",
    title: "Turn activity into an owned next step",
    items: [
      "Import and deduplicate every source immediately. High-intent contacts should reach the right owner while the event is still recent.",
      "Personalize follow-up from the captured conversation. Route lower-intent contacts to an appropriate nurture instead of forcing a sales sequence.",
      "Treat gifting as a measured follow-up motion. Record the account, recipient, reason, delivery status, owner, conversation outcome, and next step in HubSpot.",
      "Reconcile attendance, scans, qualified conversations, booked meetings, demos, pipeline, spend, content, and partner outcomes.",
      "Run a short debrief: what to repeat, change, stop, and test next time. Add those decisions to the event record, not a private document.",
      "Close the loop in the system that owns each fact: outcomes in HubSpot, program status in the tracker, execution decisions in Notion, and final artifacts in the Events Drive. Event Basecamp refreshes from those records after reconciliation.",
    ],
  },
];

const crmActivationSteps = [
  {
    title: "Create one event record",
    copy: "Create a HubSpot Marketing Event for every event TeamSimple is attending. Use the event name, dates, organizer URL, and canonical Event key shown on its Event Basecamp page.",
  },
  {
    title: "Attach the campaign",
    copy: "Associate the Marketing Event with its HubSpot campaign before outreach begins so promotion, forms, lists, and follow-up share one reporting container.",
  },
  {
    title: "Track participant state",
    copy: "Import or sync people with registered, canceled, and attended states. Keep booth conversations and qualified leads as additional outcomes—not substitutes for attendance.",
  },
  {
    title: "Join the commercial record",
    copy: "Put the canonical Event key on meetings and deals. Record the conversation owner, account, outcome, and next step so leadership can separate sourced pipeline from influence.",
  },
];

export default async function MarketingPage({ searchParams }: { searchParams: Promise<{ event?: string }> }) {
  const { event: selectedEvent } = await searchParams;
  const programDate = getProgramDate();
  const activeEvents = events.filter((event) => getEventPhase(event, programDate) !== "past" && event.status !== "No");
  const workload = getMarketingProgramReadiness(activeEvents, programDate);
  return (
    <main id="page-top">
      <SiteHeader />
      <section className="role-hero marketing-hero">
        <p className="eyebrow">Marketing operations</p>
        <h1>Make every event easier to execute and measure.</h1>
        <p className="lede">This page tracks the support promised for each active event and the operating rules that keep contracts, creative, lead capture, follow-up, and reporting connected.</p>
        <Link className="button" href="/#events">Open the event directory <span>↗</span></Link>
      </section>
      <PageContentsLayout primaryLabel="Marketing sections" items={[
        { id: "marketing-pulse", label: "Workload pulse" },
        { id: "lessons", label: "Operating lessons" },
        { id: "event-tasks", label: "Event tasks" },
        { id: "support-matrix", label: "Support matrix" },
        ...playbook.map((section) => ({ id: section.id, label: section.label })),
        { id: "event-pipeline", label: "Event pipeline" },
        { id: "crm-setup", label: "HubSpot setup" },
        { id: "measurement", label: "Measurement" },
      ]}>

      <section className="marketing-program-pulse" id="marketing-pulse">
        <div className="shell">
          <div className="marketing-pulse-head">
            <div><p className="eyebrow">Marketing workload</p><h2>What needs attention now.</h2></div>
            <p>These counts use structured event tasks only. Priority bullets remain visible in each event workspace, but they do not become owned or dated work until the event project records those fields.</p>
          </div>
          <div className="marketing-pulse-metrics">
            <article><span>Task-plan coverage</span><strong>{workload.structuredEvents} / {workload.activeEvents}</strong><p>active events have structured marketing tasks</p></article>
            <article><span>Open structured work</span><strong>{workload.openTasks}</strong><p>tasks are still open or in progress</p></article>
            <article className={workload.overdueTasks ? "marketing-pulse-alert" : undefined}><span>Overdue</span><strong>{workload.overdueTasks}</strong><p>recorded deadlines have passed</p>{workload.overdue ? <Link href={`/marketing?event=${workload.overdue.eventSlug}#event-tasks`}>Open {workload.overdue.eventName} →</Link> : null}</article>
            <article><span>Next shared deadline</span><strong>{workload.nextDeadline?.label ?? "None"}</strong><p>{workload.nextDeadline ? `${workload.nextDeadline.taskCount} task${workload.nextDeadline.taskCount === 1 ? "" : "s"} across ${workload.nextDeadline.eventCount} event${workload.nextDeadline.eventCount === 1 ? "" : "s"}` : "No dated task is recorded"}</p>{workload.nextDeadline ? <Link href={`/marketing?event=${workload.nextDeadline.eventSlug}#event-tasks`}>Open {workload.nextDeadline.eventName} →</Link> : null}</article>
          </div>
          <div className="marketing-pulse-gaps">
            <span>{workload.setupGaps} events still need task setup</span>
            <span>{workload.ownerGaps} open tasks need an owner</span>
            <span>{workload.dateGaps} open tasks need a dated deadline</span>
            <a href="#event-tasks">Open event workspaces ↓</a>
          </div>
        </div>
      </section>

      <section className="shell marketing-lessons" id="lessons">
        <div className="section-intro"><p className="eyebrow">Lessons from this schedule</p><h2>Fix the handoffs that keep repeating.</h2><p>These are the patterns already visible across the 2026–2027 tracker and event plans.</p></div>
        <div className="lesson-grid">{operatingLessons.map(([title, copy], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
        <BackToTop />
      </section>

      <section className="shell event-task-section" id="event-tasks">
        <div className="section-intro"><p className="eyebrow">Event workspaces</p><h2>Keep each event’s execution list in its own tab.</h2><p>These are marketing and program-management tasks. The field brief stays focused on what sales, SDRs, and leadership need before and during the event.</p></div>
        <EventMarketingWorkspace events={activeEvents} initialSlug={selectedEvent} programDate={programDate} />
        <BackToTop />
      </section>

      <section className="marketing-matrix-section" id="support-matrix">
        <div className="shell">
          <div className="section-intro"><p className="eyebrow">Active event support</p><h2>See the work and the gaps in one place.</h2><p>The board uses the same event records as the directory. It does not treat the event team as the marketing owner, and it does not invent a deadline when none is recorded.</p></div>
          <MarketingSupportBoard events={activeEvents} programDate={programDate} />
          <BackToTop />
        </div>
      </section>

      <section className="role-grid shell marketing-playbook">
        {playbook.map((section, index) => <article className="role-block" id={section.id} key={section.id}>
          <div className="role-number">{String(index + 1).padStart(2, "0")}</div>
          <div><p className="eyebrow">{section.label}</p><h2>{section.title}</h2><ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul><BackToTop /></div>
        </article>)}
      </section>

      <section className="event-pipeline" id="event-pipeline">
        <div className="shell">
          <div className="event-pipeline-head">
            <div className="section-intro">
              <p className="eyebrow">HubSpot event outcomes</p>
              <h2>What events have created in the pipeline.</h2>
              <p>The operating view starts with the three controlled event Deal Source values. The exact-attribution view also requires the matching Event detail. Closed Lost and Disqualified records stay out of opportunity totals.</p>
            </div>
            <a href={eventPipelineSnapshot.hubspotUrl} target="_blank" rel="noreferrer">Open the deals in HubSpot ↗</a>
          </div>
          <div className="event-pipeline-metrics" aria-label="Event-sourced deal totals">
            <article><span>Source-based opportunities</span><strong>{eventPipelineSnapshot.opportunities}</strong><p>qualifying deals in the Deal Source view</p></article>
            <article><span>Open pipeline</span><strong>${eventPipelineSnapshot.openPipeline.toLocaleString()}</strong><p>from recorded deal amounts</p></article>
            <article><span>Closed-won revenue</span><strong>${eventPipelineSnapshot.closedWonRevenue.toLocaleString()}</strong><p>recognized only after a deal is won</p></article>
          </div>
          <div className="event-attribution-bridge" aria-label="HubSpot event deal attribution reconciliation">
            <article><span>Deal Source view</span><strong>{eventPipelineSnapshot.sourceEligibleRecords} records</strong><p>{eventPipelineSnapshot.opportunities} remain after stage exclusions.</p></article>
            <article><span>Exact CCW join</span><strong>{eventPipelineSnapshot.exactAttributionRecords} records</strong><p>{eventPipelineSnapshot.exactQualifyingOpportunities} remain after the same exclusions.</p></article>
            <article className="event-attribution-alert"><span>Needs field QA</span><strong>{eventPipelineSnapshot.pairMismatchCount} records</strong><p>{eventPipelineSnapshot.sourceOnlyRecords} source-only · {eventPipelineSnapshot.detailOnlyRecords} detail-only</p></article>
          </div>
          <div className="event-stage-chart" role="img" aria-label={`Current stage distribution for ${eventPipelineSnapshot.opportunities} source-based event opportunities`}>
            <p>Stage mix · source-based opportunities</p>
            {eventPipelineSnapshot.stages.map((stage) => <div className="event-stage-row" key={stage.label}>
              <span>{stage.label}</span>
              <div><i aria-hidden="true" style={{ width: stage.count ? `${Math.max(2, (stage.count / eventPipelineSnapshot.opportunities) * 100)}%` : "0%" }} /></div>
              <strong>{stage.count}</strong>
            </div>)}
          </div>
          <aside className="event-pipeline-quality"><strong>Pipeline hygiene</strong><p>All {eventPipelineSnapshot.dealsWithoutAmount} source-based opportunities lack a reportable amount, so pipeline and revenue remain $0. The exact CCW view contains {eventPipelineSnapshot.exactQualifyingOpportunities} qualifying opportunities; neither view invents value for blank amounts.</p><span>Checked {eventPipelineSnapshot.checkedAt} · {eventPipelineSnapshot.refreshRule}</span></aside>
          <BackToTop />
        </div>
      </section>

      <section className="crm-activation" id="crm-setup">
        <div className="shell">
          <div className="section-intro"><p className="eyebrow">HubSpot activation</p><h2>Build attribution before the first scan.</h2><p>The event plan is not measurement-ready until the event, campaign, participants, meetings, and deals can be joined without guessing.</p></div>
          <div className="crm-activation-status">
            <strong>{measurementReadiness.marketingEventRecords}</strong>
            <span>Marketing Event records detected</span>
            <p>{activeEvents.length} active events need canonical HubSpot event coverage.</p>
          </div>
          <div className="crm-activation-grid">
            {crmActivationSteps.map((step, index) => <article key={step.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{step.title}</h3><p>{step.copy}</p></article>)}
          </div>
          <aside className="crm-activation-note"><strong>Start with the event record, not a reporting spreadsheet.</strong><p>HubSpot supports manually created Marketing Events for in-person programs, campaign association, participant statuses, segments, and event reporting. The canonical Event key supplies the missing join from that attendance record to meetings, deals, and cost.</p><a href="https://knowledge.hubspot.com/integrations/use-marketing-events" target="_blank" rel="noreferrer">Open HubSpot’s Marketing Events guidance ↗</a></aside>
          <BackToTop />
        </div>
      </section>

      <section className="shell measurement" id="measurement">
        <div className="measurement-intro"><p className="eyebrow">Measurement</p><h2>Report the chain, not just the crowd.</h2><p>For every event, report spend and fulfillment alongside qualified conversations, meetings held, demos, pipeline, and closed revenue. Keep brand, partner, and customer outcomes as separate evidence—not a substitute for commercial results.</p></div>
        <dl className="measurement-chain">
          <div><dt>Inputs</dt><dd>Spend · people · deliverables · campaign activity</dd></div>
          <div><dt>Engagement</dt><dd>App targets · sessions · booth conversations · scans</dd></div>
          <div><dt>Progression</dt><dd>Qualified contacts · meetings · demos · opportunities</dd></div>
          <div><dt>Return</dt><dd>Pipeline · closed revenue · partner/customer outcomes · lessons</dd></div>
        </dl>
        <div className="measurement-contract">
          <div className="section-intro"><p className="eyebrow">Minimum data contract</p><h3>Six records make the scorecard usable.</h3><p>If one is missing, show the gap. Do not replace it with a proxy metric.</p></div>
          <div className="measurement-table-wrap"><table className="measurement-table">
            <thead><tr><th>Required field</th><th>System of record</th><th>When</th><th>Rule</th></tr></thead>
            <tbody>{measurementFields.map((item) => <tr key={item.field}><th scope="row">{item.field}</th><td data-label="System of record">{item.owner}</td><td data-label="When">{item.timing}</td><td data-label="Rule">{item.rule}</td></tr>)}</tbody>
          </table></div>
        </div>
        <div className="measurement-windows">
          <div className="section-intro"><p className="eyebrow">Reporting windows</p><h3>Close the loop while the evidence still exists.</h3></div>
          <div>{measurementWindows.map((item, index) => <article key={item.window}><span>{String(index + 1).padStart(2, "0")}</span><time>{item.window}</time><h4>{item.action}</h4><p>{item.output}</p></article>)}</div>
        </div>
        <div className="metric-definitions">
          <div className="section-intro"><p className="eyebrow">Metric definitions</p><h3>Use the same denominator every time.</h3><p>These definitions prevent a scheduled calendar entry, a badge scan, and a qualified opportunity from collapsing into one flattering number.</p></div>
          <div>{metricDefinitions.map((item) => <article key={item.metric}><span>{item.metric}</span><p>{item.definition}</p>{item.formula ? <code>{item.formula}</code> : null}</article>)}</div>
        </div>
        <aside className="measurement-gate"><strong>Portfolio comparison is blocked today.</strong><p>No normalized event-cost ledger exists, active events do not have exact CRM joins, and HubSpot has no Marketing Event records. Until those three foundations are complete, report coverage and follow-up—not event ROI rankings.</p><Link href="/sources#writeback-queue">Open the setup queue →</Link></aside>
        <p className="practice-sources">Practice references: <a href="https://www.cvent.com/en/blog/events/how-to-prove-event-roi" target="_blank" rel="noreferrer">Cvent’s 2026 event-value guidance ↗</a>, <a href="https://www.bizzabo.com/blog/trade-show-roi" target="_blank" rel="noreferrer">Bizzabo’s trade-show measurement model ↗</a>, and <a href="https://knowledge.hubspot.com/integrations/use-marketing-events" target="_blank" rel="noreferrer">HubSpot’s Marketing Events guidance ↗</a>.</p>
        <BackToTop />
      </section>
      </PageContentsLayout>
      <Footer />
    </main>
  );
}
