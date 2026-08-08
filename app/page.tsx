import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EventDirectory } from "./components/event-directory";
import { SiteHeader } from "./components/site-header";
import { Footer } from "./components/footer";
import { BackToTop, PageContents } from "./components/page-contents";
import { events, getEventPhase, getProgramDate } from "./data/events";
import { getGuaranteedMeetingSignal, getSpeakingOpportunitySignal, getStaffingSignal } from "./data/event-signals";
import { getProgramPulse } from "./data/program-pulse";
import { parseEventDirectoryState } from "./data/directory-state";

export const metadata: Metadata = {
  title: "Event Basecamp · 2026–2027",
  description: "Dates, owners, plans, and follow-up for the 2026–2027 event program.",
};

export const dynamic = "force-dynamic";

const lifecycleSteps = [
  { stage: "Choose the event", when: "Before approval", detail: "Confirm the audience fit, participation, package, dates, budget, and event owner.", cta: "Find the event plan", href: "#events" },
  { stage: "Build the plan", when: "After approval", detail: "Name the team, capture the activation, assign the work, and lock travel and logistics.", cta: "Find the event plan", href: "#events" },
  { stage: "Reach the audience", when: "Before the event", detail: "Build the target list, run outreach, fulfill sponsor promotion, and prepare event communications.", cta: "Review marketing support", href: "/marketing#support-matrix" },
  { stage: "Prepare the team", when: "Final prep", detail: "Brief the crew, research priority accounts, rehearse sessions, and agree on qualification and handoffs.", cta: "Open the team guides", href: "/guides#role-guides" },
  { stage: "Run the event", when: "At the event", detail: "Follow the event brief, work the program, capture useful context, and record every booked meeting.", cta: "Find the onsite brief", href: "#events" },
  { stage: "Follow up and learn", when: "After the event", detail: "Send follow-up, record outcomes, assign next steps, and review cost, pipeline, and lessons.", cta: "Review event measurement", href: "/marketing#measurement" },
] as const;

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string | string[]; attendance?: string | string[]; attention?: string | string[]; year?: string | string[] }> }) {
  const params = await searchParams;
  const programDate = getProgramDate();
  const pulse = getProgramPulse(events, programDate);
  const years = [...new Set(events.map((event) => event.dateSort.slice(0, 4)))].sort();
  const initialDirectoryState = parseEventDirectoryState(params, years);
  return (
    <main id="page-top">
      <SiteHeader />
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">TeamSimple · 2026–2027 event plan</p>
          <h1>Find your event. Know what matters.</h1>
          <p className="hero-note">The agenda, team, activation, open work, and follow-up for every event in one place.</p>
          <div className="home-hero-actions"><Link href="#events">Find my event ↓</Link><Link href="/guides">Read the event guide →</Link></div>
        </div>
        <div className="home-hero-start">
          <div className="ranger-figure">
            <Image src="/ranger-raccoon-clean-hat.png" width={1122} height={1402} alt="A raccoon ranger wearing a green hat with the Simple logo" priority unoptimized />
            <span className="ranger-hat-logo" aria-hidden="true"><Image src="/simple-mark.svg" width={19} height={24} alt="" /></span>
          </div>
          <p><strong>Before you go</strong><span>Open your event, check the agenda, and read the TL;DR.</span></p>
        </div>
      </section>
      <PageContents items={[
        { id: "start-map", label: "Start here" },
        { id: "event-lifecycle", label: "Event process" },
        { id: "program-pulse", label: "Program pulse" },
        { id: "events", label: "Event directory" },
      ]} />

      <section className="start-map shell" id="start-map">
        <div className="section-intro">
          <p className="eyebrow">Start with the task</p>
          <h2>What do you need to do?</h2>
          <p>Open an event brief for event-specific facts. Use the role and process pages for tips that are useful no matter where you&apos;re headed.</p>
        </div>
        <div className="start-map-grid">
          <Link href="#events">
            <header><span>01</span><small>Event brief</small></header>
            <h3>Get the plan for one event.</h3>
            <p>Dates, location, roster, sponsorship, speaking, meetings, open work, and organizer links.</p>
            <b>Open the directory →</b>
          </Link>
          <Link href="/ae">
            <header><span>02</span><small>AE</small></header>
            <h3>Prepare and run the conversation.</h3>
            <p>Account context, discovery, demos, HubSpot notes, and the next-step handoff.</p>
            <b>Open the AE guide →</b>
          </Link>
          <Link href="/sdr">
            <header><span>03</span><small>SDR</small></header>
            <h3>Target, qualify, and route.</h3>
            <p>Event outreach, booth conduct, fast qualification, AE handoffs, and follow-up.</p>
            <b>Open the SDR guide →</b>
          </Link>
          <Link href="/marketing">
            <header><span>04</span><small>Marketing</small></header>
            <h3>See the support plan and open work.</h3>
            <p>Event-by-event deliverables, owners, due dates, production gaps, capture, and reporting.</p>
            <b>Open marketing →</b>
          </Link>
          <Link href="/guides">
            <header><span>05</span><small>Process</small></header>
            <h3>Check the standard rules.</h3>
            <p>Planning workstreams, timing, ZoomInfo, booth etiquette, lead tiers, and role guides.</p>
            <b>Open the process guide →</b>
          </Link>
          <Link href="/leadership">
            <header><span>06</span><small>Leadership</small></header>
            <h3>See the whole event portfolio.</h3>
            <p>Upcoming commitments, execution coverage, decision gaps, and CRM-proven outcomes.</p>
            <b>Open the leadership brief →</b>
          </Link>
        </div>
        <section className="event-lifecycle" id="event-lifecycle">
          <div className="event-lifecycle-head">
            <div><p className="eyebrow">Event process</p><h3>What happens before, during, and after every event.</h3></div>
            <p>Start at 01 when an event is proposed. Move in order, and open the linked guide or event plan when you need the details.</p>
          </div>
          <nav className="event-lifecycle-steps" aria-label="Event process">
            {lifecycleSteps.map((step, index) => <Link href={step.href} key={step.stage}>
              <header><span>{String(index + 1).padStart(2, "0")}</span><small>{step.when}</small></header>
              <h4>{step.stage}</h4>
              <p>{step.detail}</p>
              <b>{step.cta} →</b>
            </Link>)}
          </nav>
        </section>
        <BackToTop />
      </section>

      <section className="program-pulse" id="program-pulse">
        <div className="shell">
          <div className="section-intro">
            <p className="eyebrow">Program pulse</p>
            <h2>What’s next—and what still needs attention.</h2>
            <p>A current view of the active schedule and the work that can change an event outcome.</p>
          </div>
          <div className="pulse-metrics" aria-label="Active program summary">
            <article><strong>{pulse.current.length}</strong><span>happening now</span></article>
            <article><strong>{pulse.next60Days.length}</strong><span>starting within 60 days</span></article>
            <article><strong>{pulse.rosterGaps.length}</strong><span>rosters incomplete</span></article>
            <article><strong>{pulse.readiness.dueNow.length}</strong><span>actions due now</span></article>
          </div>
          <div className="pulse-readiness" aria-label="Execution coverage">
            <article><span>Tracked task lists</span><strong>{pulse.readiness.structuredPlans} / {pulse.readiness.activeEvents}</strong><p>active events have searchable tasks; open owners and deadlines stay visible.</p></article>
            <article><span>Checklist setup needed</span><strong>{pulse.readiness.planSetupNeeded}</strong><p>events still show only high-level priorities instead of a task-by-task checklist.</p></article>
            <article><span>Due or overdue now</span><strong>{pulse.readiness.dueNow.length}</strong><p>next actions need attention today.</p></article>
            <article className={pulse.rosterGaps.length ? "metric-attention" : "metric-good"}><span>Rosters incomplete</span><strong>{pulse.rosterGaps.length}</strong><p>event passes still need a named attendee.</p></article>
          </div>
          <div className="pulse-layout">
            <section className="next-stops" aria-labelledby="next-stops-title">
              <div className="pulse-heading"><p className="eyebrow">Route ahead</p><h3 id="next-stops-title">Current and next stops</h3></div>
              <div>{pulse.nextStops.map((event) => {
                const phase = getEventPhase(event, programDate);
                const staffing = getStaffingSignal(event);
                return <Link href={`/events/${event.slug}`} key={event.slug}>
                  <time dateTime={event.dateSort}>{event.dates}</time>
                  <h4>{event.name}</h4>
                  <p>{event.location}</p>
                  <div><span>{phase === "now" ? "Happening now" : getSpeakingOpportunitySignal(event)}</span><span>{getGuaranteedMeetingSignal(event)}</span><span>{staffing.card}</span></div>
                </Link>;
              })}</div>
            </section>
            <section className="attention-board" aria-labelledby="attention-title">
              <div className="pulse-heading"><p className="eyebrow">Action queue</p><h3 id="attention-title">Earliest plans with open inputs</h3></div>
              <ol>{pulse.attention.slice(0, 6).map((item, index) => <li key={item.eventKey}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><Link href={`/events/${item.eventKey}`}>{item.name}</Link><time dateTime={item.dateSort}>{item.dates}</time><p>{item.issues.slice(0, 3).join(" · ")}{item.issues.length > 3 ? ` · +${item.issues.length - 3} more on the brief` : ""}</p>{item.nextAction ? <div className="attention-next"><span>Next action</span><Link href={item.nextAction.href}>{item.nextAction.title}</Link><small>{item.nextAction.owner ? `Owner · ${item.nextAction.owner}` : "Owner · Open"} · {item.nextAction.due ? `Due · ${item.nextAction.due}` : "Due · Open"}</small></div> : null}</div>
              </li>)}</ol>
              <Link className="attention-source-link" href="#events">Open all event plans →</Link>
            </section>
          </div>
          <div className="pulse-footer-links">
            <Link className="pulse-leadership-link" href="/leadership">Open the leadership program brief →</Link>
            <BackToTop />
          </div>
        </div>
      </section>

      <section className="directory shell" id="events">
        <div className="section-intro">
          <p className="eyebrow">2026–2027 event program</p>
          <h2>Pick an event. See the whole plan.</h2>
          <p>Open your event before you travel, promote it, or work the floor. You’ll find the TL;DR, team, open items, prospecting targets, onsite rules, and the programs actually in play.</p>
        </div>
        <EventDirectory events={events} programDate={programDate} initialState={initialDirectoryState} />
        <BackToTop />
      </section>
      <Footer />
    </main>
  );
}
