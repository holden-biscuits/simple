import test from "node:test";
import assert from "node:assert/strict";
import { events } from "../app/data/events.ts";
import { getLeadershipBrief, getLeadershipChangeDigest } from "../app/data/leadership-brief.ts";
import { siteStatus } from "../app/data/site-status.ts";

test("leadership brief derives the active portfolio from governed event data", () => {
  const brief = getLeadershipBrief(events, "2026-08-06");
  assert.equal(brief.portfolio.length, 14);
  assert.equal(brief.pulse.next60Days.length, 5);
  assert.equal(brief.pulse.readiness.structuredPlans, 5);
  assert.equal(brief.pulse.rosterGaps.length, 12);
  assert.equal(brief.pulse.sourceConflicts.length, 2);
  assert.equal(brief.pulse.sourceChecksDue.length, 0);
  assert.equal(brief.briefReadiness.ready.length, 0);
  assert.equal(brief.briefReadiness.attention.length, 14);
  assert.equal(brief.briefReadiness.openInputs, 35);
  assert.equal(brief.linkage.activeEvents, 14);
  assert.equal(brief.linkage.activeNotionProjects, 10);
  assert.equal(brief.linkage.activeDriveFolders, 0);
  assert.equal(brief.linkage.activeMarketingEvents, 14);
  assert.equal(brief.linkage.activeCrmEvents, 0);
  assert.equal(brief.portfolio[0].eventKey, "ccw-exchange-chicago");
  assert.equal(brief.portfolio.at(-1).eventKey, "ccw-vegas-2027");
  assert.deepEqual(brief.closeout, { completedEvents: 12, complete: 0, partial: 9, missing: 3, openCategories: 36 });
});

test("leadership outcomes preserve CRM limits", () => {
  const brief = getLeadershipBrief(events, "2026-08-06");
  assert.deepEqual(brief.outcomes, {
    sourceEligibleRecords: 30,
    qualifyingOpportunities: 22,
    exactQualifyingOpportunities: 21,
    openPipeline: 0,
    closedWonRevenue: 0,
    dealsWithoutAmount: 22,
    exactDeals: 29,
    pairMismatchCount: 2,
    sourceOnlyRecords: 1,
    detailOnlyRecords: 1,
    representedEvents: 1,
    meetingRecordsToQa: 4,
    completedMeetingOutcomes: 0,
    marketingEvents: 29,
    pipelineClaimSupported: false,
  });
  assert.deepEqual(brief.writebacks, { ready: 20, decisions: 2, setup: 10 });
});

test("leadership change digest separates applied facts from unresolved claims", () => {
  const digest = getLeadershipChangeDigest(events, siteStatus.sourceMonitor.changeLog);
  assert.equal(digest.applied.length, 17);
  assert.equal(digest.needsReview.length, 3);
  assert.equal(digest.applied.find((change) => change.id === "genesys-roster-confirmed")?.href, "/sources#change-log");
  assert.equal(digest.applied.find((change) => change.id === "genesys-wish-line-route-confirmed")?.href, "/sources#change-log");
  assert.equal(digest.applied.find((change) => change.id === "chicago-closeout-applied")?.href, "/sources#change-log");
  assert.equal(digest.applied.find((change) => change.id === "2027-program-added")?.href, "/sources#change-log");
  assert.equal(digest.applied.find((change) => change.id === "chicago-roster-confirmed")?.eventName, "CCW Exchange Chicago");
  assert.equal(digest.needsReview.find((change) => change.id === "hubspot-ccw-source-mismatch")?.eventName, "CCW Vegas");
  assert.equal(digest.applied.find((change) => change.id === "customer-connect-onboarding-signal")?.eventName, "Customer Connect Expo");
  assert.equal(digest.applied.find((change) => change.id === "ccw-vegas-meeting-tracker-confirmed")?.eventName, "CCW Vegas");
  assert.equal(digest.applied.find((change) => change.id === "travel-hospitality-task-checklist")?.eventName, "IQPC CX Travel & Hospitality");
  assert.equal(digest.applied.find((change) => change.id === "retail-task-checklist")?.eventName, "IQPC CX Retail");
  assert.equal(digest.applied.find((change) => change.id === "consero-task-checklist")?.eventName, "Consero CX & Contact Center Forum");
  assert.equal(digest.applied.find((change) => change.id === "customer-connect-notion-refresh")?.eventName, "Customer Connect Expo");
  assert.equal(digest.applied.find((change) => change.id === "customer-connect-notion-closeout")?.eventName, "Customer Connect Expo");
  assert.equal(digest.applied.some((change) => change.state === "No change"), false);
  assert.equal(digest.needsReview.some((change) => change.state === "No change"), false);
});
