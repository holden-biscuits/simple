import assert from "node:assert/strict";
import test from "node:test";
import { getEventAgenda } from "../app/data/event-agenda.ts";
import { eventBySlug, events } from "../app/data/events.ts";

test("every event agenda starts with the recorded event window and a live organizer route", () => {
  for (const event of events) {
    const agenda = getEventAgenda(event, "2026-08-07");
    assert.equal(agenda.items[0]?.label, "Event window");
    assert.equal(agenda.items[0]?.title, event.dates);
    assert.ok(agenda.url);
  }
});

test("event agendas surface recorded TeamSimple commitments without inventing meetings", () => {
  const genesys = eventBySlug("genesys-xperience");
  assert.ok(genesys);
  const genesysAgenda = getEventAgenda(genesys, "2026-08-07");
  assert.ok(genesysAgenda.items.some((item) => item.title.includes("Sep 3 at 1:10 PM")));
  assert.equal(genesysAgenda.items.some((item) => item.label === "Meetings"), false);

  const icmi = eventBySlug("icmi-contact-center-expo");
  assert.ok(icmi);
  const icmiAgenda = getEventAgenda(icmi, "2026-08-07");
  assert.equal(icmiAgenda.url, "https://icmievents.com/conference/event-schedule/");
  assert.ok(icmiAgenda.items.some((item) => item.label === "TeamSimple session" && item.state === "open"));
});
