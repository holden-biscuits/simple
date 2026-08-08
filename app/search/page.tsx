import type { Metadata } from "next";
import { Footer } from "../components/footer";
import { SiteHeader } from "../components/site-header";
import { SiteSearch, type SearchRecord, type SearchType } from "../components/site-search";
import { eventBySlug, events, getEventPhase, getEventVerification, getProgramDate, getWorkstreams, workstreamLabels, type MarketingTask } from "../data/events";
import { getCompletedEventOutcomeCoverage, getSpeakingStatus, getSponsorshipStatus, getStaffingSignal, hasGuaranteedMeetingPackage, hasKnownGuaranteedMeetingCount } from "../data/event-signals";
import { getBriefIssueAction, getEventBriefReadiness } from "../data/event-brief-readiness";
import { siteStatus } from "../data/site-status";
import { getEventRoleRoutes } from "../data/event-role-routes";
import { connectorCapabilities, dataStreams, fieldOwners, writebackQueue } from "../data/source-governance";
import { matchesAttendance, matchesAttention } from "../data/event-filters";
import { getEventProspectingBrief } from "../data/event-prospecting";
import { getAudienceSegmentRegistry } from "../data/audience-segment-registry";
import { latestSourceScan } from "../data/latest-source-scan";
import { getEventWorkstreamState, getEventWorkstreamsNeedingConfirmation } from "../data/event-page-model";
import { getEventUpdateRoutes } from "../data/event-update-routes";

export const metadata: Metadata = { title: "Search · Event Basecamp" };

const validSearchTypes: SearchType[] = ["All", "Event", "Guide", "Role", "Operations"];

