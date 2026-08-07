import type { EventRecord } from "./events";

export type AttendanceFilter = "all" | "going" | "deciding" | "not-going";

export const attendanceFilters: { value: AttendanceFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "going", label: "Going" },
  { value: "deciding", label: "Deciding" },
  { value: "not-going", label: "Not attending" },
];

export function matchesAttendance(event: EventRecord, filter: AttendanceFilter) {
  if (filter === "going") return event.status === "Confirmed";
  if (filter === "deciding") return event.status === "TBD" || event.status === "Tentative";
  if (filter === "not-going") return event.status === "No";
  return true;
}

export function matchesProgramYear(event: EventRecord, year: string) {
  return year === "all" || event.dateSort.startsWith(year);
}

export function eventDirectorySearchText(event: EventRecord) {
  return [
    event.name,
    event.location,
    event.dates,
    event.status,
    event.team.join(" "),
    event.available.join(" "),
    event.speaking,
    event.sponsorship,
    event.guaranteedMeetings,
    event.notes,
    event.venue ?? "",
    event.credentials ?? "",
    ...(event.specialConsiderations ?? []),
    ...(event.priorityActions ?? []),
    ...(event.relatedLinks ?? []).map((link) => link.label),
    ...(event.outcomeNotes ?? []),
    ...event.meetingsBooked,
    ...event.demosBooked,
    ...event.closed,
    event.crmSnapshot?.attribution ?? "",
    event.crmSnapshot?.dataQualityNote ?? "",
    ...(event.crmSnapshot?.stages.map((stage) => `${stage.label} ${stage.count}`) ?? []),
    ...Object.values(event.workstreams ?? {}).flat(),
  ].join(" ").toLowerCase();
}

export function filterEventDirectory(
  events: EventRecord[],
  filters: { query: string; attendance: AttendanceFilter; year: string },
) {
  const query = filters.query.toLowerCase().trim();
  return events.filter((event) =>
    (!query || eventDirectorySearchText(event).includes(query))
    && matchesAttendance(event, filters.attendance)
    && matchesProgramYear(event, filters.year),
  );
}
