import assert from "node:assert/strict";
import test from "node:test";
import { getEventSourceChanges, siteStatus } from "../app/data/site-status.ts";

test("event change history returns only records tied to that event", () => {
  const partnerPlatform = getEventSourceChanges("demo-event-16");
  assert.deepEqual(partnerPlatform.map((change) => change.id), ["partnerPlatform-wish-line-route-confirmed", "partnerPlatform-roster-confirmed", "partnerPlatform-email-deadline", "partnerPlatform-meetings-upstream-aligned"]);
  assert.ok(partnerPlatform.every((change) => change.eventSlug === "demo-event-16"));

  const customerConnect = getEventSourceChanges("demo-event-11");
  assert.deepEqual(customerConnect.map((change) => change.id), ["customer-connect-date-owner-check", "customer-connect-notion-closeout", "customer-connect-notion-refresh", "customer-connect-onboarding-signal", "customer-connect-portal-registration", "customer-connect-confirmed"]);
});

test("program-wide receipts do not leak onto individual event pages", () => {
  assert.deepEqual(getEventSourceChanges("demo-event-26"), []);
  assert.ok(siteStatus.sourceMonitor.changeLog.some((change) => !change.eventSlug));
});
