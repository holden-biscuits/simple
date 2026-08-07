import type { Metadata } from "next";
import { Footer } from "../components/footer";
import { SiteHeader } from "../components/site-header";
import { SiteSearch, type SearchRecord, type SearchType } from "../components/site-search";
import { eventBySlug, events, getEventPhase, getEventVerification, getProgramDate, getWorkstreams, workstreamLabels, type MarketingTask } from "../data/events";
import { getSpeakingStatus, getSponsorshipStatus, getStaffingSignal, hasGuaranteedMeetingPackage, hasKnownGuaranteedMeetingCount } from "../data/event-signals";
import { getEventBriefReadiness } from "../data/event-brief-readiness";
import { siteStatus } from "../data/site-status";
import { getEventRoleRoutes } from "../data/event-role-routes";

export const metadata: Metadata = { title: "Search · Event Basecamp" };

const validSearchTypes: SearchType[] = ["All", "Event", "Guide", "Role", "Operations"];

const referenceRecords: SearchRecord[] = [
  { type: "Guide", title: "Start with the task", href: "/#start-map", description: "Choose the event brief, AE guide, SDR guide, marketing workspace, planning process, or source record that matches the work in front of you.", keywords: "start here where should I go find page event plan role responsibility source truth changed conflict" },
  { type: "Operations", title: "Active event program pulse", href: "/#program-pulse", description: "Current and next events plus the earliest plans with open staffing, source, meeting-package, or execution inputs.", keywords: "leadership dashboard program pulse happening now next 60 days roster gaps source conflicts action queue risk attention" },
  { type: "Operations", title: "Leadership event program brief", href: "/leadership", description: "Portfolio commitments, execution readiness, decision gaps, source coverage and CRM-proven outcomes.", keywords: "executive leadership portfolio event program commitments readiness risks decisions outcomes ROI pipeline source truth" },
  { type: "Operations", title: "Event execution plan coverage", href: "/#program-pulse", description: "Which active events have an owned task plan, which still need owners and dates, and the next action for each event.", keywords: "readiness task plan coverage owner due date open unassigned unscheduled overdue marketing operations leadership" },
  { type: "Guide", title: "Standard event checklist", href: "/guides#standard-checklist", description: "The nine workstreams used to plan every event.", keywords: Object.values(workstreamLabels).join(" ") },
  { type: "Guide", title: "Planning sequence", href: "/guides#planning-sequence", description: "Suggested planning windows from contract through debrief.", keywords: "timeline t-minus production travel ship rehearse follow-up" },
  { type: "Guide", title: "ZoomInfo for events", href: "/guides#zoominfo", description: "Use event apps, attendee names, technographics, and ICP filters to build a useful list.", keywords: "prospecting mobile app attendees contacts technology vendor HubSpot" },
  { type: "Guide", title: "Booth etiquette", href: "/guides#booth-etiquette", description: "Coverage, breaks, attention, handoffs, food, phones, and keeping the booth approachable.", keywords: "sit eating team questions floor visitor coverage" },
  { type: "Guide", title: "Lead tiers", href: "/guides#lead-tiers", description: "Prioritize meeting-booked, premium activation, meaningful engagement, and attendee-only contacts.", keywords: "follow-up lead capture tier qualification" },
  { type: "Role", title: "AE field guide", href: "/ae", description: "Account preparation, onsite discovery, demos, HubSpot notes, Granola, and next steps.", keywords: "account executive meeting hypothesis deal booked meeting CRM follow-up" },
  { type: "Role", title: "SDR field guide", href: "/sdr", description: "Onsite ground rules, product claims, AE triage, booth traffic, targeting, outreach, qualification, and follow-up.", keywords: "sales development representative conduct professionalism alcohol safety booth etiquette work the floor gatekeeper AE time qualification product claims sequence phone email LinkedIn ZoomInfo event app" },
  { type: "Operations", title: "Marketing operations", href: "/marketing", description: "Event support matrix, operating lessons, production, capture, reporting, and measurement.", keywords: "campaign creative booth contract sponsor deliverables ROI budget support matrix lessons" },
  { type: "Operations", title: "Event measurement contract", href: "/marketing#measurement", description: "Required fields, reporting windows, metric definitions, formulas, and the gates that block trustworthy event ROI.", keywords: "measurement scorecard ROI event cost ledger spend held meetings sourced pipeline influenced pipeline show rate opportunity conversion 30 90 days attribution" },
  { type: "Operations", title: "Source monitor, change log and approval queue", href: "/sources", description: "What controls the site, what changed in each scan, and which source conflicts still need a decision.", keywords: "source hierarchy conference tracker notion google drive slack gmail hubspot granola monaco contracts files automation cadence change log before after applied no change conflict approval queue" },
  { type: "Operations", title: "Event source freshness policy", href: "/sources#freshness-policy", description: "Daily, three-day, weekly, and monthly source-check windows based on how close an event is.", keywords: "fresh current stale overdue source check cadence daily weekly monthly event window verification" },
  { type: "Operations", title: "Data feeds and write-back", href: "/sources#data-streams", description: "What is scheduled, signal-only or indirect; what each system feeds; and where approved corrections can be written back.", keywords: "live data stream feed sync write back sheets notion drive hubspot gmail slack granola monaco architecture leadership" },
  { type: "Operations", title: "Event data operating roadmap", href: "/sources#operating-roadmap", description: "The build order for making the fieldbook durable across GTM and leadership: shared Event keys, CRM outcome capture, then joined cost and performance reporting.", keywords: "long term useful usefulness build order roadmap architecture gtm leadership event key hubspot attribution cost spend readiness results how site stays useful dependable durable" },
  { type: "Operations", title: "Canonical Event key rollout", href: "/sources#canonical-event-key", description: "The shared identifier that joins an event across the fieldbook, tracker, Notion, Drive and HubSpot.", keywords: "event key slug id identifier join property schema tracker notion hubspot meeting deal marketing event drive folder attribution" },
  { type: "Operations", title: "Cross-system event coverage", href: "/sources#canonical-event-key", description: "How many active events have linked Notion workspaces, Drive folders, and exact CRM associations.", keywords: "coverage missing workspace notion project drive folder hubspot crm join reporting readiness active events" },
  { type: "Operations", title: "How event data moves", href: "/sources#data-flow", description: "The scheduled path from source detection through reconciliation, publication approval, and upstream write-back.", keywords: "data pipeline live feed scheduled snapshot detect reconcile publish writeback write-back event key sync integration" },
  { type: "Operations", title: "Source scan automation contract", href: "/sources#scan-contract", description: "The tested batch contract that separates publishable changes, review items, no-change receipts, rejected findings, and upstream destinations.", keywords: "source scan batch proposal automation pipeline apply to review needs review no change reject receipt writeback destination audit evidence" },
  { type: "Operations", title: "Where to update event data", href: "/sources#field-ownership", description: "The owning system, intake path, correction destination, and automation rule for every event-data category.", keywords: "system of record field ownership tracker notion hubspot drive slack gmail granola monaco dates staffing tasks contracts meetings demos deals pipeline" },
  { type: "Operations", title: "Who updates event data", href: "/sources#stewardship", description: "Role-by-role ownership and timing for field teams, event leads, Marketing Ops, creative, RevOps, and leadership.", keywords: "who updates responsibility SLA same day end of day AE SDR event lead marketing operations creative revops leadership escalation source owner" },
  { type: "Operations", title: "CRM attribution health", href: "/sources#crm-attribution", description: "Exact event deals, meeting records that still need QA, Marketing Event coverage, and the rules for what leadership reporting may count.", keywords: "hubspot event key exact attribution deals meetings demos outcomes marketing events leadership reporting ccw vegas qa" },
  { type: "Operations", title: "Source write-back queue", href: "/sources#writeback-queue", description: "Known upstream corrections and integration setup work that still needs approval or a decision.", keywords: "write back upstream mismatch drift protected decision tracker notion genesys hubspot event attribution event key folder structure roundup" },
  { type: "Operations", title: "Event data reconciliation rules", href: "/sources#update-rules", description: "How the source scan handles direct corrections, source ownership, message signals, conflicts, and publication approval.", keywords: "reconciliation scanner rules protected override direct confirmation source owner apply review no change reject approval" },
];

