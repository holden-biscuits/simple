import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EventDirectory } from "./components/event-directory";
import { SiteHeader } from "./components/site-header";
import { Footer } from "./components/footer";
import { BackToTop, PageContents } from "./components/page-contents";
import { events, getEventPhase, getProgramDate } from "./data/events";

export const metadata: Metadata = {
  title: "Event Basecamp · 2026–2027",
  description: "Dates, owners, plans, and follow-up for the 2026–2027 event program.",
};

export const dynamic = "force-dynamic";

export default function Home() {
  const programDate = getProgramDate();
  const confirmedUpcoming = events.filter((event) => getEventPhase(event, programDate) !== "past" && event.status === "Confirmed").length;
  const meetings = events.filter((e) => e.guaranteedMeetings.startsWith("Yes")).length;
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
        { id: "program-summary", label: "Program summary" },
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
          <Link href="/sources">
            <header><span>06</span><small>Source truth</small></header>
            <h3>See what changed and what conflicts.</h3>
            <p>Source coverage, scan receipts, applied updates, unresolved conflicts, and working files.</p>
            <b>Open the source record →</b>
          </Link>
        </div>
        <BackToTop />
      </section>

      <section className="stats shell" id="program-summary" aria-label="Program summary">
        <div><strong>{events.length}</strong><span>events on the map</span></div>
        <div><strong>{confirmedUpcoming}</strong><span>confirmed ahead</span></div>
        <div><strong>{meetings}</strong><span>include guaranteed meetings</span></div>
        <div><strong>09</strong><span>planning workstreams</span></div>
      </section>
      <div className="shell section-return"><BackToTop /></div>

      <section className="directory shell" id="events">
        <div className="section-intro">
          <p className="eyebrow">2026–2027 event program</p>
          <h2>Pick an event. See the whole plan.</h2>
          <p>The conference tracker supplies the event list. Active Notion projects add the working details. Each page surfaces the workstreams in play and tucks everything else under “Not in this event plan.”</p>
        </div>
        <EventDirectory events={events} programDate={programDate} />
        <BackToTop />
      </section>
      <Footer />
    </main>
  );
}
