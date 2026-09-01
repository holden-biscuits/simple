import assert from "node:assert/strict";
import test from "node:test";
import { events } from "../app/data/events.ts";
import { getSourceFreshness } from "../app/data/source-freshness.ts";

const find = (slug) => {
  const event = events.find((item) => item.slug === slug);
  assert.ok(event);
  return event;
};

test("explicitly completed events are archived on their final day", () => {
  const freshness = getSourceFreshness(find("demo-event-12"), "2026-08-07");
  assert.equal(freshness.state, "archived");
  assert.equal(freshness.maxAgeDays, undefined);
  assert.equal(freshness.nextCheckISO, undefined);
});

test("upcoming events tighten from weekly to every three days", () => {
  const weekly = getSourceFreshness(find("demo-event-16"), "2026-08-14");
  const finalWindow = getSourceFreshness(find("demo-event-16"), "2026-08-20");
  assert.equal(weekly.state, "due");
  assert.equal(weekly.maxAgeDays, 7);
  assert.equal(finalWindow.state, "overdue");
  assert.equal(finalWindow.maxAgeDays, 3);
});

test("past and non-participating events are archived", () => {
  assert.equal(getSourceFreshness(find("demo-event-29"), "2026-08-06").state, "archived");
  assert.equal(getSourceFreshness(find("demo-event-28"), "2026-08-06").state, "archived");
});
