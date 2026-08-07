import { sourceLinks } from "./events.ts";

export type SourceFlowStep = {
  number: string;
  title: string;
  detail: string;
};

export type FieldOwner = {
  data: string;
  owner: string;
  intake: string;
  correction: string;
  automation: string;
};

export type DataStream = {
  system: string;
  state: "Scheduled read" | "Signal only" | "Indirect" | "Published view";
  refresh: string;
  feeds: string;
  writeback: string;
};

export type ConnectorCapability = {
  system: string;
  access: string;
  detail: string;
  boundary: string;
};

export type EventKeyRolloutItem = {
  system: string;
  field: string;
  state: "In use" | "Setup needed" | "Convention needed";
  rule: string;
};

export type WritebackItem = {
  system: string;
  scope: string;
  eventSlug?: string;
  current: string;
  proposed: string;
  evidence: string;
  evidenceUrl?: string;
  state: "Ready for approval" | "Decision needed" | "Setup needed";
  url: string;
};

export type StewardshipRole = {
  role: string;
  owns: string;
  destination: string;
  timing: string;
  rule: string;
  url: string;
};

export type OperatingRoadmapItem = {
  phase: string;
  title: string;
  work: string;
  unlocks: string;
  doneWhen: string;
};

export type SourceSystem = "direct" | "sheet" | "notion" | "drive" | "hubspot" | "organizer" | "gmail" | "slack" | "granola" | "monaco";

export type EventFieldRoute = {
  field: string;
  owner: SourceSystem;
  destination: string;
};

export type EventUpdateRoute = {
  id: "tracker" | "notion" | "drive" | "hubspot";
  scope: string;
  system: string;
  detail: string;
  action: string;
  url: string;
  attendingOnly?: boolean;
};

export const eventFieldRoutes: EventFieldRoute[] = [
  ...["slug", "name", "dates", "dateSort", "dateEndSort", "completedAt", "location", "status", "speaking", "speakingStatus", "sponsorship", "sponsorshipStatus", "guaranteedMeetings", "attendeeCount", "team", "available", "rating"].map((field) => ({ field, owner: "sheet" as const, destination: "Conference tracker" })),
  ...["notionUrl", "credentials", "tldrCallout", "specialConsiderations", "priorityActions", "marketingTasks", "notes", "workstreams"].map((field) => ({ field, owner: "notion" as const, destination: "Conference project in Notion" })),
  ...["meetingsBooked", "followupMeetingsBooked", "meetingCountLabel", "meetingRecordSummary", "demosBooked", "demoCountLabel", "closed", "outcomeNotes", "crmSnapshot"].map((field) => ({ field, owner: "hubspot" as const, destination: "HubSpot" })),
  ...["organizerUrl", "venue"].map((field) => ({ field, owner: "organizer" as const, destination: "Organizer source, then the conference tracker or Notion" })),
  { field: "relatedLinks", owner: "drive", destination: "Events Drive, then the conference project in Notion" },
];

export const eventUpdateRoutes: EventUpdateRoute[] = [
  {
    id: "tracker",
    scope: "Dates · participation · roster",
    system: "Conference tracker",
    detail: "Correct the event row first. Update participation, package, date, location, and roster changes as soon as they are confirmed.",
    action: "Open Sheets",
    url: sourceLinks.sheet,
  },
  {
    id: "notion",
    scope: "Tasks · owners · decisions",
    system: "Event project",
    detail: "Update the owner, deadline, status, or execution decision the same business day. Link the evidence instead of copying a second version.",
    action: "Open Notion",
    url: sourceLinks.notion,
    attendingOnly: true,
  },
  {
    id: "drive",
    scope: "Contracts · creative · files",
    system: "Events Drive",
    detail: "Upload the approved artifact once, use the event folder, and link the file from the event project.",
    action: "Open Drive",
    url: sourceLinks.eventsDrive,
    attendingOnly: true,
  },
  {
    id: "hubspot",
    scope: "Meetings · demos · pipeline",
    system: "HubSpot",
    detail: "Log booked meetings before the event day ends. Record the outcome and next step separately; never infer that a scheduled meeting happened.",
    action: "Open HubSpot",
    url: sourceLinks.hubspot,
    attendingOnly: true,
  },
];

export const sourceFlow: SourceFlowStep[] = [
  {
    number: "01",
    title: "Detect",
    detail: "The scheduled scan reads Sheets, Notion, Drive, Slack, Gmail and HubSpot. Granola and Monaco are visible only when their output reaches one of those systems.",
  },
  {
    number: "02",
    title: "Reconcile",
    detail: "Each fact is matched to an event, compared with its owning system and checked against protected direct decisions. Conflicts stop here.",
  },
  {
    number: "03",
    title: "Publish",
    detail: "Supported changes update Event Basecamp and create a review version. The live site changes only after Holden approves it.",
  },
  {
    number: "04",
    title: "Write back",
    detail: "Approved corrections return to the system that owns the field. Slack, Gmail and Event Basecamp are not allowed to become shadow databases.",
  },
];

