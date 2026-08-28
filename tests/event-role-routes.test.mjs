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
  const partnerPlatform = getEventRoleRoutes(event("demo-event-16"), "upcoming");
  assert.deepEqual(partnerPlatform.map((route) => route.role), ["AE", "SDR"]);
  assert.ok(partnerPlatform.every((route) => route.bullets.length === 3));
  assert.match(partnerPlatform[0].bullets.join(" "), /nothing arrives pre-booked/);
  assert.match(partnerPlatform[0].bullets.join(" "), /HubSpot/);
  assert.match(partnerPlatform[1].bullets.join(" "), /Work the booth and nearby traffic/);
  assert.match(partnerPlatform[1].bullets.join(" "), /speaking program as a relevant opener/);

  const travel = getEventRoleRoutes(event("demo-event-05"), "upcoming");
  assert.deepEqual(travel.map((route) => route.role), ["AE", "SDR"]);

  const retail = getEventRoleRoutes(event("demo-event-09"), "upcoming");
  assert.deepEqual(retail.map((route) => route.role), ["AE", "SDR"]);

  const orlando = getEventRoleRoutes(event("demo-event-18"), "upcoming");
  assert.match(orlando[0].bullets.join(" "), /6 executive leadership exchange meetings/i);

  const uk = getEventRoleRoutes(event("demo-event-01"), "upcoming");
  assert.match(uk[1].bullets.join(" "), /Keep the meeting area ready for scheduled conversations/);
  assert.doesNotMatch(uk[1].bullets.join(" "), /Work the booth/);

  const icmi = getEventRoleRoutes(event("demo-event-07"), "upcoming");
  assert.match(icmi[1].bullets.join(" "), /onsite footprint is unresolved/);
});

test("event task lists use HubSpot rather than Monaco for meeting and demo records", () => {
  const taskText = events.flatMap((record) => record.marketingTasks ?? []).map((task) => `${task.title} ${task.note ?? ""}`).join("\n");
  assert.doesNotMatch(taskText, /log(?:ging)? meetings? (?:and|or) demos? in Monaco/i);
  assert.match(event("demo-event-05").marketingTasks?.map((task) => task.title).join("\n") ?? "", /Log booked meetings and demos in HubSpot/);
});

test("events without a booth tell SDRs to work the event instead of waiting for traffic", () => {
  const routes = getEventRoleRoutes(event("demo-event-20"), "upcoming");
  assert.deepEqual(routes.map((route) => route.role), ["AE", "SDR"]);
  assert.match(routes[1].bullets.join(" "), /No booth is listed/);
  assert.match(routes[1].bullets.join(" "), /app, sessions, and networking areas/);
});

test("past and non-attending events do not show preparation routes", () => {
  assert.deepEqual(getEventRoleRoutes(event("demo-event-26"), "past"), []);
  assert.deepEqual(getEventRoleRoutes(event("demo-event-28"), "upcoming"), []);
});
