import assert from "node:assert/strict";
import test from "node:test";
import { filterEventDirectory, matchesAttention, matchesProgramYear } from "../app/data/event-filters.ts";
import { events } from "../app/data/events.ts";

test("program-year filtering keeps the 2026 and 2027 schedules separate", () => {
  assert.equal(events.filter((event) => matchesProgramYear(event, "2026")).length, 26);
  assert.equal(events.filter((event) => matchesProgramYear(event, "2027")).length, 3);
  assert.equal(events.filter((event) => matchesProgramYear(event, "all")).length, 29);
});

test("directory filters compose year, attendance and search", () => {
  const goingIn2027 = filterEventDirectory(events, { query: "", attendance: "going", attention: "all", year: "2027" }, "2026-08-07");
  assert.deepEqual(goingIn2027.map((event) => event.slug), [
    "demo-event-18",
    "demo-event-01",
    "demo-event-22",
  ]);

  const vegasIn2027 = filterEventDirectory(events, { query: "Caesars Forum", attendance: "going", attention: "all", year: "2027" }, "2026-08-07");
  assert.deepEqual(vegasIn2027.map((event) => event.slug), ["demo-event-22"]);

  const noShowsIn2027 = filterEventDirectory(events, { query: "", attendance: "not-going", attention: "all", year: "2027" }, "2026-08-07");
  assert.equal(noShowsIn2027.length, 0);
});

test("attention filters expose active operating gaps and archived closeout gaps", () => {
  assert.equal(events.filter((event) => matchesAttention(event, "source", "2026-08-07")).length, 2);
  assert.equal(events.filter((event) => matchesAttention(event, "roster", "2026-08-07")).length, 12);
  assert.equal(events.filter((event) => matchesAttention(event, "meetings", "2026-08-07")).length, 6);
  assert.equal(events.filter((event) => matchesAttention(event, "program", "2026-08-07")).length, 9);
  assert.equal(events.filter((event) => matchesAttention(event, "plan", "2026-08-07")).length, 8);
  assert.equal(events.filter((event) => matchesAttention(event, "closeout", "2026-08-07")).length, 13);

  const sourceIssues = filterEventDirectory(events, { query: "", attendance: "going", attention: "source", year: "2026" }, "2026-08-07");
  assert.deepEqual(sourceIssues.map((event) => event.slug), ["demo-event-05"]);
  assert.equal(sourceIssues.some((event) => event.slug === "demo-event-29"), false);

  const openMeetingCounts = filterEventDirectory(events, { query: "", attendance: "going", attention: "meetings", year: "2026" }, "2026-08-07");
  assert.deepEqual(openMeetingCounts.map((event) => event.slug), [
    "demo-event-05",
    "demo-event-09",
    "demo-event-17",
    "demo-event-25",
    "demo-event-06",
    "demo-event-03",
  ]);

  const openPrograms = filterEventDirectory(events, { query: "", attendance: "going", attention: "program", year: "2026" }, "2026-08-07");
  assert.ok(openPrograms.some((event) => event.slug === "demo-event-07"));
  assert.ok(openPrograms.every((event) => event.status === "Confirmed"));
  assert.ok(openPrograms.every((event) => event.dateSort.startsWith("2026")));

  const openCloseouts = filterEventDirectory(events, { query: "", attendance: "going", attention: "closeout", year: "2026" }, "2026-08-07");
  assert.equal(openCloseouts.length, 13);
  assert.ok(openCloseouts.every((event) => event.status === "Confirmed"));
  assert.ok(openCloseouts.every((event) => event.dateSort <= "2026-08-07"));
  assert.ok(openCloseouts.some((event) => event.slug === "demo-event-12"));
  assert.equal(openCloseouts.some((event) => event.slug === "demo-event-28"), false);
});