const referenceRecords: SearchRecord[] = [
  { type: "Guide", title: "Start with the task", href: "/#start-map", description: "Choose the event brief, AE guide, SDR guide, marketing workspace, planning process, or source record that matches the work in front of you.", keywords: "start here where should I go find page event plan role responsibility source truth changed conflict" },
  { type: "Guide", title: "Event process", href: "/#event-lifecycle", description: "Follow the event sequence from approval through planning, audience work, team preparation, onsite execution, follow-up, and measurement.", keywords: "event lifecycle process workflow what do I do next after event choose approve plan audience outreach prepare onsite run follow up learn measure" },
  { type: "Operations", title: "Active event program pulse", href: "/#program-pulse", description: "Current and next events plus the earliest plans with open staffing, source, meeting-package, or execution inputs.", keywords: "leadership dashboard program pulse happening now next 60 days roster gaps source conflicts action queue risk attention" },
  { type: "Operations", title: "Leadership event program brief", href: "/leadership", description: "Portfolio commitments, execution readiness, decision gaps, source coverage and CRM-proven outcomes.", keywords: "executive leadership portfolio event program commitments readiness risks decisions outcomes ROI pipeline source truth" },
  { type: "Operations", title: "Event execution plan coverage", href: "/#program-pulse", description: "Which active events have an owned task plan, which still need owners and dates, and the next action for each event.", keywords: "readiness task plan coverage owner due date open unassigned unscheduled overdue marketing operations leadership" },
  { type: "Guide", title: "Standard event checklist", href: "/guides#standard-checklist", description: "The nine workstreams used to plan every event.", keywords: Object.values(workstreamLabels).join(" ") },
  { type: "Guide", title: "Planning sequence", href: "/guides#planning-sequence", description: "Suggested planning windows from contract through debrief.", keywords: "timeline t-minus production travel ship rehearse follow-up" },
  { type: "Guide", title: "ZoomInfo for events", href: "/guides#zoominfo", description: "Use event apps, attendee names, technographics, and ICP filters to build a useful list.", keywords: "prospecting mobile app attendees contacts technology vendor HubSpot" },
  { type: "Guide", title: "Booth etiquette", href: "/guides#booth-etiquette", description: "Coverage, breaks, attention, handoffs, food, phones, and keeping the booth approachable.", keywords: "sit eating team questions floor visitor coverage" },
  { type: "Guide", title: "Lead tiers", href: "/guides#lead-tiers", description: "Prioritize meeting-booked, premium activation, meaningful engagement, and attendee-only contacts.", keywords: "follow-up lead capture tier qualification" },
  { type: "Role", title: "AE field guide", href: "/ae", description: "Account preparation, marketing support, gifting, event strategy, onsite discovery, HubSpot notes, Granola, and next steps.", keywords: "account executive meeting hypothesis deal booked meeting CRM follow-up marketing help support gifting Goody ongoody event details giveaways advertising strategy" },
  { type: "Role", title: "SDR field guide", href: "/sdr", description: "Onsite ground rules, event logistics, gifting, product claims, AE triage, targeting, qualification, and follow-up.", keywords: "sales development representative conduct professionalism alcohol safety booth etiquette work the floor gatekeeper AE time qualification product claims sequence phone email LinkedIn ZoomInfo event app gifting Goody ongoody rendezvous meeting point billing location side events swag giveaways materials" },
  { type: "Operations", title: "Marketing operations", href: "/marketing", description: "Event support matrix, operating lessons, production, capture, reporting, and measurement.", keywords: "campaign creative booth contract sponsor deliverables ROI budget support matrix lessons" },
  { type: "Operations", title: "Marketing workload pulse", href: "/marketing#marketing-pulse", description: "Task-plan coverage, open and overdue structured work, the next shared deadline, and missing owners or dates across active events.", keywords: "marketing workload overdue tasks plan coverage next deadline owner gap date gap what needs attention now operations" },
  { type: "Operations", title: "Event-sourced pipeline", href: "/marketing#event-pipeline", description: "HubSpot source-based and exact-attribution opportunity counts, stage distribution, open pipeline, closed-won revenue, and amount hygiene.", keywords: "hubspot event conference trade show field dinner opportunities deals stages open pipeline revenue closed won deal source detail exact attribution 30 source records 29 exact 22 source based 21 exact qualifying 2 mismatches" },
  { type: "Operations", title: "Event measurement contract", href: "/marketing#measurement", description: "Required fields, reporting windows, metric definitions, formulas, and the gates that block trustworthy event ROI.", keywords: "measurement scorecard ROI event cost ledger spend held meetings sourced pipeline influenced pipeline show rate opportunity conversion 30 90 days attribution" },
  { type: "Operations", title: "Source monitor, change log and approval queue", href: "/sources", description: "What controls the site, what changed in each scan, and which source conflicts still need a decision.", keywords: "source hierarchy conference tracker notion google drive slack gmail hubspot granola monaco contracts files automation cadence change log before after applied no change conflict approval queue" },
  { type: "Operations", title: "Daily event action briefing", href: "/sources#action-briefing", description: "The private Slack briefing that asks for decisions, recent event closeouts, overdue-task updates, exact write-back approvals, and time-sensitive source blockers only when action is required.", keywords: "daily briefing slack dm ping me reminder update request open items action needed decision recent closeout approval overdue task source blocker reply automation 9 am email digest" },
  { type: "Operations", title: "Event source freshness policy", href: "/sources#freshness-policy", description: "Daily, three-day, weekly, and monthly source-check windows based on how close an event is.", keywords: "fresh current stale overdue source check cadence daily weekly monthly event window verification" },
  { type: "Operations", title: "Data feeds and write-back", href: "/sources#data-streams", description: "What is scheduled, signal-only or indirect; what each system feeds; and where approved corrections can be written back.", keywords: "live data stream feed sync write back sheets notion drive hubspot gmail slack granola monaco architecture leadership" },
  { type: "Operations", title: "Event data operating roadmap", href: "/sources#operating-roadmap", description: "The build order for durable event reporting across GTM and leadership: shared Event keys, CRM outcome capture, then joined cost and performance reporting.", keywords: "long term useful usefulness build order roadmap architecture gtm leadership event key hubspot attribution cost spend readiness results how site stays useful dependable durable" },
  { type: "Operations", title: "Canonical Event key rollout", href: "/sources#canonical-event-key", description: "The shared identifier that joins an event across Event Basecamp, the tracker, Notion, Drive and HubSpot.", keywords: "event key slug id identifier join property schema tracker notion hubspot meeting deal marketing event drive folder attribution" },
  { type: "Operations", title: "Cross-system event coverage", href: "/sources#canonical-event-key", description: "How many active events have linked Notion workspaces, Drive folders, and exact CRM associations.", keywords: "coverage missing workspace notion project drive folder hubspot crm join reporting readiness active events" },
  { type: "Operations", title: "How event data moves", href: "/sources#data-flow", description: "The scheduled path from source detection through reconciliation, publication approval, and upstream write-back.", keywords: "data pipeline live feed scheduled snapshot detect reconcile publish writeback write-back event key sync integration" },
  { type: "Operations", title: "Source scan automation contract", href: "/sources#scan-contract", description: "The tested batch contract that separates publishable changes, review items, no-change receipts, rejected findings, and upstream destinations.", keywords: "source scan batch proposal automation pipeline apply to review needs review no change reject receipt writeback destination audit evidence" },
  { type: "Operations", title: "Where to update event data", href: "/sources#quick-update-routes", description: "Open the owning system for a date, participation, roster, task, decision, file, meeting, demo, or pipeline update.", keywords: "system of record field ownership tracker notion hubspot drive slack gmail dates staffing roster participation tasks contracts creative files meetings demos deals pipeline fix correction update" },
  { type: "Operations", title: "Who updates event data", href: "/sources#stewardship", description: "Role-by-role ownership and timing for field teams, event leads, Marketing Ops, creative, RevOps, and leadership.", keywords: "who updates responsibility SLA same day end of day AE SDR event lead marketing operations creative revops leadership escalation source owner" },
  { type: "Operations", title: "CRM attribution health", href: "/sources#crm-attribution", description: "The source/detail reconciliation, exact event deals, field mismatches, meeting QA, Marketing Event coverage, and the rules for what leadership reporting may count.", keywords: "hubspot event key exact attribution deals meetings demos outcomes marketing events leadership reporting ccw vegas qa source only detail only 30 29 22 21 two mismatches" },
  { type: "Operations", title: "HubSpot Marketing Events · current role", href: "/sources#marketing-event-role", description: "The 29 keyed Marketing Event records provide CRM event identity, participant state, and association routes; they do not replace the tracker, Notion, meeting outcomes, deal stages, pipeline, or revenue.", keywords: "hubspot marketing events current truth crm spine 29 keyed records participant state campaign association event key source hierarchy no longer empty" },
  { type: "Operations", title: "HubSpot event audience registry", href: "/sources#audience-segments", description: "The governed names, evidence gates, membership rules and refresh rules for event prospecting segments.", keywords: "hubspot segment list audience prospecting active segment static list attendee target universe organizer matched accounts event key zoominfo maintain sync" },
  { type: "Operations", title: "Source write-back queue", href: "/sources#writeback-queue", description: "Known upstream corrections and integration setup work that still needs approval or a decision.", keywords: "write back upstream mismatch drift protected decision tracker notion genesys hubspot event attribution event key folder structure roundup" },
  { type: "Operations", title: "Event data reconciliation rules", href: "/sources#update-rules", description: "How the source scan handles direct corrections, source ownership, message signals, conflicts, and publication approval.", keywords: "reconciliation scanner rules protected override direct confirmation source owner apply review no change reject approval" },
];

