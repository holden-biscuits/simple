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
  const isNotAttending = event.status === "No";
  const workstreams = getWorkstreams(event);
  const hasGuaranteedMeetings = event.guaranteedMeetings.startsWith("Yes");
  const bookedMeetingCount = event.meetingsBooked.length;
  const bookedMeetingLabel = event.meetingCountLabel ?? bookedMeetingCount.toString();
  const note = event.notes.trim();
  const isSourceConflict = note.toLowerCase().startsWith("source conflict:");
  const facts = [
    ["Status", event.status === "No" ? "Not attending" : event.status],
    ["City", event.location],
    ...(event.venue ? [["Venue", event.venue]] : []),
    ["Planned headcount", event.attendeeCount?.toString() ?? "None"],
    ["Guaranteed package", hasGuaranteedMeetings ? event.guaranteedMeetings : "No"],
    ["Meetings recorded", bookedMeetingLabel],
    ["Speaking", event.speaking],
    ["Sponsorship", event.sponsorship],
    ...(event.credentials ? [["Credentials", event.credentials]] : []),
  ] as string[][];
  const resultGroups = [
    ["Meetings recorded", event.meetingsBooked.length ? event.meetingsBooked : event.meetingCountLabel ? [`${event.meetingCountLabel} meetings recorded; account names were not captured`] : []],
    ["Demos booked", event.demosBooked],
    ["Closed", event.closed],
  ] as const;
  const workstreamKeys = Object.keys(workstreamLabels) as WorkstreamKey[];
  const activeWorkstreamKeys = workstreamKeys.filter((key) => !(workstreams[key].length === 1 && workstreams[key][0] === "None"));
  const inactiveWorkstreamKeys = workstreamKeys.filter((key) => !activeWorkstreamKeys.includes(key));
  const programMix = isNotAttending ? "No activation planned" : [
    !event.sponsorship.toLowerCase().startsWith("none") ? "Sponsorship" : null,
    event.speaking.toLowerCase() !== "none" && !event.speaking.toLowerCase().includes("no slot confirmed") ? "Speaking" : null,
    workstreams.swag.length === 1 && workstreams.swag[0] === "None" ? null : "Swag / materials",
  ].filter(Boolean).join(" · ") || "Attendance only";
  const meetingSummary = isNotAttending
    ? "No meetings planned"
    : hasGuaranteedMeetings
    ? `Guaranteed meeting package · ${bookedMeetingLabel} recorded`
    : `No guaranteed meetings · ${bookedMeetingLabel} recorded`;
  const tldr = [
    ["Participation", event.status === "No" ? "Not attending" : event.status],
    ["Program mix", programMix],
    ["Meetings", meetingSummary],
    ["Team", isNotAttending ? "No team assigned" : event.attendeeCount ? `${event.attendeeCount} planned` : event.team.length ? `${event.team.length} named` : "Not assigned"],
  ];
  const showResults = event.phase === "past" || resultGroups.some(([, items]) => items.length > 0);

  return (
    <main id="page-top">
      <SiteHeader />
      <section className={`event-hero${isNotAttending ? " event-hero-inactive" : ""}`}>
        <div className="event-back"><Link className="back-link" href="/#events"><b aria-hidden="true">←</b><span>Back to events</span></Link><span>{event.status === "No" ? "Not attending" : event.phase === "past" ? "Past event" : event.phase === "now" ? "Happening now" : "Upcoming"}</span></div>
        <div className="event-title-row">
          <div><p className="eyebrow">{event.dates}</p><h1>{event.name}</h1><p className="event-city">{event.location}</p></div>
          <a className="round-link" href={event.organizerUrl} target="_blank" rel="noreferrer" aria-label={`Open ${event.name} organizer site`}><span>Event<br />site</span><b>↗</b></a>
        </div>
      </section>
      <PageContents items={isNotAttending ? [
        { id: "event-tldr", label: "TL;DR" },
        { id: "event-no-plan", label: "Event status" },
      ] : [
        { id: "event-tldr", label: "TL;DR" },
        ...(event.priorityActions?.length ? [{ id: "event-priorities", label: "Open items" }] : []),
        { id: "event-facts", label: "At a glance" },
        { id: "event-crew", label: "Crew" },
        ...(event.specialConsiderations?.length ? [{ id: "event-considerations", label: "Rules of engagement" }] : []),
        ...activeWorkstreamKeys.map((key) => ({ id: `workstream-${key}`, label: workstreamLabels[key] })),
        ...(showResults ? [{ id: "event-results", label: "Results" }] : []),
      ]} />

      <section className="event-tldr shell" id="event-tldr">
        <div className="section-intro"><p className="eyebrow">TL;DR</p><h2>Know this before you go.</h2></div>
        <div className="tldr-grid">{tldr.map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}</div>
        {note ? <p className={`tldr-note${isSourceConflict ? " source-conflict" : ""}`}>
          {isSourceConflict ? <strong>Source check needed</strong> : null}
          {isSourceConflict ? note.replace(/^Source conflict:\s*/i, "") : note}
        </p> : null}
      </section>

      {isNotAttending ? (
        <section className="event-no-plan shell" id="event-no-plan">
          <div className="event-no-mark" aria-hidden="true">×</div>
          <div>
            <p className="eyebrow">No TeamSimple program</p>
            <h2>Nothing to prep for this event.</h2>
            <p>TeamSimple is not attending. There is no staffing, travel, booth, meeting, swag, marketing, follow-up, or budget plan.</p>
            <div className="detail-links event-no-links">
              <a href={event.organizerUrl} target="_blank" rel="noreferrer">Live event site ↗</a>
              {event.notionUrl ? <a href={event.notionUrl} target="_blank" rel="noreferrer">Notion record ↗</a> : null}
              {event.relatedLinks?.map((link) => <a href={link.url} target="_blank" rel="noreferrer" key={link.url}>{link.label} ↗</a>)}
            </div>
            <BackToTop />
          </div>
        </section>
      ) : <>
      {event.priorityActions?.length ? (
        <section className="event-priorities shell" id="event-priorities">
          <div className="section-intro"><p className="eyebrow">Open items</p><h2>Do these next.</h2></div>
          <ol>{event.priorityActions.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ol>
          <BackToTop />
        </section>
      ) : null}

      <section className="fact-strip shell" id="event-facts">{facts.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>

      {event.specialConsiderations?.length ? (
        <section className="event-considerations shell" id="event-considerations">
          <div><p className="eyebrow">Rules of engagement</p><h2>What is different about this event.</h2></div>
          <ol>{event.specialConsiderations.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ol>
          <BackToTop />
        </section>
      ) : null}

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
            {event.relatedLinks?.map((link) => <a href={link.url} target="_blank" rel="noreferrer" key={link.url}>{link.label} ↗</a>)}
          </div>
          <BackToTop />
        </aside>
        <div className="workstreams">
          <div className="section-intro"><p className="eyebrow">Event checklist</p><h2>What needs to happen.</h2></div>
          {activeWorkstreamKeys.map((key, index) => {
            const items = workstreams[key];
            return <article className="workstream" id={`workstream-${key}`} key={key}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><h3>{workstreamLabels[key]}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul><BackToTop /></div>
            </article>;
          })}
          {inactiveWorkstreamKeys.length ? <details className="not-in-plan"><summary>Not in this event plan <span>{inactiveWorkstreamKeys.length}</span></summary><p>{inactiveWorkstreamKeys.map((key) => workstreamLabels[key]).join(" · ")} — None.</p></details> : null}
        </div>
      </section>

      {showResults ? <section className="shell outcomes" id="event-results">
        <div className="section-intro"><p className="eyebrow">Event results</p><h2>Results recorded in the tracker.</h2></div>
        <div className="outcome-grid">{resultGroups.map(([label, items]) => <article key={label}><span>{label}</span>{items.length ? <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p>None</p>}</article>)}</div>
        {event.outcomeNotes?.length ? <ul className="outcome-notes">{event.outcomeNotes.map((note) => <li key={note}>{note}</li>)}</ul> : null}
        <BackToTop />
      </section> : null}
      </>}
      <Footer />
    </main>
  );
}
