import { getEventPhase, type EventRecord } from "./events.ts";
import { getEventProspectingBrief } from "./event-prospecting.ts";

export type AudienceSegmentState =
  | "Verified static snapshot"
  | "Specification ready"
  | "Waiting for organizer audience"
  | "Research only"
  | "Inactive";

export type AudienceSegmentRegistryItem = {
  eventKey: string;
  eventName: string;
  eventHref: string;
  year: string;
  state: AudienceSegmentState;
  segmentName: string;
  objectType: "Contacts";
  membershipRule: string;
  sourceGate: string;
  refreshRule: string;
  nextAction: string;
  hubspotUrl?: string;
};

export type AudienceSegmentRegistry = {
  items: AudienceSegmentRegistryItem[];
  activeEvents: number;
  verifiedSnapshots: number;
  specificationsReady: number;
  waitingForOrganizerAudience: number;
  automaticallyMaintained: number;
};

export const audienceSegmentContract = [
  {
    step: "01",
    title: "Define the target universe",
    detail: "Use the event-specific ZoomInfo company and contact taxonomy to decide who is worth researching. This is targeting—not proof of attendance.",
  },
  {
    step: "02",
    title: "Require an event signal",
    detail: "Enroll a contact only after the event app, organizer file, matched-meeting schedule, booked meeting, badge scan, session, or another named source connects that person or company to the event.",
  },
  {
    step: "03",
    title: "Maintain one active segment",
    detail: "Use the canonical Event key as the membership join. New qualified signals enter automatically; disqualified or wrongly attributed records leave without a manual copy-and-paste list.",
  },
  {
    step: "04",
    title: "Preserve the follow-up cohort",
    detail: "Keep the segment active through the 90-day reporting window. After that, retain a dated snapshot only when it is needed for audit or historical campaign reporting.",
  },
] as const;

function yearFor(event: EventRecord) {
  return event.dateSort.slice(0, 4);
}

function desiredSegmentName(event: EventRecord) {
  return `Events · ${yearFor(event)} · ${event.name} · Qualified audience`;
}

function toRegistryItem(event: EventRecord, programDate: string): AudienceSegmentRegistryItem {
  const prospecting = getEventProspectingBrief(event);
  const phase = getEventPhase(event, programDate);
  const common = {
    eventKey: event.slug,
    eventName: event.name,
    eventHref: `/events/${event.slug}#event-prospecting`,
    year: yearFor(event),
    segmentName: prospecting.hubspotSegment?.name ?? desiredSegmentName(event),
    objectType: "Contacts" as const,
  };

  if (prospecting.hubspotSegment) return {
    ...common,
    state: "Verified static snapshot",
    membershipRule: "Membership is frozen. Treat it as historical evidence, not a self-updating audience.",
    sourceGate: "Existing HubSpot list verified by exact list ID.",
    refreshRule: "No automatic refresh. Replace with an active Event-key segment if this event returns to the program.",
    nextAction: "Keep for audit; do not describe it as current attendance.",
    hubspotUrl: prospecting.hubspotSegment.url,
  };

  if (event.status === "No") return {
    ...common,
    state: "Inactive",
    membershipRule: "No event segment while TeamSimple is not participating.",
    sourceGate: "A new participation decision is required before any audience work starts.",
    refreshRule: "None.",
    nextAction: "Leave inactive.",
  };

  if (phase === "past") return {
    ...common,
    state: "Research only",
    membershipRule: "No retroactive audience is created from event branding or date proximity.",
    sourceGate: "A named historical attendee, meeting, scan, or campaign record is required.",
    refreshRule: "None unless a source correction reopens the event record.",
    nextAction: "Use ZoomInfo only for a specific named research question.",
  };

  if (prospecting.confidence === "Matched-account qualification") return {
    ...common,
    state: "Waiting for organizer audience",
    membershipRule: `Event key equals ${event.slug}; contact or associated company must appear in the organizer's matched-account or meeting file.`,
    sourceGate: "Organizer matched-account list or guaranteed-meeting schedule.",
    refreshRule: "Add newly matched contacts through the event; remove cancellations and rejected matches; retain through T+90 days.",
    nextAction: "Import the organizer file with the Event key, then activate the segment.",
  };

  if (prospecting.confidence === "Names required") return {
    ...common,
    state: "Research only",
    membershipRule: `Event key equals ${event.slug}; membership starts only from a named attendee, speaker, or company signal.`,
    sourceGate: "Credible attendee, speaker, app, or organizer source.",
    refreshRule: "Refresh when new named evidence arrives; retain through T+90 days.",
    nextAction: "Collect a named audience source before creating a segment.",
  };

  return {
    ...common,
    state: "Specification ready",
    membershipRule: `Event key equals ${event.slug}; contact has a named event signal and the associated company fits the event's qualification profile.`,
    sourceGate: "Event app, sponsor file, booked meeting, badge scan, session, or another named signal.",
    refreshRule: "Refresh from new qualified signals through the event; remove false matches; retain through T+90 days.",
    nextAction: "Create the active HubSpot segment after Event key and list-write access are available.",
  };
}

export function getAudienceSegmentRegistry(events: EventRecord[], programDate: string): AudienceSegmentRegistry {
  const allItems = events.map((event) => toRegistryItem(event, programDate));
  const sourceEvents = new Map(events.map((event) => [event.slug, event]));
  const items = allItems
    .filter((item) => {
      const event = sourceEvents.get(item.eventKey);
      return item.state === "Verified static snapshot" || Boolean(event && event.status !== "No" && getEventPhase(event, programDate) !== "past");
    })
    .sort((a, b) => (sourceEvents.get(a.eventKey)?.dateSort ?? "").localeCompare(sourceEvents.get(b.eventKey)?.dateSort ?? ""));
  const activeEvents = events.filter((event) => event.status !== "No" && getEventPhase(event, programDate) !== "past").length;
  return {
    items,
    activeEvents,
    verifiedSnapshots: items.filter((item) => item.state === "Verified static snapshot").length,
    specificationsReady: items.filter((item) => item.state === "Specification ready").length,
    waitingForOrganizerAudience: items.filter((item) => item.state === "Waiting for organizer audience").length,
    automaticallyMaintained: 0,
  };
}