export const dataStreams: DataStream[] = [
  {
    system: "Google Sheets · conference tracker",
    state: "Scheduled read",
    refresh: "Checked by the daily scan when an event’s freshness window is due.",
    feeds: "Event roster, dates, participation, speaking, sponsorship, meeting package and topline staffing.",
    writeback: "Yes—an approved row-level correction can be written to the tracker first, then reflected here.",
  },
  {
    system: "Notion · event projects",
    state: "Scheduled read",
    refresh: "Checked for active events when their freshness window is due.",
    feeds: "Workstreams, tasks, owners, due dates, execution decisions and event links.",
    writeback: "Yes—approved task and project corrections belong on the event project, not only in Event Basecamp.",
  },
  {
    system: "Google Drive · Events Drive",
    state: "Scheduled read",
    refresh: "Folder and file receipts are checked with the relevant active event.",
    feeds: "Contracts, creative, attendee files and post-event artifacts; confidential content stays restricted.",
    writeback: "Yes for approved folder and file organization. Inferred content is never used to rewrite a source file.",
  },
  {
    system: "HubSpot · Marketing Events and CRM outcomes",
    state: "Scheduled read",
    refresh: "Event-attributed records are checked with active-event and post-event reviews.",
    feeds: "The Marketing Event is the CRM event spine: canonical Event key, participant states, campaign/list associations and event-level rollups. Meetings and deals still control their own outcomes and value.",
    writeback: "Yes, with an exact approved record set. All 29 Marketing Events now exist with keys; participant, campaign, meeting and deal associations remain separately governed.",
  },
  {
    system: "Gmail and Slack",
    state: "Signal only",
    refresh: "New matching correspondence is scanned for changes, deadlines and decisions.",
    feeds: "Potential organizer changes and internal decisions that must be reconciled with an owning system.",
    writeback: "No factual writeback. Confirmed signals are promoted into Sheets, Notion, Drive or HubSpot.",
  },
  {
    system: "Organizer sites",
    state: "Signal only",
    refresh: "Checked when dates, venues, agendas or participation packages need external verification.",
    feeds: "Public dates, venues, agendas and sponsor information.",
    writeback: "No. Verified facts are recorded in the tracker or the relevant Notion project.",
  },
  {
    system: "Granola and Monaco",
    state: "Indirect",
    refresh: "Only available when notes or exports arrive in a connected source.",
    feeds: "Conversation context and legacy event reporting; neither is a dependable direct feed today.",
    writeback: "No direct route. Useful facts should move to Notion or HubSpot after review.",
  },
  {
    system: "Event Basecamp",
    state: "Published view",
    refresh: "A reconciled review build is created after supported changes; production waits for approval.",
    feeds: "One readable view for event teams, GTM operators and leadership.",
    writeback: "Never the system of record. Site corrections are routed upstream to the field owner.",
  },
];

export const connectorCapabilities: ConnectorCapability[] = [
  {
    system: "Google Workspace",
    access: "Read + controlled write",
    detail: "The tracker, Drive folders and native Google files can be read and updated through exact row, range, file or folder operations.",
    boundary: "Write only an approved diff to the named source artifact; never replace a whole file from Event Basecamp.",
  },
  {
    system: "Notion",
    access: "Read + controlled write",
    detail: "Event projects can be found, read and updated at the page or property level.",
    boundary: "Execution decisions belong in the event project with an owner, deadline and supporting link.",
  },
  {
    system: "HubSpot",
    access: "Marketing Events + CRM records writable · segments read-only",
    detail: "Marketing Events, deals, meetings, contacts and companies are readable and writable. All 29 event records carry the canonical key; existing segments can be audited, but segment creation is not available through the current connector.",
    boundary: "Show the exact record-and-property diff first. A Marketing Event may mirror tracker or Notion facts, but it does not overrule them. Never infer attribution or turn a scheduled meeting into a held meeting.",
  },
  {
    system: "Slack + Gmail",
    access: "Connected signal sources",
    detail: "Messages can be searched for organizer changes, decisions, deadlines and supporting evidence.",
    boundary: "Do not back-write event facts into a thread. Promote a confirmed fact to Sheets, Notion, Drive or HubSpot.",
  },
  {
    system: "Granola + Monaco",
    access: "Indirect only",
    detail: "There is no dependable direct event feed in the current task environment.",
    boundary: "Move useful notes or legacy evidence into Notion or HubSpot before Event Basecamp relies on it.",
  },
];