const searchProgramDate = getProgramDate();

const eventRecords: SearchRecord[] = events.map((event) => {
  const briefReadiness = getEventBriefReadiness(event, searchProgramDate);
  const verification = getEventVerification(event);
  const guaranteedCountOpen = hasGuaranteedMeetingPackage(event) && !hasKnownGuaranteedMeetingCount(event);
  const staffing = getStaffingSignal(event);
  const staffingOpen = staffing.state === "open";
  const outcomeCounts = [
    event.meetingsBooked.length ? `${event.meetingsBooked.length} meeting${event.meetingsBooked.length === 1 ? "" : "s"}` : "",
    event.demosBooked.length ? `${event.demosBooked.length} demo${event.demosBooked.length === 1 ? "" : "s"}` : "",
    event.closed.length ? `${event.closed.length} closed` : "",
    event.crmSnapshot ? `${event.crmSnapshot.totalDeals} HubSpot deal${event.crmSnapshot.totalDeals === 1 ? "" : "s"}` : "",
  ].filter(Boolean).join(" · ");
  const details = [
    event.venue ? `Venue · ${event.venue}` : "",
    event.team.length ? `Team · ${event.team.join(", ")}` : "",
    event.available.length ? `Available · ${event.available.join(", ")}` : "",
    `Speaking · ${event.speaking}`,
    `Speaking status · ${getSpeakingStatus(event)}`,
    `Sponsorship · ${event.sponsorship}`,
    `Sponsorship status · ${getSponsorshipStatus(event)}`,
    `Guaranteed meetings · ${event.guaranteedMeetings}`,
    guaranteedCountOpen ? "Meeting package · count TBD" : "",
    staffingOpen ? `Staffing · names open · ${staffing.detail}` : "",
    event.notes ? `Plan note · ${event.notes}` : "",
    event.credentials ? `Credentials · ${event.credentials}` : "",
    `Source check · ${verification.checkedAt} · ${verification.sources.join(" · ")}`,
    `Brief readiness · ${briefReadiness.label} · ${briefReadiness.timing}`,
    ...briefReadiness.issues.map((issue) => `Open readiness input · ${issue.label} · ${issue.destination}`),
    ...(event.specialConsiderations ?? []).map((item) => `Rule · ${item}`),
    ...(event.priorityActions ?? []).map((item) => `Open item · ${item}`),
    ...(event.relatedLinks ?? []).map((link) => `Link · ${link.label}`),
    ...(event.outcomeNotes ?? []).map((item) => `Result · ${item}`),
    ...getEventRoleRoutes(event, getEventPhase(event, searchProgramDate)).map((route) => `${route.role} route · ${route.title} ${route.detail}`),
    ...Object.entries(getWorkstreams(event)).flatMap(([key, items]) => items.map((item) => `${workstreamLabels[key as keyof typeof workstreamLabels]} · ${item}`)),
    ...event.meetingsBooked.map((item) => `Meeting · ${item}`),
    ...event.demosBooked.map((item) => `Demo · ${item}`),
    ...event.closed.map((item) => `Closed · ${item}`),
    ...(event.crmSnapshot ? [
      `${event.crmSnapshot.system} attribution · ${event.crmSnapshot.attribution}`,
      `${event.crmSnapshot.system} deals · ${event.crmSnapshot.totalDeals}`,
      ...event.crmSnapshot.stages.map((stage) => `${event.crmSnapshot?.system} stage · ${stage.label}: ${stage.count}`),
      `Data quality · ${event.crmSnapshot.dataQualityNote}`,
    ] : []),
  ].filter(Boolean);
  return {
    type: "Event",
    title: event.name,
    href: `/events/${event.slug}`,
    description: `${event.dates} · ${event.location}${event.venue ? ` · ${event.venue}` : ""} · ${event.status === "No" ? "Not attending" : event.status}${outcomeCounts ? ` · ${outcomeCounts} recorded` : ""}`,
    keywords: details.join(" "),
    details,
  };
});

