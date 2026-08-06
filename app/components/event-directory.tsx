"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { EventPhase, EventRecord } from "../data/events";

function EventCard({ event }: { event: EventRecord }) {
  const signal = event.status === "No" ? "Not attending" : event.status;
  const inactive = event.status === "No";
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
        <span>{event.speaking === "None" ? "No speaking" : "Speaking"}</span>
        <span>{event.guaranteedMeetings.startsWith("Yes") ? "Guaranteed meetings" : "No guaranteed meetings"}</span>
        {event.attendeeCount ? <span>{event.attendeeCount} planned</span> : null}
      </div>
    </Link>
  );
}

export function EventDirectory({ events }: { events: EventRecord[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return events.filter((event) => {
      const matchesQuery = !q || [event.name, event.location, event.dates, event.team.join(" ")].join(" ").toLowerCase().includes(q);
      const matchesStatus = status === "All" || event.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [events, query, status]);

  const groups: { phase: EventPhase; label: string; kicker: string }[] = [
    { phase: "now", label: "Happening now", kicker: "Current stop" },
    { phase: "upcoming", label: "Upcoming", kicker: "Ahead on the route" },
    { phase: "past", label: "Past", kicker: "Trail log" },
  ];

  return (
    <div>
      <div className="directory-tools">
        <label>
          <span>Find an event</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search event, city or teammate" />
        </label>
        <label>
          <span>Participation</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {['All', 'Confirmed', 'TBD', 'Tentative', 'No'].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
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
