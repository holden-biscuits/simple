type GuaranteedMeetingSource = { guaranteedMeetings: string };
type StaffingSource = {
  status: "Confirmed" | "TBD" | "Tentative" | "No";
  attendeeCount: number | null;
  team: string[];
  credentials?: string;
};
type ActivationStatus = "Confirmed" | "Under review" | "None";
type ActivationSource = {
  speaking: string;
  speakingStatus?: ActivationStatus;
  sponsorship: string;
  sponsorshipStatus?: ActivationStatus;
};
type CompletedEventSource = {
  rating: string;
  meetingsBooked: string[];
  meetingCountLabel?: string;
  followupMeetingsBooked?: number;
  demosBooked: string[];
  demoCountLabel?: string;
  crmSnapshot?: { totalDeals: number };
};

function knownGuaranteedMeetingLabel(event: GuaranteedMeetingSource) {
  const meetings = event.guaranteedMeetings.trim();

  const range = meetings.match(/\b(\d+)\s*[–-]\s*(\d+)\b/);
  if (range) return `${range[1]}–${range[2]} Guaranteed Meetings`;

  const minimum = meetings.match(/\bminimum\s+(\d+)\b/i);
  if (minimum) return `${minimum[1]}+ Guaranteed Meetings`;

  const exact = meetings.match(/^yes(?:\s*·\s*|\s+)(\d+)\b/i);
  if (exact) return `${exact[1]} Guaranteed Meeting${exact[1] === "1" ? "" : "s"}`;

  return null;
}

export function hasGuaranteedMeetingPackage(event: GuaranteedMeetingSource) {
  return event.guaranteedMeetings.trim().toLowerCase().startsWith("yes");
}

export function hasKnownGuaranteedMeetingCount(event: GuaranteedMeetingSource) {
  return hasGuaranteedMeetingPackage(event) && knownGuaranteedMeetingLabel(event) !== null;
}

export function getGuaranteedMeetingSignal(event: GuaranteedMeetingSource) {
  if (!hasGuaranteedMeetingPackage(event)) return "0 Guaranteed Meetings";

  return knownGuaranteedMeetingLabel(event) ?? "Guaranteed Meetings · Count TBD";
}

export function getStaffingSignal(event: StaffingSource) {
  const named = event.team.length;
  const planned = event.attendeeCount;
  const recordedPasses = event.credentials?.match(/\b(\d+)\s+(?:[a-z]+\s+)?passes?\b/i);
  const passes = recordedPasses ? Number(recordedPasses[1]) : planned;
  const card = passes ? `${named} Attending / ${passes} Pass${passes === 1 ? "" : "es"}` : `${named} Attending`;

  if (event.status === "No") return {
    card: "0 Attending",
    summary: "No team assigned",
    detail: "No team assigned",
    state: "not-attending" as const,
  };
  if (planned && named === planned) return {
    card,
    summary: `${planned} attending`,
    detail: event.team.join(", "),
    state: "named" as const,
  };
  if (planned && named > 0) return {
    card,
    summary: `${named} named · ${planned} planned`,
    detail: `${event.team.join(", ")} · ${named} of ${planned} named`,
    state: "open" as const,
  };
  if (planned) return {
    card,
    summary: `${planned} planned · names open`,
    detail: `0 of ${planned} named`,
    state: "open" as const,
  };
  if (named) return {
    card,
    summary: `${named} named`,
    detail: event.team.join(", "),
    state: "named" as const,
  };
  return {
    card: "Team TBD",
    summary: "Not assigned",
    detail: "No team named",
    state: "open" as const,
  };
}

export function getSpeakingStatus(event: Pick<ActivationSource, "speaking" | "speakingStatus">): ActivationStatus {
  if (event.speakingStatus) return event.speakingStatus;
  const speaking = event.speaking.trim().toLowerCase();
  return speaking === "none" || speaking.includes("no slot confirmed") ? "None" : "Confirmed";
}

export function getSponsorshipStatus(event: Pick<ActivationSource, "sponsorship" | "sponsorshipStatus">): ActivationStatus {
  if (event.sponsorshipStatus) return event.sponsorshipStatus;
  return event.sponsorship.trim().toLowerCase().startsWith("none") ? "None" : "Confirmed";
}

export function getSpeakingOpportunitySignal(event: Pick<ActivationSource, "speaking" | "speakingStatus">) {
  const status = getSpeakingStatus(event);
  if (status === "None") return "0 Speaking Opp";
  if (status === "Under review") return "Speaking TBD";
  return "1 Speaking Opp";
}

export function getCompletedEventSignals(event: CompletedEventSource) {
  const rating = event.rating === "None"
    ? "Rating Not Recorded"
    : event.rating.includes("·")
      ? `${event.rating.split("·")[0].trim()} Feedback`
      : `${event.rating} Rating`;
  const meetings = event.meetingCountLabel
    ? `${event.meetingCountLabel} Meetings Recorded`
    : event.meetingsBooked.length
      ? `${event.meetingsBooked.length} Meeting${event.meetingsBooked.length === 1 ? "" : "s"} Recorded`
      : "Meetings Not Recorded";
  const downstream = event.followupMeetingsBooked
    ? `${event.followupMeetingsBooked} Follow-up Meeting${event.followupMeetingsBooked === 1 ? "" : "s"}`
    : event.demoCountLabel
      ? `${event.demoCountLabel} Demos Recorded`
      : event.demosBooked.length
      ? `${event.demosBooked.length} Demo${event.demosBooked.length === 1 ? "" : "s"} Recorded`
      : event.crmSnapshot?.totalDeals
        ? `${event.crmSnapshot.totalDeals} Attributed Deal${event.crmSnapshot.totalDeals === 1 ? "" : "s"}`
        : "CRM Outcomes Not Recorded";
  return [rating, meetings, downstream] as const;
}
