import { getEventPhase, type EventRecord } from "./events.ts";
import { getSpeakingStatus, getSponsorshipStatus, hasGuaranteedMeetingPackage, hasKnownGuaranteedMeetingCount } from "./event-signals.ts";
import { getEventReadiness } from "./program-readiness.ts";
import { getSourceFreshness } from "./source-freshness.ts";

export type BriefReadinessStage = "not-attending" | "archived" | "onsite" | "final-prep" | "planning" | "foundation";

export type BriefReadinessIssue = {
  key: string;
  label: string;
  destination: "Conference tracker" | "Organizer source" | "Event project" | "Source review";
};

export type EventBriefReadiness = {
  eventKey: string;
  stage: BriefReadinessStage;
  timing: string;
  label: string;
  state: "ready" | "attention" | "inactive";
  issues: BriefReadinessIssue[];
};

function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

function stageFor(event: EventRecord, programDate: string): { stage: BriefReadinessStage; timing: string } {
  if (event.status === "No") return { stage: "not-attending", timing: "Not attending" };
  const phase = getEventPhase(event, programDate);
  if (phase === "past") return { stage: "archived", timing: "Past event" };
  if (phase === "now") return { stage: "onsite", timing: "Happening now" };
  const daysOut = daysBetween(programDate, event.dateSort);
  if (daysOut <= 14) return { stage: "final-prep", timing: `${daysOut} day${daysOut === 1 ? "" : "s"} out` };
  if (daysOut <= 60) return { stage: "planning", timing: `${daysOut} days out` };
  return { stage: "foundation", timing: `${daysOut} days out` };
}

function readinessLabel(stage: BriefReadinessStage, issueCount: number) {
  if (stage === "not-attending") return "No TeamSimple plan";
  if (stage === "archived") return "Archived";
  if (!issueCount) {
    if (stage === "onsite") return "Onsite-ready";
    if (stage === "final-prep") return "Final prep on track";
    if (stage === "planning") return "Planning on track";
    return "Foundation on track";
  }
  if (stage === "onsite") return "Onsite gaps open";
  if (stage === "final-prep") return "Final prep needs attention";
  if (stage === "planning") return "Planning gaps open";
  return "Foundation gaps open";
}

export function getEventBriefReadiness(event: EventRecord, programDate: string): EventBriefReadiness {
  const { stage, timing } = stageFor(event, programDate);
  if (stage === "not-attending" || stage === "archived") {
    return { eventKey: event.slug, stage, timing, label: readinessLabel(stage, 0), state: "inactive", issues: [] };
  }

  const issues: BriefReadinessIssue[] = [];
  const add = (key: string, label: string, destination: BriefReadinessIssue["destination"]) => issues.push({ key, label, destination });
  const nearTerm = stage !== "foundation";

  if (event.status !== "Confirmed") add("participation", `Confirm whether TeamSimple is attending; status is ${event.status}`, "Conference tracker");
  if (/\bTBD\b|exact dates/i.test(event.dates)) add("dates", "Confirm the exact event dates", "Conference tracker");
  if (getSpeakingStatus(event) === "Under review") add("speaking", "Confirm the speaking commitment", "Conference tracker");
  if (getSponsorshipStatus(event) === "Under review") add("sponsorship", "Confirm the sponsor package and inclusions", "Conference tracker");
  if (hasGuaranteedMeetingPackage(event) && !hasKnownGuaranteedMeetingCount(event)) add("meeting-count", "Confirm the guaranteed-meeting count and format", "Conference tracker");
  if (event.notes.toLowerCase().startsWith("source conflict:")) add("source-conflict", "Resolve the source conflict recorded on this brief", "Source review");
  if (["due", "overdue"].includes(getSourceFreshness(event, programDate).state)) add("source-check", "Refresh the event’s owning sources", "Source review");

  if (nearTerm) {
    if (event.attendeeCount !== null && event.team.length < event.attendeeCount) {
      const remaining = event.attendeeCount - event.team.length;
      add("roster", `Name ${remaining} remaining attendee${remaining === 1 ? "" : "s"}`, "Conference tracker");
    } else if (event.attendeeCount === null && !event.team.length) {
      add("roster", "Name the attending team and planned headcount", "Conference tracker");
    }
    if (!event.venue) add("venue", "Confirm the venue", "Organizer source");
    if (!event.credentials) add("credentials", "Confirm passes, registration, and credential limits", "Event project");
    if (!event.notionUrl) add("workspace", "Create or link the event project", "Event project");

    const execution = getEventReadiness(event, programDate);
    if (execution.planState !== "structured") {
      add("execution-plan", "Turn the open priorities into owned, dated tasks", "Event project");
    } else if (execution.ownerGaps || execution.dateGaps) {
      const gaps = Math.max(execution.ownerGaps, execution.dateGaps);
      add("execution-gaps", `Add missing owners or due dates to ${gaps} open task${gaps === 1 ? "" : "s"}`, "Event project");
    }
  }

  return {
    eventKey: event.slug,
    stage,
    timing,
    label: readinessLabel(stage, issues.length),
    state: issues.length ? "attention" : "ready",
    issues,
  };
}

export function getProgramBriefReadiness(catalog: EventRecord[], programDate: string) {
  const events = catalog
    .map((event) => getEventBriefReadiness(event, programDate))
    .filter((event) => event.state !== "inactive");
  return {
    events,
    ready: events.filter((event) => event.state === "ready"),
    attention: events.filter((event) => event.state === "attention"),
    openInputs: events.reduce((total, event) => total + event.issues.length, 0),
  };
}