const marketingTaskRecords: SearchRecord[] = events.flatMap((event) => {
  const hasStructuredMarketingTasks = Boolean(event.marketingTasks?.length);
  const tasks: MarketingTask[] = hasStructuredMarketingTasks
    ? event.marketingTasks!
    : (event.priorityActions ?? []).map((title) => ({ title, status: "Open" as const }));
  return tasks.map((task) => ({
    type: "Operations" as const,
    title: `${event.name} · ${task.title}`,
    href: hasStructuredMarketingTasks ? `/marketing?event=${event.slug}#event-tasks` : `/events/${event.slug}#event-priorities`,
    description: [task.status, task.owner ? `Owner: ${task.owner}` : null, task.due ? `Due: ${task.due}` : null].filter(Boolean).join(" · "),
    keywords: [event.name, event.location, event.dates, task.title, task.status, task.owner, task.due, task.note, "event task marketing open item"].filter(Boolean).join(" "),
    details: [task.note ? `Task note · ${task.note}` : "", task.owner ? `Owner · ${task.owner}` : "", task.due ? `Due · ${task.due}` : ""].filter(Boolean),
    hiddenUntilQuery: true,
  }));
});

const eventChangeRecords: SearchRecord[] = siteStatus.sourceMonitor.changeLog.flatMap((change) => {
  if (!change.eventSlug) return [];
  const event = eventBySlug(change.eventSlug);
  if (!event) return [];
  const resultLabel = change.state === "Applied" ? "Now" : change.state === "Needs review" ? "Conflicting source" : "Result";
  return [{
    type: "Operations" as const,
    title: `${event.name} · ${change.title}`,
    href: `/events/${event.slug}#event-changes`,
    description: `${change.state} · ${change.field} · checked ${change.checkedAt}`,
    keywords: [
      event.name,
      event.location,
      change.title,
      change.state,
      change.field,
      change.before,
      change.after,
      change.source,
      "what changed recent change source receipt update conflict why still open",
    ].join(" "),
    details: [
      `Before · ${change.before}`,
      `${resultLabel} · ${change.after}`,
      `Source · ${change.source}`,
    ],
    hiddenUntilQuery: true,
  }];
});

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[]; type?: string | string[] }> }) {
  const params = await searchParams;
  const initialQuery = typeof params.q === "string" ? params.q : "";
  const requestedType = typeof params.type === "string" ? params.type : "All";
  const initialType: SearchType = validSearchTypes.includes(requestedType as SearchType) ? requestedType as SearchType : "All";
  return <main id="page-top"><SiteHeader /><section className="search-hero"><p className="eyebrow">Fieldbook search</p><h1>Find the detail, not the page.</h1><p>Search events, cities, people, tools, workstreams, meeting records, tasks, owners, due dates, source changes, and role instructions. Results open the exact section or workspace you need.</p></section><SiteSearch records={[...referenceRecords, ...eventChangeRecords, ...marketingTaskRecords, ...eventRecords]} initialQuery={initialQuery} initialType={initialType} /><Footer /></main>;
}
