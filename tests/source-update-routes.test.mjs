import test from "node:test";
import assert from "node:assert/strict";
import { events, getEventTrackerRowUrl, sourceLinks } from "../app/data/events.ts";
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

test("every event routes to its exact conference tracker row", () => {
  const urls = events.map((event) => getEventTrackerRowUrl(event.slug));
  assert.equal(new Set(urls).size, events.length);
  assert.ok(urls.every((url) => /&range=A\d+:[A-Z]+\d+$/.test(url)));
  assert.match(getEventTrackerRowUrl("ccw-exchange-chicago"), /gid=0&range=A14:W14$/);
  assert.match(getEventTrackerRowUrl("genesys-xperience"), /gid=0&range=A16:W16$/);
  assert.match(getEventTrackerRowUrl("ccw-vegas-2027"), /gid=113603184&range=A4:R4$/);
  assert.equal(getEventTrackerRowUrl("missing-event"), sourceLinks.sheet);
});

test("event-specific write-backs resolve to published event pages", () => {
  const publishedSlugs = new Set(events.map((event) => event.slug));
  const tagged = writebackQueue.filter((item) => item.eventSlug);
  assert.ok(tagged.length >= 9);
  assert.ok(tagged.every((item) => publishedSlugs.has(item.eventSlug)));
  const genesys = getEventWritebackQueue("genesys-xperience");
  assert.deepEqual(genesys.map((item) => item.system), ["Conference tracker", "Notion", "Notion", "Notion", "Notion"]);
  assert.deepEqual(genesys.slice(1).map((item) => item.scope), [
    "Genesys roster reference",
    "Genesys Wish Line activation",
    "Genesys speaking plan",
    "Genesys CRM logging route",
  ]);
  const customerConnect = getEventWritebackQueue("customer-connect-expo");
  assert.deepEqual(customerConnect.map((item) => item.system), ["Conference tracker", "Notion", "Notion", "Notion"]);
  assert.deepEqual(customerConnect.slice(1).map((item) => item.scope), [
    "Customer Connect priorities · organizer call",
    "Customer Connect task plan · organizer call",
    "Customer Connect sponsorship workstream",
  ]);
  const chicago = getEventWritebackQueue("ccw-exchange-chicago");
  assert.deepEqual(chicago.map((item) => item.scope), [
    "CCW Exchange Chicago final roster",
    "CCW Exchange Chicago attendance closeout",
    "CCW Exchange Chicago completion",
    "CCW Exchange Chicago rating",
    "CCW Exchange Chicago contractual meeting count",
    "CCW Exchange Chicago follow-up meetings",
    "CCW Exchange Chicago cookie follow-up",
  ]);
  assert.equal(chicago.find((item) => item.scope.includes("contractual meeting count"))?.state, "Decision needed");
});
