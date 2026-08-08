import { getEventPhase, type EventRecord, type MarketingTask } from "./events.ts";
import { getCompletedEventOutcomeCoverage } from "./event-signals.ts";
import { getOpenItemRoute } from "./open-item-routes.ts";
import { getEventUpdateRoutes } from "./event-update-routes.ts";
import type { SourceChange } from "./site-status.ts";
import type { WritebackItem } from "./source-governance.ts";

export type ActionBriefingItem = {
  id: string;
  event: string;
  label: "Decision" | "Closeout" | "Overdue" | "Due today" | "Approval";
  title: string;
  detail: string;
  href: string;
  destination: string;
  priority: number;
  dueSort?: string;
};

export type ActionBriefing = {
  items: ActionBriefingItem[];
  counts: {
    decisions: number;
    closeouts: number;
    dueNow: number;
    approvals: number;
  };
};

export const actionBriefingPolicy = {
  maxActions: 3,
  recentCloseoutDays: 7,
  setupCreatesPing: false,
  priority: ["Decision", "Recent closeout", "Due now", "Approval", "Source blocker"] as const,
  deliverySummary: "At most 3 actions total: decisions first, then recent closeouts, due work, exact approvals, and time-sensitive blockers.",
};

type ActionBriefingInput = {
  events: EventRecord[];
  changes: SourceChange[];
  writebacks: WritebackItem[];
  programDate: string;
  limit?: number;
};

const meaningfulWords = (value: string) => new Set(value
  .toLowerCase()
  .replaceAll(/[^a-z0-9]+/g, " ")
  .split(" ")
  .filter((word) => word.length > 3 && !["event", "needed", "reconcile", "resolve", "confirm"].includes(word)));

function describesSameDecision(change: SourceChange, writeback: WritebackItem) {
  if (!change.eventSlug || change.eventSlug !== writeback.eventSlug) return false;
  const changeWords = meaningfulWords(`${change.title} ${change.field}`);
  const writebackWords = meaningfulWords(writeback.scope);
  return [...changeWords].filter((word) => writebackWords.has(word)).length >= 2;
}

function eventName(events: EventRecord[], eventSlug?: string) {
  if (!eventSlug) return "Program-wide";
  return events.find((event) => event.slug === eventSlug)?.name ?? "Program-wide";
}

function writebackAction(item: WritebackItem, events: EventRecord[]): ActionBriefingItem {
  return {
    id: `writeback:${item.system}:${item.scope}`,
    event: eventName(events, item.eventSlug),
    label: item.state === "Decision needed" ? "Decision" : "Approval",
    title: item.scope,
    detail: item.state === "Decision needed" ? item.proposed : `Approve this exact ${item.system} update: ${item.proposed}`,
    href: item.url,
    destination: item.system,
    priority: item.state === "Decision needed" ? 0 : 4,
  };
}

function changeAction(change: SourceChange, events: EventRecord[]): ActionBriefingItem {
  const event = change.eventSlug ? events.find((item) => item.slug === change.eventSlug) : undefined;
  const route = event ? getOpenItemRoute(event, `${change.title} ${change.field} ${change.after}`) : undefined;
  const exactSourceRoute = change.sourceUrl?.startsWith("http") ? change.sourceUrl : undefined;
  return {
    id: `change:${change.id}`,
    event: event?.name ?? "Program-wide",
    label: "Decision",
    title: change.title,
    detail: change.after,
    href: exactSourceRoute ?? route?.href ?? "/sources#approval-queue",
    destination: exactSourceRoute ? change.source : route?.system ?? change.source,
    priority: 0,
  };
}

function taskAction(event: EventRecord, task: MarketingTask, programDate: string): ActionBriefingItem {
  const overdue = Boolean(task.dueSort && task.dueSort < programDate);
  const route = getOpenItemRoute(event, `${task.title} ${task.note ?? ""}`);
  return {
    id: `task:${event.slug}:${task.title}`,
    event: event.name,
    label: overdue ? "Overdue" : "Due today",
    title: task.title,
    detail: `${task.owner ? `Owner: ${task.owner}` : "Owner missing"}${task.due ? ` · ${task.due}` : ""}`,
    href: task.url ?? route.href,
    destination: task.url ? "Task source" : route.system,
    priority: overdue ? 2 : 3,
    dueSort: task.dueSort,
  };
}

function closeoutAction(event: EventRecord): ActionBriefingItem {
  const coverage = getCompletedEventOutcomeCoverage(event);
  const crmRoute = getEventUpdateRoutes(event).find((route) => route.id === "hubspot");
  return {
    id: `closeout:${event.slug}`,
    event: event.name,
    label: "Closeout",
    title: `Complete the ${event.name} closeout`,
    detail: `${coverage.missing.length} outcome categories are not recorded: ${coverage.missing.join(" · ")}. Missing evidence is not zero.`,
    href: crmRoute?.url ?? `/events/${event.slug}#event-results`,
    destination: crmRoute?.system ?? "Event results",
    priority: 1,
    dueSort: event.dateEndSort ?? event.dateSort,
  };
}

function daysSince(date: string, programDate: string) {
  return Math.floor((Date.parse(`${programDate}T00:00:00Z`) - Date.parse(`${date}T00:00:00Z`)) / 86_400_000);
}

export function getActionBriefing({ events, changes, writebacks, programDate, limit }: ActionBriefingInput): ActionBriefing {
  const decisionWritebacks = writebacks.filter((item) => item.state === "Decision needed");
  const approvalWritebacks = writebacks.filter((item) => item.state === "Ready for approval");
  const changeDecisions = changes
    .filter((change) => change.state === "Needs review")
    .filter((change) => !decisionWritebacks.some((writeback) => describesSameDecision(change, writeback)));
  const dueTasks = events.flatMap((event) => (event.marketingTasks ?? [])
    .filter((task) => task.status !== "Done" && task.dueSort && task.dueSort <= programDate)
    .map((task) => ({ event, task })));
  const recentCloseouts = events
    .filter((event) => event.status !== "No" && getEventPhase(event, programDate) === "past")
    .filter((event) => {
      const age = daysSince(event.dateEndSort ?? event.dateSort, programDate);
      return age >= 0 && age <= actionBriefingPolicy.recentCloseoutDays && getCompletedEventOutcomeCoverage(event).state !== "complete";
    });

  const actions = [
    ...decisionWritebacks.map((item) => writebackAction(item, events)),
    ...changeDecisions.map((change) => changeAction(change, events)),
    ...recentCloseouts.map(closeoutAction),
    ...dueTasks.map(({ event, task }) => taskAction(event, task, programDate)),
    ...approvalWritebacks.map((item) => writebackAction(item, events)),
  ].sort((a, b) => a.priority - b.priority
    || (a.dueSort ?? "9999-12-31").localeCompare(b.dueSort ?? "9999-12-31")
    || a.id.localeCompare(b.id));

  const unique = actions.filter((item, index) => actions.findIndex((candidate) => candidate.id === item.id) === index);

  return {
    items: typeof limit === "number" ? unique.slice(0, limit) : unique,
    counts: {
      decisions: decisionWritebacks.length + changeDecisions.length,
      closeouts: recentCloseouts.length,
      dueNow: dueTasks.length,
      approvals: approvalWritebacks.length,
    },
  };
}

export function isExternalAction(item: ActionBriefingItem) {
  return item.href.startsWith("http");
}
