import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "../../components/footer";
import { BackToTop, PageContents } from "../../components/page-contents";
import { SiteHeader } from "../../components/site-header";
import { eventBySlug, events, getWorkstreams, workstreamLabels, type WorkstreamKey } from "../../data/events";

export function generateStaticParams() { return events.map((event) => ({ slug: event.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = eventBySlug(slug);
  return { title: event ? `${event.name} · Event Basecamp` : "Event not found" };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = eventBySlug(slug);
  if (!event) notFound();
  const workstreams = getWorkstreams(event);
  const facts = [
    ["Status", event.status === "No" ? "Not attending" : event.status],
    ["Where", event.location],
    ["Planned headcount", event.attendeeCount?.toString() ?? "None"],
    ["Guaranteed meetings", event.guaranteedMeetings],
    ["Speaking", event.speaking],
    ["Sponsorship", event.sponsorship],
  ];
  const resultGroups = [
    ["Meetings booked", event.meetingsBooked],
    ["Demos booked", event.demosBooked],
    ["Closed", event.closed],
  ] as const;
  const workstreamKeys = Object.keys(workstreamLabels) as WorkstreamKey[];

  return (
    <main id="page-top">
      <SiteHeader />
      <section className="event-hero">
        <div className="event-back"><Link className="back-link" href="/#events"><b aria-hidden="true">←</b><span>Back to events</span></Link><span>{event.phase === "past" ? "Past event" : event.phase === "now" ? "Happening now" : "Upcoming"}</span></div>
        <div className="event-title-row">
          <div><p className="eyebrow">{event.dates}</p><h1>{event.name}</h1><p className="event-city">{event.location}</p></div>
          <a className="round-link" href={event.organizerUrl} target="_blank" rel="noreferrer" aria-label={`Open ${event.name} organizer site`}><span>Event<br />site</span><b>↗</b></a>
        </div>
        <p className="event-summary">{event.notes}</p>
      </section>
      <PageContents items={[
        { id: "event-facts", label: "At a glance" },
        { id: "event-crew", label: "Crew" },
        ...workstreamKeys.map((key) => ({ id: `workstream-${key}`, label: workstreamLabels[key] })),
        { id: "event-results", label: "Results" },
      ]} />

      <section className="fact-strip shell" id="event-facts">{facts.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>

      <section className="shell event-body">
        <aside id="event-crew">
          <p className="eyebrow">Crew</p>
          <h2>Who’s going</h2>
          <dl>
            <div><dt>Attending</dt><dd>{event.team.length ? event.team.join(", ") : "None confirmed"}</dd></div>
            <div><dt>Available</dt><dd>{event.available.length ? event.available.join(", ") : "None listed"}</dd></div>
            <div><dt>Rating</dt><dd>{event.rating}</dd></div>
          </dl>
          <div className="detail-links">
            <a href={event.organizerUrl} target="_blank" rel="noreferrer">Live event site ↗</a>
            {event.notionUrl ? <a href={event.notionUrl} target="_blank" rel="noreferrer">Notion project ↗</a> : <span>Notion project · None</span>}
          </div>
          <BackToTop />
        </aside>
        <div className="workstreams">
          <div className="section-intro"><p className="eyebrow">Event checklist</p><h2>What needs to happen.</h2></div>
          {workstreamKeys.map((key, index) => {
            const items = workstreams[key];
            const isNone = items.length === 1 && items[0] === "None";
            return <article className={`workstream ${isNone ? "workstream-none" : ""}`} id={`workstream-${key}`} key={key}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><h3>{workstreamLabels[key]}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul><BackToTop /></div>
            </article>;
          })}
        </div>
      </section>

      <section className="shell outcomes" id="event-results">
        <div className="section-intro"><p className="eyebrow">Event results</p><h2>Results recorded in the tracker.</h2></div>
        <div className="outcome-grid">{resultGroups.map(([label, items]) => <article key={label}><span>{label}</span>{items.length ? <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p>None</p>}</article>)}</div>
        <BackToTop />
      </section>
      <Footer />
    </main>
  );
}
