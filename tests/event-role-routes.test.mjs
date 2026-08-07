import assert from "node:assert/strict";
import test from "node:test";
import { getEventRoleRoutes } from "../app/data/event-role-routes.ts";
import { events } from "../app/data/events.ts";

function event(slug) {
  const record = events.find((item) => item.slug === slug);
  assert.ok(record);
  return record;
}

test("current and upcoming event routes reflect the actual activation", () => {
  const genesys = getEventRoleRoutes(event("genesys-xperience"), "upcoming");
  assert.deepEqual(genesys.map((route) => route.role), ["AE", "SDR", "Marketing / event lead"]);
  assert.match(genesys[0].detail, /No guaranteed meeting package is listed/);
  assert.match(genesys[1].detail, /Work the booth and nearby traffic/);
  assert.match(genesys[1].detail, /speaking program as context/);
  assert.equal(genesys[2].href, "/marketing?event=genesys-xperience#event-tasks");
  assert.match(genesys[2].detail, /7 tasks are tracked/);
  assert.match(genesys[2].detail, /1 open task needs an owner; 2 need dated deadlines/);

  const travel = getEventRoleRoutes(event("iqpc-cx-travel-hospitality"), "upcoming");
  assert.equal(travel[2].title, "Finish assigning the tracked task list.");
  assert.match(travel[2].detail, /15 open tasks need an owner; 14 need dated deadlines/);

  const retail = getEventRoleRoutes(event("iqpc-cx-retail-atlanta"), "upcoming");
  assert.equal(retail[2].title, "Finish assigning the tracked task list.");
  assert.match(retail[2].detail, /13 open tasks need an owner; 12 need dated deadlines/);

  const orlando = getEventRoleRoutes(event("ccw-orlando-2027"), "upcoming");
  assert.match(orlando[0].detail, /6 Executive Leadership Exchange meetings/);

  const uk = getEventRoleRoutes(event("ccw-uk-executive-exchange-2027"), "upcoming");
  assert.match(uk[1].detail, /Keep the meeting area ready for scheduled conversations/);
  assert.doesNotMatch(uk[1].detail, /Work the booth/);

  const icmi = getEventRoleRoutes(event("icmi-contact-center-expo"), "upcoming");
  assert.match(icmi[1].detail, /Confirm the onsite footprint before promising a booth meeting/);
});

test("event task lists use HubSpot rather than Monaco for meeting and demo records", () => {
  const taskText = events.flatMap((record) => record.marketingTasks ?? []).map((task) => `${task.title} ${task.note ?? ""}`).join("\n");
  assert.doesNotMatch(taskText, /log(?:ging)? meetings? (?:and|or) demos? in Monaco/i);
  assert.match(event("iqpc-cx-travel-hospitality").marketingTasks?.map((task) => task.title).join("\n") ?? "", /Log booked meetings and demos in HubSpot/);
});

test("events without a booth tell SDRs to work the event instead of waiting for traffic", () => {
  const routes = getEventRoleRoutes(event("the-lead-summit"), "upcoming");
  assert.deepEqual(routes.map((route) => route.role), ["AE", "SDR"]);
  assert.match(routes[1].detail, /No booth is listed/);
  assert.match(routes[1].detail, /event app, sessions, and networking areas/);
});

test("past and non-attending events do not show preparation routes", () => {
  assert.deepEqual(getEventRoleRoutes(event("ccw-orlando"), "past"), []);
  assert.deepEqual(getEventRoleRoutes(event("contact-io"), "upcoming"), []);
});
