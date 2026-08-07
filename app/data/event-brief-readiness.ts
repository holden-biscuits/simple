import { getEventPhase, getEventTrackerRowUrl, sourceLinks, type EventRecord } from "./events.ts";
import { getSpeakingStatus, getSponsorshipStatus, getStaffingSignal, hasGuaranteedMeetingPackage, hasKnownGuaranteedMeetingCount } from "./event-signals.ts";
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

export type BriefIssueAction = {
  href: string;
  label: string;
  external: boolean;
};

export function getBriefIssueAction(
  issue: BriefReadinessIssue,
  event: Pick<EventRecord, "slug" | "notionUrl" | "organizerUrl">,
): BriefIssueAction {
  if (issue.destination === "Conference tracker") return { href: getEventTrackerRowUrl(event.slug), label: "Open event row", external: true };
  if (issue.destination === "Organizer source") return { href: event.organizerUrl, label: "Open organizer source", external: true };
  if (issue.destination === "Event project") return event.notionUrl
    ? { href: event.notionUrl, label: "Open event project", external: true }
    : { href: sourceLinks.notion, label: "Open Notion setup", external: true };
  return { href: "/sources#approval-queue", label: "Open source review", external: false };
}

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
  if (!event.notionUrl) add("workspace", "Create or link the event project", "Event project");

  if (nearTerm) {
    const staffing = getStaffingSignal(event);
    if (staffing.assignmentGap) {
      add("roster", `Assign ${staffing.assignmentGap} remaining pass${staffing.assignmentGap === 1 ? "" : "es"}`, "Conference tracker");
    } else if (!staffing.passCount && !event.team.length) {
      add("roster", "Confirm who is attending and how many passes are available", "Conference tracker");
    }
    if (!event.venue) add("venue", "Confirm the venue", "Organizer source");
    if (!event.credentials) add("credentials", "Confirm passes, registration, and credential limits", "Event project");
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

const onsiteAdminIssues = new Set(["workspace", "execution-plan", "execution-gaps"]);

function onsiteIssueLabel(issue: BriefReadinessIssue, event: EventRecord) {
  if (issue.key === "participation") return "Attendance status is still unverified";
  if (issue.key === "dates") return "Event dates are still unverified";
  if (issue.key === "speaking") return "Speaking commitment is still unverified";
  if (issue.key === "sponsorship") return "Sponsor package details are not recorded";
  if (issue.key === "meeting-count") return "Guaranteed-meeting count and format are not recorded";
  if (issue.key === "source-conflict") return "A source conflict still affects this brief";
  if (issue.key === "source-check") return "The event sources need a same-day refresh";
  if (issue.key === "roster" && getStaffingSignal(event).assignmentGap) {
    const remaining = getStaffingSignal(event).assignmentGap;
    return `${remaining} pass${remaining === 1 ? "" : "es"} still need${remaining === 1 ? "s" : ""} an attendee`;
  }
  if (issue.key === "roster") return "The onsite roster is not recorded";
  if (issue.key === "venue") return "Venue details are not recorded";
  if (issue.key === "credentials") return "Pass and credential details are not recorded";
  return issue.label;
}

/**
 * Event pages switch from planning hygiene to field utility once an event starts.
 * Program and leadership views keep the full readiness backlog through
 * getEventBriefReadiness; this view removes admin work that cannot help onsite.
 */
export function getEventPageBriefReadiness(event: EventRecord, programDate: string): EventBriefReadiness {
  const readiness = getEventBriefReadiness(event, programDate);
  if (readiness.stage !== "onsite") return readiness;

  const issues = readiness.issues
    .filter((issue) => !onsiteAdminIssues.has(issue.key))
    .map((issue) => ({ ...issue, label: onsiteIssueLabel(issue, event) }));

  return {
    ...readiness,
    label: readinessLabel(readiness.stage, issues.length),
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
