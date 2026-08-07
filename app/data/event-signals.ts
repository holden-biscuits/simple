export function getGuaranteedMeetingSignal(event: { guaranteedMeetings: string }) {
  const meetings = event.guaranteedMeetings.trim();
  if (!meetings.toLowerCase().startsWith("yes")) return "0 Guaranteed Meetings";

  const range = meetings.match(/\b(\d+)\s*[–-]\s*(\d+)\b/);
  if (range) return `${range[1]}–${range[2]} Guaranteed Meetings`;

  const minimum = meetings.match(/\bminimum\s+(\d+)\b/i);
  if (minimum) return `${minimum[1]}+ Guaranteed Meetings`;

  const exact = meetings.match(/^yes(?:\s*·\s*|\s+)(\d+)\b/i);
  if (exact) return `${exact[1]} Guaranteed Meeting${exact[1] === "1" ? "" : "s"}`;

  return "Guaranteed Meetings · Count TBD";
}
