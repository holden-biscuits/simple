import assert from "node:assert/strict";
import test from "node:test";
import { events } from "../app/data/events.ts";
import { getSourceFreshness } from "../app/data/source-freshness.ts";

const find = (slug) => {
  const event = events.find((item) => item.slug === slug);
  assert.ok(event);
  return event;
};

test("current events use a daily source-check window", () => {
  const freshness = getSourceFreshness(find("ccw-exchange-chicago"), "2026-08-06");
  assert.equal(freshness.state, "current");
  assert.equal(freshness.maxAgeDays, 1);
  assert.equal(freshness.nextCheckISO, "2026-08-07");
});

test("upcoming events tighten from weekly to every three days", () => {
  const weekly = getSourceFreshness(find("genesys-xperience"), "2026-08-13");
  const finalWindow = getSourceFreshness(find("genesys-xperience"), "2026-08-20");
  assert.equal(weekly.state, "due");
  assert.equal(weekly.maxAgeDays, 7);
  assert.equal(finalWindow.state, "overdue");
  assert.equal(finalWindow.maxAgeDays, 3);
});

test("past and non-participating events are archived", () => {
  assert.equal(getSourceFreshness(find("ccw-vegas"), "2026-08-06").state, "archived");
  assert.equal(getSourceFreshness(find("contact-io"), "2026-08-06").state, "archived");
});
