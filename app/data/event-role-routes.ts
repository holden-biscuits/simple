import { getSpeakingStatus, getSponsorshipStatus, hasGuaranteedMeetingPackage } from "./event-signals.ts";
import { type EventPhase, type EventRecord } from "./events.ts";
import { getEventFootprint } from "./event-footprint.ts";

export type EventRoleRoute = {
  role: "AE" | "SDR";
  bullets: [string, string, string];
  href: string;
  cta: string;
};

export function getEventRoleRoutes(event: EventRecord, phase: EventPhase): EventRoleRoute[] {
  if (event.status === "No" || phase === "past") return [];

  const sponsorship = getSponsorshipStatus(event);
  const speaking = getSpeakingStatus(event);
  const footprint = getEventFootprint(event);
  const bookedMeetingCount = event.meetingsBooked.length;
  const guaranteedMeetingDetail = event.guaranteedMeetings.replace(/^Yes\s*(?:·\s*)?/i, "").trim();

  const aeExpectation = hasGuaranteedMeetingPackage(event)
    ? guaranteedMeetingDetail ? `Expect ${guaranteedMeetingDetail.toLowerCase()}; review the matched accounts and the meeting format before you arrive.` : "A guaranteed meeting package is included, but the count is still open; confirm the matched accounts and format before you arrive."
      : bookedMeetingCount
      ? `${bookedMeetingCount} meeting${bookedMeetingCount === 1 ? " is" : "s are"} already booked; review the account and protect the discovery time for each one.`
      : sponsorship === "Confirmed" || speaking === "Confirmed"
        ? "Expect to create qualified conversations through the event program, booth, app, and direct outreach; nothing arrives pre-booked."
        : "No meeting package or confirmed activation is listed; do not rely on onsite traffic to create the meeting for you.";

  const sdrFootprint = footprint.kind === "booth"
    ? "Work the booth and nearby traffic: start conversations, keep the space clear, and bring qualified people to the right AE."
    : footprint.kind === "meeting-area"
      ? "Keep the meeting area ready for scheduled conversations and bring qualified people to the right AE without crowding the space."
      : footprint.kind === "sponsor-activation"
        ? "Use the sponsor activation as an introduction point, then qualify quickly before routing someone to an AE."
        : footprint.kind === "unresolved"
          ? "The onsite footprint is unresolved; do not promise a booth meeting. Work the app, sessions, and networking areas instead."
          : "No booth is listed; work the app, sessions, and networking areas and make direct introductions instead of waiting for traffic.";

  const sdrProgram = speaking === "Confirmed"
    ? "Use the speaking program as a relevant opener, never as permission to improvise product claims; route qualified interest to an AE."
    : "Qualify quickly: protect AE time, identify the real use case and buyer role, and route only the conversations worth advancing.";

  return [
    {
      role: "AE",
      bullets: [
        aeExpectation,
        "Know the priority account, its contact-center environment, one useful hypothesis, and the next-step ask before the conversation.",
        "Before the day ends, record the contact, context, qualification, owner, and next action in HubSpot.",
      ],
      href: "/ae#build-the-meeting-hypothesis",
      cta: "Open the general AE guide",
    },
    {
      role: "SDR",
      bullets: [
        "Download the event app, find priority people and accounts, and try to connect before the show.",
        sdrFootprint,
        sdrProgram,
      ],
      href: "/sdr#how-to-work-the-event",
      cta: "Open the general SDR guide",
    },
  ];
}
