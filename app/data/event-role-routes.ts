import { getSpeakingStatus, getSponsorshipStatus, hasGuaranteedMeetingPackage } from "./event-signals.ts";
import { getWorkstreams, isEmptyWorkstream, type EventPhase, type EventRecord } from "./events.ts";

export type EventRoleRoute = {
  role: "AE" | "SDR" | "Marketing / event lead";
  title: string;
  detail: string;
  href: string;
  cta: string;
};

export function getEventRoleRoutes(event: EventRecord, phase: EventPhase): EventRoleRoute[] {
  if (event.status === "No" || phase === "past") return [];

  const sponsorship = getSponsorshipStatus(event);
  const speaking = getSpeakingStatus(event);
  const workstreams = getWorkstreams(event);
  const hasMarketingWork = !isEmptyWorkstream(workstreams.marketing) || Boolean(event.marketingTasks?.length || event.priorityActions?.length);
  const marketingItemCount = event.priorityActions?.length || workstreams.marketing.length;
  const bookedMeetingCount = event.meetingsBooked.length;
  const guaranteedMeetingDetail = event.guaranteedMeetings.replace(/^Yes\s*(?:·\s*)?/i, "").trim();

  const aeDetail = hasGuaranteedMeetingPackage(event)
    ? `${guaranteedMeetingDetail ? `${guaranteedMeetingDetail}.` : "A guaranteed meeting package is included, but the count is still open."} Get the matched-account list, prepare one hypothesis per account, and decide the next-step ask before each conversation.`
    : bookedMeetingCount
      ? `${bookedMeetingCount} meeting${bookedMeetingCount === 1 ? " is" : "s are"} already booked. Review each account, protect the discovery time, and leave with an owned next action.`
      : sponsorship === "Confirmed" || speaking === "Confirmed"
        ? "No guaranteed meeting package is listed. Use the event program to create qualified conversations, then record the context and next action in HubSpot."
        : "No meeting package or confirmed activation is listed. Prepare priority accounts and a direct meeting ask before relying on onsite traffic.";

  const sdrDetail = sponsorship === "Confirmed"
    ? `Work the booth and nearby traffic, use the event app to find priority people, and protect AE time with fast qualification.${speaking === "Confirmed" ? " Use the speaking program as context—not as permission to improvise product claims." : ""}`
    : sponsorship === "Under review"
      ? "Confirm the onsite footprint before promising a booth meeting. Use the event app, sessions, and networking areas while the activation remains unresolved."
      : `No booth is listed. Work the event app, sessions, and networking areas; make direct introductions instead of waiting for traffic.${speaking === "Confirmed" ? " Use the session as a relevant opener and route qualified interest to an AE." : ""}`;

  const routes: EventRoleRoute[] = [
    {
      role: "AE",
      title: "Prepare the account and the next-step ask.",
      detail: aeDetail,
      href: "/ae#build-the-meeting-hypothesis",
      cta: "Open the AE route",
    },
    {
      role: "SDR",
      title: sponsorship === "Confirmed" ? "Create traffic and qualify quickly." : "Go find the right conversations.",
      detail: sdrDetail,
      href: "/sdr#how-to-work-the-event",
      cta: "Open the SDR route",
    },
  ];

  if (hasMarketingWork) routes.push({
    role: "Marketing / event lead",
    title: event.marketingTasks?.length ? "Run the owned event task list." : "Turn the open plan into owned work.",
    detail: event.marketingTasks?.length
      ? `${event.marketingTasks.length} structured task${event.marketingTasks.length === 1 ? " is" : "s are"} tracked for this event. Review status, owner, deadline, and the next blocked handoff.`
      : `${marketingItemCount} event-specific item${marketingItemCount === 1 ? " needs" : "s need"} ownership and timing. Use the event workspace rather than a separate private checklist.`,
    href: `/marketing?event=${event.slug}#event-tasks`,
    cta: "Open this event’s workspace",
  });

  return routes;
}
