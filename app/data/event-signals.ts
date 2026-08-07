type GuaranteedMeetingSource = { guaranteedMeetings: string };

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
