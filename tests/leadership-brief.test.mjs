import test from "node:test";
import assert from "node:assert/strict";
import { events } from "../app/data/events.ts";
import { getLeadershipBrief, getLeadershipChangeDigest } from "../app/data/leadership-brief.ts";
import { siteStatus } from "../app/data/site-status.ts";

test("leadership brief derives the active portfolio from governed event data", () => {
  const brief = getLeadershipBrief(events, "2026-08-06");
  assert.equal(brief.portfolio.length, 14);
  assert.equal(brief.pulse.next60Days.length, 5);
  assert.equal(brief.pulse.readiness.structuredPlans, 2);
  assert.equal(brief.pulse.rosterGaps.length, 13);
  assert.equal(brief.pulse.sourceConflicts.length, 3);
  assert.equal(brief.pulse.sourceChecksDue.length, 0);
  assert.equal(brief.briefReadiness.ready.length, 2);
  assert.equal(brief.briefReadiness.attention.length, 12);
  assert.equal(brief.briefReadiness.openInputs, 33);
  assert.equal(brief.linkage.activeEvents, 14);
  assert.equal(brief.linkage.activeNotionProjects, 10);
  assert.equal(brief.linkage.activeDriveFolders, 0);
  assert.equal(brief.linkage.activeCrmEvents, 0);
  assert.equal(brief.portfolio[0].eventKey, "ccw-exchange-chicago");
  assert.equal(brief.portfolio.at(-1).eventKey, "ccw-vegas-2027");
});

test("leadership outcomes preserve CRM limits", () => {
  const brief = getLeadershipBrief(events, "2026-08-06");
  assert.deepEqual(brief.outcomes, {
    exactDeals: 29,
    representedEvents: 1,
    meetingRecordsToQa: 4,
    completedMeetingOutcomes: 0,
    marketingEvents: 0,
    pipelineClaimSupported: false,
  });
  assert.deepEqual(brief.writebacks, { ready: 9, decisions: 1, setup: 9 });
});

test("leadership change digest separates applied facts from unresolved claims", () => {
  const digest = getLeadershipChangeDigest(events, siteStatus.sourceMonitor.changeLog);
  assert.equal(digest.applied.length, 5);
  assert.equal(digest.needsReview.length, 5);
  assert.equal(digest.applied.find((change) => change.id === "genesys-roster-confirmed")?.href, "/events/genesys-xperience#event-changes");
  assert.equal(digest.applied.find((change) => change.id === "2027-program-added")?.href, "/sources#change-log");
  assert.equal(digest.needsReview.find((change) => change.id === "chicago-staffing-conflict")?.eventName, "CCW Exchange Chicago");
  assert.equal(digest.needsReview.find((change) => change.id === "hubspot-ccw-source-mismatch")?.eventName, "CCW Vegas");
  assert.equal(digest.needsReview.find((change) => change.id === "customer-connect-onboarding-signal")?.eventName, "Customer Connect Expo");
  assert.equal(digest.applied.some((change) => change.state === "No change"), false);
  assert.equal(digest.needsReview.some((change) => change.state === "No change"), false);
});