const searchProgramDate = getProgramDate();
const audienceSegmentRegistry = getAudienceSegmentRegistry(events, searchProgramDate);

const attentionViewRecords: SearchRecord[] = [
  {
    type: "Operations",
    context: "Saved event view",
    status: `${events.filter((event) => matchesAttendance(event, "going") && matchesAttention(event, "roster", searchProgramDate)).length} events`,
    title: "Events with rosters still open",
    href: "/?attendance=going&attention=roster#events",
    description: "Confirmed, active events where fewer people are attending than the current pass allocation.",
    keywords: "roster open missing names unnamed unassigned attendees staffing passes credentials seats incomplete need names who is attending who is going attention",
  },
  {
    type: "Operations",
    context: "Saved event view",
    status: `${events.filter((event) => matchesAttention(event, "source", searchProgramDate)).length} events`,
    title: "Events with a source issue",
    href: "/?attention=source#events",
    description: "Active events with a stated source conflict or an overdue source check.",
    keywords: "source issue conflict mismatch stale overdue freshness review attention current truth",
  },
  {
    type: "Operations",
    context: "Saved event view",
    status: `${events.filter((event) => matchesAttendance(event, "going") && matchesAttention(event, "plan", searchProgramDate)).length} events`,
    title: "Events that need plan setup",
    href: "/?attendance=going&attention=plan#events",
    description: "Confirmed, active events that still lack a structured execution plan with task status.",
    keywords: "plan setup missing owner due date tasks workstream incomplete needs attention execution readiness",
  },
  {
    type: "Operations",
    context: "Saved event view",
    status: `${events.filter((event) => matchesAttendance(event, "going") && matchesAttention(event, "meetings", searchProgramDate)).length} events`,
    title: "Guaranteed-meeting counts still open",
    href: "/?attendance=going&attention=meetings#events",
    description: "Events with a guaranteed-meeting package where the count or format is not yet recorded.",
    keywords: "guaranteed meeting meetings count unknown open TBD package format matched accounts how many",
  },
  {
    type: "Operations",
    context: "Saved event view",
    status: `${events.filter((event) => matchesAttention(event, "program", searchProgramDate)).length} events`,
    title: "Programs that need confirmation",
    href: "/?attention=program#events",
    description: "Active events with a speaking, sponsorship, meeting, or side-event workstream that is not yet confirmed.",
    keywords: "program programs activation workstream open unresolved confirm confirmation under review speaking sponsorship meetings side event attention",
  },
];

