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

  const credentialsOnly = {
    ...structuredClone(events[0]),
    slug: "credentials-only-test",
    status: "Confirmed",
    attendeeCount: null,
    team: [],
    credentials: "4 sponsor passes",
  };
  assert.ok(validateEventCatalog([credentialsOnly]).some((issue) => issue.field === "team" && issue.message === "Some passes still need attendees assigned."));
});

test("event TLDR callouts are optional, concise, and route to supporting detail", () => {
  const genesys = events.find((event) => event.slug === "genesys-xperience");
  const contact = events.find((event) => event.slug === "contact-io");

  assert.deepEqual(genesys?.tldrCallout, {
    label: "Wish Line FYI",
    title: "1-855-955-WISH",
    detail: "Live Simple agent · Aug 31–Sep 3",
    goal: "Turn the Vegas campaign into a live product demo and bring qualified conference callers to the booth.",
    salesAction: "Ask prospects to call it; if they engage, continue the conversation at the booth and record the next step.",
    href: "https://www.notion.so/3a66fee642fe812d8882cb912a924a7c",
    action: "Open the campaign brief",
  });
  assert.equal(contact?.tldrCallout, undefined);
});
