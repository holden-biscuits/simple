import { getEventPhase, getProgramDate, type EventRecord } from "./events.ts";
import { getEventReadiness, getProgramReadiness, type ReadinessAction } from "./program-readiness.ts";
import { getSourceFreshness } from "./source-freshness.ts";
import { getEventBriefReadiness } from "./event-brief-readiness.ts";
import { getStaffingSignal } from "./event-signals.ts";

export type ProgramAttentionItem = {
  eventKey: string;
  name: string;
  dates: string;
  dateSort: string;
  issues: string[];
  nextAction?: ReadinessAction;
};

function addDays(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getEventAttention(event: EventRecord, programDate = getProgramDate()) {
  return getEventBriefReadiness(event, programDate).issues.map((issue) => issue.label);
}

export function getProgramPulse(catalog: EventRecord[], programDate: string) {
  const active = catalog
    .filter((event) => getEventPhase(event, programDate) !== "past" && event.status !== "No")
    .sort((a, b) => a.dateSort.localeCompare(b.dateSort) || a.name.localeCompare(b.name));
  const through60Days = addDays(programDate, 60);
  const attention: ProgramAttentionItem[] = active
    .map((event) => ({ eventKey: event.slug, name: event.name, dates: event.dates, dateSort: event.dateSort, issues: getEventAttention(event, programDate), nextAction: getEventReadiness(event, programDate).nextAction }))
    .filter((event) => event.issues.length > 0);

  return {
    active,
    current: active.filter((event) => getEventPhase(event, programDate) === "now"),
    nextStops: active.filter((event) => event.dateEndSort >= programDate).slice(0, 4),
    next60Days: active.filter((event) => event.dateSort > programDate && event.dateSort <= through60Days),
    rosterGaps: active.filter((event) => getStaffingSignal(event).assignmentGap > 0),
    sourceConflicts: active.filter((event) => event.notes.toLowerCase().startsWith("source conflict:")),
    sourceChecksDue: active.filter((event) => ["due", "overdue"].includes(getSourceFreshness(event, programDate).state)),
    readiness: getProgramReadiness(active, programDate),
    attention,
  };
}