const connectorCapabilityRecords: SearchRecord[] = connectorCapabilities.map((item) => ({
  type: "Operations",
  context: "Connector access",
  status: item.access,
  title: `${item.system} connector access`,
  href: "/sources#data-streams",
  description: item.detail,
  keywords: [item.system, item.access, item.detail, item.boundary, "can I write update edit connector access permission policy"].join(" "),
  details: [`Operating boundary · ${item.boundary}`],
  hiddenUntilQuery: true,
}));

const dataStreamRecords: SearchRecord[] = dataStreams.map((stream) => ({
  type: "Operations",
  context: "Data stream",
  status: stream.state,
  title: `${stream.system} data stream`,
  href: "/sources#data-streams",
  description: stream.refresh,
  keywords: [stream.system, stream.state, stream.refresh, stream.feeds, stream.writeback, "feed stream sync update source"].join(" "),
  details: [`Feeds · ${stream.feeds}`, `Write-back · ${stream.writeback}`],
  hiddenUntilQuery: true,
}));

const fieldOwnerRecords: SearchRecord[] = fieldOwners.map((field) => ({
  type: "Operations",
  context: "System of record",
  status: field.owner,
  title: `${field.data} · where to update`,
  href: "/sources#field-ownership",
  description: `Update in ${field.owner}.`,
  keywords: [field.data, field.owner, field.intake, field.correction, field.automation, "where update edit correct owner source of truth system of record"].join(" "),
  details: [`Correction route · ${field.correction}`, `Automation · ${field.automation}`],
  hiddenUntilQuery: true,
}));

const writebackRecords: SearchRecord[] = writebackQueue.map((item) => {
  const event = item.eventSlug ? eventBySlug(item.eventSlug) : undefined;
  return {
    type: "Operations",
    context: event ? "Event source correction" : "Program write-back item",
    status: item.state,
    title: `${item.scope} · upstream work`,
    href: event ? `/events/${event.slug}#event-writebacks` : "/sources#writeback-queue",
    description: `${item.system} · ${item.proposed}`,
    keywords: [event?.name, event?.location, item.system, item.scope, item.current, item.proposed, item.evidence, item.state, "write back upstream correction setup decision approval"].filter(Boolean).join(" "),
    details: [`Current · ${item.current}`, `Proposed · ${item.proposed}`, `Evidence · ${item.evidence}`],
    hiddenUntilQuery: true,
  };
});

