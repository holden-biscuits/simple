import assert from "node:assert/strict";
import test from "node:test";
import { events } from "../app/data/events.ts";
import { getCompletedEventOutcomeCoverage, getCompletedEventSignals, getGuaranteedMeetingSignal, getSpeakingOpportunitySignal, getSpeakingStatus, getSponsorshipStatus, getStaffingSignal, hasGuaranteedMeetingPackage, hasKnownGuaranteedMeetingCount } from "../app/data/event-signals.ts";

function event(slug) {
  const match = events.find((item) => item.slug === slug);
  assert.ok(match, `Missing event fixture: ${slug}`);
  return match;
}

test("event cards expose known guaranteed-meeting counts", () => {
  assert.equal(getGuaranteedMeetingSignal(event("demo-event-18")), "6 Guaranteed Meetings");
  assert.equal(getGuaranteedMeetingSignal(event("demo-event-01")), "10+ Guaranteed Meetings");
  assert.equal(getGuaranteedMeetingSignal(event("demo-event-12")), "Guaranteed Meetings · Count TBD");
  assert.equal(getGuaranteedMeetingSignal(event("demo-event-16")), "0 Guaranteed Meetings");
});

test("meeting-package status distinguishes known counts from unresolved counts", () => {
  assert.equal(hasGuaranteedMeetingPackage(event("demo-event-18")), true);
  assert.equal(hasKnownGuaranteedMeetingCount(event("demo-event-18")), true);
  assert.equal(hasKnownGuaranteedMeetingCount(event("demo-event-01")), true);
  assert.equal(hasGuaranteedMeetingPackage(event("demo-event-12")), true);
  assert.equal(hasKnownGuaranteedMeetingCount(event("demo-event-12")), false);
  assert.equal(hasGuaranteedMeetingPackage(event("demo-event-16")), false);
});

test("staffing signals distinguish named attendees from an unassigned plan", () => {
  assert.equal(getStaffingSignal(event("demo-event-16")).card, "9 Attending / 9 Passes");
  assert.equal(getStaffingSignal(event("demo-event-05")).card, "1 Attending / 3 Passes");
  assert.equal(getStaffingSignal(event("demo-event-18")).card, "0 Attending / 11 Passes");
  assert.equal(getStaffingSignal(event("demo-event-01")).card, "0 Attending / 3 Passes");
  assert.equal(getStaffingSignal(event("demo-event-22")).card, "0 Attending / 9 Passes");
  assert.equal(getStaffingSignal(event("demo-event-12")).card, "1 Attending / 1 Pass");
  assert.equal(getStaffingSignal(event("demo-event-28")).card, "0 Attending");
  assert.equal(getStaffingSignal(event("demo-event-26")).card, "2 Attending");
  assert.equal(getStaffingSignal(event("demo-event-05")).assignmentGap, 2);
  assert.equal(getStaffingSignal(event("demo-event-16")).assignmentGap, 0);
  assert.equal(getStaffingSignal(event("demo-event-05")).summary, "1 attending / 3 passes · 2 unassigned");
  assert.equal(getStaffingSignal(event("demo-event-01")).summary, "0 attending / 3 passes · 3 unassigned");
  assert.equal(getStaffingSignal(event("demo-event-16")).summary, "9 attending / 9 passes");
});

test("activation signals distinguish attendance from activation certainty", () => {
  assert.equal(getSpeakingStatus(event("demo-event-07")), "Under review");
  assert.equal(getSpeakingOpportunitySignal(event("demo-event-07")), "Speaking TBD");
  assert.equal(getSponsorshipStatus(event("demo-event-07")), "Under review");
  assert.equal(getSponsorshipStatus(event("demo-event-25")), "Under review");
  assert.equal(getSpeakingOpportunitySignal(event("demo-event-22")), "1 Speaking Opp");
  assert.equal(getSpeakingStatus(event("demo-event-28")), "None");
});

test("completed event cards replace planning signals with recorded outcomes", () => {
  assert.deepEqual(getCompletedEventSignals(event("demo-event-12")), ["Negative Feedback", "Meetings Not Recorded", "3 Closeout Gaps"]);
  assert.deepEqual(getCompletedEventSignals(event("demo-event-27")), ["Good Rating", "16 Meetings Recorded", "2 Closeout Gaps"]);
  assert.deepEqual(getCompletedEventSignals(event("demo-event-29")), ["Rating Not Recorded", "54 Meetings Recorded", "2 Closeout Gaps"]);
  assert.deepEqual(getCompletedEventOutcomeCoverage(event("demo-event-12")), {
    recorded: ["Follow-up meetings booked"],
    missing: ["Meetings recorded", "Demos recorded", "Closed"],
    state: "partial",
  });
});
