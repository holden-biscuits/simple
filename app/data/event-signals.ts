type GuaranteedMeetingSource = { guaranteedMeetings: string };
type StaffingSource = {
  status: "Confirmed" | "TBD" | "Tentative" | "No";
  attendeeCount: number | null;
  team: string[];
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

  if (event.status === "No") return {
    card: "0 Attending",
    summary: "No team assigned",
    detail: "No team assigned",
    state: "not-attending" as const,
  };
  if (planned && named === planned) return {
    card: `${planned} Attending`,
    summary: `${planned} attending`,
    detail: event.team.join(", "),
    state: "named" as const,
  };
  if (planned && named > 0) return {
    card: `${named} Named · ${planned} Planned`,
    summary: `${named} named · ${planned} planned`,
    detail: `${event.team.join(", ")} · ${named} of ${planned} named`,
    state: "open" as const,
  };
  if (planned) return {
    card: `${planned} Planned`,
    summary: `${planned} planned · names open`,
    detail: `0 of ${planned} named`,
    state: "open" as const,
  };
  if (named) return {
    card: `${named} Attending`,
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