const audienceSegmentRecords: SearchRecord[] = audienceSegmentRegistry.items.map((item) => ({
  type: "Operations",
  context: "HubSpot audience segment",
  status: item.state,
  title: `${item.eventName} · audience segment`,
  href: "/sources#audience-segments",
  description: `${item.segmentName} · ${item.nextAction}`,
  keywords: [item.eventName, item.eventKey, item.segmentName, item.state, item.objectType, item.membershipRule, item.sourceGate, item.refreshRule, item.nextAction, "HubSpot segment list audience prospecting maintain sync"].join(" "),
  details: [`Membership · ${item.membershipRule}`, `Evidence gate · ${item.sourceGate}`, `Refresh · ${item.refreshRule}`],
  hiddenUntilQuery: true,
}));

const latestScanRecord: SearchRecord = {
  type: "Operations",
  context: "Scan receipt",
  status: latestSourceScan.audit.complete ? "Audit complete" : "Audit incomplete",
  title: "Latest scheduled source scan",
  href: "/sources#latest-scan",
  description: `${latestSourceScan.checkedAtLabel} · ${latestSourceScan.summary.total} findings · ${latestSourceScan.summary.needsReview} need review · ${latestSourceScan.summary.noChange} no change`,
  keywords: [
    latestSourceScan.runMode,
    latestSourceScan.scanId,
    ...Object.values(latestSourceScan.gates),
    ...latestSourceScan.receipts.flatMap((receipt) => [receipt.source, receipt.state, receipt.scope, receipt.result]),
    ...latestSourceScan.findings.flatMap((finding) => [finding.event, finding.field, finding.state, finding.destination, finding.result]),
    "scheduled source scan receipt checked unavailable not due audit gate",
  ].join(" "),
  details: [
    `Review build · ${latestSourceScan.gates.reviewBuild}`,
    `Production · ${latestSourceScan.gates.production}`,
    `Upstream write-back · ${latestSourceScan.gates.upstreamWriteback}`,
    ...latestSourceScan.receipts.map((receipt) => `${receipt.source} · ${receipt.state} · ${receipt.result}`),
  ],
  hiddenUntilQuery: true,
};

