import type { EventRecord, MarketingTask } from "./events";

type MarketingEvent = Pick<EventRecord, "slug" | "name" | "marketingTasks">;

type DatedTask = {
  eventSlug: string;
  eventName: string;
  task: MarketingTask;
};

function formatProgramDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export function getMarketingProgramReadiness(events: MarketingEvent[], programDate: string) {
  const structuredEvents = events.filter((event) => Boolean(event.marketingTasks?.length));
  const openTasks = structuredEvents.flatMap((event) => event.marketingTasks!
    .filter((task) => task.status !== "Done")
    .map((task) => ({ eventSlug: event.slug, eventName: event.name, task })));
  const overdue = openTasks.filter(({ task }) => task.dueSort && task.dueSort < programDate);
  const datedUpcoming = openTasks
    .filter((item): item is DatedTask => Boolean(item.task.dueSort && item.task.dueSort >= programDate))
    .sort((a, b) => a.task.dueSort!.localeCompare(b.task.dueSort!));
  const nextDateSort = datedUpcoming[0]?.task.dueSort;
  const nextDeadlineTasks = nextDateSort ? datedUpcoming.filter(({ task }) => task.dueSort === nextDateSort) : [];

  return {
    activeEvents: events.length,
    structuredEvents: structuredEvents.length,
    setupGaps: events.length - structuredEvents.length,
    openTasks: openTasks.length,
    overdueTasks: overdue.length,
    overdue: overdue.length ? {
      taskCount: overdue.length,
      eventCount: new Set(overdue.map((item) => item.eventSlug)).size,
      eventSlug: overdue[0].eventSlug,
      eventName: overdue[0].eventName,
    } : null,
    ownerGaps: openTasks.filter(({ task }) => !task.owner).length,
    dateGaps: openTasks.filter(({ task }) => !task.dueSort).length,
    nextDeadline: nextDateSort ? {
      dateSort: nextDateSort,
      label: formatProgramDate(nextDateSort),
      taskCount: nextDeadlineTasks.length,
      eventCount: new Set(nextDeadlineTasks.map((item) => item.eventSlug)).size,
      eventSlug: nextDeadlineTasks[0].eventSlug,
      eventName: nextDeadlineTasks[0].eventName,
    } : null,
  };
}
