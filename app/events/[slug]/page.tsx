import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Footer } from "../../components/footer";
import { BackToTop, PageContentsLayout } from "../../components/page-contents";
import { SiteHeader } from "../../components/site-header";
import { eventBySlug, events, getProgramDate, getWorkstreams, isEmptyWorkstream, workstreamLabels, type WorkstreamKey } from "../../data/events";
import { getCompletedEventOutcomeCoverage, getStaffingSignal, hasGuaranteedMeetingPackage } from "../../data/event-signals";
import { getSafeEventReturnHref } from "../../data/directory-state";
import { getEventRoleRoutes } from "../../data/event-role-routes";
import { getEventFootprint } from "../../data/event-footprint";
import { getEventProspectingBrief } from "../../data/event-prospecting";
import { getEventPageModel, getEventWorkstreamState } from "../../data/event-page-model";
import { getEventUpdateRoutes } from "../../data/event-update-routes";
import { getEventAgenda } from "../../data/event-agenda";

export const dynamic = "force-dynamic";

export function generateStaticParams() { return events.map((event) => ({ slug: event.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = eventBySlug(slug);
  if (!event) return { title: "Event not found" };
  const incoming = await headers();
  const host = incoming.get("x-forwarded-host") ?? incoming.get("host") ?? "teamsimple-events-fieldbook.holden165736.chatgpt.site";
  const protocol = incoming.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = new URL(`${protocol}://${host}`);
  const canonical = `/events/${event.slug}`;
  const image = new URL("/og-2026-2027.png", origin).toString();
  const participation = event.status === "No" ? "TeamSimple is not attending." : "TeamSimple event brief.";
  const description = `${participation} ${event.dates} · ${event.location}. Open the agenda, team, activation, and current plan.`;
  const title = `${event.name} · Event Basecamp`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "TeamSimple Event Basecamp",
      images: [{ url: image, width: 1731, height: 909, alt: "TeamSimple Event Basecamp · 2026–2027" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function EventPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ returnTo?: string | string[] }> }) {
  const { slug } = await params;
  const { returnTo } = await searchParams;
  const event = eventBySlug(slug);
  if (!event) notFound();
  const eventDirectoryHref = getSafeEventReturnHref(returnTo);
  const programDate = getProgramDate();
  const pageModel = getEventPageModel(event, programDate);
  const { phase: eventPhase, isNotAttending, hasRecordedResults, showProspecting, showPlanningBody, showResults } = pageModel;
  const roleRoutes = getEventRoleRoutes(event, eventPhase);
  const prospecting = getEventProspectingBrief(event);
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
  const staffing = getStaffingSignal(event);
  const note = event.notes.trim();
  const userFacingNote = note.replace(/^Source conflict:\s*/i, "");
  const resultGroups = [
    [meetingProgressLabel, event.meetingsBooked.length ? event.meetingsBooked : event.meetingCountLabel ? [event.meetingRecordSummary ?? `${event.meetingCountLabel} meetings ${eventPhase === "past" ? "recorded" : "booked"}; account names were not captured`] : []],
    ["Follow-up meetings booked", event.followupMeetingsBooked ? [`${event.followupMeetingsBooked} scheduled · account, contact, date, owner, and outcome pending in HubSpot`] : []],
    [eventPhase === "past" ? "Demos recorded" : "Demos booked", event.demosBooked.length ? event.demosBooked : event.demoCountLabel ? [`${event.demoCountLabel} rows labeled Demo in the meetings tracker`] : []],
    ["Closed", event.closed],
  ] as const;
  const missingResultLabels = getCompletedEventOutcomeCoverage(event).missing;
  const workstreamKeys = (Object.keys(workstreamLabels) as WorkstreamKey[]).filter((key) => key !== "marketing" && key !== "budget");
  const workstreamStates = new Map(workstreamKeys.map((key) => [key, getEventWorkstreamState(event, key)]));
  const activeWorkstreamKeys = workstreamKeys.filter((key) => workstreamStates.get(key) === "active");
  const reviewWorkstreamKeys = workstreamKeys.filter((key) => workstreamStates.get(key) === "needs-confirmation");
  const displayedWorkstreamKeys = workstreamKeys.filter((key) => workstreamStates.get(key) !== "inactive");
  const inactiveWorkstreamKeys = workstreamKeys.filter((key) => workstreamStates.get(key) === "inactive");
  const workstreamContents = displayedWorkstreamKeys.map((key) => ({ id: `workstream-${key}`, label: workstreamLabels[key] }));
  const eventBriefContents = isNotAttending ? [
    { id: "event-tldr", label: "TL;DR" },
    { id: "event-agenda", label: "Agenda" },
    ...(roleRoutes.length ? [{ id: "event-role-routes", label: "Your role" }] : []),
    { id: "event-no-plan", label: "Event status" },
  ] : [
    { id: "event-tldr", label: "TL;DR" },
    { id: "event-agenda", label: "Agenda" },
    ...(event.specialConsiderations?.length ? [{ id: "event-considerations", label: "Need to know" }] : []),
    ...(roleRoutes.length ? [{ id: "event-role-routes", label: "Your role" }] : []),
    { id: "event-prospecting", label: "Prospecting" },
    { id: "event-crew", label: "Crew" },
  ];
  const eventRecordContents = showResults ? [{ id: "event-results", label: "Results" }] : [];
  const eventContentsGroups = [
    { label: "Event brief", items: eventBriefContents },
    ...(!isNotAttending && workstreamContents.length ? [{ label: pageModel.secondaryLabel, items: workstreamContents }] : []),
    ...(eventRecordContents.length ? [{ label: eventPhase === "past" ? "Closeout" : "Results", items: eventRecordContents }] : []),
  ];
  const footprint = getEventFootprint(event);
  const swagSummary = isNotAttending || isEmptyWorkstream(workstreams.swag) ? "None" : "In plan · see event materials";
  const partnerGuidelines = event.relatedLinks?.find((link) => link.label.includes("Genesys sales rules"));
  const meetingPackage = isNotAttending ? "None" : guaranteedPackageSummary;
  const tldr = isNotAttending ? [
    ["When", event.dates],
    ["Where", event.venue ? `${event.location} · ${event.venue}` : event.location],
    ["Participation", "Not attending"],
    ["TeamSimple program", "None"],
  ] : [
    ["When", event.dates],
    ["Where", event.venue ? `${event.location} · ${event.venue}` : event.location],
    ["Onsite footprint", footprint.label],
    ["Speaking", event.speaking],
    ["Swag / materials", swagSummary],
    ["Guaranteed meetings", meetingPackage],
    ...(showMeetingProgress ? [[meetingProgressLabel, meetingProgressValue]] : []),
    ...(event.followupMeetingsBooked ? [["Follow-up meetings", `${event.followupMeetingsBooked} booked · HubSpot details pending`]] : []),
    ...(eventPhase === "past" && event.rating !== "None" ? [["Event rating", event.rating]] : []),
    ...(eventPhase === "past" ? [["Closeout", hasRecordedResults ? "Results recorded · see below" : "No outcomes recorded yet"]] : []),
    [staffing.passCount ? "Team & passes" : "Team", staffing.summary],
  ];
  const updateRoutes = getEventUpdateRoutes(event);
  const crmUpdateRoute = updateRoutes.find((route) => route.id === "hubspot");
  const agenda = getEventAgenda(event, programDate);

  return (
    <main id="page-top">
      <SiteHeader />
      <section className={`event-hero${isNotAttending ? " event-hero-inactive" : ""}`}>
        <div className="event-back"><Link className="back-link" href={eventDirectoryHref}><b aria-hidden="true">←</b><span>Back to events</span></Link><span>{event.status === "No" ? "Not attending" : eventPhase === "past" ? "Past event" : eventPhase === "now" ? "Happening now" : "Upcoming"}</span></div>
        <div className="event-title-row">
          <div><p className="eyebrow">{event.dates}</p><h1>{event.name}</h1><p className="event-city">{event.location}</p></div>
          <a className="round-link" href={event.organizerUrl} target="_blank" rel="noreferrer" aria-label={`Open ${event.name} organizer site`}><span>Event<br />site</span><b>↗</b></a>
        </div>
      </section>
      <PageContentsLayout mobileLabel="Navigate this event" groups={eventContentsGroups}>

      <section className="event-tldr shell" id="event-tldr">
        <div className="section-intro"><p className="eyebrow">TL;DR</p><h2>{pageModel.tldrHeading}</h2></div>
        <div className={`tldr-grid tldr-grid-${tldr.length + (event.tldrCallout ? 1 : 0)}`}>
          {tldr.map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}
          {event.tldrCallout ? <aside className="tldr-fyi" aria-label={event.tldrCallout.label}>
            <span>{event.tldrCallout.label}</span>
            <strong>{event.tldrCallout.title}</strong>
            <small>{event.tldrCallout.detail}</small>
            <p><b>Goal</b>{event.tldrCallout.goal}</p>
            <ul><li>{event.tldrCallout.salesAction}</li></ul>
            {event.tldrCallout.href ? <a href={event.tldrCallout.href} target="_blank" rel="noreferrer">{event.tldrCallout.action ?? "Open brief"} ↗</a> : null}
          </aside> : null}
        </div>
        {userFacingNote ? <p className="tldr-note">{userFacingNote}</p> : null}
      </section>

      <section className="event-agenda shell" id="event-agenda">
        <div className="section-intro"><p className="eyebrow">Agenda</p><h2>{eventPhase === "past" ? "Recorded schedule." : "What is on the schedule."}</h2><p>{agenda.days.length ? "Official event schedule. Check the live agenda for session details and last-minute changes." : "TeamSimple commitments are listed here. Use the live agenda for organizer sessions and last-minute changes."}</p></div>
        {agenda.days.length ? <div className="event-agenda-days">{agenda.days.map((day) => <section key={day.date}>
          <h3>{day.date}</h3>
          <ol>{day.items.map((item) => <li className={item.teamSimple ? "event-agenda-team" : undefined} key={`${day.date}-${item.time}-${item.title}`}><time>{item.time}</time><div><span>{item.title}</span>{item.teamSimple ? <small>TeamSimple · Cat speaking</small> : null}</div></li>)}</ol>
        </section>)}</div> : <ol className="event-agenda-list">{agenda.items.map((item, index) => <li key={`${item.label}-${item.title}`}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <div><small>{item.label}</small><h3>{item.title}</h3><p>{item.detail}</p></div>
          <b className={`agenda-state agenda-state-${item.state}`}>{item.state === "confirmed" ? "Confirmed" : "Confirm"}</b>
        </li>)}</ol>}
        <a className="event-agenda-link" href={agenda.url} target="_blank" rel="noreferrer">{agenda.linkLabel} ↗</a>
        <BackToTop />
      </section>

      {event.specialConsiderations?.length ? (
        <section className="event-considerations shell" id="event-considerations">
          <div><p className="eyebrow">Need to know</p><h2>Key information for the sales team.</h2></div>
          <ul>{event.specialConsiderations.map((item) => <li key={item}>{item}</li>)}</ul>
          {partnerGuidelines ? <a className="text-link" href={partnerGuidelines.url} target="_blank" rel="noreferrer">Open the restricted partner guidelines ↗</a> : null}
          <BackToTop />
        </section>
      ) : null}

      {roleRoutes.length ? <section className="event-role-routes shell" id="event-role-routes">
        <div className="section-intro"><p className="eyebrow">For sales</p><h2>What to do and expect at this event.</h2></div>
        <div className="event-role-briefs">{roleRoutes.map((route) => <article key={route.role}>
          <header><h3>{route.role}</h3><span>3 event-specific points</span></header>
          <ul>{route.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
          <Link href={route.href}>{route.cta} →</Link>
        </article>)}</div>
        <BackToTop />
      </section> : null}

      {showProspecting ? <section className="event-prospecting shell" id="event-prospecting">
        <div className="event-prospecting-head">
          <div className="section-intro">
            <p className="eyebrow">Prospecting brief</p>
            <h2>{eventPhase === "past" ? "Who is worth following up with." : "Who is worth finding here."}</h2>
            <p>{prospecting.summary}</p>
          </div>
          <div className={`prospecting-confidence prospecting-confidence-${prospecting.confidence.toLowerCase().replaceAll(" ", "-")}`}>
            <span>Audience basis</span><strong>{prospecting.confidence}</strong>
          </div>
        </div>
        <div className="prospecting-filter-grid">
          <article>
            <header><h3>Company criteria</h3></header>
            <dl>{prospecting.companyFilters.map((filter) => <div key={`${filter.label}-${filter.value}`}><dt>{filter.label}</dt><dd>{filter.value}</dd></div>)}</dl>
            <a href={prospecting.zoomInfoCompanyUrl} target="_blank" rel="noreferrer">Open ZoomInfo company search ↗</a>
            <small>Opens Advanced Search. Apply the criteria above.</small>
          </article>
          <article>
            <header><h3>Contact criteria</h3></header>
            <dl>{prospecting.contactFilters.map((filter) => <div key={`${filter.label}-${filter.value}`}><dt>{filter.label}</dt><dd>{filter.value}</dd></div>)}</dl>
            <a href={prospecting.zoomInfoContactUrl} target="_blank" rel="noreferrer">Open ZoomInfo contact search ↗</a>
            <small>Opens Advanced Search. Apply the criteria above.</small>
          </article>
        </div>
        <div className="prospecting-sequence">
          <h3>Use this order</h3>
          <ol>
            <li><span>01</span><div><strong>Start with the event app.</strong><p>Use the app, organizer file, or meeting schedule to identify companies and people who may actually be there.</p></div></li>
            <li><span>02</span><div><strong>Qualify the companies.</strong><p>Apply the company criteria in ZoomInfo, including the event-specific technology or industry filter.</p></div></li>
            <li><span>03</span><div><strong>Find the right people.</strong><p>Enrich the named contacts and prioritize the job functions, titles, and seniority above.</p></div></li>
            <li><span>04</span><div><strong>Reach out before the show.</strong><p>Invite qualified people to the relevant booth, meeting, or session and route the next step to the right AE.</p></div></li>
          </ol>
          {prospecting.hubspotSegment ? <a href={prospecting.hubspotSegment.url} target="_blank" rel="noreferrer">Open the existing HubSpot segment ↗</a> : null}
          {prospecting.hubspotAccountLinks.map((account) => <a href={account.url} target="_blank" rel="noreferrer" key={account.name}>Open {account.name} contacts in HubSpot ↗</a>)}
        </div>
        <p className="prospecting-boundary"><strong>Do not confuse targeting with attendance.</strong> A company fits the event audience only after the event app, organizer file, matched-meeting schedule, scan, session, or other named signal connects it to the show.</p>
        <BackToTop />
      </section> : null}

      {!showPlanningBody ? (
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
      <section className="shell event-body">
        <aside id="event-crew">
          <p className="eyebrow">Crew</p>
          <h2>{eventPhase === "past" ? "Who attended" : "Who’s going"}</h2>
          <div className="event-crew-groups">
            <div><h3>{eventPhase === "past" ? "Recorded attendees" : "Attending"}</h3>{event.team.length ? <ul className="crew-list">{event.team.map((person) => <li key={person}>{person}</li>)}</ul> : <p>{eventPhase === "past" ? "No attendee recorded" : "None confirmed"}</p>}</div>
            {event.available.length ? <div><h3>{eventPhase === "past" ? "Marked available" : "Available"}</h3><ul className="crew-list">{event.available.map((person) => <li key={person}>{person}</li>)}</ul></div> : null}
            {event.rating !== "None" ? <div><h3>Event rating</h3><p>{event.rating}</p></div> : null}
          </div>
          <div className="detail-links">
            <a href={event.organizerUrl} target="_blank" rel="noreferrer">Live event site ↗</a>
            {event.notionUrl ? <a href={event.notionUrl} target="_blank" rel="noreferrer">Notion project ↗</a> : <span>Notion project · None</span>}
            {event.relatedLinks?.map((link) => <a href={link.url} target="_blank" rel="noreferrer" key={link.url}>{link.label} ↗</a>)}
          </div>
          <BackToTop />
        </aside>
        <div className="workstreams">
          <div className="section-intro"><p className="eyebrow">{pageModel.workstreamEyebrow}</p><h2>{pageModel.workstreamTitle}</h2><p>{eventPhase === "past" ? `${displayedWorkstreamKeys.length} of nine workstreams contain recorded detail. Plan language is intent unless the results below confirm the outcome.` : `${activeWorkstreamKeys.length} in plan · ${reviewWorkstreamKeys.length} need confirmation · ${inactiveWorkstreamKeys.length} not in plan.`}</p></div>
          {displayedWorkstreamKeys.map((key, index) => {
            const items = workstreams[key];
            const state = workstreamStates.get(key) ?? "active";
            return <article className={`workstream workstream-${state}`} id={`workstream-${key}`} key={key}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <div className="workstream-title-row"><div><h3>{workstreamLabels[key]}</h3><small className={`workstream-state workstream-state-${state}`}>{state === "needs-confirmation" ? "Needs confirmation" : eventPhase === "past" ? "Recorded plan" : "In plan"}</small></div>{key === "marketing" && eventPhase !== "past" ? <Link href={`/marketing?event=${event.slug}#event-tasks`}>Open event tasks →</Link> : key === "budget" ? <Link href="/marketing#measurement">Open measurement →</Link> : null}</div>
                <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul><BackToTop />
              </div>
            </article>;
          })}
          {inactiveWorkstreamKeys.length ? <details className="not-in-plan"><summary>Not in this event plan <span>{inactiveWorkstreamKeys.length}</span></summary><p>{inactiveWorkstreamKeys.map((key) => workstreamLabels[key]).join(" · ")} — None.</p></details> : null}
        </div>
      </section>

      {showResults ? <section className="shell outcomes" id="event-results">
        <div className="section-intro"><p className="eyebrow">Event results</p><h2>{hasRecordedResults ? "Results recorded across event sources." : "Closeout has not been recorded."}</h2><p>“Not recorded” means no qualifying evidence is linked yet. It does not mean zero.</p></div>
        <div className="outcome-grid">{resultGroups.map(([label, items]) => <article className={items.length ? "outcome-recorded" : "outcome-not-recorded"} key={label}><span>{label}</span>{items.length ? <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p>Not recorded</p>}</article>)}</div>
        {missingResultLabels.length && eventPhase === "past" ? <aside className="outcome-closeout-empty">
          <div><span>Closeout needed · {missingResultLabels.length} {missingResultLabels.length === 1 ? "gap" : "gaps"}</span><h3>{hasRecordedResults ? "Complete the missing results." : "Record what actually happened."}</h3></div>
          <p><strong>Missing:</strong> {missingResultLabels.join(" · ")}. Start from the keyed HubSpot Marketing Event, then associate the meeting and deal records that carry the actual outcome, stage, and value.</p>
          {crmUpdateRoute ? <a href={crmUpdateRoute.url} target="_blank" rel="noreferrer">Open HubSpot Marketing Event ↗</a> : <Link href="/sources#quick-update-routes">Open update routes →</Link>}
        </aside> : null}
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

      </PageContentsLayout>

      <Footer />
    </main>
  );
}
