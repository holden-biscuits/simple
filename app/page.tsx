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

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string | string[]; attendance?: string | string[]; year?: string | string[] }> }) {
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
          <h1>Know the route before you hit the floor.</h1>
          <p className="hero-note">Dates, staffing, meeting targets, event plans, and follow-up live here.</p>
          <div className="ranger-card">
            <div className="ranger-figure">
              <Image src="/ranger-raccoon-clean-hat.png" width={1122} height={1402} alt="A raccoon ranger wearing a green hat with the Simple logo" priority unoptimized />
              <span className="ranger-hat-logo" aria-hidden="true"><Image src="/simple-mark.svg" width={19} height={24} alt="" /></span>
            </div>
            <p><strong>Start here:</strong> find your event and read the TL;DR before you go.</p>
          </div>
        </div>
        <div className="hero-tools">
          <div className="route-board" aria-label="Before you go checklist">
            <div className="route-board-head"><span>Before you go</span><span>3 checks</span></div>
            <div className="route-line"><span>01</span><p>Confirm your travel, hotel, credentials, and event app.</p></div>
            <div className="route-line"><span>02</span><p>Review your meetings, sessions, target accounts, and booth coverage.</p></div>
            <div className="route-line"><span>03</span><p>Know the AE handoff and what you must record in HubSpot.</p></div>
            <Link className="button" href="#events">Find my event <span>↓</span></Link>
          </div>
        </div>
      </section>
      <PageContents items={[
        { id: "start-map", label: "Start here" },
        { id: "program-pulse", label: "Program pulse" },
        { id: "events", label: "Event directory" },
      ]} />

      <section className="start-map shell" id="start-map">
        <div className="section-intro">
          <p className="eyebrow">Start with the task</p>
          <h2>What do you need to do?</h2>
          <p>Open an event brief for event-specific facts. Use the role and process pages for work that repeats across the program.</p>
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
          <Link href="/sources" className="start-map-wide">
            <header><span>07</span><small>Source truth</small></header>
            <h3>See what changed and what conflicts.</h3>
            <p>Source coverage, scan receipts, applied updates, unresolved conflicts, and working files.</p>
            <b>Open the source record →</b>
          </Link>
        </div>
        <BackToTop />
      </section>

      <section className="program-pulse" id="program-pulse">
        <div className="shell">
          <div className="section-intro">
            <p className="eyebrow">Program pulse</p>
            <h2>What’s next—and what still needs attention.</h2>
            <p>A current view of the active schedule. Open an event for the field brief; use the source record when a fact is disputed.</p>
          </div>
          <div className="pulse-metrics" aria-label="Active program summary">
            <article><strong>{pulse.current.length}</strong><span>happening now</span></article>
            <article><strong>{pulse.next60Days.length}</strong><span>starting within 60 days</span></article>
            <article><strong>{pulse.rosterGaps.length}</strong><span>rosters incomplete</span></article>
            <article><strong>{pulse.sourceConflicts.length}</strong><span>source conflicts</span></article>
          </div>
          <div className="pulse-readiness" aria-label="Execution and source coverage">
            <article><span>Structured task plans</span><strong>{pulse.readiness.structuredPlans} / {pulse.readiness.activeEvents}</strong><p>active events have a task list with statuses; individual owner gaps remain visible.</p></article>
            <article><span>Plan setup needed</span><strong>{pulse.readiness.planSetupNeeded}</strong><p>events have priorities but still need owners and dates.</p></article>
            <article><span>Due or overdue now</span><strong>{pulse.readiness.dueNow.length}</strong><p>next actions need attention today.</p></article>
            <article><span>Source checks due</span><strong>{pulse.sourceChecksDue.length}</strong><p>active event briefs are outside their freshness window.</p></article>
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
                <div><Link href={`/events/${item.eventKey}`}>{item.name}</Link><time dateTime={item.dateSort}>{item.dates}</time><p>{item.issues.join(" · ")}</p>{item.nextAction ? <div className="attention-next"><span>Next action</span><Link href={item.nextAction.href}>{item.nextAction.title}</Link><small>{item.nextAction.owner ? `Owner · ${item.nextAction.owner}` : "Owner · Open"} · {item.nextAction.due ? `Due · ${item.nextAction.due}` : "Due · Open"}</small></div> : null}</div>
              </li>)}</ol>
              <Link className="attention-source-link" href="/sources#approval-queue">Open source and approval record →</Link>
            </section>
          </div>
          <Link className="pulse-leadership-link" href="/leadership">Open the leadership program brief →</Link>
          <BackToTop />
        </div>
      </section>

      <section className="directory shell" id="events">
        <div className="section-intro">
          <p className="eyebrow">2026–2027 event program</p>
          <h2>Pick an event. See the whole plan.</h2>
          <p>The conference tracker supplies the event list. Active Notion projects add the working details. Each page surfaces the workstreams in play and tucks everything else under “Not in this event plan.”</p>
        </div>
        <EventDirectory events={events} programDate={programDate} initialState={initialDirectoryState} />
        <BackToTop />
      </section>
      <Footer />
    </main>
  );
}
