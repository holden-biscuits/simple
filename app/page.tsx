import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EventDirectory } from "./components/event-directory";
import { SiteHeader } from "./components/site-header";
import { Footer } from "./components/footer";
import { BackToTop, PageContents } from "./components/page-contents";
import { events } from "./data/events";

export const metadata: Metadata = {
  title: "Event Basecamp · 2026",
  description: "Dates, owners, plans, and follow-up for the 2026 event program.",
};

export default function Home() {
  const confirmedUpcoming = events.filter((e) => e.phase !== "past" && e.status === "Confirmed").length;
  const meetings = events.filter((e) => e.guaranteedMeetings.startsWith("Yes")).length;
  return (
    <main id="page-top">
      <SiteHeader />
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">TeamSimple · 2026 event plan</p>
          <h1>Know the route before you hit the floor.</h1>
          <p className="hero-note">Dates, staffing, meeting targets, event plans, and follow-up live here.</p>
        </div>
        <div className="hero-tools">
          <div className="route-board" aria-label="Basecamp quick guide">
            <div className="route-board-head"><span>Basecamp notes</span><span>2026</span></div>
            <div className="route-line"><span>01</span><p>Check the event page before booking or shipping anything.</p></div>
            <div className="route-line"><span>02</span><p>Know your accounts, your owner, and the next-step ask.</p></div>
            <div className="route-line"><span>03</span><p>Log the conversation before the day ends.</p></div>
            <Link className="button" href="/guides">Open the prep guide <span>↗</span></Link>
          </div>
          <div className="ranger-card">
            <div className="ranger-figure">
              <Image src="/ranger-raccoon.png" width={1122} height={1402} alt="A raccoon ranger wearing a green hat with the Simple logo" priority unoptimized />
              <span className="ranger-hat-logo" aria-hidden="true">
                <Image src="/simple-mark.svg" width={19} height={24} alt="" />
              </span>
            </div>
            <p><strong>Start here:</strong> check the event page before you book, ship, or promote.</p>
          </div>
        </div>
      </section>
      <PageContents items={[
        { id: "program-summary", label: "Program summary" },
        { id: "events", label: "Event directory" },
      ]} />

      <section className="stats shell" id="program-summary" aria-label="Program summary">
        <div><strong>{events.length}</strong><span>events on the map</span></div>
        <div><strong>{confirmedUpcoming}</strong><span>confirmed ahead</span></div>
        <div><strong>{meetings}</strong><span>include guaranteed meetings</span></div>
        <div><strong>09</strong><span>planning workstreams</span></div>
      </section>
      <div className="shell section-return"><BackToTop /></div>

      <section className="directory shell" id="events">
        <div className="section-intro">
          <p className="eyebrow">2026 event program</p>
          <h2>Pick an event. See the whole plan.</h2>
          <p>The conference tracker supplies the event list. Active Notion projects add the working details. If nothing is planned for a workstream, the page says “None.”</p>
        </div>
        <EventDirectory events={events} />
        <BackToTop />
      </section>
      <Footer />
    </main>
  );
}
