import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "../../components/footer";
import { BackToTop, PageContents } from "../../components/page-contents";
import { SiteHeader } from "../../components/site-header";
import { eventBySlug, events, getEventPhase, getEventVerification, getWorkstreams, isEmptyWorkstream, workstreamLabels, type WorkstreamKey } from "../../data/events";
import { hasGuaranteedMeetingPackage } from "../../data/event-signals";

export const dynamic = "force-dynamic";

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
  const eventPhase = getEventPhase(event);
  const verification = getEventVerification(event);
  const isNotAttending = event.status === "No";
  const workstreams = getWorkstreams(event);
  const hasGuaranteedMeetings = hasGuaranteedMeetingPackage(event);
  const bookedMeetingCount = event.meetingsBooked.length;
  const bookedMeetingLabel = event.meetingCountLabel ?? bookedMeetingCount.toString();
  const meetingProgressLabel = eventPhase === "past" ? "Meetings recorded" : "Meetings booked";
  const showMeetingProgress = !isNotAttending && (hasGuaranteedMeetings || bookedMeetingCount > 0 || Boolean(event.meetingCountLabel));
  const meetingProgressValue = bookedMeetingCount > 0 || event.meetingCountLabel
    ? bookedMeetingLabel
    : eventPhase === "past"
      ? "Not recorded"
      : "None recorded yet";
  const guaranteedPackageSummary = hasGuaranteedMeetings
    ? event.guaranteedMeetings.replace(/^Yes\s*(?:·\s*)?/i, "") || "Included · count TBD"
    : "None";
  const namedAttendeeCount = event.team.length;
  const teamSummary = isNotAttending
    ? "No team assigned"
    : event.attendeeCount && namedAttendeeCount === event.attendeeCount
      ? `${event.attendeeCount} attending`
      : event.attendeeCount && namedAttendeeCount > 0
        ? `${namedAttendeeCount} named · ${event.attendeeCount} planned`
        : event.attendeeCount
          ? `${event.attendeeCount} planned · names open`
          : namedAttendeeCount
            ? `${namedAttendeeCount} named`
            : "Not assigned";
  const note = event.notes.trim();
  const isSourceConflict = note.toLowerCase().startsWith("source conflict:");
  const resultGroups = [
    [meetingProgressLabel, event.meetingsBooked.length ? event.meetingsBooked : event.meetingCountLabel ? [`${event.meetingCountLabel} meetings ${eventPhase === "past" ? "recorded" : "booked"}; account names were not captured`] : []],
    ["Demos booked", event.demosBooked],
    ["Closed", event.closed],
  ] as const;
  const workstreamKeys = (Object.keys(workstreamLabels) as WorkstreamKey[]).filter((key) => key !== "marketing" && key !== "budget");
  const activeWorkstreamKeys = workstreamKeys.filter((key) => !isEmptyWorkstream(workstreams[key]));
  const inactiveWorkstreamKeys = workstreamKeys.filter((key) => !activeWorkstreamKeys.includes(key));
  const showPriorities = !isNotAttending && eventPhase !== "past" && Boolean(event.priorityActions?.length);
  const programMix = isNotAttending ? "No activation planned" : [
    !event.sponsorship.toLowerCase().startsWith("none") ? "Sponsorship" : null,
    event.speaking.toLowerCase() !== "none" && !event.speaking.toLowerCase().includes("no slot confirmed") ? "Speaking" : null,
    isEmptyWorkstream(workstreams.swag) ? null : "Swag / materials",
  ].filter(Boolean).join(" · ") || "Attendance only";
  const meetingPackage = isNotAttending ? "None" : guaranteedPackageSummary;
  const tldr = [
    ["When", event.dates],
    ["Where", event.venue ? `${event.location} · ${event.venue}` : event.location],
    ["Activation", programMix],
    ["Speaking", event.speaking],
    ["Guaranteed meetings", meetingPackage],
    ...(showMeetingProgress ? [[meetingProgressLabel, meetingProgressValue]] : []),
    ...(event.credentials ? [["Passes / credentials", event.credentials]] : []),
    ["Team", teamSummary],
  ];
  const showResults = eventPhase === "past" || resultGroups.some(([, items]) => items.length > 0) || Boolean(event.crmSnapshot);

  return (
    <main id="page-top">
      <SiteHeader />
      <section className={`event-hero${isNotAttending ? " event-hero-inactive" : ""}`}>
        <div className="event-back"><Link className="back-link" href="/#events"><b aria-hidden="true">←</b><span>Back to events</span></Link><span>{event.status === "No" ? "Not attending" : eventPhase === "past" ? "Past event" : eventPhase === "now" ? "Happening now" : "Upcoming"}</span></div>
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
        ...(showPriorities ? [{ id: "event-priorities", label: "Open items" }] : []),
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
        <div className="event-verification">
          <div><span>Source check</span><strong>Checked <time dateTime={verification.checkedAtISO}>{verification.checkedAt}</time></strong></div>
          <p>{verification.sources.join(" · ")}</p>
          <Link href="/sources">See source record →</Link>
        </div>
      </section>

      {showPriorities ? (
        <section className="event-priorities shell" id="event-priorities">
          <div className="priority-intro">
            <p className="eyebrow">{eventPhase === "now" ? "Onsite focus" : "Before the event"}</p>
            <h2>Still needs attention.</h2>
            <p>{event.priorityActions!.length} event-specific {event.priorityActions!.length === 1 ? "item is" : "items are"} still open in the current plan.</p>
            <Link className="priority-link" href={`/marketing?event=${event.slug}#event-tasks`}>Open marketing workspace →</Link>
          </div>
          <ol>{event.priorityActions!.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ol>
          <BackToTop />
        </section>
      ) : null}

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
          <div className="event-crew-groups">
            <div><h3>Attending</h3>{event.team.length ? <ul className="crew-list">{event.team.map((person) => <li key={person}>{person}</li>)}</ul> : <p>None confirmed</p>}</div>
            {event.available.length ? <div><h3>Available</h3><ul className="crew-list">{event.available.map((person) => <li key={person}>{person}</li>)}</ul></div> : null}
            {event.rating !== "None" ? <div><h3>Event rating</h3><p>{event.rating}</p></div> : null}
          </div>
          <div className="detail-links">
            <a href={event.organizerUrl} target="_blank" rel="noreferrer">Live event site ↗</a>
            {event.notionUrl ? <a href={event.notionUrl} target="_blank" rel="noreferrer">Notion project ↗</a> : <span>Notion project · None</span>}
            {event.relatedLinks?.map((link) => <a href={link.url} target="_blank" rel="noreferrer" key={link.url}>{link.label} ↗</a>)}
            {event.priorityActions?.length ? <Link href={`/marketing?event=${event.slug}#event-tasks`}>Marketing tasks →</Link> : null}
          </div>
          <BackToTop />
        </aside>
        <div className="workstreams">
          <div className="section-intro"><p className="eyebrow">Field checklist</p><h2>What the event team needs to know and do.</h2></div>
          {activeWorkstreamKeys.map((key, index) => {
            const items = workstreams[key];
            return <article className="workstream" id={`workstream-${key}`} key={key}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <div className="workstream-title-row"><h3>{workstreamLabels[key]}</h3></div>
                <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul><BackToTop />
              </div>
            </article>;
          })}
          {inactiveWorkstreamKeys.length ? <details className="not-in-plan"><summary>Not in this event plan <span>{inactiveWorkstreamKeys.length}</span></summary><p>{inactiveWorkstreamKeys.map((key) => workstreamLabels[key]).join(" · ")} — None.</p></details> : null}
        </div>
      </section>

      {showResults ? <section className="shell outcomes" id="event-results">
        <div className="section-intro"><p className="eyebrow">Event results</p><h2>Results recorded across event sources.</h2></div>
        <div className="outcome-grid">{resultGroups.map(([label, items]) => <article key={label}><span>{label}</span>{items.length ? <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p>None</p>}</article>)}</div>
        {event.outcomeNotes?.length ? <ul className="outcome-notes">{event.outcomeNotes.map((note) => <li key={note}>{note}</li>)}</ul> : null}
        {event.crmSnapshot ? <article className="crm-snapshot">
          <div className="crm-snapshot-head">
            <div><p className="eyebrow">{event.crmSnapshot.system} attribution</p><h3>{event.crmSnapshot.totalDeals} explicitly attributed deals</h3></div>
            <a href={event.crmSnapshot.url} target="_blank" rel="noreferrer">Open HubSpot ↗</a>
          </div>
          <p className="crm-attribution">{event.crmSnapshot.attribution} · Checked {event.crmSnapshot.checkedAt}</p>
          <div className="crm-stage-grid">{event.crmSnapshot.stages.map((stage) => <div key={stage.label}><strong>{stage.count}</strong><span>{stage.label}</span></div>)}</div>
          <p className="crm-quality"><strong>Data quality</strong>{event.crmSnapshot.dataQualityNote}</p>
        </article> : null}
        <BackToTop />
      </section> : null}
      </>}
      <Footer />
    </main>
  );
}
