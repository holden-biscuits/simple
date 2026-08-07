import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Footer } from "../../components/footer";
import { BackToTop, PageContentsLayout } from "../../components/page-contents";
import { SiteHeader } from "../../components/site-header";
import { eventBySlug, events, getEventVerification, getProgramDate, getWorkstreams, isEmptyWorkstream, workstreamLabels, type WorkstreamKey } from "../../data/events";
import { getStaffingSignal, hasGuaranteedMeetingPackage } from "../../data/event-signals";
import { getSafeEventReturnHref } from "../../data/directory-state";
import { getSourceFreshness } from "../../data/source-freshness";
import { getEventSystemLinkage } from "../../data/system-linkage";
import { getEventMeasurementCheckpoint } from "../../data/event-measurement";
import { getBriefIssueAction, getEventPageBriefReadiness } from "../../data/event-brief-readiness";
import { getEventSourceChanges } from "../../data/site-status";
import { getEventRoleRoutes } from "../../data/event-role-routes";
import { getEventFootprint } from "../../data/event-footprint";
import { getEventWritebackQueue } from "../../data/source-governance";
import { getEventProspectingBrief } from "../../data/event-prospecting";
import { getEventReadiness } from "../../data/program-readiness";
import { getEventPageModel, getEventWorkstreamState } from "../../data/event-page-model";
import { getOpenItemRoute } from "../../data/open-item-routes";
import { getEventUpdateRoutes } from "../../data/event-update-routes";

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
  const description = `${participation} ${event.dates} · ${event.location}. Open the current plan, links, and source status.`;
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
  const verification = getEventVerification(event);
  const freshness = getSourceFreshness(event, programDate);
  const systemLinkage = getEventSystemLinkage(event);
  const measurementCheckpoint = getEventMeasurementCheckpoint(event, eventPhase);
  const briefReadiness = getEventPageBriefReadiness(event, programDate);
  const recentChanges = getEventSourceChanges(event.slug);
  const eventWritebacks = getEventWritebackQueue(event.slug);
  const roleRoutes = getEventRoleRoutes(event, eventPhase);
  const prospecting = getEventProspectingBrief(event);
  const executionReadiness = getEventReadiness(event, programDate);
  const nextMove = event.status !== "No" && eventPhase !== "past" ? executionReadiness.nextAction : undefined;
  const zoomInfoOnlyReason = prospecting.confidence === "Matched-account qualification"
    ? "Use the organizer's matched accounts; do not manufacture an attendee segment."
    : prospecting.confidence === "No active plan"
      ? "No event segment is maintained while TeamSimple is not attending."
      : prospecting.confidence === "Names required"
        ? "Create a segment only after a credible source supplies attendee or company names."
        : "No defensible event-specific HubSpot segment is linked yet.";
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
  const isSourceConflict = note.toLowerCase().startsWith("source conflict:");
  const resultGroups = [
    [meetingProgressLabel, event.meetingsBooked.length ? event.meetingsBooked : event.meetingCountLabel ? [event.meetingRecordSummary ?? `${event.meetingCountLabel} meetings ${eventPhase === "past" ? "recorded" : "booked"}; account names were not captured`] : []],
    ["Follow-up meetings booked", event.followupMeetingsBooked ? [`${event.followupMeetingsBooked} scheduled · account, contact, date, owner, and outcome pending in HubSpot`] : []],
    [eventPhase === "past" ? "Demos recorded" : "Demos booked", event.demosBooked.length ? event.demosBooked : event.demoCountLabel ? [`${event.demoCountLabel} rows labeled Demo in the meetings tracker`] : []],
    ["Closed", event.closed],
  ] as const;
  const workstreamKeys = Object.keys(workstreamLabels) as WorkstreamKey[];
  const workstreamStates = new Map(workstreamKeys.map((key) => [key, getEventWorkstreamState(event, key)]));
  const activeWorkstreamKeys = workstreamKeys.filter((key) => workstreamStates.get(key) === "active");
  const reviewWorkstreamKeys = workstreamKeys.filter((key) => workstreamStates.get(key) === "needs-confirmation");
  const displayedWorkstreamKeys = workstreamKeys.filter((key) => workstreamStates.get(key) !== "inactive");
  const inactiveWorkstreamKeys = workstreamKeys.filter((key) => workstreamStates.get(key) === "inactive");
  const workstreamContents = displayedWorkstreamKeys.map((key) => ({ id: `workstream-${key}`, label: workstreamLabels[key] }));
  const showPriorities = !isNotAttending && eventPhase !== "past" && Boolean(event.priorityActions?.length);
  const eventBriefContents = isNotAttending ? [
    { id: "event-tldr", label: "TL;DR" },
    ...(roleRoutes.length ? [{ id: "event-role-routes", label: "Your role" }] : []),
    { id: "event-no-plan", label: "Event status" },
  ] : [
    { id: "event-tldr", label: "TL;DR" },
    ...(roleRoutes.length ? [{ id: "event-role-routes", label: "Your role" }] : []),
    { id: "event-prospecting", label: "Prospecting" },
    ...(showPriorities ? [{ id: "event-priorities", label: "Open items" }] : []),
    ...(event.specialConsiderations?.length ? [{ id: "event-considerations", label: "Rules of engagement" }] : []),
    { id: "event-crew", label: "Crew" },
  ];
  const eventRecordContents = [
    ...(showResults ? [{ id: "event-results", label: "Results" }] : []),
    ...(recentChanges.length ? [{ id: "event-changes", label: "Recent changes" }] : []),
    ...(eventWritebacks.length ? [{ id: "event-writebacks", label: "Source write-backs" }] : []),
    { id: "event-update-route", label: "Update this event" },
  ];
  const eventContentsGroups = [
    { label: "Event brief", items: eventBriefContents },
    ...(!isNotAttending && workstreamContents.length ? [{ label: pageModel.secondaryLabel, items: workstreamContents }] : []),
    { label: isNotAttending ? "Source record" : eventPhase === "past" ? "Closeout + sources" : "Results + sources", items: eventRecordContents },
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
    ...(event.credentials ? [["Passes / credentials", event.credentials]] : []),
    ["Team", staffing.summary],
  ];
  const updateRoutes = getEventUpdateRoutes(event);

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
        <div className={`tldr-grid tldr-grid-${tldr.length}`}>{tldr.map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}</div>
        {event.tldrCallout ? <aside className="event-tldr-callout" aria-label={event.tldrCallout.title}>
          <div><span>{event.tldrCallout.label}</span><h3>{event.tldrCallout.title}</h3></div>
          <p>{event.tldrCallout.detail}</p>
          <div className="event-tldr-callout-action"><strong>{event.tldrCallout.status}</strong>{event.tldrCallout.href ? <a href={event.tldrCallout.href}>{event.tldrCallout.action ?? "Open plan"} ↓</a> : null}</div>
        </aside> : null}
        {nextMove ? <div className={`event-next-move event-next-move-${nextMove.urgency}`}>
          <div><span>Next move</span><h3>{nextMove.title}</h3></div>
          <dl>
            <div><dt>Owner</dt><dd>{nextMove.owner ?? "Open"}</dd></div>
            <div><dt>Due</dt><dd>{eventPhase === "now" && !nextMove.structured ? "Today" : nextMove.due ?? "Open"}</dd></div>
            <div><dt>Status</dt><dd>{nextMove.structured ? nextMove.status : eventPhase === "now" ? "Owner open" : "Needs an owner and date"}</dd></div>
          </dl>
          <Link href={eventPhase === "now" && !nextMove.structured ? "#event-priorities" : nextMove.href}>{nextMove.structured ? "Open task plan" : eventPhase === "now" ? "Open onsite priorities" : "Turn priorities into a plan"} →</Link>
        </div> : null}
        {!isNotAttending && eventPhase !== "past" ? <div className={`event-brief-readiness event-brief-readiness-${briefReadiness.state}${briefReadiness.stage === "onsite" ? " event-brief-readiness-onsite" : ""}`}>
          <header><div><span>{briefReadiness.stage === "onsite" ? "Onsite check" : "Brief readiness"}</span><strong>{briefReadiness.label}</strong></div><b>{briefReadiness.timing}</b></header>
          {briefReadiness.issues.length ? <ul>{briefReadiness.issues.map((issue) => {
            const action = getBriefIssueAction(issue, event);
            return <li key={issue.key}><div><p>{issue.label}</p><span>{issue.destination}</span></div>{action.external ? <a href={action.href} target="_blank" rel="noreferrer">{action.label} ↗</a> : <Link href={action.href}>{action.label} →</Link>}</li>;
          })}</ul> : <p>{briefReadiness.stage === "onsite" ? "No decision-critical onsite details are missing. Review the event plan and log each meaningful conversation before the day ends." : "No decision-critical inputs are missing for this planning stage. Check the open work below before treating the plan as complete."}</p>}
          <footer><span>{briefReadiness.issues.length ? `${briefReadiness.issues.length} ${briefReadiness.stage === "onsite" ? `onsite fact${briefReadiness.issues.length === 1 ? "" : "s"} unresolved` : `open input${briefReadiness.issues.length === 1 ? "" : "s"}`}` : briefReadiness.stage === "onsite" ? "Onsite facts present" : "Required inputs present"}</span><a href="#event-update-route">Open all update routes →</a></footer>
        </div> : null}
        {note ? <p className={`tldr-note${isSourceConflict ? " source-conflict" : ""}`}>
          {isSourceConflict ? <strong>Source check needed</strong> : null}
          {isSourceConflict ? note.replace(/^Source conflict:\s*/i, "") : note}
        </p> : null}
        <div className="event-verification">
          <div><span>Source check</span><strong className={`freshness-state freshness-state-${freshness.state}`}>{freshness.label} · checked <time dateTime={verification.checkedAtISO}>{verification.checkedAt}</time></strong></div>
          <p>{verification.sources.join(" · ")}<small>{freshness.nextCheckLabel ? `Next check ${freshness.nextCheckLabel}. ` : ""}{freshness.reason}</small></p>
          <Link href="/sources">See source record →</Link>
        </div>
      </section>

      {roleRoutes.length ? <section className="event-role-routes shell" id="event-role-routes">
        <div className="section-intro"><p className="eyebrow">Use the route for your role</p><h2>Start with what this event changes for you.</h2><p>These are event-specific starting points, not staffing assignments. Open the full role guide for the rules that apply everywhere.</p></div>
        <div className={`event-role-route-grid event-role-route-grid-${roleRoutes.length}`}>{roleRoutes.map((route, index) => <Link href={route.href} key={route.role}>
          <header><span>{String(index + 1).padStart(2, "0")}</span><b>{route.role}</b></header>
          <h3>{route.title}</h3>
          <p>{route.detail}</p>
          <strong>{route.cta} →</strong>
        </Link>)}</div>
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
        <div className="prospecting-grid">
          <article>
            <header><span>01</span><h3>Company search</h3></header>
            <dl>{prospecting.companyFilters.map((filter) => <div key={`${filter.label}-${filter.value}`}><dt>{filter.label}</dt><dd>{filter.value}</dd></div>)}</dl>
            <a href={prospecting.zoomInfoCompanyUrl} target="_blank" rel="noreferrer">Open ZoomInfo companies ↗</a>
          </article>
          <article>
            <header><span>02</span><h3>Contact search</h3></header>
            <dl>{prospecting.contactFilters.map((filter) => <div key={`${filter.label}-${filter.value}`}><dt>{filter.label}</dt><dd>{filter.value}</dd></div>)}</dl>
            <a href={prospecting.zoomInfoContactUrl} target="_blank" rel="noreferrer">Open ZoomInfo contacts ↗</a>
          </article>
          <article className="prospecting-route-card">
            <header><span>03</span><h3>Working route</h3></header>
            <p>{prospecting.workflow}</p>
            {prospecting.hubspotSegment ? <div className="prospecting-segment">
              <span>Existing HubSpot segment</span>
              <strong>{prospecting.hubspotSegment.name}</strong>
              <small>{prospecting.hubspotSegment.size.toLocaleString()} contacts · {prospecting.hubspotSegment.kind.toLowerCase()} · checked {prospecting.hubspotSegment.checkedAt}</small>
              <a href={prospecting.hubspotSegment.url} target="_blank" rel="noreferrer">Open HubSpot segment ↗</a>
            </div> : prospecting.hubspotAccountLinks.length ? <div className="prospecting-account-links">
              <span>Grounded account searches</span>
              {prospecting.hubspotAccountLinks.map((account) => <a href={account.url} target="_blank" rel="noreferrer" key={account.name}>Open {account.name} contacts ↗</a>)}
            </div> : <p className="prospecting-zoominfo-only"><strong>ZoomInfo only.</strong> {zoomInfoOnlyReason}</p>}
          </article>
        </div>
        <p className="prospecting-boundary"><strong>Do not confuse targeting with attendance.</strong> A company fits the event audience only after the event app, organizer file, matched-meeting schedule, scan, session, or other named signal connects it to the show.</p>
        <BackToTop />
      </section> : null}

      {showPriorities ? (
        <section className="event-priorities shell" id="event-priorities">
          <div className="priority-intro">
            <p className="eyebrow">{eventPhase === "now" ? "Onsite focus" : "Before the event"}</p>
            <h2>{eventPhase === "now" ? "Do these next." : "Still needs attention."}</h2>
            <p>{event.priorityActions!.length} event-specific {eventPhase === "now" ? `priorit${event.priorityActions!.length === 1 ? "y is" : "ies are"} live today` : `${event.priorityActions!.length === 1 ? "item is" : "items are"} still open in the current plan`}.</p>
            <p className="priority-route-note">Use each item’s link to document the update in its owning event record.</p>
          </div>
          <ol>{event.priorityActions!.map((item, index) => {
            const route = getOpenItemRoute(event, item);
            return <li key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p>{item}</p>
                <a className={route.setupNeeded ? "priority-item-route priority-item-route-setup" : "priority-item-route"} href={route.href} target="_blank" rel="noreferrer" aria-label={`${route.label}: ${item}`}>
                  <b>{route.system}</b>
                  <span>{route.label} ↗</span>
                </a>
              </div>
            </li>;
          })}</ol>
          <BackToTop />
        </section>
      ) : null}

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
      {event.specialConsiderations?.length ? (
        <section className="event-considerations shell" id="event-considerations">
          <div><p className="eyebrow">Rules of engagement</p><h2>What is different about this event.</h2></div>
          <ol>{event.specialConsiderations.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ol>
          {partnerGuidelines ? <a className="text-link" href={partnerGuidelines.url} target="_blank" rel="noreferrer">Open the restricted partner guidelines ↗</a> : null}
          <BackToTop />
        </section>
      ) : null}

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
            {event.priorityActions?.length ? <Link href={`/marketing?event=${event.slug}#event-tasks`}>Marketing tasks →</Link> : null}
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

      {recentChanges.length ? <section className="event-recent-changes shell" id="event-changes">
        <div className="section-intro"><p className="eyebrow">Recent source activity</p><h2>What changed for this event.</h2><p>Applied changes are already reflected on this page. Unresolved differences still need a decision.</p></div>
        <div className="event-change-grid">{recentChanges.map((change) => {
          const firstLabel = change.state === "Applied" ? "Before" : change.state === "Needs review" ? "Controlling source" : "Checked";
          const secondLabel = change.state === "Applied" ? "Now" : change.state === "Needs review" ? "Conflicting source" : "Result";
          return <article className={`event-change event-change-${change.state.toLowerCase().replace(" ", "-")}`} key={change.id}>
            <header><span>{change.state}</span><time>{change.checkedAt}</time></header>
            <small>{change.field}</small><h3>{change.title}</h3>
            <dl><div><dt>{firstLabel}</dt><dd>{change.before}</dd></div><div><dt>{secondLabel}</dt><dd>{change.after}</dd></div></dl>
            <footer>{change.sourceUrl ? <a href={change.sourceUrl} target="_blank" rel="noreferrer">Open source ↗</a> : <span>{change.source}</span>}<Link href="/sources#change-log">Open full log →</Link></footer>
          </article>;
        })}</div>
        <BackToTop />
      </section> : null}

      {eventWritebacks.length ? <section className="event-writebacks shell" id="event-writebacks">
        <div className="section-intro"><p className="eyebrow">Source write-backs</p><h2>Source records still need to catch up.</h2><p>This event page and an owning system do not match yet. Each card shows the exact upstream correction and its approval state; update the destination, then remove the item after a fresh source check.</p></div>
        <div className="writeback-grid event-writeback-grid">
          {eventWritebacks.map((item) => <article key={`${item.system}-${item.scope}`}>
            <header><span>{item.system}</span><b className={`writeback-state writeback-state-${item.state.toLowerCase().replaceAll(" ", "-")}`}>{item.state}</b></header>
            <h3>{item.scope}</h3>
            <dl className="writeback-diff"><div><dt>Current source</dt><dd>{item.current}</dd></div><div><dt>Proposed source</dt><dd>{item.proposed}</dd></div></dl>
            <p className="writeback-evidence">Evidence · {item.evidence}{item.evidenceUrl ? <Link href={item.evidenceUrl}> View →</Link> : null}</p>
            <a className="writeback-destination" href={item.url} target={item.url.startsWith("http") ? "_blank" : undefined} rel={item.url.startsWith("http") ? "noreferrer" : undefined}>Open {item.system} ↗</a>
          </article>)}
        </div>
        <BackToTop />
      </section> : null}

      <section className="event-update-route shell" id="event-update-route">
        <details>
          <summary><span><small>Something changed?</small><strong>Update the source that owns it.</strong></span><b>Open routes <i aria-hidden="true">+</i></b></summary>
          <div className="event-update-route-body">
            <aside>
              <span>Canonical Event key</span>
              <code>{event.slug}</code>
              <p>Use this exact value across the tracker, Notion and HubSpot. Until the CRM properties exist, include <code>[evt:{event.slug}]</code> in an event-sourced activity.</p>
            </aside>
            <div className="event-update-route-grid">
              {updateRoutes.map((route) => <a href={route.url} target="_blank" rel="noreferrer" key={route.id}><span>{route.scope}</span><strong>{route.system}</strong><p>{route.detail}</p><b>{route.action} ↗</b></a>)}
            </div>
          </div>
          <div className="event-linkage-strip" aria-label="Event system coverage">
            {systemLinkage.map((item) => <div key={item.system}><span>{item.system}</span><strong className={`linkage-state linkage-state-${item.state.toLowerCase().replaceAll(" ", "-")}`}>{item.state}</strong><p>{item.detail}</p>{item.url ? <a href={item.url} target="_blank" rel="noreferrer">Open Marketing Event ↗</a> : null}</div>)}
          </div>
          {!isNotAttending ? <div className="event-measurement-checkpoint">
            <header><span>Measurement checkpoint</span><strong>{measurementCheckpoint.state}</strong></header>
            <div>
              <p><span>Primary objective</span><b>{measurementCheckpoint.objective}</b></p>
              <p><span>Fully loaded cost</span><b>{measurementCheckpoint.cost}</b></p>
              <p><span>CRM association</span><b>{measurementCheckpoint.crm}</b></p>
              <p><span>Meeting evidence</span><b>{measurementCheckpoint.meetings}</b></p>
            </div>
            <footer><p>{measurementCheckpoint.nextAction}</p><Link href="/marketing#measurement">Open measurement contract →</Link></footer>
          </div> : null}
        </details>
      </section>
      </PageContentsLayout>

      <Footer />
    </main>
  );
}