const eventRecords: SearchRecord[] = events.map((event) => {
  const prospecting = getEventProspectingBrief(event);
  const briefReadiness = getEventBriefReadiness(event, searchProgramDate);
  const verification = getEventVerification(event);
  const guaranteedCountOpen = hasGuaranteedMeetingPackage(event) && !hasKnownGuaranteedMeetingCount(event);
  const staffing = getStaffingSignal(event);
  const confirmationWorkstreams = getEventWorkstreamsNeedingConfirmation(event);
  const phase = getEventPhase(event, searchProgramDate);
  const closeoutCoverage = getCompletedEventOutcomeCoverage(event);
  const outcomeCounts = [
    event.meetingsBooked.length ? `${event.meetingsBooked.length} meeting${event.meetingsBooked.length === 1 ? "" : "s"}` : "",
    event.demosBooked.length ? `${event.demosBooked.length} demo${event.demosBooked.length === 1 ? "" : "s"}` : "",
    event.followupMeetingsBooked ? `${event.followupMeetingsBooked} follow-up meeting${event.followupMeetingsBooked === 1 ? "" : "s"} booked` : "",
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
    event.followupMeetingsBooked ? `Follow-up meetings booked · ${event.followupMeetingsBooked}` : "",
    guaranteedCountOpen ? "Meeting package · count TBD" : "",
    `Staffing · ${staffing.card}`,
    staffing.assignmentGap ? `Roster gap · ${staffing.assignmentGap} pass${staffing.assignmentGap === 1 ? "" : "es"} unassigned` : "",
    event.notes ? `Plan note · ${event.notes}` : "",
    event.credentials ? `Credentials · ${event.credentials}` : "",
    ...(event.tldrCallout ? [
      `${event.tldrCallout.label} · ${event.tldrCallout.title}`,
      `Activation route · ${event.tldrCallout.detail}`,
      `Activation status · ${event.tldrCallout.status}`,
    ] : []),
    `Source check · ${verification.checkedAt} · ${verification.sources.join(" · ")}`,
    `Brief readiness · ${briefReadiness.label} · ${briefReadiness.timing}`,
    ...briefReadiness.issues.map((issue) => `Open readiness input · ${issue.label} · ${issue.destination}`),
    ...(event.specialConsiderations ?? []).map((item) => `Rule · ${item}`),
    ...(event.priorityActions ?? []).map((item) => `Open item · ${item}`),
    ...(event.relatedLinks ?? []).map((link) => `Link · ${link.label}`),
    ...(event.outcomeNotes ?? []).map((item) => `Result · ${item}`),
    ...getEventRoleRoutes(event, getEventPhase(event, searchProgramDate)).map((route) => `${route.role} route · ${route.title} ${route.detail}`),
    ...Object.entries(getWorkstreams(event)).flatMap(([key, items]) => items.map((item) => `${workstreamLabels[key as keyof typeof workstreamLabels]} · ${item}`)),
    ...confirmationWorkstreams.map((key) => `Needs confirmation · ${workstreamLabels[key]}`),
    ...event.meetingsBooked.map((item) => `Meeting · ${item}`),
    ...event.demosBooked.map((item) => `Demo · ${item}`),
    ...event.closed.map((item) => `Closed · ${item}`),
    ...(event.crmSnapshot ? [
      `${event.crmSnapshot.system} attribution · ${event.crmSnapshot.attribution}`,
      `${event.crmSnapshot.system} deals · ${event.crmSnapshot.totalDeals}`,
      ...event.crmSnapshot.stages.map((stage) => `${event.crmSnapshot?.system} stage · ${stage.label}: ${stage.count}`),
      `Data quality · ${event.crmSnapshot.dataQualityNote}`,
    ] : []),
    `Prospecting audience · ${prospecting.summary}`,
    ...prospecting.companyFilters.map((filter) => `ZoomInfo company ${filter.label} · ${filter.value}`),
    ...prospecting.contactFilters.map((filter) => `ZoomInfo contact ${filter.label} · ${filter.value}`),
    `Prospecting workflow · ${prospecting.workflow}`,
    ...(prospecting.hubspotSegment ? [`HubSpot segment · ${prospecting.hubspotSegment.name} · ${prospecting.hubspotSegment.size} contacts`] : []),
  ].filter(Boolean);
  return {
    type: "Event",
    context: "Event brief",
    status: event.status === "No" ? "Not attending" : event.status,
    title: event.name,
    href: `/events/${event.slug}`,
    description: `${event.dates} · ${event.location}${event.venue ? ` · ${event.venue}` : ""} · ${event.status === "No" ? "Not attending" : event.status}${outcomeCounts ? ` · ${outcomeCounts} recorded` : ""}${phase === "past" && event.status !== "No" ? ` · ${closeoutCoverage.missing.length} closeout gap${closeoutCoverage.missing.length === 1 ? "" : "s"}` : ""}`,
    keywords: details.join(" "),
    details,
  };
});

const eventReadinessRecords: SearchRecord[] = events.flatMap((event) => {
  const readiness = getEventBriefReadiness(event, searchProgramDate);
  return readiness.issues.map((issue) => {
    const action = getBriefIssueAction(issue, event);
    return {
      type: "Operations" as const,
      context: "Open event input",
      status: issue.destination,
      title: `${event.name} · ${issue.label}`,
      href: action.href,
      description: `${readiness.timing} · ${action.label}.`,
      keywords: [event.name, event.location, event.dates, issue.key, issue.label, issue.destination, action.label, "open gap missing unresolved needs attention fix update correct source record"].join(" "),
      details: [`Timing · ${readiness.timing}`, `Owning destination · ${issue.destination}`, `Action · ${action.label}`],
      hiddenUntilQuery: true,
    };
  });
});

