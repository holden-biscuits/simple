import { sourceLinks } from "./events";

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

export type WritebackItem = {
  system: string;
  scope: string;
  action: string;
  state: "Ready for approval" | "Decision needed" | "Setup needed";
  url: string;
};

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

export const writebackQueue: WritebackItem[] = [
  {
    system: "Conference tracker",
    scope: "Five protected direct corrections",
    action: "Mirror the confirmed Contact.io, Customer Connect and ICMI participation decisions plus the nine-person Genesys roster and zero guaranteed meetings into the tracker.",
    state: "Ready for approval",
    url: sourceLinks.sheet,
  },
  {
    system: "Conference tracker",
    scope: "CCW Vegas 2027 speaking",
    action: "Resolve whether the directory should count one contracted speaking opportunity or three separate programs before changing the tracker or the protected site value.",
    state: "Decision needed",
    url: "https://docs.google.com/spreadsheets/d/1vDieEhNcLwWNFxrMQBQLCInhQTcPkspb-6glkSn44Fk/edit?gid=113603184#gid=113603184",
  },
  {
    system: "Notion",
    scope: "Events home and Genesys Xperience",
    action: "Change the 2026-only source note to 2026–2027, replace Monaco logging with HubSpot, record the named roster, and mark the Wish Line and talk inputs as confirmed.",
    state: "Ready for approval",
    url: sourceLinks.notion,
  },
  {
    system: "HubSpot",
    scope: "Stable event attribution",
    action: "Add one canonical Event key across deals and meetings, keep Deal Source reportable, and use Deal Source Detail for the specific event. Marketing Event writes need HubSpot reauthorization before that object can be the shared event entity.",
    state: "Setup needed",
    url: "https://app.hubspot.com/contacts/245561359/objects/0-3/views/all/list",
  },
  {
    system: "Events Drive",
    scope: "Folder structure",
    action: "Create one folder per confirmed event with Contracts, Creative, Attendees and Post-event subfolders, then store those folder links on the matching Notion page.",
    state: "Setup needed",
    url: sourceLinks.eventsDrive,
  },
  {
    system: "Slack or Gmail",
    scope: "Change roundup destination",
    action: "Keep the Codex roundup as the audit record. Add a leadership-facing Slack channel or email destination only after the audience and level of detail are chosen.",
    state: "Setup needed",
    url: "/sources#source-monitor",
  },
];
