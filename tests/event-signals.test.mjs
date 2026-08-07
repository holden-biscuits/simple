import assert from "node:assert/strict";
import test from "node:test";
import { events } from "../app/data/events.ts";
import { getCompletedEventSignals, getGuaranteedMeetingSignal, getSpeakingOpportunitySignal, getSpeakingStatus, getSponsorshipStatus, getStaffingSignal, hasGuaranteedMeetingPackage, hasKnownGuaranteedMeetingCount } from "../app/data/event-signals.ts";

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
  assert.equal(getStaffingSignal(event("genesys-xperience")).card, "9 Attending / 9 Passes");
  assert.equal(getStaffingSignal(event("iqpc-cx-travel-hospitality")).card, "1 Attending / 3 Passes");
  assert.equal(getStaffingSignal(event("ccw-orlando-2027")).card, "0 Attending / 11 Passes");
  assert.equal(getStaffingSignal(event("ccw-uk-executive-exchange-2027")).card, "0 Attending / 3 Passes");
  assert.equal(getStaffingSignal(event("ccw-vegas-2027")).card, "0 Attending / 9 Passes");
  assert.equal(getStaffingSignal(event("ccw-exchange-chicago")).card, "1 Attending");
  assert.equal(getStaffingSignal(event("contact-io")).card, "0 Attending");
  assert.equal(getStaffingSignal(event("ccw-orlando")).card, "2 Attending / 2 Passes");
});

test("activation signals distinguish attendance from activation certainty", () => {
  assert.equal(getSpeakingStatus(event("icmi-contact-center-expo")), "Under review");
  assert.equal(getSpeakingOpportunitySignal(event("icmi-contact-center-expo")), "Speaking TBD");
  assert.equal(getSponsorshipStatus(event("icmi-contact-center-expo")), "Under review");
  assert.equal(getSponsorshipStatus(event("ccw-nashville")), "Under review");
  assert.equal(getSpeakingOpportunitySignal(event("ccw-vegas-2027")), "1 Speaking Opp");
  assert.equal(getSpeakingStatus(event("contact-io")), "None");
});

test("completed event cards replace planning signals with recorded outcomes", () => {
  assert.deepEqual(getCompletedEventSignals(event("ccw-exchange-chicago")), ["Negative Feedback", "Meetings Not Recorded", "2 Follow-up Meetings"]);
  assert.deepEqual(getCompletedEventSignals(event("nice-world")), ["Good Rating", "16 Meetings Recorded", "7 Demos Recorded"]);
  assert.deepEqual(getCompletedEventSignals(event("ccw-vegas")), ["Rating Not Recorded", "54 Meetings Recorded", "20 Demos Recorded"]);
});
