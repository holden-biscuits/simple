import assert from "node:assert/strict";
import test from "node:test";
import { getEventFootprint } from "../app/data/event-footprint.ts";
import { events } from "../app/data/events.ts";

function event(slug) {
  const record = events.find((item) => item.slug === slug);
  assert.ok(record);
  return record;
}

test("onsite footprint distinguishes a booth, meeting area, unresolved package and no activation", () => {
  assert.deepEqual(getEventFootprint(event("genesys-xperience")), { kind: "booth", label: "Booth confirmed" });
  assert.deepEqual(getEventFootprint(event("ccw-uk-executive-exchange-2027")), { kind: "meeting-area", label: "Meeting area confirmed" });
  assert.deepEqual(getEventFootprint(event("icmi-contact-center-expo")), { kind: "unresolved", label: "Under review" });
  assert.deepEqual(getEventFootprint(event("iqpc-cx-travel-hospitality")), { kind: "none", label: "None listed" });
  assert.deepEqual(getEventFootprint(event("contact-io")), { kind: "none", label: "None" });
});
