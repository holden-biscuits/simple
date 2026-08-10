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
  assert.deepEqual(genesys.map((route) => route.role), ["AE", "SDR"]);
  assert.ok(genesys.every((route) => route.bullets.length === 3));
  assert.match(genesys[0].bullets.join(" "), /nothing arrives pre-booked/);
  assert.match(genesys[0].bullets.join(" "), /HubSpot/);
  assert.match(genesys[1].bullets.join(" "), /Work the booth and nearby traffic/);
  assert.match(genesys[1].bullets.join(" "), /speaking program as a relevant opener/);

  const travel = getEventRoleRoutes(event("iqpc-cx-travel-hospitality"), "upcoming");
  assert.deepEqual(travel.map((route) => route.role), ["AE", "SDR"]);

  const retail = getEventRoleRoutes(event("iqpc-cx-retail-atlanta"), "upcoming");
  assert.deepEqual(retail.map((route) => route.role), ["AE", "SDR"]);

  const orlando = getEventRoleRoutes(event("ccw-orlando-2027"), "upcoming");
  assert.match(orlando[0].bullets.join(" "), /6 executive leadership exchange meetings/i);

  const uk = getEventRoleRoutes(event("ccw-uk-executive-exchange-2027"), "upcoming");
  assert.match(uk[1].bullets.join(" "), /Keep the meeting area ready for scheduled conversations/);
  assert.doesNotMatch(uk[1].bullets.join(" "), /Work the booth/);

  const icmi = getEventRoleRoutes(event("icmi-contact-center-expo"), "upcoming");
  assert.match(icmi[1].bullets.join(" "), /onsite footprint is unresolved/);
});

test("event task lists use HubSpot rather than Monaco for meeting and demo records", () => {
  const taskText = events.flatMap((record) => record.marketingTasks ?? []).map((task) => `${task.title} ${task.note ?? ""}`).join("\n");
  assert.doesNotMatch(taskText, /log(?:ging)? meetings? (?:and|or) demos? in Monaco/i);
  assert.match(event("iqpc-cx-travel-hospitality").marketingTasks?.map((task) => task.title).join("\n") ?? "", /Log booked meetings and demos in HubSpot/);
});

test("events without a booth tell SDRs to work the event instead of waiting for traffic", () => {
  const routes = getEventRoleRoutes(event("the-lead-summit"), "upcoming");
  assert.deepEqual(routes.map((route) => route.role), ["AE", "SDR"]);
  assert.match(routes[1].bullets.join(" "), /No booth is listed/);
  assert.match(routes[1].bullets.join(" "), /app, sessions, and networking areas/);
});

test("past and non-attending events do not show preparation routes", () => {
  assert.deepEqual(getEventRoleRoutes(event("ccw-orlando"), "past"), []);
  assert.deepEqual(getEventRoleRoutes(event("contact-io"), "upcoming"), []);
});