export const audienceViews = [
  { audience: "Event team", view: "One event brief", detail: "The TL;DR, roster, rules, logistics, meetings, open work and links needed before and during the event." },
  { audience: "GTM operators", view: "Program control", detail: "Readiness, owner and deadline gaps, source freshness, conflicts and the exact write-back queue." },
  { audience: "Leadership", view: "Portfolio and outcomes", detail: "Upcoming commitments, material risks and CRM-proven meetings, pipeline and revenue—without inferred or decorative counts." },
] as const;

export const operatingRoadmap: OperatingRoadmapItem[] = [
  {
    phase: "01 · Establish the join",
    title: "Put the Event key in every owning system",
    work: "Add the existing Event key to the conference tracker and Notion projects. Use the same key in Drive folder names and all new HubSpot event records.",
    unlocks: "Reliable matching, fewer false conflicts, safer review builds and exact write-back destinations.",
    doneWhen: "Every active event has the same immutable key in Sheets, Notion, Drive and HubSpot.",
  },
  {
    phase: "02 · Capture outcomes",
    title: "Make event attribution part of the CRM workflow",
    work: "Use the 29 keyed Marketing Events as the CRM spine. Associate the right campaign and participant states, add Event key properties to meetings and deals, and require outcome plus next step before the event day ends.",
    unlocks: "Meeting, demo, pipeline and revenue rollups that leadership can trust without manual title searches.",
    doneWhen: "Every published event outcome resolves through an exact CRM association and a usable outcome state.",
  },
  {
    phase: "03 · Add the management layer",
    title: "Join cost, readiness and results",
    work: "Create the governed cost ledger, keep the daily source scan, and send a concise exception roundup to the chosen leadership channel.",
    unlocks: "Portfolio decisions based on readiness, full cost and CRM-proven results—not anecdotes or duplicate spreadsheets.",
    doneWhen: "Leadership can review commitments, risk, spend and outcomes from one reconciled view with links back to source records.",
  },
];

export const eventKeyRollout: EventKeyRolloutItem[] = [
  { system: "Event Basecamp", field: "Event key · URL slug", state: "In use", rule: "The published event URL is the canonical key. Example: genesys-xperience." },
  { system: "Google Sheets", field: "Event key · text column", state: "Setup needed", rule: "Add one immutable key per tracker row. Do not rebuild it from the event name after creation." },
  { system: "Notion", field: "Event key · text property", state: "Setup needed", rule: "Set the same key on each event project and use it when linking tasks, files and CRM records." },
  { system: "HubSpot deals", field: "Event key · custom property", state: "Setup needed", rule: "Populate only after explicit attribution. Keep Deal Source and Deal Source Detail for reporting continuity." },
  { system: "HubSpot meetings", field: "Event key · custom property", state: "Setup needed", rule: "Set it when a meeting is booked or confirmed as event-sourced; record the outcome separately." },
  { system: "HubSpot Marketing Events", field: "Event key · custom property", state: "In use", rule: "All 29 records carry the canonical Event key. Use the record for CRM participant state and associations; do not let mirrored planning fields overrule Sheets or Notion." },
  { system: "Google Drive", field: "Event folder prefix", state: "Convention needed", rule: "Prefix the event folder with the key so contracts and artifacts remain traceable after names change." },
] as const;

