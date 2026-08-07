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
  assert.equal(pulse.rosterGaps.length, 13);
  assert.equal(pulse.sourceConflicts.length, 3);
  assert.equal(pulse.readiness.structuredPlans, 2);
  assert.equal(pulse.readiness.planSetupNeeded, 12);
});

test("attention labels distinguish source, staffing, execution and meeting-count gaps", () => {
  const chicago = events.find((event) => event.slug === "ccw-exchange-chicago");
  const genesys = events.find((event) => event.slug === "genesys-xperience");
  assert.ok(chicago);
  assert.ok(genesys);
  assert.deepEqual(getEventAttention(chicago), [
    "Source conflict",
    "1 attendee name open",
    "4 open plan items",
    "Task owners and dates missing",
    "Sponsor package under review",
    "Guaranteed-meeting count open",
  ]);
  assert.deepEqual(getEventAttention(genesys), ["6 open plan items"]);
});
