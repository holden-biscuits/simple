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
    "ccw-orlando-2027",
    "ccw-uk-executive-exchange-2027",
    "ccw-vegas-2027",
  ]);

  const vegasIn2027 = filterEventDirectory(events, { query: "Caesars Forum", attendance: "going", attention: "all", year: "2027" }, "2026-08-07");
  assert.deepEqual(vegasIn2027.map((event) => event.slug), ["ccw-vegas-2027"]);

  const noShowsIn2027 = filterEventDirectory(events, { query: "", attendance: "not-going", attention: "all", year: "2027" }, "2026-08-07");
  assert.equal(noShowsIn2027.length, 0);
});

test("attention filters expose the kind of operating gap without including archived events", () => {
  assert.equal(events.filter((event) => matchesAttention(event, "source", "2026-08-07")).length, 2);
  assert.equal(events.filter((event) => matchesAttention(event, "roster", "2026-08-07")).length, 12);
  assert.equal(events.filter((event) => matchesAttention(event, "meetings", "2026-08-07")).length, 6);
  assert.equal(events.filter((event) => matchesAttention(event, "plan", "2026-08-07")).length, 10);

  const sourceIssues = filterEventDirectory(events, { query: "", attendance: "going", attention: "source", year: "2026" }, "2026-08-07");
  assert.deepEqual(sourceIssues.map((event) => event.slug), ["iqpc-cx-travel-hospitality"]);
  assert.equal(sourceIssues.some((event) => event.slug === "ccw-vegas"), false);

  const openMeetingCounts = filterEventDirectory(events, { query: "", attendance: "going", attention: "meetings", year: "2026" }, "2026-08-07");
  assert.deepEqual(openMeetingCounts.map((event) => event.slug), [
    "iqpc-cx-travel-hospitality",
    "iqpc-cx-retail-atlanta",
    "consero-cx-forum",
    "ccw-nashville",
    "ccw-uk-executive-exchange",
    "ccw-executive-exchange-miami",
  ]);
});
