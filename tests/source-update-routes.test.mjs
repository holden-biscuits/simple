import test from "node:test";
import assert from "node:assert/strict";
import { events, getEventTrackerRowUrl, sourceLinks } from "../app/data/events.ts";
import { getEventUpdateRoutes } from "../app/data/event-update-routes.ts";
import { getMarketingEventRecord } from "../app/data/marketing-events.ts";
import { eventUpdateRoutes, getEventWritebackQueue, writebackQueue } from "../app/data/source-governance.ts";

test("shared update routes cover every owning execution system", () => {
  assert.deepEqual(eventUpdateRoutes.map((route) => route.id), ["tracker", "notion", "drive", "hubspot"]);
  assert.equal(new Set(eventUpdateRoutes.map((route) => route.url)).size, eventUpdateRoutes.length);
  assert.equal(eventUpdateRoutes.find((route) => route.id === "tracker")?.url, sourceLinks.sheet);
  assert.equal(eventUpdateRoutes.find((route) => route.id === "notion")?.url, sourceLinks.notion);
  assert.equal(eventUpdateRoutes.find((route) => route.id === "drive")?.url, sourceLinks.eventsDrive);
  assert.equal(eventUpdateRoutes.find((route) => route.id === "hubspot")?.url, sourceLinks.hubspot);
  assert.equal(eventUpdateRoutes.find((route) => route.id === "tracker")?.attendingOnly, undefined);
  assert.ok(eventUpdateRoutes.filter((route) => route.id !== "tracker").every((route) => route.attendingOnly));
});

test("update routes keep signals out of the system-of-record list", () => {
  const systems = eventUpdateRoutes.map((route) => route.system).join(" ");
  assert.doesNotMatch(systems, /Slack|Gmail|email/i);
  assert.ok(eventUpdateRoutes.every((route) => /Open /.test(route.action)));
});

test("event pages route updates to the exact event records", () => {
  const partnerPlatform = events.find((event) => event.slug === "demo-event-16");
  assert.ok(partnerPlatform);
  const routes = getEventUpdateRoutes(partnerPlatform);
  assert.equal(routes.find((route) => route.id === "tracker")?.url, getEventTrackerRowUrl(partnerPlatform.slug));
  assert.equal(routes.find((route) => route.id === "notion")?.url, partnerPlatform.notionUrl);
  assert.equal(routes.find((route) => route.id === "hubspot")?.url, getMarketingEventRecord(partnerPlatform.slug)?.url);
  assert.equal(routes.find((route) => route.id === "hubspot")?.system, "HubSpot Marketing Event");
  assert.equal(routes.find((route) => route.id === "hubspot")?.action, "Open Marketing Event");

  const contact = events.find((event) => event.slug === "demo-event-28");
  assert.ok(contact);
  assert.deepEqual(getEventUpdateRoutes(contact).map((route) => route.id), ["tracker"]);
});

test("every event routes to its exact conference tracker row", () => {
  const urls = events.map((event) => getEventTrackerRowUrl(event.slug));
  assert.equal(new Set(urls).size, events.length);
  assert.ok(urls.every((url) => /source=tracker&event=demo-event-\d+#public-demo$/.test(url)));
  assert.match(getEventTrackerRowUrl("demo-event-12"), /source=tracker&event=demo-event-12/);
  assert.match(getEventTrackerRowUrl("demo-event-16"), /source=tracker&event=demo-event-16/);
  assert.match(getEventTrackerRowUrl("demo-event-22"), /source=tracker&event=demo-event-22/);
  assert.equal(getEventTrackerRowUrl("missing-event"), sourceLinks.sheet);
});

test("event-specific write-backs resolve to published event pages", () => {
  const publishedSlugs = new Set(events.map((event) => event.slug));
  const tagged = writebackQueue.filter((item) => item.eventSlug);
  assert.ok(tagged.length >= 9);
  assert.ok(tagged.every((item) => publishedSlugs.has(item.eventSlug)));
  const partnerPlatform = getEventWritebackQueue("demo-event-16");
  assert.deepEqual(partnerPlatform.map((item) => item.system), ["Conference tracker", "Notion", "Notion", "Notion", "Notion"]);
  assert.deepEqual(partnerPlatform.slice(1).map((item) => item.scope), [
    "Partner Platform roster reference",
    "Partner Platform Wish Line activation",
    "Partner Platform speaking plan",
    "Partner Platform CRM logging route",
  ]);
  const customerConnect = getEventWritebackQueue("demo-event-11");
  assert.deepEqual(customerConnect.map((item) => item.system), ["Conference tracker", "Notion"]);
  assert.deepEqual(customerConnect.map((item) => item.scope), ["Customer Connect Showcase participation", "Customer Connect Showcase date property"]);
  const chicago = getEventWritebackQueue("demo-event-12");
  assert.deepEqual(chicago.map((item) => item.scope), [
    "Midwest CX Exchange final roster",
    "Midwest CX Exchange attendance closeout",
    "Midwest CX Exchange completion",
    "Midwest CX Exchange rating",
    "Midwest CX Exchange contractual meeting count",
    "Midwest CX Exchange follow-up meetings",
    "Midwest CX Exchange cookie follow-up",
  ]);
  assert.equal(chicago.find((item) => item.scope.includes("contractual meeting count"))?.state, "Decision needed");
});
