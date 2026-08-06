import type { Metadata } from "next";
import Link from "next/link";
import { EventDirectory } from "./components/event-directory";
import { SiteHeader } from "./components/site-header";
import { Footer } from "./components/footer";
import { events } from "./data/events";

export const metadata: Metadata = {
  title: "Events Fieldbook · 2026",
  description: "The central operating hub for the 2026 event program.",
};

export default function Home() {
  const confirmedUpcoming = events.filter((e) => e.phase !== "past" && e.status === "Confirmed").length;
  const meetings = events.filter((e) => e.guaranteedMeetings.startsWith("Yes")).length;
  return (
    <main>
      <SiteHeader />
      <section className="home-hero">
        <div>
          <p className="eyebrow">2026 events operating system</p>
          <h1>Arrive ready.<br />Leave with pipeline.</h1>
        </div>
        <div className="hero-aside">
          <p>One source for where we’re going, what we’re doing, who owns it, and what happens next.</p>
          <Link className="button" href="/guides">Start with the rules <span>↗</span></Link>
        </div>
      </section>

      <section className="stats shell" aria-label="Program summary">
        <div><strong>{events.length}</strong><span>events tracked</span></div>
        <div><strong>{confirmedUpcoming}</strong><span>confirmed ahead</span></div>
        <div><strong>{meetings}</strong><span>with guaranteed meetings</span></div>
        <div><strong>09</strong><span>standard workstreams</span></div>
      </section>

      <section className="directory shell">
        <div className="section-intro">
          <p className="eyebrow">The field calendar</p>
          <h2>Every event, one operating pattern.</h2>
          <p>The sheet controls the event list. Active Notion projects add execution detail. Empty workstreams stay visibly empty.</p>
        </div>
        <EventDirectory events={events} />
      </section>
      <Footer />
    </main>
  );
}
