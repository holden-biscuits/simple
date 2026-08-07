import { attendanceFilters, type AttendanceFilter } from "./event-filters.ts";

export type EventDirectoryState = {
  query: string;
  attendance: AttendanceFilter;
  year: string;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseEventDirectoryState(
  params: { q?: string | string[]; attendance?: string | string[]; year?: string | string[] },
  years: string[],
): EventDirectoryState {
  const query = (first(params.q) ?? "").trim().slice(0, 120);
  const attendanceValue = first(params.attendance);
  const attendance = attendanceFilters.some((filter) => filter.value === attendanceValue)
    ? attendanceValue as AttendanceFilter
    : "all";
  const yearValue = first(params.year);
  const year = yearValue && years.includes(yearValue) ? yearValue : "all";
  return { query, attendance, year };
}

export function hasActiveDirectoryState(state: EventDirectoryState) {
  return Boolean(state.query || state.attendance !== "all" || state.year !== "all");
}

export function getEventDirectoryHref(state: EventDirectoryState) {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  if (state.attendance !== "all") params.set("attendance", state.attendance);
  if (state.year !== "all") params.set("year", state.year);
  return `/${params.size ? `?${params.toString()}` : ""}#events`;
}

export function getEventDetailHref(slug: string, state: EventDirectoryState) {
  if (!hasActiveDirectoryState(state)) return `/events/${slug}`;
  return `/events/${slug}?returnTo=${encodeURIComponent(getEventDirectoryHref(state))}`;
}

export function getSafeEventReturnHref(value: string | string[] | undefined) {
  const candidate = first(value);
  if (!candidate) return "/#events";
  try {
    const base = "https://fieldbook.local";
    const url = new URL(candidate, base);
    const allowedParams = new Set(["q", "attendance", "year"]);
    const safe = url.origin === base
      && url.pathname === "/"
      && url.hash === "#events"
      && [...url.searchParams.keys()].every((key) => allowedParams.has(key));
    return safe ? `${url.pathname}${url.search}${url.hash}` : "/#events";
  } catch {
    return "/#events";
  }
}
