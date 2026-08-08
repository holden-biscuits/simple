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
  closed: string[];
  crmSnapshot?: { totalDeals: number };
};

export function getCompletedEventOutcomeCoverage(event: CompletedEventSource) {
  const categories = [
    { label: "Meetings recorded", recorded: Boolean(event.meetingsBooked.length || event.meetingCountLabel) },
    { label: "Follow-up meetings booked", recorded: Boolean(event.followupMeetingsBooked) },
    { label: "Demos recorded", recorded: Boolean(event.demosBooked.length || event.demoCountLabel) },
    { label: "Closed", recorded: event.closed.length > 0 },
  ];
  const recorded = categories.filter((category) => category.recorded).map((category) => category.label);
  const missing = categories.filter((category) => !category.recorded).map((category) => category.label);
  return {
    recorded,
    missing,
    state: missing.length === 0 ? "complete" as const : recorded.length ? "partial" as const : "missing" as const,
  };
}

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
  const assignmentGap = passes ? Math.max(passes - named, 0) : 0;

  if (event.status === "No") return {
    card: "0 Attending",
    summary: "No team assigned",
    detail: "No team assigned",
    state: "not-attending" as const,
    passCount: 0,
    assignmentGap: 0,
  };
  if (planned && named === planned && !assignmentGap) return {
    card,
    summary: passes ? `${planned} attending / ${passes} pass${passes === 1 ? "" : "es"}` : `${planned} attending`,
    detail: event.team.join(", "),
    state: "named" as const,
    passCount: passes,
    assignmentGap,
  };
  if (planned && named > 0) return {
    card,
    summary: passes ? `${named} attending / ${passes} passes · ${assignmentGap} unassigned` : `${named} attending`,
    detail: `${event.team.join(", ")}${assignmentGap ? ` · ${assignmentGap} pass${assignmentGap === 1 ? "" : "es"} unassigned` : ""}`,
    state: "open" as const,
    passCount: passes,
    assignmentGap,
  };
  if (planned) return {
    card,
    summary: passes ? `0 attending / ${passes} passes · ${assignmentGap} unassigned` : "No team assigned",
    detail: assignmentGap ? `${assignmentGap} passes unassigned` : "No team assigned",
    state: "open" as const,
    passCount: passes,
    assignmentGap,
  };
  if (named) return {
    card,
    summary: passes ? `${named} attending / ${passes} passes${assignmentGap ? ` · ${assignmentGap} unassigned` : ""}` : `${named} attending`,
    detail: `${event.team.join(", ")}${assignmentGap ? ` · ${assignmentGap} pass${assignmentGap === 1 ? "" : "es"} unassigned` : ""}`,
    state: assignmentGap ? "open" as const : "named" as const,
    passCount: passes,
    assignmentGap,
  };
  return {
    card: "Team TBD",
    summary: "Not assigned",
    detail: "No team named",
    state: "open" as const,
    passCount: passes,
    assignmentGap,
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
  const coverage = getCompletedEventOutcomeCoverage(event);
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
  const closeout = coverage.missing.length
    ? `${coverage.missing.length} Closeout Gap${coverage.missing.length === 1 ? "" : "s"}`
    : "Closeout Complete";
  return [rating, meetings, closeout] as const;
}
