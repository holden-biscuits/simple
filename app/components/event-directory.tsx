"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { EventPhase, EventRecord } from "../data/events";

type AttendanceFilter = "all" | "going" | "deciding" | "not-going";

const attendanceFilters: { value: AttendanceFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "going", label: "Going" },
  { value: "deciding", label: "Deciding" },
  { value: "not-going", label: "Not attending" },
];

function matchesAttendance(event: EventRecord, filter: AttendanceFilter) {
  if (filter === "going") return event.status === "Confirmed";
  if (filter === "deciding") return event.status === "TBD" || event.status === "Tentative";
  if (filter === "not-going") return event.status === "No";
  return true;
}

function guaranteedMeetingSignal(event: EventRecord) {
  if (!event.guaranteedMeetings.startsWith("Yes")) return "0 Guaranteed Meetings";
  const range = event.guaranteedMeetings.match(/\d+[–-]\d+/)?.[0];
  return range ? `${range} Guaranteed Meetings` : "Guaranteed Meetings Included";
}

function EventCard({ event }: { event: EventRecord }) {
  const signal = event.status === "No" ? "Not attending" : event.status;
  const inactive = event.status === "No";
  const speakingText = event.speaking.toLowerCase();
  const speakingOpps = speakingText === "none" || speakingText.includes("no slot confirmed") ? 0 : 1;
  const attending = event.attendeeCount ?? 0;
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
        <span>{guaranteedMeetingSignal(event)}</span>
        <span>{attending} Attending</span>
      </div>
    </Link>
  );
}

export function EventDirectory({ events }: { events: EventRecord[] }) {
  const [query, setQuery] = useState("");
  const [attendance, setAttendance] = useState<AttendanceFilter>("all");
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return events.filter((event) => {
      const searchable = [
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
      return (!q || searchable.includes(q)) && matchesAttendance(event, attendance);
    });
  }, [events, query, attendance]);

  const counts = useMemo(() => Object.fromEntries(attendanceFilters.map((filter) => [
    filter.value,
    events.filter((event) => matchesAttendance(event, filter.value)).length,
  ])) as Record<AttendanceFilter, number>, [events]);
  const filtersActive = query.trim().length > 0 || attendance !== "all";

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
        <fieldset className="attendance-filters">
          <legend>TeamSimple attendance</legend>
          <div>
            {attendanceFilters.map((filter) => (
              <button
                type="button"
                key={filter.value}
                aria-pressed={attendance === filter.value}
                onClick={() => setAttendance(filter.value)}
              >
                <span>{filter.label}</span><b>{counts[filter.value]}</b>
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="directory-result-summary" aria-live="polite">
        <span>Showing <strong>{filtered.length}</strong> of {events.length} events</span>
        {filtersActive ? <button type="button" onClick={() => { setQuery(""); setAttendance("all"); }}>Clear filters</button> : null}
      </div>

      {groups.map((group) => {
        const matches = filtered
          .filter((event) => event.phase === group.phase)
          .sort((a, b) => group.phase === "past" ? b.dateSort.localeCompare(a.dateSort) : 0);
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
