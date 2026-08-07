import { getSponsorshipStatus } from "./event-signals.ts";
import { getWorkstreams, type EventRecord } from "./events.ts";

export type EventFootprintKind = "booth" | "meeting-area" | "sponsor-activation" | "unresolved" | "none";

export type EventFootprint = {
  kind: EventFootprintKind;
  label: string;
};

export function getEventFootprint(event: EventRecord): EventFootprint {
  if (event.status === "No") return { kind: "none", label: "None" };

  const sponsorshipStatus = getSponsorshipStatus(event);
  const sponsorshipText = [event.sponsorship, ...getWorkstreams(event).sponsorship].join(" ").toLowerCase();

  if (sponsorshipStatus === "Under review") return { kind: "unresolved", label: "Under review" };
  if (/\bmeeting area\b/.test(sponsorshipText)) return { kind: "meeting-area", label: "Meeting area confirmed" };
  if (/\bbooth\b/.test(sponsorshipText) && !/\bno (?:expo )?booth\b/.test(sponsorshipText)) return { kind: "booth", label: "Booth confirmed" };
  if (sponsorshipStatus === "Confirmed") return { kind: "sponsor-activation", label: "Sponsor activation confirmed" };
  return { kind: "none", label: "None listed" };
}
