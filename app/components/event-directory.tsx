"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getEventPhase, type EventPhase, type EventRecord } from "../data/events";
import { attendanceFilters, attentionFilters, filterEventDirectory, matchesAttendance, matchesAttention, matchesProgramYear, type AttendanceFilter, type AttentionFilter } from "../data/event-filters";
import { getCompletedEventSignals, getGuaranteedMeetingSignal, getSpeakingOpportunitySignal, getStaffingSignal } from "../data/event-signals";
import { getEventDetailHref, getEventDirectoryHref, hasActiveDirectoryState, type EventDirectoryState } from "../data/directory-state";

function EventCard({ event, directoryState, programDate }: { event: EventRecord; directoryState: EventDirectoryState; programDate: string }) {
  const phase = getEventPhase(event, programDate);
  const inactive = event.status === "No";
  const signal = inactive ? "Not attending" : phase === "past" ? "Completed" : event.status;
  const staffing = getStaffingSignal(event);
  const cardSignals = phase === "past" && !inactive
    ? getCompletedEventSignals(event)
    : [getSpeakingOpportunitySignal(event), getGuaranteedMeetingSignal(event), staffing.card];
  return (
    <Link href={getEventDetailHref(event.slug, directoryState)} className={`event-card${inactive ? " event-card-inactive" : ""}`}>
      {inactive ? <span className="event-card-x" aria-hidden="true" /> : null}
      <div className="event-card-top">
        <span className={`status status-${event.status.toLowerCase()}`}><span>{signal}</span></span>
        <span className="arrow" aria-hidden="true">↗</span>
      </div>
      <h3>{event.name}</h3>
      <p className="event-date">{event.dates}</p>
      <p className="event-location">{event.location}</p>
      <div className="event-signals">
        {cardSignals.map((item) => <span key={item}>{item}</span>)}
      </div>
    </Link>
  );
}

export function EventDirectory({ events, programDate, initialState }: { events: EventRecord[]; programDate: string; initialState: EventDirectoryState }) {
  const [query, setQuery] = useState(initialState.query);
  const [attendance, setAttendance] = useState<AttendanceFilter>(initialState.attendance);
  const [attention, setAttention] = useState<AttentionFilter>(initialState.attention);
  const [year, setYear] = useState(initialState.year);
  const years = useMemo(() => [...new Set(events.map((event) => event.dateSort.slice(0, 4)))].sort(), [events]);
  const filtered = useMemo(() => filterEventDirectory(events, { query, attendance, attention, year }, programDate), [events, query, attendance, attention, year, programDate]);

  const attendanceCounts = useMemo(() => Object.fromEntries(attendanceFilters.map((filter) => [
    filter.value,
    events.filter((event) => matchesProgramYear(event, year) && matchesAttention(event, attention, programDate) && matchesAttendance(event, filter.value)).length,
  ])) as Record<AttendanceFilter, number>, [attention, events, programDate, year]);
  const attentionCounts = useMemo(() => Object.fromEntries(attentionFilters.map((filter) => [
    filter.value,
    events.filter((event) => matchesProgramYear(event, year) && matchesAttendance(event, attendance) && matchesAttention(event, filter.value, programDate)).length,
  ])) as Record<AttentionFilter, number>, [attendance, events, programDate, year]);
  const yearCounts = useMemo(() => Object.fromEntries([
    ["all", events.filter((event) => matchesAttendance(event, attendance) && matchesAttention(event, attention, programDate)).length],
    ...years.map((programYear) => [programYear, events.filter((event) => matchesAttendance(event, attendance) && matchesAttention(event, attention, programDate) && matchesProgramYear(event, programYear)).length]),
  ]) as Record<string, number>, [attendance, attention, events, programDate, years]);
  const filtersActive = query.trim().length > 0 || attendance !== "all" || attention !== "all" || year !== "all";
  const activeFilterSummary = [
    year !== "all" ? year : null,
    attendance !== "all" ? attendanceFilters.find((filter) => filter.value === attendance)?.label : null,
    attention !== "all" ? attentionFilters.find((filter) => filter.value === attention)?.label : null,
    query.trim() ? `Search: ${query.trim()}` : null,
  ].filter(Boolean).join(" · ");
  const directoryState = useMemo(() => ({ query: query.trim(), attendance, attention, year }), [attendance, attention, query, year]);

  useEffect(() => {
    const current = new URL(window.location.href);
    const hadDirectoryParams = ["q", "attendance", "attention", "year"].some((key) => current.searchParams.has(key));
    if (!hasActiveDirectoryState(directoryState) && !hadDirectoryParams) return;
    window.history.replaceState(null, "", getEventDirectoryHref(directoryState));
  }, [directoryState]);

  const groups: { phase: EventPhase; label: string; kicker: string }[] = [
    { phase: "now", label: "Happening now", kicker: "Current stop" },
    { phase: "upcoming", label: "Upcoming", kicker: "Next events" },
    { phase: "past", label: "Past", kicker: "Completed events" },
  ];

  return (
    <div>
      <div className="directory-tools">
        <label>
          <span>Find an event</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search event, city, teammate, program or detail" />
        </label>
        <fieldset className="directory-filter-set attendance-filters">
          <legend>Attendance</legend>
          <div>
            {attendanceFilters.map((filter) => (
              <button
                type="button"
                key={filter.value}
                aria-pressed={attendance === filter.value}
                onClick={() => setAttendance(filter.value)}
              >
                <span>{filter.label}</span><b>{attendanceCounts[filter.value]}</b>
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="directory-filter-set year-filters">
          <legend>Program year</legend>
          <div>
            {["all", ...years].map((programYear) => (
              <button
                type="button"
                key={programYear}
                aria-pressed={year === programYear}
                onClick={() => setYear(programYear)}
              >
                <span>{programYear === "all" ? "All years" : programYear}</span><b>{yearCounts[programYear]}</b>
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="directory-filter-set attention-filters">
          <legend>Needs attention</legend>
          <div>
            {attentionFilters.map((filter) => (
              <button
                type="button"
                key={filter.value}
                aria-pressed={attention === filter.value}
                onClick={() => setAttention(filter.value)}
              >
                <span>{filter.label}</span><b>{attentionCounts[filter.value]}</b>
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="directory-result-summary" aria-live="polite">
        <span>Showing <strong>{filtered.length}</strong> of {events.length} events{activeFilterSummary ? ` · ${activeFilterSummary}` : ""}</span>
        {filtersActive ? <button type="button" onClick={() => { setQuery(""); setAttendance("all"); setAttention("all"); setYear("all"); }}>Clear filters</button> : null}
      </div>

      {groups.map((group) => {
        const matches = filtered
          .filter((event) => getEventPhase(event, programDate) === group.phase)
          .sort((a, b) => group.phase === "past"
            ? b.dateSort.localeCompare(a.dateSort)
            : a.dateSort.localeCompare(b.dateSort));
        if (!matches.length) return null;
        return (
          <section className="event-group" key={group.phase}>
            <div className="group-heading">
              <div><p className="eyebrow">{group.kicker}</p><h2>{group.label}</h2></div>
              <span>{matches.length.toString().padStart(2, "0")}</span>
            </div>
            <div className="event-grid">{matches.map((event) => <EventCard key={event.slug} event={event} directoryState={directoryState} programDate={programDate} />)}</div>
          </section>
        );
      })}

      {!filtered.length ? <p className="empty-state">No events match those filters.</p> : null}
    </div>
  );
}
