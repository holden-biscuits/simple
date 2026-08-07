import assert from "node:assert/strict";
import test from "node:test";
import { getEventCatalogHealth, getEventKey, validateEventCatalog } from "../app/data/event-contract.ts";
import { events } from "../app/data/events.ts";

test("the published event catalog has stable keys and no structural errors", () => {
  const health = getEventCatalogHealth(events);
  assert.equal(health.eventKeys, events.length);
  assert.deepEqual(health.errors, []);
  assert.equal(getEventKey(events[0]), events[0].slug);
});

test("the event contract rejects duplicate keys and malformed routing fields", () => {
  const base = structuredClone(events[0]);
  const malformed = {
    ...structuredClone(events[1]),
    slug: base.slug,
    dateSort: "2026-02-31",
    dateEndSort: "2026-01-01",
    organizerUrl: "http://example.com",
  };
  const errors = validateEventCatalog([base, malformed]).filter((issue) => issue.severity === "error");

  assert.ok(errors.some((issue) => issue.field === "slug" && /duplicated/.test(issue.message)));
  assert.ok(errors.some((issue) => issue.field === "dateSort"));
  assert.ok(errors.some((issue) => issue.field === "organizerUrl"));
});

test("source conflicts and unnamed rosters remain visible as review warnings", () => {
  const health = getEventCatalogHealth(events);
  assert.ok(health.sourceConflicts > 0);
  assert.ok(health.unnamedRosters > 0);
});

test("event TLDR callouts are optional, concise, and route to local detail", () => {
  const genesys = events.find((event) => event.slug === "genesys-xperience");
  const contact = events.find((event) => event.slug === "contact-io");

  assert.deepEqual(genesys?.tldrCallout, {
    label: "Featured activation",
    title: "Wish Line taxi campaign",
    detail: "0.25-mile geofence · Bellagio to Fontainebleau · ~10-minute loop",
    status: "AP confirmation pending",
    href: "#workstream-marketing",
    action: "Open route and viewing plan",
  });
  assert.equal(contact?.tldrCallout, undefined);
});
