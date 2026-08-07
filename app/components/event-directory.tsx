"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getEventPhase, getEventVerification, type EventPhase, type EventRecord } from "../data/events";
import { attendanceFilters, filterEventDirectory, matchesAttendance, matchesProgramYear, type AttendanceFilter } from "../data/event-filters";
import { getGuaranteedMeetingSignal, getStaffingSignal } from "../data/event-signals";

function EventCard({ event }: { event: EventRecord }) {
  const verification = getEventVerification(event);
  const signal = event.status === "No" ? "Not attending" : event.status;
  const inactive = event.status === "No";
  const speakingText = event.speaking.toLowerCase();
  const speakingOpps = speakingText === "none" || speakingText.includes("no slot confirmed") ? 0 : 1;
  const staffing = getStaffingSignal(event);
  return (
    <Link href={`/events/${event.slug}`} className={`event-card${inactive ? " event-card-inactive" : ""}`}>
      {inactive ? <span className="event-card-x" aria-hidden="true" /> : null}
      <div className="event-card-top">
        <span className={`status status-${event.status.toLowerCase()}`}><span>{signal}</span></span>
        <span className="arrow" aria-hidden="true">↗</span>
      </div>
      <h3>{event.name}</h3>
      <p className="event-date">{event.dates}</p>
      <p className="event-location">{event.location}</p>
      <div className="event-signals">
        <span>{speakingOpps} Speaking Opp</span>
        <span>{getGuaranteedMeetingSignal(event)}</span>
        <span>{staffing.card}</span>
      </div>
      <div className="event-card-freshness">
        <span>Checked <time dateTime={verification.checkedAtISO}>{verification.checkedAt.replace(/,\s\d{4}$/, "")}</time></span>
        <span>{verification.sources.length === 1 ? verification.sources[0] : `${verification.sources[0]} + ${verification.sources.length - 1}`}</span>
      </div>
    </Link>
  );
}

export function EventDirectory({ events, programDate }: { events: EventRecord[]; programDate: string }) {
  const [query, setQuery] = useState("");
  const [attendance, setAttendance] = useState<AttendanceFilter>("all");
  const [year, setYear] = useState("all");
  const years = useMemo(() => [...new Set(events.map((event) => event.dateSort.slice(0, 4)))].sort(), [events]);
  const filtered = useMemo(() => filterEventDirectory(events, { query, attendance, year }), [events, query, attendance, year]);

  const attendanceCounts = useMemo(() => Object.fromEntries(attendanceFilters.map((filter) => [
    filter.value,
    events.filter((event) => matchesProgramYear(event, year) && matchesAttendance(event, filter.value)).length,
  ])) as Record<AttendanceFilter, number>, [events, year]);
  const yearCounts = useMemo(() => Object.fromEntries([
    ["all", events.filter((event) => matchesAttendance(event, attendance)).length],
    ...years.map((programYear) => [programYear, events.filter((event) => matchesAttendance(event, attendance) && matchesProgramYear(event, programYear)).length]),
  ]) as Record<string, number>, [attendance, events, years]);
  const filtersActive = query.trim().length > 0 || attendance !== "all" || year !== "all";
  const activeFilterSummary = [
    year !== "all" ? year : null,
    attendance !== "all" ? attendanceFilters.find((filter) => filter.value === attendance)?.label : null,
    query.trim() ? `Search: ${query.trim()}` : null,
  ].filter(Boolean).join(" · ");

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
          <legend>TeamSimple attendance</legend>
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
      </div>
      <div className="directory-result-summary" aria-live="polite">
        <span>Showing <strong>{filtered.length}</strong> of {events.length} events{activeFilterSummary ? ` · ${activeFilterSummary}` : ""}</span>
        {filtersActive ? <button type="button" onClick={() => { setQuery(""); setAttendance("all"); setYear("all"); }}>Clear filters</button> : null}
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
            <div className="event-grid">{matches.map((event) => <EventCard key={event.slug} event={event} />)}</div>
          </section>
        );
      })}

      {!filtered.length ? <p className="empty-state">No events match those filters.</p> : null}
    </div>
  );
}