const eventUpdateRouteRecords: SearchRecord[] = events.flatMap((event) => getEventUpdateRoutes(event).map((route) => ({
  type: "Operations" as const,
  context: "Event update route",
  status: route.system,
  title: `${event.name} · ${route.scope}`,
  href: route.url,
  description: route.detail,
  keywords: [event.name, event.location, event.dates, route.scope, route.system, route.detail, route.action, "where update edit correct fix log record source of truth"].join(" "),
  details: [`Owning destination · ${route.system}`, `Action · ${route.action}`],
  hiddenUntilQuery: true,
})));

const eventSectionRecords: SearchRecord[] = events.flatMap((event) => {
  if (event.status === "No") return [];
  const phase = getEventPhase(event, searchProgramDate);
  const staffing = getStaffingSignal(event);
  const prospecting = getEventProspectingBrief(event);
  const workstreams = getWorkstreams(event);
  const outcomeDetails = [
    ...event.meetingsBooked.map((item) => `Meeting · ${item}`),
    ...(event.followupMeetingsBooked ? [`Follow-up meetings booked · ${event.followupMeetingsBooked}`] : []),
    ...(event.meetingCountLabel ? [`Meeting records · ${event.meetingCountLabel}`, ...(event.meetingRecordSummary ? [event.meetingRecordSummary] : [])] : []),
    ...event.demosBooked.map((item) => `Demo · ${item}`),
    ...(event.demoCountLabel ? [`Demo records · ${event.demoCountLabel}`] : []),
    ...event.closed.map((item) => `Closed · ${item}`),
    ...(event.outcomeNotes ?? []).map((item) => `Outcome · ${item}`),
    ...(event.rating !== "None" ? [`Event rating · ${event.rating}`] : []),
    ...(event.crmSnapshot ? [`HubSpot deals · ${event.crmSnapshot.totalDeals}`, `CRM quality · ${event.crmSnapshot.dataQualityNote}`] : []),
  ];
  const closeoutCoverage = getCompletedEventOutcomeCoverage(event);
  const sectionRecords: SearchRecord[] = [
    {
      type: "Event",
      context: "Event section · Crew",
      status: staffing.card,
      title: `${event.name} · crew`,
      href: `/events/${event.slug}#event-crew`,
      description: event.team.length ? `Attending: ${event.team.join(", ")}.` : staffing.detail,
      keywords: [event.name, event.location, "who is going attending attendee team roster staffing people crew passes credentials unassigned", staffing.card, event.team.join(" "), event.available.join(" "), staffing.detail].join(" "),
      details: [staffing.card, staffing.assignmentGap ? `${staffing.assignmentGap} pass${staffing.assignmentGap === 1 ? "" : "es"} unassigned` : "", event.team.length ? `Attending · ${event.team.join(", ")}` : "Attending · None confirmed", event.available.length ? `Available · ${event.available.join(", ")}` : ""].filter(Boolean),
      hiddenUntilQuery: true,
    },
    {
      type: "Event",
      context: "Event section · Prospecting",
      status: prospecting.confidence,
      title: `${event.name} · prospecting`,
      href: `/events/${event.slug}#event-prospecting`,
      description: prospecting.summary,
      keywords: [event.name, event.location, "target targeting prospect prospecting audience accounts contacts companies ZoomInfo", prospecting.workflow, ...prospecting.companyFilters.map((filter) => filter.value), ...prospecting.contactFilters.map((filter) => filter.value)].join(" "),
      details: [`Workflow · ${prospecting.workflow}`, ...prospecting.companyFilters.map((filter) => `Company ${filter.label} · ${filter.value}`), ...prospecting.contactFilters.map((filter) => `Contact ${filter.label} · ${filter.value}`)],
      hiddenUntilQuery: true,
    },
    ...(event.specialConsiderations?.length ? [{
      type: "Event" as const,
      context: "Event section · Rules",
      status: `${event.specialConsiderations.length} event-specific rule${event.specialConsiderations.length === 1 ? "" : "s"}`,
      title: `${event.name} · rules of engagement`,
      href: `/events/${event.slug}#event-considerations`,
      description: "Event-specific operating rules and guardrails.",
      keywords: [event.name, event.location, "rules rule considerations engagement guardrails what can I say do", ...event.specialConsiderations].join(" "),
      details: event.specialConsiderations.map((item) => `Rule · ${item}`),
      hiddenUntilQuery: true,
    }] : []),
    ...Object.entries(workstreams).flatMap(([key, items]) => {
      const workstreamKey = key as keyof typeof workstreamLabels;
      const state = getEventWorkstreamState(event, workstreamKey);
      return state !== "inactive" ? [{
      type: "Event" as const,
      context: "Event section · Workstream",
      status: phase === "past" ? "Recorded plan" : state === "needs-confirmation" ? "Needs confirmation" : "In plan",
      title: `${event.name} · ${workstreamLabels[workstreamKey]}`,
      href: `/events/${event.slug}#workstream-${key}`,
      description: items[0],
      keywords: [event.name, event.location, workstreamLabels[workstreamKey], key, state, "checklist workstream plan program confirm confirmation unresolved", ...items].join(" "),
      details: [state === "needs-confirmation" ? "State · Needs confirmation" : phase === "past" ? "State · Recorded plan" : "State · In plan", ...items],
      hiddenUntilQuery: true,
    }] : [];
    }),
  ];

  if (phase === "past" || outcomeDetails.length) {
    sectionRecords.push({
      type: "Event",
      context: "Event section · Results",
      status: closeoutCoverage.state === "complete" ? "Closeout complete" : closeoutCoverage.state === "partial" ? `Partial closeout · ${closeoutCoverage.missing.length} gaps` : "Closeout not recorded",
      title: `${event.name} · results`,
      href: `/events/${event.slug}#event-results`,
      description: outcomeDetails.length ? `${outcomeDetails.slice(0, 2).join(" · ")} · Missing: ${closeoutCoverage.missing.join(" · ") || "None"}` : "No outcomes have been recorded yet. Missing evidence is not zero.",
      keywords: [event.name, event.location, "what happened results result outcomes outcome closeout incomplete partial missing not recorded meetings demos deals revenue rating", ...outcomeDetails, ...closeoutCoverage.missing].join(" "),
      details: [...(outcomeDetails.length ? outcomeDetails : ["Closeout · No outcomes recorded yet"]), ...closeoutCoverage.missing.map((label) => `Closeout gap · ${label}`)],
      hiddenUntilQuery: true,
    });
  }

  return sectionRecords;
});

