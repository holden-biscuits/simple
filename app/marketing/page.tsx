import Link from "next/link";
import { BackToTop, PageContents } from "../components/page-contents";
import { Footer } from "../components/footer";
import { EventMarketingWorkspace, MarketingSupportBoard } from "../components/marketing-support-board";
import { SiteHeader } from "../components/site-header";
import { events, getEventPhase, getProgramDate } from "../data/events";

export const dynamic = "force-dynamic";

const operatingLessons = [
  ["One roster", "The tracker and Notion can drift. Name the final team in one place before registration, travel, and booth shifts are locked."],
  ["One capture path", "Badge scans, dinners, sessions, raffles, sponsor lists, and personal notes must land in the same HubSpot workflow with an owner and next step."],
  ["One decision date", "Tentative events need a real go/no-go date. Do not book travel, print, ship, or launch promotion while the decision is still open."],
  ["Program-specific production", "A booth, a seat drop, a client case study, and a workshop are different jobs. The contract language should become a concrete deliverables list."],
  ["Plan the handoff first", "Agree on lead tiers, required notes, routing, and follow-up timing before the team arrives. Reconstructing context after the event costs pipeline."],
  ["Use the local option", "For international events, compare local printing and rentals against shipping before committing. It can reduce customs risk and last-minute failures."],
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
      "Reconcile attendance, scans, qualified conversations, booked meetings, demos, pipeline, spend, content, and partner outcomes.",
      "Run a short debrief: what to repeat, change, stop, and test next time. Add those decisions to the event record, not a private document.",
      "Update this fieldbook, the tracker, the Notion project, and the Events Drive so the next team sees the same truth.",
    ],
  },
];

export default async function MarketingPage({ searchParams }: { searchParams: Promise<{ event?: string }> }) {
  const { event: selectedEvent } = await searchParams;
  const programDate = getProgramDate();
  const activeEvents = events.filter((event) => getEventPhase(event, programDate) !== "past" && event.status !== "No");
  return (
    <main id="page-top">
      <SiteHeader />
      <section className="role-hero marketing-hero">
        <p className="eyebrow">Marketing operations</p>
        <h1>Make every event easier to execute and measure.</h1>
        <p className="lede">This page tracks the support promised for each active event and the operating rules that keep contracts, creative, lead capture, follow-up, and reporting connected.</p>
        <Link className="button" href="/#events">Open the event directory <span>↗</span></Link>
      </section>
      <PageContents items={[
        { id: "lessons", label: "Operating lessons" },
        { id: "event-tasks", label: "Event tasks" },
        { id: "support-matrix", label: "Support matrix" },
        ...playbook.map((section) => ({ id: section.id, label: section.label })),
        { id: "measurement", label: "Measurement" },
      ]} />

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

      <section className="shell measurement" id="measurement">
        <div><p className="eyebrow">Measurement</p><h2>Report the chain, not just the crowd.</h2><p>For every event, report spend and fulfillment alongside qualified conversations, meetings booked, demos, pipeline, and closed revenue. Keep brand, partner, and customer outcomes as separate evidence—not a substitute for commercial results.</p></div>
        <dl>
          <div><dt>Inputs</dt><dd>Spend · people · deliverables · campaign activity</dd></div>
          <div><dt>Engagement</dt><dd>App targets · sessions · booth conversations · scans</dd></div>
          <div><dt>Progression</dt><dd>Qualified contacts · meetings · demos · opportunities</dd></div>
          <div><dt>Return</dt><dd>Pipeline · closed revenue · partner/customer outcomes · lessons</dd></div>
        </dl>
        <p className="practice-sources">Practice references: <a href="https://www.cvent.com/en/blog/events/how-effectively-collect-leads-trade-shows" target="_blank" rel="noreferrer">Cvent’s 2026 trade-show lead capture guidance ↗</a> and <a href="https://www.salesforce.com/en-us/wp-content/uploads/sites/4/documents/partners/gtm-offerings/isv-agentforce-marketing-playbook.pdf" target="_blank" rel="noreferrer">Salesforce’s event follow-up playbook ↗</a>.</p>
        <BackToTop />
      </section>
      <Footer />
    </main>
  );
}
