import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "../../components/footer";
import { BackToTop, PageContents } from "../../components/page-contents";
import { SiteHeader } from "../../components/site-header";
import { eventBySlug, events, getEventPhase, getEventVerification, getProgramDate, getWorkstreams, isEmptyWorkstream, sourceLinks, workstreamLabels, type WorkstreamKey } from "../../data/events";
import { getSpeakingStatus, getSponsorshipStatus, getStaffingSignal, hasGuaranteedMeetingPackage } from "../../data/event-signals";
import { getSafeEventReturnHref } from "../../data/directory-state";
import { getSourceFreshness } from "../../data/source-freshness";
import { getEventSystemLinkage } from "../../data/system-linkage";
import { getEventMeasurementCheckpoint } from "../../data/event-measurement";
import { getBriefIssueAction, getEventBriefReadiness } from "../../data/event-brief-readiness";
import { getEventSourceChanges } from "../../data/site-status";
import { getEventRoleRoutes } from "../../data/event-role-routes";

export const dynamic = "force-dynamic";

export function generateStaticParams() { return events.map((event) => ({ slug: event.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = eventBySlug(slug);
  return { title: event ? `${event.name} · Event Basecamp` : "Event not found" };
}

export default async function EventPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ returnTo?: string | string[] }> }) {
  const { slug } = await params;
  const { returnTo } = await searchParams;
  const event = eventBySlug(slug);
  if (!event) notFound();
  const eventDirectoryHref = getSafeEventReturnHref(returnTo);
  const programDate = getProgramDate();
  const eventPhase = getEventPhase(event, programDate);
  const verification = getEventVerification(event);
  const freshness = getSourceFreshness(event, programDate);
  const systemLinkage = getEventSystemLinkage(event);
  const measurementCheckpoint = getEventMeasurementCheckpoint(event, eventPhase);
  const briefReadiness = getEventBriefReadiness(event, programDate);
  const recentChanges = getEventSourceChanges(event.slug);
  const roleRoutes = getEventRoleRoutes(event, eventPhase);
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
  const staffing = getStaffingSignal(event);
  const note = event.notes.trim();
  const isSourceConflict = note.toLowerCase().startsWith("source conflict:");
  const resultGroups = [
    [meetingProgressLabel, event.meetingsBooked.length ? event.meetingsBooked : event.meetingCountLabel ? [`${event.meetingCountLabel} meetings ${eventPhase === "past" ? "recorded" : "booked"}; account names were not captured`] : []],
    ["Demos booked", event.demosBooked],
    ["Closed", event.closed],
  ] as const;
  const workstreamKeys = Object.keys(workstreamLabels) as WorkstreamKey[];
  const activeWorkstreamKeys = workstreamKeys.filter((key) => !isEmptyWorkstream(workstreams[key]));
  const inactiveWorkstreamKeys = workstreamKeys.filter((key) => !activeWorkstreamKeys.includes(key));
  const showPriorities = !isNotAttending && eventPhase !== "past" && Boolean(event.priorityActions?.length);
  const speakingStatus = getSpeakingStatus(event);
  const sponsorshipStatus = getSponsorshipStatus(event);
  const programMix = isNotAttending ? "No activation planned" : [
    sponsorshipStatus === "Confirmed" ? "Sponsorship" : sponsorshipStatus === "Under review" ? "Sponsorship under review" : null,
    speakingStatus === "Confirmed" ? "Speaking" : speakingStatus === "Under review" ? "Speaking under review" : null,
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
    ["Team", staffing.summary],
  ];
  const showResults = eventPhase === "past" || resultGroups.some(([, items]) => items.length > 0) || Boolean(event.crmSnapshot);

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
      <PageContents items={isNotAttending ? [
        { id: "event-tldr", label: "TL;DR" },
        ...(roleRoutes.length ? [{ id: "event-role-routes", label: "Your role" }] : []),
        ...(recentChanges.length ? [{ id: "event-changes", label: "Recent changes" }] : []),
        { id: "event-update-route", label: "Update this event" },
        { id: "event-no-plan", label: "Event status" },
      ] : [
        { id: "event-tldr", label: "TL;DR" },
        ...(recentChanges.length ? [{ id: "event-changes", label: "Recent changes" }] : []),
        { id: "event-update-route", label: "Update this event" },
        ...(showPriorities ? [{ id: "event-priorities", label: "Open items" }] : []),
        { id: "event-crew", label: "Crew" },
        ...(event.specialConsiderations?.length ? [{ id: "event-considerations", label: "Rules of engagement" }] : []),
        ...activeWorkstreamKeys.map((key) => ({ id: `workstream-${key}`, label: workstreamLabels[key] })),
        ...(showResults ? [{ id: "event-results", label: "Results" }] : []),
      ]} />

      <section className="event-tldr shell" id="event-tldr">
        <div className="section-intro"><p className="eyebrow">TL;DR</p><h2>Know this before you go.</h2></div>
        <div className="tldr-grid">{tldr.map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}</div>
        {!isNotAttending && eventPhase !== "past" ? <div className={`event-brief-readiness event-brief-readiness-${briefReadiness.state}`}>
          <header><div><span>Brief readiness</span><strong>{briefReadiness.label}</strong></div><b>{briefReadiness.timing}</b></header>
          {briefReadiness.issues.length ? <ul>{briefReadiness.issues.map((issue) => {
            const action = getBriefIssueAction(issue, event);
            return <li key={issue.key}><div><p>{issue.label}</p><span>{issue.destination}</span></div>{action.external ? <a href={action.href} target="_blank" rel="noreferrer">{action.label} ↗</a> : <Link href={action.href}>{action.label} →</Link>}</li>;
          })}</ul> : <p>No decision-critical inputs are missing for this planning stage. Check the open work below before treating the plan as complete.</p>}
          <footer><span>{briefReadiness.issues.length ? `${briefReadiness.issues.length} open input${briefReadiness.issues.length === 1 ? "" : "s"}` : "Required inputs present"}</span><a href="#event-update-route">Open all update routes →</a></footer>
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

      {recentChanges.length ? <section className="event-recent-changes shell" id="event-changes">
        <div className="section-intro"><p className="eyebrow">Recent source activity</p><h2>What changed for this event.</h2><p>These are event-specific receipts from the source scan. Applied changes are already in this review build; unresolved differences still need a decision.</p></div>
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
              <a href={sourceLinks.sheet} target="_blank" rel="noreferrer"><span>Dates · participation · roster</span><strong>Conference tracker</strong><p>Correct the event row first. Update participation and roster changes as soon as they are confirmed.</p><b>Open Sheets ↗</b></a>
              {!isNotAttending ? <>
                <a href={event.notionUrl ?? sourceLinks.notion} target="_blank" rel="noreferrer"><span>Tasks · owners · decisions</span><strong>{event.notionUrl ? "Event project" : "Notion setup needed"}</strong><p>{event.notionUrl ? "Update the owner, deadline or status the same business day." : "Create or locate the event project before execution work starts."}</p><b>Open Notion ↗</b></a>
                <a href={sourceLinks.eventsDrive} target="_blank" rel="noreferrer"><span>Contracts · creative · files</span><strong>Events Drive</strong><p>Upload the approved artifact once, then link it from the event project.</p><b>Open Drive ↗</b></a>
                <a href="https://app.hubspot.com/contacts/245561359/objects/0-47/views/all/list" target="_blank" rel="noreferrer"><span>Meetings · demos · pipeline</span><strong>HubSpot</strong><p>Log booked meetings before the event day ends. Record outcomes separately; never infer one here.</p><b>Open HubSpot ↗</b></a>
              </> : null}
            </div>
          </div>
          <div className="event-linkage-strip" aria-label="Event system coverage">
            {systemLinkage.map((item) => <div key={item.system}><span>{item.system}</span><strong className={`linkage-state linkage-state-${item.state.toLowerCase().replaceAll(" ", "-")}`}>{item.state}</strong><p>{item.detail}</p></div>)}
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
          <div className="section-intro"><p className="eyebrow">Field checklist</p><h2>What the event team needs to know and do.</h2><p>{activeWorkstreamKeys.length} of nine workstreams are in play. Relevant sections are open below; everything else stays in the explicit not-in-plan summary.</p></div>
          {activeWorkstreamKeys.map((key, index) => {
            const items = workstreams[key];
            return <article className="workstream" id={`workstream-${key}`} key={key}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <div className="workstream-title-row"><h3>{workstreamLabels[key]}</h3>{key === "marketing" ? <Link href={`/marketing?event=${event.slug}#event-tasks`}>Open workspace →</Link> : key === "budget" ? <Link href="/marketing#measurement">Open measurement →</Link> : null}</div>
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
