"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getWorkstreams, type EventRecord } from "../data/events";

type BoardFilter = "all" | "support" | "no-support" | "team-open" | "speaking";

const filters: { value: BoardFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "support", label: "Support listed" },
  { value: "no-support", label: "No support listed" },
  { value: "team-open", label: "Team unassigned" },
  { value: "speaking", label: "Speaking" },
];

function marketingItems(event: EventRecord) {
  return getWorkstreams(event).marketing.filter((item) => item !== "None");
}

function hasSpeaking(event: EventRecord) {
  const speaking = event.speaking.toLowerCase();
  return speaking !== "none" && !speaking.includes("no slot confirmed");
}

function activationSignals(event: EventRecord) {
  return [
    !event.sponsorship.toLowerCase().startsWith("none") ? "Sponsor / booth" : null,
    hasSpeaking(event) ? "Speaking" : null,
    event.guaranteedMeetings.startsWith("Yes") ? "Meeting package" : null,
  ].filter(Boolean) as string[];
}

function matchesFilter(event: EventRecord, filter: BoardFilter) {
  const support = marketingItems(event);
  if (filter === "support") return support.length > 0;
  if (filter === "no-support") return support.length === 0;
  if (filter === "team-open") return event.team.length === 0;
  if (filter === "speaking") return hasSpeaking(event);
  return true;
}

function staffingSignal(event: EventRecord) {
  if (event.team.length) return { state: "named", label: event.team.join(", ") };
  if (event.available.length) return { state: "open", label: `${event.available.join(", ")} marked available` };
  return { state: "open", label: "No team named" };
}

export function MarketingSupportBoard({ events }: { events: EventRecord[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<BoardFilter>("all");

  const counts = useMemo(() => Object.fromEntries(filters.map((item) => [
    item.value,
    events.filter((event) => matchesFilter(event, item.value)).length,
  ])) as Record<BoardFilter, number>, [events]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((event) => {
      const searchable = [
        event.name,
        event.location,
        event.dates,
        event.speaking,
        event.sponsorship,
        event.guaranteedMeetings,
        ...event.team,
        ...event.available,
        ...marketingItems(event),
        ...(event.priorityActions ?? []),
      ].join(" ").toLowerCase();
      return matchesFilter(event, filter) && (!q || searchable.includes(q));
    });
  }, [events, filter, query]);

  const filtersActive = filter !== "all" || query.trim().length > 0;

  return <>
    <div className="marketing-board-toolbar">
      <label>
        <span>Find an event or task</span>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search event, city, activation or task" />
      </label>
      <fieldset className="marketing-board-filters">
        <legend>Show</legend>
        <div>{filters.map((item) => <button type="button" key={item.value} aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>
          <span>{item.label}</span><b>{counts[item.value]}</b>
        </button>)}</div>
      </fieldset>
    </div>
    <div className="marketing-result-summary" aria-live="polite">
      <span>Showing <strong>{filtered.length}</strong> of {events.length} active events</span>
      {filtersActive ? <button type="button" onClick={() => { setQuery(""); setFilter("all"); }}>Clear filters</button> : null}
    </div>
    <div className="marketing-table-wrap">
      <table className="marketing-table">
        <thead><tr><th>Event</th><th>Activation</th><th>Marketing support</th><th>Event team</th><th>Most urgent open item</th></tr></thead>
        <tbody>{filtered.map((event) => {
          const support = marketingItems(event);
          const signals = activationSignals(event);
          const staffing = staffingSignal(event);
          const openItem = event.priorityActions?.[0] ?? (support.length ? "No open item recorded" : "Marketing support is not listed");
          return <tr key={event.slug}>
            <th>
              <Link href={`/events/${event.slug}`}>{event.name}</Link>
              <span>{event.dates} · {event.location}</span>
              <small>{event.phase === "now" ? "Happening now" : "Upcoming"}</small>
            </th>
            <td data-label="Activation"><div className="matrix-signals">{signals.length ? signals.map((signal) => <span key={signal}>{signal}</span>) : <span>Attendance only</span>}</div></td>
            <td data-label="Marketing support">{support.length ? <ul>{support.map((item) => <li key={item}>{item}</li>)}</ul> : <span className="matrix-empty">None listed</span>}</td>
            <td data-label="Event team"><span className={`matrix-staffing matrix-staffing-${staffing.state}`}>{staffing.state === "named" ? "Named" : "Open"}</span><p>{staffing.label}</p></td>
            <td data-label="Most urgent open item"><p className="matrix-open-item">{openItem}</p><Link className="matrix-open-plan" href={`/events/${event.slug}`}>Open event plan →</Link></td>
          </tr>;
        })}</tbody>
      </table>
      {!filtered.length ? <p className="marketing-empty-state">No active events match those filters.</p> : null}
    </div>
  </>;
}
