import { getEventPhase, getWorkstreams, isEmptyWorkstream, type EventRecord } from "./events.ts";
import { getSpeakingStatus, hasGuaranteedMeetingPackage } from "./event-signals.ts";

export type EventAgendaItem = {
  label: string;
  title: string;
  detail: string;
  state: "confirmed" | "open";
};

function getAgendaUrl(event: EventRecord) {
  return event.relatedLinks?.find((link) => /agenda|schedule|program/i.test(link.label))?.url
    ?? event.organizerUrl;
}

export function getEventAgenda(event: EventRecord, programDate: string) {
  const items: EventAgendaItem[] = [{
    label: "Event window",
    title: event.dates,
    detail: event.venue ? `${event.venue} · ${event.location}` : event.location,
    state: /TBD|exact dates/i.test(event.dates) ? "open" : "confirmed",
  }];

  const speaking = getSpeakingStatus(event);
  if (speaking !== "None") items.push({
    label: "TeamSimple session",
    title: event.speaking,
    detail: speaking === "Under review" ? "Timing or commitment still needs confirmation." : "TeamSimple programming recorded in the event plan.",
    state: speaking === "Under review" ? "open" : "confirmed",
  });

  if (hasGuaranteedMeetingPackage(event)) items.push({
    label: "Meetings",
    title: event.guaranteedMeetings.replace(/^Yes\s*(?:·\s*)?/i, "") || "Guaranteed meetings included",
    detail: "Individual appointment times belong in the organizer schedule and HubSpot meeting records.",
    state: /TBD|not yet confirmed|unknown/i.test(event.guaranteedMeetings) ? "open" : "confirmed",
  });

  const secondary = getWorkstreams(event).secondary;
  if (!isEmptyWorkstream(secondary)) items.push({
    label: "Side program",
    title: secondary.filter((item) => !/^none\b/i.test(item)).join(" · "),
    detail: "Confirm exact times and locations in the event plan before attending.",
    state: secondary.some((item) => /possible|optional|not confirmed|TBD/i.test(item)) ? "open" : "confirmed",
  });

  const exactAgendaLink = event.relatedLinks?.find((link) => /agenda|schedule|program/i.test(link.label));
  return {
    phase: getEventPhase(event, programDate),
    items,
    url: getAgendaUrl(event),
    linkLabel: exactAgendaLink || /agenda|schedule|program/i.test(event.organizerUrl)
      ? "Open the live agenda"
      : "Open the event site for the live agenda",
  };
}
