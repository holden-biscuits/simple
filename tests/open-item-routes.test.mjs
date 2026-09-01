import assert from "node:assert/strict";
import test from "node:test";
import { events, sourceLinks } from "../app/data/events.ts";
import { getOpenItemRoute } from "../app/data/open-item-routes.ts";

function event(slug) {
  const match = events.find((item) => item.slug === slug);
  assert.ok(match, `Missing event: ${slug}`);
  return match;
}

test("planning and logistics items open the event-specific Notion project", () => {
  const partnerPlatform = event("demo-event-16");
  const route = getOpenItemRoute(partnerPlatform, partnerPlatform.priorityActions[0]);
  assert.equal(route.system, "Notion");
  assert.equal(route.href, partnerPlatform.notionUrl);
  assert.equal(route.setupNeeded, false);
});

test("CRM and attribution items open the keyed HubSpot Marketing Event", () => {
  const partnerPlatform = event("demo-event-16");
  const route = getOpenItemRoute(partnerPlatform, partnerPlatform.priorityActions[2]);
  assert.equal(route.system, "HubSpot Marketing Event");
  assert.match(route.href, /source=crm-marketing-event&event=demo-event-16/);
  assert.equal(route.setupNeeded, false);
});

test("lead follow-up work opens the keyed HubSpot Marketing Event", () => {
  const partnerPlatform = event("demo-event-16");
  const route = getOpenItemRoute(partnerPlatform, "Build the post-event lead and follow-up workspace");
  assert.equal(route.system, "HubSpot Marketing Event");
  assert.match(route.href, /source=crm-marketing-event&event=demo-event-16/);
});

test("events without a Notion project link route setup work to the Events directory", () => {
  const reuters = event("demo-event-02");
  const route = getOpenItemRoute(reuters, reuters.priorityActions[0]);
  assert.equal(route.system, "Notion");
  assert.equal(route.href, sourceLinks.notion);
  assert.equal(route.label, "Create the Notion event project");
  assert.equal(route.setupNeeded, true);
});
