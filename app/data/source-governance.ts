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

export const eventFieldRoutes: EventFieldRoute[] = [
  ...["slug", "name", "dates", "dateSort", "dateEndSort", "location", "status", "speaking", "speakingStatus", "sponsorship", "sponsorshipStatus", "guaranteedMeetings", "attendeeCount", "team", "available", "rating"].map((field) => ({ field, owner: "sheet" as const, destination: "Conference tracker" })),
  ...["notionUrl", "credentials", "specialConsiderations", "priorityActions", "marketingTasks", "notes", "workstreams"].map((field) => ({ field, owner: "notion" as const, destination: "Conference project in Notion" })),
  ...["meetingsBooked", "meetingCountLabel", "demosBooked", "closed", "outcomeNotes", "crmSnapshot"].map((field) => ({ field, owner: "hubspot" as const, destination: "HubSpot" })),
  ...["organizerUrl", "venue"].map((field) => ({ field, owner: "organizer" as const, destination: "Organizer source, then the conference tracker or Notion" })),
  { field: "relatedLinks", owner: "drive", destination: "Events Drive, then the conference project in Notion" },
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
    detail: "Supported changes update the fieldbook and create a review version. The live site changes only after Holden approves it.",
  },
  {
    number: "04",
    title: "Write back",
    detail: "Approved corrections return to the system that owns the field. Slack, Gmail and the fieldbook itself are not allowed to become shadow databases.",
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
    writeback: "Yes—approved task and project corrections belong on the event project, not only in the fieldbook.",
  },
  {
    system: "Google Drive · Events Drive",
    state: "Scheduled read",
    refresh: "Folder and file receipts are checked with the relevant active event.",
    feeds: "Contracts, creative, attendee files and post-event artifacts; confidential content stays restricted.",
    writeback: "Yes for approved folder and file organization. Inferred content is never used to rewrite a source file.",
  },
  {
    system: "HubSpot",
    state: "Scheduled read",
    refresh: "Event-attributed records are checked with active-event and post-event reviews.",
    feeds: "Meetings, demos, deals, pipeline and revenue only when a canonical event association is present.",
    writeback: "Yes, with an exact approved record set. The Event key properties and Marketing Event objects still need setup.",
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
    boundary: "Write only an approved diff to the named source artifact; never replace a whole file from the fieldbook.",
  },
  {
    system: "Notion",
    access: "Read + controlled write",
    detail: "Event projects can be found, read and updated at the page or property level.",
    boundary: "Execution decisions belong in the event project with an owner, deadline and supporting link.",
  },
  {
    system: "HubSpot",
    access: "Deals + meetings writable",
    detail: "Deals, meetings, contacts and companies are readable and writable. Marketing Event writes still require reauthorization.",
    boundary: "Show the exact record-and-property diff first. Never write inferred attribution or turn a scheduled meeting into a held meeting.",
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
    boundary: "Move useful notes or legacy evidence into Notion or HubSpot before the fieldbook relies on it.",
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
    work: "Add the existing fieldbook key to the conference tracker and Notion projects. Use the same key in Drive folder names and all new HubSpot event records.",
    unlocks: "Reliable matching, fewer false conflicts, safer review builds and exact write-back destinations.",
    doneWhen: "Every active event has the same immutable key in Sheets, Notion, Drive and HubSpot.",
  },
  {
    phase: "02 · Capture outcomes",
    title: "Make event attribution part of the CRM workflow",
    work: "Add Event key properties to meetings and deals, create one HubSpot Marketing Event per attended event, and require outcome plus next step before the event day ends.",
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
  { system: "HubSpot Marketing Events", field: "Canonical event record", state: "Setup needed", rule: "Create one record per attended event and associate its contacts, meetings and deals." },
  { system: "Google Drive", field: "Event folder prefix", state: "Convention needed", rule: "Prefix the event folder with the key so contracts and artifacts remain traceable after names change." },
] as const;

