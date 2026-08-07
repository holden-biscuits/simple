import { getEventPhase, type EventRecord } from "./events.ts";
import { getSpeakingStatus, getSponsorshipStatus, getStaffingSignal } from "./event-signals.ts";
import { getProgramPulse } from "./program-pulse.ts";
import { getEventReadiness } from "./program-readiness.ts";
import { crmAttributionAudit } from "./crm-attribution.ts";
import { writebackQueue } from "./source-governance.ts";
import { getProgramSystemLinkage } from "./system-linkage.ts";
import { getEventBriefReadiness, getProgramBriefReadiness } from "./event-brief-readiness.ts";
import type { SourceChange } from "./site-status.ts";

function activationLabel(event: EventRecord) {
  const speaking = getSpeakingStatus(event);
  const sponsorship = getSponsorshipStatus(event);
  if (speaking === "Confirmed" && sponsorship === "Confirmed") return "Sponsor + speaking";
  if (sponsorship === "Confirmed") return "Sponsorship";
  if (speaking === "Confirmed") return "Speaking";
  if (speaking === "Under review" || sponsorship === "Under review") return "Activation under review";
  return "Attendance only";
}

export function getLeadershipChangeDigest(catalog: EventRecord[], changes: SourceChange[]) {
  const eventNames = new Map(catalog.map((event) => [event.slug, event.name]));
  const items = changes
    .filter((change) => change.state === "Applied" || change.state === "Needs review")
    .map((change) => ({
      ...change,
      eventName: change.eventSlug ? eventNames.get(change.eventSlug) ?? "Unmatched event" : "Program-wide",
      href: change.eventSlug && eventNames.has(change.eventSlug)
        ? `/events/${change.eventSlug}#event-changes`
        : "/sources#change-log",
    }));
  return {
    applied: items.filter((change) => change.state === "Applied"),
    needsReview: items.filter((change) => change.state === "Needs review"),
  };
}

export function getLeadershipBrief(catalog: EventRecord[], programDate: string) {
  const pulse = getProgramPulse(catalog, programDate);
  const linkage = getProgramSystemLinkage(catalog, programDate);
  const portfolio = pulse.active.map((event) => {
    const readiness = getEventReadiness(event, programDate);
    return {
      eventKey: event.slug,
      name: event.name,
      dates: event.dates,
      dateSort: event.dateSort,
      location: event.location,
      status: event.status,
      phase: getEventPhase(event, programDate),
      activation: activationLabel(event),
      staffing: getStaffingSignal(event),
      readiness,
      briefReadiness: getEventBriefReadiness(event, programDate),
      issues: pulse.attention.find((item) => item.eventKey === event.slug)?.issues ?? [],
    };
  });
  const writebacks = {
    ready: writebackQueue.filter((item) => item.state === "Ready for approval").length,
    decisions: writebackQueue.filter((item) => item.state === "Decision needed").length,
    setup: writebackQueue.filter((item) => item.state === "Setup needed").length,
  };

  return {
    programDate,
    pulse,
    briefReadiness: getProgramBriefReadiness(catalog, programDate),
    linkage,
    portfolio,
    writebacks,
    outcomes: {
      exactDeals: crmAttributionAudit.exactDeals,
      representedEvents: crmAttributionAudit.representedEvents,
      meetingRecordsToQa: crmAttributionAudit.meetingWindow.possibleEventMeetings,
      completedMeetingOutcomes: crmAttributionAudit.meetingWindow.completedOutcomes,
      marketingEvents: crmAttributionAudit.marketingEvents,
      pipelineClaimSupported: false,
    },
  };
}
