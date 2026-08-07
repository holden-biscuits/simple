import test from "node:test";
import assert from "node:assert/strict";
import { sourceLinks } from "../app/data/events.ts";
import { eventUpdateRoutes } from "../app/data/source-governance.ts";

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
