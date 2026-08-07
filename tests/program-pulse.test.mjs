import assert from "node:assert/strict";
import test from "node:test";
import { events } from "../app/data/events.ts";
import { getEventAttention, getProgramPulse } from "../app/data/program-pulse.ts";

test("the program pulse prioritizes the active route and real data gaps", () => {
  const pulse = getProgramPulse(events, "2026-08-06");
  assert.deepEqual(pulse.current.map((event) => event.slug), ["ccw-exchange-chicago"]);
  assert.deepEqual(pulse.nextStops.map((event) => event.slug), [
    "ccw-exchange-chicago",
    "genesys-xperience",
    "iqpc-cx-travel-hospitality",
    "customer-connect-expo",
  ]);
  assert.equal(pulse.next60Days.length, 5);
  assert.equal(pulse.rosterGaps.length, 12);
  assert.equal(pulse.sourceConflicts.length, 2);
  assert.equal(pulse.sourceChecksDue.length, 0);
  assert.equal(pulse.readiness.structuredPlans, 5);
  assert.equal(pulse.readiness.planSetupNeeded, 9);
});

test("the program pulse raises source checks when a verification window expires", () => {
  const pulse = getProgramPulse(events, "2026-08-14");
  const genesys = events.find((event) => event.slug === "genesys-xperience");
  assert.ok(genesys);
  assert.ok(pulse.sourceChecksDue.some((event) => event.slug === "genesys-xperience"));
  assert.ok(getEventAttention(genesys, "2026-08-14").includes("Refresh the event’s owning sources"));
});

test("attention labels distinguish source, staffing, execution and meeting-count gaps", () => {
  const chicago = events.find((event) => event.slug === "ccw-exchange-chicago");
  const genesys = events.find((event) => event.slug === "genesys-xperience");
  assert.ok(chicago);
  assert.ok(genesys);
  assert.deepEqual(getEventAttention(chicago, "2026-08-06"), [
    "Confirm the sponsor package and inclusions",
    "Confirm the guaranteed-meeting count and format",
    "Confirm the venue",
    "Confirm passes, registration, and credential limits",
    "Turn the open priorities into owned, dated tasks",
  ]);
  assert.deepEqual(getEventAttention(genesys, "2026-08-06"), ["Add missing owners or due dates to 2 open tasks"]);
});
