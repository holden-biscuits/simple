import assert from "node:assert/strict";
import test from "node:test";
import { getActionBriefing } from "../app/data/action-briefing.ts";
import { events } from "../app/data/events.ts";
import { siteStatus } from "../app/data/site-status.ts";
import { writebackQueue } from "../app/data/source-governance.ts";

const fullBriefing = getActionBriefing({
  events,
  changes: siteStatus.sourceMonitor.changeLog,
  writebacks: writebackQueue,
  programDate: "2026-08-07",
});

test("briefing prioritizes decisions before approvals and excludes setup work", () => {
  assert.equal(fullBriefing.items[0].label, "Decision");
  assert.ok(fullBriefing.items.some((item) => item.label === "Approval"));
  assert.ok(fullBriefing.items.every((item) => !item.id.includes("Normalized event-cost ledger")));
  assert.equal(fullBriefing.counts.approvals, writebackQueue.filter((item) => item.state === "Ready for approval").length);
});

test("a decision already represented by an exact writeback is not duplicated", () => {
  const vegasDateActions = fullBriefing.items.filter((item) => /workshop date/i.test(`${item.title} ${item.detail}`));
  assert.equal(vegasDateActions.length, 1);
  assert.match(vegasDateActions[0].href, /docs\.google\.com\/spreadsheets/);
});

test("every action has one direct owning destination and a stable unique id", () => {
  assert.equal(new Set(fullBriefing.items.map((item) => item.id)).size, fullBriefing.items.length);
  for (const item of fullBriefing.items) {
    assert.ok(item.destination.length > 0);
    assert.match(item.href, /^(?:https?:\/\/|\/)/);
  }
});

test("a decision with an exact source record does not fall back to a generic event route", () => {
  const mismatch = fullBriefing.items.find((item) => item.id === "change:hubspot-ccw-source-mismatch");
  assert.ok(mismatch);
  assert.match(mismatch.href, /objects\/0-3\/views\/all\/list/);
  assert.equal(mismatch.destination, "HubSpot");
});

test("the visible preview is capped at three without changing queue totals", () => {
  const preview = getActionBriefing({
    events,
    changes: siteStatus.sourceMonitor.changeLog,
    writebacks: writebackQueue,
    programDate: "2026-08-07",
    limit: 3,
  });
  assert.equal(preview.items.length, 3);
  assert.deepEqual(preview.counts, fullBriefing.counts);
});