export const fieldOwners: FieldOwner[] = [
  {
    data: "Event list, dates, participation and topline staffing",
    owner: "Conference tracker · Google Sheets",
    intake: "Scheduled scan plus organizer-site checks when dates or venues need verification.",
    correction: "Update the tracker first. Reconcile any related execution text in Notion; the next review build refreshes Event Basecamp.",
    automation: "High-confidence source changes may update a review version. Conflicts and direct overrides wait for approval.",
  },
  {
    data: "Execution tasks, owners, deadlines and event-specific decisions",
    owner: "Conference Projects · Notion",
    intake: "Scheduled scan of the Events database and active project pages.",
    correction: "Update the event project. Event Basecamp reads the resulting plan; it should not invent task status.",
    automation: "Clear owner, deadline and completion changes may flow into a review version. Contradictory project text is queued.",
  },
  {
    data: "Contracts, creative, attendee files and final artifacts",
    owner: "Events Drive · Google Drive",
    intake: "File metadata and approved document content; confidential terms stay out of the public site.",
    correction: "Upload or organize the actual file in Drive, then link it from Notion and the event page.",
    automation: "Links and file receipts may update automatically. Files are never rewritten from an inferred site value.",
  },
  {
    data: "CRM event identity, participant states and campaign associations",
    owner: "HubSpot Marketing Event",
    intake: "One keyed record per published event, plus registered, attended, canceled and no-show contact participation from imports, forms, workflows or connected event apps.",
    correction: "Correct participant state or CRM associations on the Marketing Event. Correct dates, participation decisions and execution plans in their owning source first, then mirror the accepted value into HubSpot.",
    automation: "The keyed record may drive segments and event-level rollups. It may not convert a registration into attendance or overwrite tracker and Notion ownership.",
  },
  {
    data: "Meetings, demos, deals, pipeline and closed revenue",
    owner: "HubSpot meetings and deals",
    intake: "Records with explicit event attribution and usable associations.",
    correction: "Create or correct the HubSpot record. Tracker outcome columns should become rollups or references, not a second manual ledger.",
    automation: "Read-only outcome rollups may publish automatically. Creating or editing CRM records requires an exact reviewed change set.",
  },
  {
    data: "Organizer changes and internal decisions",
    owner: "Gmail and Slack · signal only",
    intake: "New messages are scanned for dates, deliverables, decisions and conflicts.",
    correction: "Promote the confirmed fact into Sheets, Notion, HubSpot or Drive. Do not leave the decision trapped in a thread.",
    automation: "Messages can open a review item; they do not silently overrule an owning system.",
  },
  {
    data: "Conversation notes and legacy event reporting",
    owner: "Granola and Monaco · indirect",
    intake: "Only notes, exports or references shared into a connected source are available today.",
    correction: "Move useful notes to HubSpot or Notion. Do not create new Monaco-only event records.",
    automation: "No direct feed. Missing access is reported rather than filled with guesses.",
  },
];

export const stewardshipRoles: StewardshipRole[] = [
  {
    role: "AEs and SDRs",
    owns: "Booked meetings, meaningful conversations, demos, next steps and outcomes",
    destination: "HubSpot",
    timing: "Before the event day ends",
    rule: "Use the canonical Event key when the property exists. Until then, include the event token shown on the event page and never mark a scheduled meeting as held.",
    url: "https://app.hubspot.com/contacts/245561359/objects/0-47/views/all/list",
  },
  {
    role: "Event lead",
    owns: "Execution decisions, owners, deadlines, run of show and unresolved work",
    destination: "Event project in Notion",
    timing: "The same business day",
    rule: "A decision is not operational until the project names the owner, deadline and current status. Link the supporting source instead of pasting a second copy.",
    url: sourceLinks.notion,
  },
  {
    role: "Marketing Ops",
    owns: "Participation, dates, roster, sponsorship scope and program-level status",
    destination: "Conference tracker",
    timing: "Before the next Event Basecamp review build",
    rule: "Correct the tracker row first, preserve direct decisions and use the permanent Event key. Event Basecamp remains the read-only view, not the master record.",
    url: sourceLinks.sheet,
  },
  {
    role: "Marketing and creative",
    owns: "Contracts, approved creative, attendee files and post-event artifacts",
    destination: "Events Drive",
    timing: "As soon as the artifact is final",
    rule: "Store one governed file, use the Event key folder convention and link it from the event project. Keep restricted terms out of Event Basecamp.",
    url: sourceLinks.eventsDrive,
  },
  {
    role: "RevOps",
    owns: "CRM schema, exact event associations, attribution QA and outcome rollups",
    destination: "HubSpot",
    timing: "During setup and the T+1 / T+7 reviews",
    rule: "Maintain the keyed Marketing Event spine and the meeting/deal Event key properties. Count only participant states and commercial outcomes supported by exact associations and usable outcome fields.",
    url: "https://app.hubspot.com/contacts/245561359/objects/0-3/views/all/list",
  },
  {
    role: "Leadership",
    owns: "Participation, investment, customer commitments and exceptions with material GTM impact",
    destination: "Decision queue",
    timing: "When explicitly escalated",
    rule: "Leadership resolves judgment calls. Routine roster, task, file and CRM hygiene stays with the operating owner.",
    url: "/sources#approval-queue",
  },
];

