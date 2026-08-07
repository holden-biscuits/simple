import { getEventPhase, type EventRecord, type MarketingTask } from "./events.ts";

export type ActionUrgency = "overdue" | "due-today" | "due-soon" | "scheduled" | "unscheduled";
export type EventPlanState = "structured" | "priorities-only" | "missing";

export type ReadinessAction = {
  title: string;
  status: MarketingTask["status"];
  owner?: string;
  due?: string;
  dueSort?: string;
  urgency: ActionUrgency;
  href: string;
  structured: boolean;
};

export type EventReadiness = {
  eventKey: string;
  planState: EventPlanState;
  totalTasks: number;
  openTasks: number;
  ownerGaps: number;
  dateGaps: number;
  nextAction?: ReadinessAction;
};

function addDays(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function getUrgency(dueSort: string | undefined, programDate: string): ActionUrgency {
  if (!dueSort) return "unscheduled";
  if (dueSort < programDate) return "overdue";
  if (dueSort === programDate) return "due-today";
  if (dueSort <= addDays(programDate, 14)) return "due-soon";
  return "scheduled";
}

function sortTasks(tasks: MarketingTask[], programDate: string) {
  const urgencyOrder: Record<ActionUrgency, number> = { overdue: 0, "due-today": 1, "due-soon": 2, scheduled: 3, unscheduled: 4 };
  return [...tasks].sort((a, b) => {
    const urgency = urgencyOrder[getUrgency(a.dueSort, programDate)] - urgencyOrder[getUrgency(b.dueSort, programDate)];
    if (urgency) return urgency;
    return (a.dueSort ?? "9999-12-31").localeCompare(b.dueSort ?? "9999-12-31") || a.title.localeCompare(b.title);
  });
}

export function getEventReadiness(event: EventRecord, programDate: string): EventReadiness {
  const href = `/marketing?event=${event.slug}#event-tasks`;
  if (event.marketingTasks?.length) {
    const open = event.marketingTasks.filter((task) => task.status !== "Done");
    const next = sortTasks(open, programDate)[0];
    return {
      eventKey: event.slug,
      planState: "structured",
      totalTasks: event.marketingTasks.length,
      openTasks: open.length,
      ownerGaps: open.filter((task) => !task.owner).length,
      dateGaps: open.filter((task) => !task.dueSort).length,
      nextAction: next ? { ...next, urgency: getUrgency(next.dueSort, programDate), href, structured: true } : undefined,
    };
  }

  if (event.priorityActions?.length) {
    return {
      eventKey: event.slug,
      planState: "priorities-only",
      totalTasks: event.priorityActions.length,
      openTasks: event.priorityActions.length,
      ownerGaps: event.priorityActions.length,
      dateGaps: event.priorityActions.length,
      nextAction: {
        title: event.priorityActions[0],
        status: "Open",
        urgency: "unscheduled",
        href,
        structured: false,
      },
    };
  }

  return {
    eventKey: event.slug,
    planState: "missing",
    totalTasks: 0,
    openTasks: 0,
    ownerGaps: 0,
    dateGaps: 0,
    nextAction: {
      title: "Create an owned event task plan",
      status: "Open",
      urgency: "unscheduled",
      href,
      structured: false,
    },
  };
}

export function getProgramReadiness(catalog: EventRecord[], programDate: string) {
  const active = catalog.filter((event) => getEventPhase(event, programDate) !== "past" && event.status !== "No");
  const events = active.map((event) => getEventReadiness(event, programDate));
  const structured = events.filter((event) => event.planState === "structured");
  const dueNow = events.flatMap((event) => event.nextAction && ["overdue", "due-today"].includes(event.nextAction.urgency) ? [event.nextAction] : []);
  return {
    activeEvents: events.length,
    structuredPlans: structured.length,
    planSetupNeeded: events.filter((event) => event.planState !== "structured").length,
    openStructuredTasks: structured.reduce((total, event) => total + event.openTasks, 0),
    ownerGaps: events.reduce((total, event) => total + event.ownerGaps, 0),
    dateGaps: events.reduce((total, event) => total + event.dateGaps, 0),
    dueNow,
    events,
  };
}
