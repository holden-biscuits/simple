import assert from "node:assert/strict";
import test from "node:test";
import { getEventSourceChanges, siteStatus } from "../app/data/site-status.ts";

test("event change history returns only records tied to that event", () => {
  const genesys = getEventSourceChanges("genesys-xperience");
  assert.deepEqual(genesys.map((change) => change.id), ["genesys-roster-confirmed", "genesys-email-deadline", "genesys-meetings-upstream-aligned"]);
  assert.ok(genesys.every((change) => change.eventSlug === "genesys-xperience"));

  const customerConnect = getEventSourceChanges("customer-connect-expo");
  assert.deepEqual(customerConnect.map((change) => change.id), ["customer-connect-portal-registration", "customer-connect-confirmed"]);
});

test("program-wide receipts do not leak onto individual event pages", () => {
  assert.deepEqual(getEventSourceChanges("ccw-orlando"), []);
  assert.ok(siteStatus.sourceMonitor.changeLog.some((change) => !change.eventSlug));
});
