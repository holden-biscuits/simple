import { getEventPhase, getEventVerification, type EventRecord } from "./events.ts";

export type FreshnessState = "current" | "due" | "overdue" | "archived";

export type SourceFreshness = {
  state: FreshnessState;
  label: string;
  checkedAtISO: string;
  nextCheckISO?: string;
  nextCheckLabel?: string;
  maxAgeDays?: number;
  reason: string;
};

export const freshnessPolicies = [
  { window: "Happening now", cadence: "Daily", detail: "Check staffing, logistics, organizer changes and the onsite action list every day." },
  { window: "Starts within 14 days", cadence: "Every 3 days", detail: "Recheck roster, travel, credentials, deliverables, meetings and the event app." },
  { window: "Starts within 60 days", cadence: "Weekly", detail: "Reconcile the tracker, active Notion project, organizer correspondence and HubSpot setup." },
  { window: "More than 60 days away", cadence: "Monthly", detail: "Confirm the event still belongs in the program and capture material organizer changes." },
  { window: "Past or not attending", cadence: "Archived", detail: "No recurring check. Reopen only for a correction, missing result or retrospective update." },
] as const;

function addDays(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysBetween(fromISO: string, toISO: string) {
  const milliseconds = new Date(`${toISO}T00:00:00Z`).getTime() - new Date(`${fromISO}T00:00:00Z`).getTime();
  return Math.round(milliseconds / 86_400_000);
}

function shortDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${isoDate}T00:00:00Z`));
}

export function getSourceFreshness(event: EventRecord, programDate: string): SourceFreshness {
  const verification = getEventVerification(event);
  const phase = getEventPhase(event, programDate);
  if (event.status === "No" || phase === "past") {
    return {
      state: "archived",
      label: "Archived",
      checkedAtISO: verification.checkedAtISO,
      reason: "Past and non-participating events do not need a recurring source check.",
    };
  }

  const daysUntilEvent = daysBetween(programDate, event.dateSort);
  const maxAgeDays = phase === "now" ? 1 : daysUntilEvent <= 14 ? 3 : daysUntilEvent <= 60 ? 7 : 30;
  const nextCheckISO = addDays(verification.checkedAtISO, maxAgeDays);
  const state: FreshnessState = programDate > nextCheckISO ? "overdue" : programDate === nextCheckISO ? "due" : "current";
  const label = state === "overdue" ? "Check overdue" : state === "due" ? "Check due" : "Current";
  const cadence = maxAgeDays === 1 ? "daily" : maxAgeDays === 3 ? "every 3 days" : maxAgeDays === 7 ? "weekly" : "monthly";
  return {
    state,
    label,
    checkedAtISO: verification.checkedAtISO,
    nextCheckISO,
    nextCheckLabel: shortDate(nextCheckISO),
    maxAgeDays,
    reason: state === "current" ? `This event is inside the ${cadence} check window.` : `This event is inside the ${cadence} check window and needs a fresh source pass.`,
  };
}
