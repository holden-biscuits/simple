import assert from "node:assert/strict";
import test from "node:test";
import { eventBySlug, getEventPhase } from "../app/data/events.ts";

test("event phase follows the inclusive event date range", () => {
  const chicago = eventBySlug("ccw-exchange-chicago");
  assert.ok(chicago);
  assert.equal(getEventPhase(chicago, "2026-08-04"), "upcoming");
  assert.equal(getEventPhase(chicago, "2026-08-05"), "now");
  assert.equal(getEventPhase(chicago, "2026-08-07"), "now");
  assert.equal(getEventPhase(chicago, "2026-08-08"), "past");
});

test("one-day events are current only on their event date", () => {
  const consero = eventBySlug("consero-summit");
  assert.ok(consero);
  assert.equal(getEventPhase(consero, "2026-07-21"), "upcoming");
  assert.equal(getEventPhase(consero, "2026-07-22"), "now");
  assert.equal(getEventPhase(consero, "2026-07-23"), "past");
});
