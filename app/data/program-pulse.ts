import { getEventPhase, type EventRecord } from "./events.ts";
import { getSpeakingStatus, getSponsorshipStatus, hasGuaranteedMeetingPackage, hasKnownGuaranteedMeetingCount } from "./event-signals.ts";

export type ProgramAttentionItem = {
  eventKey: string;
  name: string;
  dates: string;
  dateSort: string;
  issues: string[];
};

function addDays(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getEventAttention(event: EventRecord) {
  const issues: string[] = [];
  const named = event.team.length;
  const planned = event.attendeeCount;

  if (event.notes.toLowerCase().startsWith("source conflict:")) issues.push("Source conflict");
  if (event.status !== "Confirmed" && event.status !== "No") issues.push(`Participation ${event.status}`);
  if (planned !== null && named < planned) issues.push(`${planned - named} attendee name${planned - named === 1 ? "" : "s"} open`);
  if (event.priorityActions?.length) issues.push(`${event.priorityActions.length} open plan item${event.priorityActions.length === 1 ? "" : "s"}`);
  if (getSpeakingStatus(event) === "Under review") issues.push("Speaking under review");
  if (getSponsorshipStatus(event) === "Under review") issues.push("Sponsor package under review");
  if (hasGuaranteedMeetingPackage(event) && !hasKnownGuaranteedMeetingCount(event)) issues.push("Guaranteed-meeting count open");

  return issues;
}

export function getProgramPulse(catalog: EventRecord[], programDate: string) {
  const active = catalog
    .filter((event) => getEventPhase(event, programDate) !== "past" && event.status !== "No")
    .sort((a, b) => a.dateSort.localeCompare(b.dateSort) || a.name.localeCompare(b.name));
  const through60Days = addDays(programDate, 60);
  const attention: ProgramAttentionItem[] = active
    .map((event) => ({ eventKey: event.slug, name: event.name, dates: event.dates, dateSort: event.dateSort, issues: getEventAttention(event) }))
    .filter((event) => event.issues.length > 0);

  return {
    active,
    current: active.filter((event) => getEventPhase(event, programDate) === "now"),
    nextStops: active.filter((event) => event.dateEndSort >= programDate).slice(0, 4),
    next60Days: active.filter((event) => event.dateSort > programDate && event.dateSort <= through60Days),
    rosterGaps: active.filter((event) => event.attendeeCount !== null && event.team.length < event.attendeeCount),
    sourceConflicts: active.filter((event) => event.notes.toLowerCase().startsWith("source conflict:")),
    attention,
  };
}
