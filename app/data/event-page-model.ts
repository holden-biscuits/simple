import { getEventPhase, type EventRecord } from "./events.ts";

export type EventPageModel = {
  phase: ReturnType<typeof getEventPhase>;
  isNotAttending: boolean;
  hasRecordedResults: boolean;
  showProspecting: boolean;
  showPlanningBody: boolean;
  showResults: boolean;
  tldrHeading: string;
  secondaryLabel: string;
  workstreamEyebrow: string;
  workstreamTitle: string;
};

export function getEventPageModel(event: EventRecord, programDate: string): EventPageModel {
  const phase = getEventPhase(event, programDate);
  const isNotAttending = event.status === "No";
  const hasRecordedResults = Boolean(
    event.meetingsBooked.length
    || event.followupMeetingsBooked
    || event.meetingCountLabel
    || event.demosBooked.length
    || event.demoCountLabel
    || event.closed.length
    || event.outcomeNotes?.length
    || event.crmSnapshot,
  );

  return {
    phase,
    isNotAttending,
    hasRecordedResults,
    showProspecting: !isNotAttending,
    showPlanningBody: !isNotAttending,
    showResults: !isNotAttending && (phase === "past" || hasRecordedResults),
    tldrHeading: isNotAttending
      ? "Why there is no TeamSimple plan."
      : phase === "past"
        ? "What happened and what happens next."
        : phase === "now"
          ? "What matters onsite today."
          : "Know this before you go.",
    secondaryLabel: phase === "past" ? "Closeout sections" : "Plan sections",
    workstreamEyebrow: phase === "past" ? "Plan and closeout" : "Field checklist",
    workstreamTitle: phase === "past"
      ? "What was planned—and what the record still needs."
      : "What the event team needs to know and do.",
  };
}
