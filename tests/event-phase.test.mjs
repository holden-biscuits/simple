import assert from "node:assert/strict";
import test from "node:test";
import { eventBySlug, getEventPhase } from "../app/data/events.ts";

test("an explicit closeout moves an event to past on its final day", () => {
  const chicago = eventBySlug("ccw-exchange-chicago");
  assert.ok(chicago);
  assert.equal(getEventPhase(chicago, "2026-08-04"), "upcoming");
  assert.equal(getEventPhase(chicago, "2026-08-05"), "now");
  assert.equal(getEventPhase(chicago, "2026-08-07"), "past");
  assert.equal(getEventPhase(chicago, "2026-08-08"), "past");
});

test("one-day events are current only on their event date", () => {
  const consero = eventBySlug("consero-summit");
  assert.ok(consero);
  assert.equal(getEventPhase(consero, "2026-07-21"), "upcoming");
  assert.equal(getEventPhase(consero, "2026-07-22"), "now");
  assert.equal(getEventPhase(consero, "2026-07-23"), "past");
});