export const fieldOwners: FieldOwner[] = [
  {
    data: "Event list, dates, participation and topline staffing",
    owner: "Conference tracker · Google Sheets",
    intake: "Scheduled scan plus organizer-site checks when dates or venues need verification.",
    correction: "Update the tracker first. Mirror the reconciled value into Notion and the fieldbook.",
    automation: "High-confidence source changes may update a review version. Conflicts and direct overrides wait for approval.",
  },
  {
    data: "Execution tasks, owners, deadlines and event-specific decisions",
    owner: "Conference Projects · Notion",
    intake: "Scheduled scan of the Events database and active project pages.",
    correction: "Update the event project. The fieldbook reads the resulting plan; it should not invent task status.",
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
    data: "Meetings, demos, deals, pipeline and closed revenue",
    owner: "HubSpot",
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
    timing: "Before the next fieldbook review build",
    rule: "Correct the tracker row first, preserve direct decisions and use the permanent Event key. The fieldbook remains the read view, not the master record.",
    url: sourceLinks.sheet,
  },
  {
    role: "Marketing and creative",
    owns: "Contracts, approved creative, attendee files and post-event artifacts",
    destination: "Events Drive",
    timing: "As soon as the artifact is final",
    rule: "Store one governed file, use the Event key folder convention and link it from the event project. Keep restricted terms out of the fieldbook.",
    url: sourceLinks.eventsDrive,
  },
  {
    role: "RevOps",
    owns: "CRM schema, exact event associations, attribution QA and outcome rollups",
    destination: "HubSpot",
    timing: "During setup and the T+1 / T+7 reviews",
    rule: "Maintain Event key properties and Marketing Event records. Count only records with an exact association and a usable outcome.",
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
    evidence: "Fieldbook measurement-contract audit · Aug 6",
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
    current: "Status: Tentative · 6 attendees planned",
    proposed: "Status: Confirmed · keep 6 attendees planned · names remain open",
    evidence: "Holden direct confirmation · Aug 6",
    evidenceUrl: "/events/icmi-contact-center-expo",
    state: "Ready for approval",
    url: "https://docs.google.com/spreadsheets/d/1vDieEhNcLwWNFxrMQBQLCInhQTcPkspb-6glkSn44Fk/edit?gid=0&range=A24:R24",
  },
  {
    system: "Conference tracker",
    scope: "Genesys Xperience roster",
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
    proposed: "Name the 2026 and 2027 tracker tabs and link the fieldbook as the reconciled read view",
    evidence: "Live Notion page checked Aug 6",
    state: "Ready for approval",
    url: sourceLinks.notion,
  },
  {
    system: "Notion",
    scope: "Genesys Xperience execution page",
    current: "Generic roster · Wish Line labeled in evaluation · talk title/abstract open · Monaco logging",
    proposed: "Name all 9 attendees · mark Wish Line approved and talk inputs locked · replace Monaco with HubSpot",
    evidence: "Holden confirmations + live Notion page checked Aug 6",
    evidenceUrl: "/events/genesys-xperience",
    state: "Ready for approval",
    url: "https://www.notion.so/3aa6fee642fe81c88a89de617863507c",
  },
  {
    system: "Notion",
    scope: "Customer Connect Expo execution page",
    current: "The event project is blank while the working details live in organizer email and the fieldbook",
    proposed: "Add the four-person roster decision, Aug 10 onboarding call, portal-profile work, website ticket link, and the open insurance, pipe-and-drape, booth-number and payment questions with owners and due dates",
    evidence: "Organizer onboarding email + Holden portal-registration reply · Aug 6",
    evidenceUrl: "/events/customer-connect-expo",
    state: "Ready for approval",
    url: "https://www.notion.so/3b46fee642fe80dc9ff9d1ae2661aa2c",
  },
  {
    system: "HubSpot",
    scope: "Deal attribution schema",
    current: "29 exact event-sourced deals · all use CCW Vegas follow-up · 1 additional deal has the same detail but an Outbound — SDR source",
    proposed: "Reconcile the mismatched source/detail pair, then create a Deal property named Event key and set only the confirmed records to ccw-vegas",
    evidence: "HubSpot property and record audit · Aug 7",
    state: "Setup needed",
    url: "https://app.hubspot.com/contacts/245561359/objects/0-3/views/all/list",
  },
  {
    system: "HubSpot",
    scope: "Meeting attribution and outcome QA",
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
    current: "0 Marketing Event records available to the audit",
    proposed: "Reauthorize Marketing Event writes, then create one record per attended event using the canonical Event key, dates and organizer URL",
    evidence: "HubSpot object audit · Aug 6",
    evidenceUrl: "/sources#crm-attribution",
    state: "Setup needed",
    url: "https://app.hubspot.com/contacts/245561359/objects/0-54/views/all/list",
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
