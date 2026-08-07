import assert from "node:assert/strict";
import test from "node:test";
import { filterEventDirectory, matchesProgramYear } from "../app/data/event-filters.ts";
import { events } from "../app/data/events.ts";

test("program-year filtering keeps the 2026 and 2027 schedules separate", () => {
  assert.equal(events.filter((event) => matchesProgramYear(event, "2026")).length, 26);
  assert.equal(events.filter((event) => matchesProgramYear(event, "2027")).length, 3);
  assert.equal(events.filter((event) => matchesProgramYear(event, "all")).length, 29);
});

test("directory filters compose year, attendance and search", () => {
  const goingIn2027 = filterEventDirectory(events, { query: "", attendance: "going", year: "2027" });
  assert.deepEqual(goingIn2027.map((event) => event.slug), [
    "ccw-orlando-2027",
    "ccw-uk-executive-exchange-2027",
    "ccw-vegas-2027",
  ]);

  const vegasIn2027 = filterEventDirectory(events, { query: "Caesars Forum", attendance: "going", year: "2027" });
  assert.deepEqual(vegasIn2027.map((event) => event.slug), ["ccw-vegas-2027"]);

  const noShowsIn2027 = filterEventDirectory(events, { query: "", attendance: "not-going", year: "2027" });
  assert.equal(noShowsIn2027.length, 0);
});