export const writebackQueue: WritebackItem[] = [
  {
    system: "Conference tracker",
    scope: "Normalized event-cost ledger",
    current: "No governed event-level dataset combines forecast and final sponsorship, travel, production, paid media, activation and freight cost",
    proposed: "Add a Costs tab keyed by Event key with forecast, approved and final values by category, plus owner and last-updated fields",
    evidence: "Event measurement-contract audit · Aug 6",
    evidenceUrl: "/marketing#measurement",
    state: "Setup needed",
    url: sourceLinks.sheet,
  },
  {
    system: "Conference tracker",
    scope: "Canonical Event key column",
    current: "Event rows are matched by names and dates; no immutable shared key exists upstream",
    proposed: "Add an Event key text column and backfill the 29 published Basecamp keys without regenerating them from display names",
    evidence: "Published event catalog and contract validation · Aug 6",
    evidenceUrl: "/sources#canonical-event-key",
    state: "Setup needed",
    url: sourceLinks.sheet,
  },
  {
    system: "Notion",
    scope: "Canonical Event key property",
    current: "10 of 14 active event projects are linked; none has a governed Event key property",
    proposed: "Add an Event key text property, backfill each linked project, and use it for task, file and CRM associations",
    evidence: "Event project link audit · Aug 6",
    evidenceUrl: "/sources#canonical-event-key",
    state: "Setup needed",
    url: sourceLinks.notion,
  },
  {
    system: "Conference tracker",
    scope: "Contact.io participation",
    eventSlug: "contact-io",
    current: "Status: TBD · 5 attendees planned · Carter available",
    proposed: "Status: No · 0 attendees · clear the available roster",
    evidence: "Holden direct confirmation · Aug 6",
    evidenceUrl: "/sources#protected-decisions",
    state: "Ready for approval",
    url: "https://docs.google.com/spreadsheets/d/1vDieEhNcLwWNFxrMQBQLCInhQTcPkspb-6glkSn44Fk/edit?gid=0&range=A15:R15",
  },
  {
    system: "Conference tracker",
    scope: "Customer Connect Expo participation",
    eventSlug: "customer-connect-expo",
    current: "Status blank · attendee count blank",
    proposed: "Status: Confirmed · 4 attendees planned · names remain open",
    evidence: "Holden direct confirmation + executed exhibitor contract · Aug 6",
    evidenceUrl: "/events/customer-connect-expo",
    state: "Ready for approval",
    url: "https://docs.google.com/spreadsheets/d/1vDieEhNcLwWNFxrMQBQLCInhQTcPkspb-6glkSn44Fk/edit?gid=0&range=A18:R18",
  },
  {
    system: "Conference tracker",
    scope: "ICMI participation",
    eventSlug: "icmi-contact-center-expo",
    current: "Status: Tentative · 6 attendees planned",
    proposed: "Status: Confirmed · keep 6 attendees planned · names remain open",
    evidence: "Holden direct confirmation · Aug 6",
    evidenceUrl: "/events/icmi-contact-center-expo",
    state: "Ready for approval",
    url: "https://docs.google.com/spreadsheets/d/1vDieEhNcLwWNFxrMQBQLCInhQTcPkspb-6glkSn44Fk/edit?gid=0&range=A24:R24",
  },
  {
    system: "Conference tracker",
    scope: "CCW Exchange Chicago final roster",
    eventSlug: "ccw-exchange-chicago",
    current: "Taylor confirmed · Josh and Carter marked available · attendee count 2",
    proposed: "Taylor was the sole attendee · set attendee count to 1 · clear the pre-event availability flags",
    evidence: "Holden direct correction · Aug 7",
    evidenceUrl: "/events/ccw-exchange-chicago#event-crew",
    state: "Ready for approval",
    url: "https://docs.google.com/spreadsheets/d/1vDieEhNcLwWNFxrMQBQLCInhQTcPkspb-6glkSn44Fk/edit?gid=0&range=A14:W14",
  },
  {
    system: "Notion",
    scope: "CCW Exchange Chicago attendance closeout",
    eventSlug: "ccw-exchange-chicago",
    current: "Project and calendar reference Taylor + Josh",
    proposed: "Record Taylor as the sole TeamSimple attendee and note that Josh did not attend",
    evidence: "Holden direct correction · Aug 7",
    evidenceUrl: "/events/ccw-exchange-chicago#workstream-travel",
    state: "Ready for approval",
    url: "https://www.notion.so/3aa6fee642fe81668e92e48b51819e13",
  },
  {
    system: "Conference tracker",
    scope: "CCW Exchange Chicago completion",
    eventSlug: "ccw-exchange-chicago",
    current: "Event row does not record that the program concluded",
    proposed: "Record the event as completed on Aug 7, 2026",
    evidence: "Holden direct update relaying Taylor’s closeout · Aug 7",
    evidenceUrl: "/events/ccw-exchange-chicago#event-results",
    state: "Ready for approval",
    url: "https://docs.google.com/spreadsheets/d/1vDieEhNcLwWNFxrMQBQLCInhQTcPkspb-6glkSn44Fk/edit?gid=0&range=A14:W14",
  },
  {
    system: "Conference tracker",
    scope: "CCW Exchange Chicago rating",
    eventSlug: "ccw-exchange-chicago",
    current: "Rating: None",
    proposed: "Rating: Negative · Taylor’s post-event feedback",
    evidence: "Holden direct update relaying Taylor’s closeout · Aug 7",
    evidenceUrl: "/events/ccw-exchange-chicago#event-results",
    state: "Ready for approval",
    url: "https://docs.google.com/spreadsheets/d/1vDieEhNcLwWNFxrMQBQLCInhQTcPkspb-6glkSn44Fk/edit?gid=0&range=A14:W14",
  },
  {
    system: "Conference tracker",
    scope: "CCW Exchange Chicago contractual meeting count",
    eventSlug: "ccw-exchange-chicago",
    current: "Guaranteed meetings: Yes · count blank",
    proposed: "Verify the contract before entering a count; Holden recalls 10 but has not confirmed it",
    evidence: "Holden direct update · stated as uncertain · Aug 7",
    evidenceUrl: "/events/ccw-exchange-chicago#event-results",
    state: "Decision needed",
    url: "https://docs.google.com/spreadsheets/d/1vDieEhNcLwWNFxrMQBQLCInhQTcPkspb-6glkSn44Fk/edit?gid=0&range=A14:W14",
  },
  {
    system: "HubSpot",
    scope: "CCW Exchange Chicago follow-up meetings",
    eventSlug: "ccw-exchange-chicago",
    current: "No exact Chicago meeting records are available to the Event Basecamp audit",
    proposed: "Add the two scheduled follow-up meetings with Event key ccw-exchange-chicago, account, contact, owner, scheduled date and actual outcome; do not mark either completed until it happens",
    evidence: "Holden direct update relaying Taylor’s closeout · Aug 7",
    evidenceUrl: "/events/ccw-exchange-chicago#event-results",
    state: "Ready for approval",
    url: sourceLinks.hubspot,
  },
  {
    system: "Notion",
    scope: "CCW Exchange Chicago cookie follow-up",
    eventSlug: "ccw-exchange-chicago",
    current: "The event project does not record the post-event account drop",
    proposed: "Record Taylor as owner and track recipient, reason, delivery status, outcome and next step for Kemper, Beyond Finance, United Airlines, CNA, TransUnion and Spot Hero",
    evidence: "Holden direct update relaying Taylor’s follow-up plan · Aug 7",
    evidenceUrl: "/events/ccw-exchange-chicago#workstream-followup",
    state: "Ready for approval",
    url: "https://www.notion.so/3aa6fee642fe81668e92e48b51819e13",
  },
  {
    system: "Notion",
    scope: "Event gifting operating plan",
    current: "No reusable approved gifting workflow is linked from the event operating guide",
    proposed: "Create a ready-to-go plan with approved gift options, budget bands, vendors, address and consent checks, delivery owner, measurement fields and HubSpot follow-up rules",
    evidence: "Taylor’s repeated request after CCW Exchange Chicago · Aug 7",
    evidenceUrl: "/marketing#lessons",
    state: "Ready for approval",
    url: sourceLinks.notion,
  },
  {
    system: "Conference tracker",
    scope: "Genesys Xperience roster",
    eventSlug: "genesys-xperience",
    current: "Cat, Matt, Taylor and Josh marked yes · Carter marked available",
    proposed: "Cat, Holden, Matt, Taylor, Josh, Carter, Deepti, Richard and Lars attending",
    evidence: "Holden direct confirmation · 9 attendees · Aug 6",
    evidenceUrl: "/events/genesys-xperience#event-crew",
    state: "Ready for approval",
    url: "https://docs.google.com/spreadsheets/d/1vDieEhNcLwWNFxrMQBQLCInhQTcPkspb-6glkSn44Fk/edit?gid=0&range=A16:R16",
  },
  {
    system: "Conference tracker",
    scope: "CCW Vegas 2027 workshop date",
    eventSlug: "ccw-vegas-2027",
    current: "Workshop labeled “Mon Jun 15, 3:30–5:00 PM”; June 15, 2027 is Tuesday",
    proposed: "Confirm the intended date with the organizer, then correct the weekday or calendar date",
    evidence: "2027 tracker + calendar validation · Aug 6",
    evidenceUrl: "/events/ccw-vegas-2027",
    state: "Decision needed",
    url: "https://docs.google.com/spreadsheets/d/1vDieEhNcLwWNFxrMQBQLCInhQTcPkspb-6glkSn44Fk/edit?gid=113603184#gid=113603184",
  },
  {
    system: "Notion",
    scope: "Events home source note",
    current: "Calls the 2026 Sales Conferences sheet the source of truth",
    proposed: "Name the 2026 and 2027 tracker tabs and link Event Basecamp as the reconciled read-only view",
    evidence: "Live Notion page checked Aug 6",
    state: "Ready for approval",
    url: sourceLinks.notion,
  },
  {
    system: "Notion",
    scope: "Genesys roster reference",
    eventSlug: "genesys-xperience",
    current: "Generic roster duplicates an older staffing plan",
    proposed: "Replace the generic list with a reference to the conference tracker roster; the current confirmed team is Cat, Holden, Matt, Taylor, Josh, Carter, Deepti, Richard and Lars",
    evidence: "Holden direct confirmation + live Notion page checked Aug 6",
    evidenceUrl: "/events/genesys-xperience",
    state: "Ready for approval",
    url: "https://www.notion.so/3aa6fee642fe81c88a89de617863507c",
  },
  {
    system: "Notion",
    scope: "Genesys Wish Line activation",
    eventSlug: "genesys-xperience",
    current: "Wish Line is labeled as under evaluation; route, bonus inventory and payment state are not recorded",
    proposed: "Record the approved $15K campaign, quarter-mile taxi geofence, condensed Bellagio-to-Fontainebleau loop, estimated 10-minute timing, spot-based bonus, airport-inventory caveat, Michael as the single contact and AP confirmation pending",
    evidence: "Holden direct OOH meeting update · Aug 7",
    evidenceUrl: "/events/genesys-xperience#workstream-marketing",
    state: "Ready for approval",
    url: "https://www.notion.so/3aa6fee642fe81c88a89de617863507c",
  },
  {
    system: "Notion",
    scope: "Genesys speaking plan",
    eventSlug: "genesys-xperience",
    current: "Talk title and abstract are open",
    proposed: "Mark the title, abstract and speaker locked; record the final deck deadline as Aug 10",
    evidence: "Holden direct confirmation · Aug 6",
    evidenceUrl: "/events/genesys-xperience#workstream-speaking",
    state: "Ready for approval",
    url: "https://www.notion.so/3aa6fee642fe81c88a89de617863507c",
  },
  {
    system: "Notion",
    scope: "Genesys CRM logging route",
    eventSlug: "genesys-xperience",
    current: "Execution page directs the team to Monaco",
    proposed: "Replace Monaco with HubSpot and require the account, contact, conversation context, owner and next step for every booked meeting",
    evidence: "Event Basecamp CRM operating rule · Aug 6",
    evidenceUrl: "/events/genesys-xperience#workstream-followup",
    state: "Ready for approval",
    url: "https://www.notion.so/3aa6fee642fe81c88a89de617863507c",
  },
  {
    system: "Notion",
    scope: "CX Travel & Hospitality CRM logging route",
    eventSlug: "iqpc-cx-travel-hospitality",
    current: "The event checklist directs the team to log meetings and demos in Monaco",
    proposed: "Replace Monaco with HubSpot and require the account, contact, conversation context, owner and next step for every booked meeting or demo",
    evidence: "Live Notion checklist + Holden’s protected HubSpot recording rule · Aug 7",
    evidenceUrl: "/events/iqpc-cx-travel-hospitality#workstream-followup",
    state: "Ready for approval",
    url: "https://www.notion.so/3aa6fee642fe813bba00d811370031ee",
  },
  {
    system: "Notion",
    scope: "Customer Connect priorities · organizer call",
    eventSlug: "customer-connect-expo",
    current: "Notion project blank",
    proposed: "Add the Aug 11 at 9:30 AM PT organizer call; keep the booth-logistics questions and state that insurance is recommended, not mandatory",
    evidence: "Gabby Pring organizer response + updated invitation · accepted by Holden · Aug 7",
    evidenceUrl: "https://mail.google.com/mail/#all/19fdc442630791ac",
    state: "Ready for approval",
    url: "https://www.notion.so/3b46fee642fe80dc9ff9d1ae2661aa2c",
  },
  {
    system: "Notion",
    scope: "Customer Connect task plan · organizer call",
    eventSlug: "customer-connect-expo",
    current: "Notion project blank",
    proposed: "Add an owned booth-logistics task due Aug 11 at 9:30 AM PT and record the organizer’s recommended-but-not-mandatory insurance guidance",
    evidence: "Gabby Pring organizer response + updated invitation · accepted by Holden · Aug 7",
    evidenceUrl: "https://mail.google.com/mail/#all/19fdc442630791ac",
    state: "Ready for approval",
    url: "https://www.notion.so/3b46fee642fe80dc9ff9d1ae2661aa2c",
  },
  {
    system: "Notion",
    scope: "Customer Connect sponsorship workstream",
    eventSlug: "customer-connect-expo",
    current: "Notion project blank",
    proposed: "Record the Aug 11 at 9:30 AM PT call, completed portal registration, and that insurance is recommended, not mandatory",
    evidence: "Gabby Pring organizer response + updated invitation · accepted by Holden · Aug 7",
    evidenceUrl: "https://mail.google.com/mail/#all/19fdc442630791ac",
    state: "Ready for approval",
    url: "https://www.notion.so/3b46fee642fe80dc9ff9d1ae2661aa2c",
  },
  {
    system: "HubSpot",
    scope: "CCW Vegas meeting tracker reconciliation",
    eventSlug: "ccw-vegas",
    current: "54 records in the CCW Vegas Meetings tab · 8 HubSpot event-window meetings previously reviewed · no canonical Event key on meetings",
    proposed: "Reconcile each spreadsheet record to its HubSpot activity, preserve scheduled, completed, canceled, and no-show outcomes separately, and add ccw-vegas only where the account/contact join is confirmed",
    evidence: "User-provided CCW Vegas Meetings 6/22 - 8/12 tab · Aug 7",
    evidenceUrl: "https://docs.google.com/spreadsheets/d/1aLsmihcnmB-eKh2y8RjOps4-rFQ0uaJfBCrem3pdiuc/edit?gid=1231160838#gid=1231160838",
    state: "Setup needed",
    url: "https://app.hubspot.com/contacts/245561359/objects/0-3/views/all/list",
  },
  {
    system: "HubSpot",
    scope: "Deal attribution schema",
    eventSlug: "ccw-vegas",
    current: "30 source-eligible records · 30 CCW-detail records · 29 exact intersections · 1 source-only + 1 detail-only mismatch",
    proposed: "Review both mismatched deals and correct only the inaccurate controlled field; then create a Deal property named Event key and set only the 29 confirmed intersections to ccw-vegas",
    evidence: "Independent HubSpot source/detail reconciliation · full 30-record reads on both sides · Aug 7",
    state: "Setup needed",
    url: "https://app.hubspot.com/contacts/245561359/objects/0-3/views/all/list",
  },
  {
    system: "HubSpot",
    scope: "Meeting attribution and outcome QA",
    eventSlug: "ccw-vegas",
    current: "No canonical Event key · 4 possible CCW Vegas meeting records · 2 say Scheduled and 2 have no outcome",
    proposed: "Create a Meeting property named Event key; review the 4 records individually, set ccw-vegas only where confirmed, and correct each outcome",
    evidence: "8 meetings reviewed in the Jun 22–26 event window · 4 unrelated account meetings excluded",
    evidenceUrl: "/sources#crm-attribution",
    state: "Setup needed",
    url: "https://app.hubspot.com/contacts/245561359/objects/0-47/views/all/list",
  },
  {
    system: "HubSpot",
    scope: "Marketing Event records",
    current: "29 Marketing Event records · 29 canonical Event keys · read and write access available · campaign, participant, meeting and deal associations not yet audited",
    proposed: "Adopt the Marketing Event as the CRM event spine; associate the correct campaign and participant states, then link meetings and deals through the Event key without treating mirrored planning fields as authoritative",
    evidence: "Full HubSpot Marketing Event object and property audit · Aug 7",
    evidenceUrl: "/sources#crm-attribution",
    state: "Setup needed",
    url: "https://app.hubspot.com/contacts/245561359/objects/0-54/views/all/list",
  },
  {
    system: "HubSpot",
    scope: "Active event audience segments",
    current: "2 verified historical lists are static snapshots · 0 active-event segments are automatically maintained · segment writes are unavailable through the connected workflow",
    proposed: "Add the canonical Event key to contacts, enable one approved list-write route, then create the governed active segment specifications in the audience registry",
    evidence: "HubSpot OBJECT_LIST access audit + event audience registry · Aug 7",
    evidenceUrl: "/sources#audience-segments",
    state: "Setup needed",
    url: "https://app.hubspot.com/contacts/245561359/objectLists",
  },
  {
    system: "Events Drive",
    scope: "Folder structure",
    current: "One restricted Genesys rules brief in the Events Drive",
    proposed: "One folder per confirmed event with Contracts, Creative, Attendees and Post-event subfolders; store each folder link in Notion",
    evidence: "Events Drive inventory · Aug 6",
    state: "Setup needed",
    url: sourceLinks.eventsDrive,
  },
  {
    system: "Slack or Gmail",
    scope: "Change roundup destination",
    current: "Roundup posts only in this Codex task",
    proposed: "Keep Codex as the audit record; add one leadership-facing Slack or email destination after the audience and detail level are chosen",
    evidence: "Current automation configuration",
    state: "Setup needed",
    url: "/sources#source-monitor",
  },
];

export function getEventWritebackQueue(eventSlug: string) {
  return writebackQueue.filter((item) => item.eventSlug === eventSlug);
}