const marketingTaskRecords: SearchRecord[] = events.flatMap((event) => {
  const hasStructuredMarketingTasks = Boolean(event.marketingTasks?.length);
  const tasks: MarketingTask[] = hasStructuredMarketingTasks
    ? event.marketingTasks!
    : (event.priorityActions ?? []).map((title) => ({ title, status: "Open" as const }));
  return tasks.map((task) => ({
    type: "Operations" as const,
    context: hasStructuredMarketingTasks ? "Marketing task" : "Event action",
    status: task.status,
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
    context: "Source change",
    status: change.state,
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
  return <main id="page-top"><SiteHeader /><section className="search-hero"><p className="eyebrow">Event Basecamp search</p><h1>Find the detail, not the page.</h1><p>Search events, cities, people, tools, workstreams, meeting records, tasks, owners, due dates, source changes, audience segments, and role instructions. Results open the exact section or working system you need.</p></section><SiteSearch records={[...referenceRecords, ...attentionViewRecords, latestScanRecord, ...eventReadinessRecords, ...eventUpdateRouteRecords, ...eventChangeRecords, ...marketingTaskRecords, ...eventSectionRecords, ...connectorCapabilityRecords, ...dataStreamRecords, ...fieldOwnerRecords, ...writebackRecords, ...audienceSegmentRecords, ...eventRecords]} initialQuery={initialQuery} initialType={initialType} /><Footer /></main>;
}
