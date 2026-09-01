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
  const partnerPlatform = eventBySlug("demo-event-16");
  assert.ok(partnerPlatform);
  const partnerPlatformAgenda = getEventAgenda(partnerPlatform, "2026-08-07");
  assert.ok(partnerPlatformAgenda.items.some((item) => item.title.includes("Sep 3 at 1:10 PM")));
  assert.equal(partnerPlatformAgenda.items.some((item) => item.label === "Meetings"), false);
  assert.deepEqual(partnerPlatformAgenda.days, [
    {
      date: "Tuesday, September 1",
      items: [
        { time: "10:00 AM", title: "Arrival and registration" },
        { time: "1:00 PM", title: "Optional daytime pre-event educational programming" },
        { time: "4:00 PM", title: "Orchestrators Innovation Awards" },
        { time: "5:00 PM", title: "Evening welcome reception" },
      ],
    },
    {
      date: "Wednesday, September 2",
      items: [
        { time: "9:00 AM", title: "Opening keynote" },
        { time: "11:00 AM", title: "Expo, sessions and labs" },
        { time: "4:30 PM", title: "Evening reception" },
      ],
    },
    {
      date: "Thursday, September 3",
      items: [
        { time: "9:00 AM", title: "Morning keynote" },
        { time: "11:00 AM", title: "Expo, sessions and labs" },
        { time: "1:10 PM", title: "Avery’s 20-minute solution talk", teamSimple: true },
        { time: "4:00 PM", title: "Closing keynote" },
        { time: "7:00 PM", title: "Closing celebration" },
      ],
    },
  ]);

  const icmi = eventBySlug("demo-event-07");
  assert.ok(icmi);
  const icmiAgenda = getEventAgenda(icmi, "2026-08-07");
  assert.equal(icmiAgenda.url, "/sources#public-demo");
  assert.ok(icmiAgenda.items.some((item) => item.label === "TeamSimple session" && item.state === "open"));
});
