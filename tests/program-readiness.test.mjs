import assert from "node:assert/strict";
import test from "node:test";
import { events } from "../app/data/events.ts";
import { getEventReadiness, getProgramReadiness } from "../app/data/program-readiness.ts";

test("program readiness distinguishes structured task plans from unassigned priorities", () => {
  const readiness = getProgramReadiness(events, "2026-08-06");
  assert.equal(readiness.activeEvents, 14);
  assert.equal(readiness.structuredPlans, 2);
  assert.equal(readiness.planSetupNeeded, 12);
  assert.equal(readiness.openStructuredTasks, 13);
  assert.equal(readiness.dueNow.length, 1);
});

test("the next action favors a due task and preserves its owner", () => {
  const customerConnect = events.find((event) => event.slug === "customer-connect-expo");
  assert.ok(customerConnect);
  const readiness = getEventReadiness(customerConnect, "2026-08-06");
  assert.equal(readiness.planState, "structured");
  assert.equal(readiness.nextAction?.title, "Confirm invoice payment status with AP");
  assert.equal(readiness.nextAction?.owner, "Holden + AP");
  assert.equal(readiness.nextAction?.urgency, "due-today");
});

test("completed events do not retain an invented pre-event task plan", () => {
  const chicago = events.find((event) => event.slug === "ccw-exchange-chicago");
  assert.ok(chicago);
  const readiness = getEventReadiness(chicago, "2026-08-06");
  assert.equal(readiness.planState, "missing");
  assert.equal(readiness.nextAction?.structured, false);
  assert.equal(readiness.nextAction?.owner, undefined);
  assert.equal(readiness.nextAction?.due, undefined);
});
