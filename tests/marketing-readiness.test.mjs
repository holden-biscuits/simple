import assert from "node:assert/strict";
import test from "node:test";
import { getMarketingProgramReadiness } from "../app/data/marketing-readiness.ts";

const events = [
  {
    slug: "alpha",
    name: "Alpha",
    marketingTasks: [
      { title: "Overdue", status: "Open", dueSort: "2026-08-05", owner: "Holden" },
      { title: "Shared deadline one", status: "In progress", dueSort: "2026-08-10" },
      { title: "No date", status: "Open", owner: "Cat" },
      { title: "Finished", status: "Done", dueSort: "2026-08-01" },
    ],
  },
  {
    slug: "beta",
    name: "Beta",
    marketingTasks: [
      { title: "Shared deadline two", status: "Ready for review", dueSort: "2026-08-10", owner: "Marketing" },
    ],
  },
  { slug: "gamma", name: "Gamma" },
];

test("marketing readiness separates plan coverage, open work and missing inputs", () => {
  const readiness = getMarketingProgramReadiness(events, "2026-08-07");
  assert.equal(readiness.activeEvents, 3);
  assert.equal(readiness.structuredEvents, 2);
  assert.equal(readiness.setupGaps, 1);
  assert.equal(readiness.openTasks, 4);
  assert.equal(readiness.overdueTasks, 1);
  assert.deepEqual(readiness.overdue, {
    taskCount: 1,
    eventCount: 1,
    eventSlug: "alpha",
    eventName: "Alpha",
  });
  assert.equal(readiness.ownerGaps, 1);
  assert.equal(readiness.dateGaps, 1);
});

test("the next deadline groups tasks across events without counting completed work", () => {
  const readiness = getMarketingProgramReadiness(events, "2026-08-07");
  assert.deepEqual(readiness.nextDeadline, {
    dateSort: "2026-08-10",
    label: "Aug 10",
    taskCount: 2,
    eventCount: 2,
    eventSlug: "alpha",
    eventName: "Alpha",
  });
});
