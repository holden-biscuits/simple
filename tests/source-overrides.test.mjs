import assert from "node:assert/strict";
import test from "node:test";
import { events } from "../app/data/events.ts";
import { getSpeakingOpportunitySignal } from "../app/data/event-signals.ts";
import { siteStatus } from "../app/data/site-status.ts";

function event(slug) {
  const match = events.find((item) => item.slug === slug);
  assert.ok(match, `Missing event fixture: ${slug}`);
  return match;
}

test("protected direct decisions still match the published event data", () => {
  const overrides = siteStatus.sourceMonitor.protectedOverrides;
  assert.equal(new Set(overrides.map((override) => override.id)).size, overrides.length);
  for (const override of overrides) event(override.eventSlug);

  assert.equal(event("demo-event-28").status, "No");
  assert.equal(event("demo-event-11").status, "Confirmed");
  assert.ok(event("demo-event-11").priorityActions.some((item) => item.includes("Aug 11 at 9:30 AM PT")));
  assert.ok(event("demo-event-11").workstreams.sponsorship.some((item) => item === "Insurance is not needed for our pipe-and-drape booth"));
  assert.equal(event("demo-event-07").status, "Confirmed");
  assert.deepEqual(event("demo-event-16").team, ["Avery", "Jordan", "Morgan", "Riley", "Casey", "Quinn", "Sam", "Drew", "Alex"]);
  assert.equal(event("demo-event-16").guaranteedMeetings, "No");
  assert.ok(event("demo-event-16").workstreams.marketing.some((item) => item.includes("quarter-mile taxi geofence")));
  assert.ok(event("demo-event-16").workstreams.marketing.some((item) => item.includes("airport placement")));

  assert.equal(event("demo-event-12").completedAt, "2026-08-07");
  assert.deepEqual(event("demo-event-12").team, ["Riley"]);
  assert.equal(event("demo-event-12").attendeeCount, 1);
  assert.deepEqual(event("demo-event-12").available, []);
  assert.equal(event("demo-event-12").rating, "Negative · Riley’s post-event feedback");
  assert.equal(event("demo-event-12").followupMeetingsBooked, 2);
  assert.ok(event("demo-event-12").workstreams.followup.some((item) => item.includes("Kemper")));
  assert.ok(event("demo-event-12").outcomeNotes.some((item) => item.includes("No opportunities are confirmed")));

  assert.equal(event("demo-event-29").meetingCountLabel, "54");
  assert.equal(event("demo-event-29").demoCountLabel, "20");
  assert.match(event("demo-event-29").meetingRecordSummary, /12 Booth · 20 Demo · 22 Intro/);

  assert.equal(getSpeakingOpportunitySignal(event("demo-event-22")), "1 Speaking Opp");
});
