import assert from "node:assert/strict";
import test from "node:test";
import { events } from "../app/data/events.ts";
import { getGuaranteedMeetingSignal, getStaffingSignal, hasGuaranteedMeetingPackage, hasKnownGuaranteedMeetingCount } from "../app/data/event-signals.ts";

function event(slug) {
  const match = events.find((item) => item.slug === slug);
  assert.ok(match, `Missing event fixture: ${slug}`);
  return match;
}

test("event cards expose known guaranteed-meeting counts", () => {
  assert.equal(getGuaranteedMeetingSignal(event("ccw-orlando-2027")), "6 Guaranteed Meetings");
  assert.equal(getGuaranteedMeetingSignal(event("ccw-uk-executive-exchange-2027")), "10+ Guaranteed Meetings");
  assert.equal(getGuaranteedMeetingSignal(event("ccw-exchange-chicago")), "Guaranteed Meetings · Count TBD");
  assert.equal(getGuaranteedMeetingSignal(event("genesys-xperience")), "0 Guaranteed Meetings");
});

test("meeting-package status distinguishes known counts from unresolved counts", () => {
  assert.equal(hasGuaranteedMeetingPackage(event("ccw-orlando-2027")), true);
  assert.equal(hasKnownGuaranteedMeetingCount(event("ccw-orlando-2027")), true);
  assert.equal(hasKnownGuaranteedMeetingCount(event("ccw-uk-executive-exchange-2027")), true);
  assert.equal(hasGuaranteedMeetingPackage(event("ccw-exchange-chicago")), true);
  assert.equal(hasKnownGuaranteedMeetingCount(event("ccw-exchange-chicago")), false);
  assert.equal(hasGuaranteedMeetingPackage(event("genesys-xperience")), false);
});

test("staffing signals distinguish named attendees from an unassigned plan", () => {
  assert.equal(getStaffingSignal(event("genesys-xperience")).card, "9 Attending");
  assert.equal(getStaffingSignal(event("ccw-orlando-2027")).card, "11 Planned");
  assert.equal(getStaffingSignal(event("ccw-exchange-chicago")).card, "1 Named · 2 Planned");
  assert.equal(getStaffingSignal(event("contact-io")).card, "0 Attending");
  assert.equal(getStaffingSignal(event("ccw-orlando")).card, "2 Attending");
});
