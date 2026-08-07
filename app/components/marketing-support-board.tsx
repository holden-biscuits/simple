"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { getEventPhase, getWorkstreams, isEmptyWorkstream, type EventRecord, type MarketingTask } from "../data/events";
import { getStaffingSignal, hasGuaranteedMeetingPackage } from "../data/event-signals";

type BoardFilter = "all" | "support" | "no-support" | "team-open" | "speaking";

const filters: { value: BoardFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "support", label: "Support listed" },
  { value: "no-support", label: "No support listed" },
  { value: "team-open", label: "Team unassigned" },
  { value: "speaking", label: "Speaking" },
];

function marketingItems(event: EventRecord) {
  const items = getWorkstreams(event).marketing;
  return isEmptyWorkstream(items) ? [] : items;
}

function hasSpeaking(event: EventRecord) {
  const speaking = event.speaking.toLowerCase();
  return speaking !== "none" && !speaking.includes("no slot confirmed");
}

function activationSignals(event: EventRecord) {
  return [
    !event.sponsorship.toLowerCase().startsWith("none") ? "Sponsor / booth" : null,
    hasSpeaking(event) ? "Speaking" : null,
    hasGuaranteedMeetingPackage(event) ? "Meeting package" : null,
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

function eventTasks(event: EventRecord): MarketingTask[] {
  if (event.marketingTasks?.length) return event.marketingTasks;
  const items = event.priorityActions?.length ? event.priorityActions : marketingItems(event);
  return (items ?? []).map((title) => ({ title, status: "Open" }));
}

function orderedEventTasks(event: EventRecord) {
  return eventTasks(event)
    .map((task, index) => ({ task, index }))
    .sort((a, b) => {
      if (a.task.status === "Done" && b.task.status !== "Done") return 1;
      if (a.task.status !== "Done" && b.task.status === "Done") return -1;
      if (a.task.dueSort && b.task.dueSort) return a.task.dueSort.localeCompare(b.task.dueSort) || a.index - b.index;
      if (a.task.dueSort) return -1;
      if (b.task.dueSort) return 1;
      return a.index - b.index;
    })
    .map(({ task }) => task);
}

function dueState(task: MarketingTask, programDate: string) {
  if (!task.dueSort || task.status === "Done") return null;
  if (task.dueSort < programDate) return { className: "overdue", label: "Overdue" };
  if (task.dueSort === programDate) return { className: "today", label: "Due today" };
  return null;
}

export function EventMarketingWorkspace({ events, initialSlug, programDate }: { events: EventRecord[]; initialSlug?: string; programDate: string }) {
  const firstSlug = events.some((event) => event.slug === initialSlug) ? initialSlug : events[0]?.slug;
  const [selectedSlug, setSelectedSlug] = useState(firstSlug);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const tablistRef = useRef<HTMLDivElement | null>(null);
  const selected = events.find((event) => event.slug === selectedSlug) ?? events[0];

  useEffect(() => {
    const container = tablistRef.current;
    const tab = selectedSlug ? tabRefs.current[selectedSlug] : null;
    if (!container || !tab) return;
    const left = tab.offsetLeft - (container.clientWidth - tab.clientWidth) / 2;
    container.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [selectedSlug]);

  if (!selected) return null;
  const tasks = orderedEventTasks(selected);
  const support = marketingItems(selected);
  const openCount = tasks.filter((task) => task.status !== "Done").length;

  const selectEvent = (slug: string, focus = false) => {
    setSelectedSlug(slug);
    const url = new URL(window.location.href);
    url.searchParams.set("event", slug);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    if (focus) requestAnimationFrame(() => tabRefs.current[slug]?.focus());
  };

  const handleTabKey = (event: KeyboardEvent<HTMLButtonElement>, slug: string) => {
    const currentIndex = events.findIndex((item) => item.slug === slug);
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % events.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + events.length) % events.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = events.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    selectEvent(events[nextIndex].slug, true);
  };

  return <div className="event-task-workspace">
    <div className="event-task-tabs" role="tablist" aria-label="Marketing tasks by event" ref={tablistRef}>
      {events.map((event) => <button
        type="button"
        role="tab"
        aria-selected={event.slug === selected.slug}
        aria-controls="event-task-panel"
        id={`event-task-tab-${event.slug}`}
        tabIndex={event.slug === selected.slug ? 0 : -1}
        ref={(element) => { tabRefs.current[event.slug] = element; }}
        key={event.slug}
        onClick={() => selectEvent(event.slug)}
        onKeyDown={(keyboardEvent) => handleTabKey(keyboardEvent, event.slug)}
      >
        <span>{event.name}</span><b>{eventTasks(event).filter((task) => task.status !== "Done").length}</b>
      </button>)}
    </div>
    <section className="event-task-panel" id="event-task-panel" role="tabpanel" aria-labelledby={`event-task-tab-${selected.slug}`}>
      <header>
        <div><p className="eyebrow">{selected.dates} · {selected.location}</p><h3>{selected.name}</h3></div>
        <div className="event-task-count"><strong>{openCount}</strong><span>Open tasks</span></div>
      </header>
      <div className="event-task-grid">
        <div className="event-task-list">
          <h4>Do these next</h4>
          {tasks.length ? <ol>{tasks.map((task, index) => {
            const timing = dueState(task, programDate);
            return <li key={`${task.title}-${index}`}>
            <span className={`task-state task-state-${task.status.toLowerCase().replaceAll(" ", "-")}`}>{task.status}</span>
            <div>
              <h5>{task.url ? <a href={task.url} target="_blank" rel="noreferrer">{task.title} ↗</a> : task.title}</h5>
              {(task.owner || task.due || timing) ? <p className="task-meta">{timing ? <span className={`task-due-state task-due-${timing.className}`}>{timing.label}</span> : null}{[task.owner ? `Owner: ${task.owner}` : null, task.due ? `Due: ${task.due}` : null].filter(Boolean).join(" · ")}</p> : null}
              {task.note ? <p>{task.note}</p> : null}
            </div>
          </li>;})}</ol> : <p className="event-task-empty">No marketing action has been entered for this event.</p>}
        </div>
        <aside>
          <h4>Current support</h4>
          {support.length ? <ul>{support.map((item) => <li key={item}>{item}</li>)}</ul> : <p>None listed.</p>}
          <div className="event-task-links">
            <Link href={`/events/${selected.slug}`}>Open field brief →</Link>
            {selected.notionUrl ? <a href={selected.notionUrl} target="_blank" rel="noreferrer">Open Notion →</a> : null}
          </div>
        </aside>
      </div>
    </section>
  </div>;
}

export function MarketingSupportBoard({ events, programDate }: { events: EventRecord[]; programDate: string }) {
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
        <thead><tr><th>Event</th><th>Activation</th><th>Marketing support</th><th>Event team</th><th>Next open item</th></tr></thead>
        <tbody>{filtered.map((event) => {
          const support = marketingItems(event);
          const signals = activationSignals(event);
          const staffing = getStaffingSignal(event);
          const staffingDetail = staffing.state === "open" && event.available.length && !event.team.length
            ? `${staffing.detail} · ${event.available.join(", ")} marked available`
            : staffing.detail;
          const openTask = orderedEventTasks(event).find((task) => task.status !== "Done");
          const openItem = openTask?.title ?? (support.length ? "No open item recorded" : "Marketing support is not listed");
          const eventPlanHref = event.priorityActions?.length ? `/events/${event.slug}#event-priorities` : `/events/${event.slug}`;
          return <tr key={event.slug}>
            <th>
              <Link href={`/events/${event.slug}`}>{event.name}</Link>
              <span>{event.dates} · {event.location}</span>
              <small>{getEventPhase(event, programDate) === "now" ? "Happening now" : "Upcoming"}</small>
            </th>
            <td data-label="Activation"><div className="matrix-signals">{signals.length ? signals.map((signal) => <span key={signal}>{signal}</span>) : <span>Attendance only</span>}</div></td>
            <td data-label="Marketing support">{support.length ? <ul>{support.map((item) => <li key={item}>{item}</li>)}</ul> : <span className="matrix-empty">None listed</span>}</td>
            <td data-label="Event team"><span className={`matrix-staffing matrix-staffing-${staffing.state}`}>{staffing.state === "named" ? "Named" : staffing.state === "not-attending" ? "None" : "Open"}</span><p>{staffingDetail}</p></td>
            <td data-label="Next open item"><p className="matrix-open-item">{openItem}</p>{openTask?.due ? <span className="matrix-open-due">Due {openTask.due}</span> : null}<Link className="matrix-open-plan" href={eventPlanHref}>Open event plan →</Link></td>
          </tr>;
        })}</tbody>
      </table>
      {!filtered.length ? <p className="marketing-empty-state">No active events match those filters.</p> : null}
    </div>
  </>;
}
