import test from "node:test";
import assert from "node:assert/strict";
import { events } from "../app/data/events.ts";
import { getLeadershipBrief } from "../app/data/leadership-brief.ts";

test("leadership brief derives the active portfolio from governed event data", () => {
  const brief = getLeadershipBrief(events, "2026-08-06");
  assert.equal(brief.portfolio.length, 14);
  assert.equal(brief.pulse.next60Days.length, 5);
  assert.equal(brief.pulse.readiness.structuredPlans, 2);
  assert.equal(brief.pulse.rosterGaps.length, 13);
  assert.equal(brief.pulse.sourceConflicts.length, 3);
  assert.equal(brief.pulse.sourceChecksDue.length, 0);
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
  assert.deepEqual(brief.writebacks, { ready: 6, decisions: 1, setup: 8 });
});
