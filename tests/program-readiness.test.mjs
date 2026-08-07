import assert from "node:assert/strict";
import test from "node:test";
import { events } from "../app/data/events.ts";
import { getEventReadiness, getProgramReadiness } from "../app/data/program-readiness.ts";

test("program readiness distinguishes structured task plans from unassigned priorities", () => {
  const readiness = getProgramReadiness(events, "2026-08-06");
  assert.equal(readiness.activeEvents, 14);
  assert.equal(readiness.structuredPlans, 5);
  assert.equal(readiness.planSetupNeeded, 9);
  assert.equal(readiness.openStructuredTasks, 53);
  assert.equal(readiness.dueNow.length, 0);
});

test("the Consero checklist preserves the open staffing and schedule inputs", () => {
  const consero = events.find((event) => event.slug === "consero-cx-forum");
  assert.ok(consero);
  const readiness = getEventReadiness(consero, "2026-08-07");
  assert.equal(readiness.planState, "structured");
  assert.equal(readiness.totalTasks, 12);
  assert.equal(readiness.ownerGaps, 12);
  assert.equal(readiness.dateGaps, 11);
  assert.equal(readiness.nextAction?.title, "Confirm the breakout speaker and finalize the session title and abstract with Consero");
});

test("the retail checklist keeps assignment gaps explicit and preserves its only sourced deadline", () => {
  const retail = events.find((event) => event.slug === "iqpc-cx-retail-atlanta");
  assert.ok(retail);
  const readiness = getEventReadiness(retail, "2026-08-07");
  assert.equal(readiness.planState, "structured");
  assert.equal(readiness.totalTasks, 13);
  assert.equal(readiness.ownerGaps, 13);
  assert.equal(readiness.dateGaps, 12);
  assert.equal(readiness.nextAction?.title, "Confirm the plenary speaker");
});

test("a source-backed checklist is searchable without pretending its owner and date gaps are closed", () => {
  const travel = events.find((event) => event.slug === "iqpc-cx-travel-hospitality");
  assert.ok(travel);
  const readiness = getEventReadiness(travel, "2026-08-07");
  assert.equal(readiness.planState, "structured");
  assert.equal(readiness.totalTasks, 15);
  assert.equal(readiness.ownerGaps, 15);
  assert.equal(readiness.dateGaps, 14);
  assert.equal(readiness.nextAction?.title, "Confirm speaker and finalize title/abstract with IQPC");
  assert.equal(readiness.nextAction?.dueSort, undefined);
});

test("the next action preserves the fresh AP status, timing and owner", () => {
  const customerConnect = events.find((event) => event.slug === "customer-connect-expo");
  assert.ok(customerConnect);
  const readiness = getEventReadiness(customerConnect, "2026-08-06");
  assert.equal(readiness.planState, "structured");
  assert.equal(readiness.nextAction?.title, "Confirm the AP payment has settled");
  assert.equal(readiness.nextAction?.owner, "Holden + AP");
  assert.equal(readiness.nextAction?.due, "Week of Aug 11");
  assert.equal(readiness.nextAction?.urgency, "due-soon");
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
