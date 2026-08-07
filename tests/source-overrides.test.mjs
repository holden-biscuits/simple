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

  assert.equal(event("contact-io").status, "No");
  assert.equal(event("customer-connect-expo").status, "Confirmed");
  assert.ok(event("customer-connect-expo").priorityActions.some((item) => item.includes("Aug 11 at 9:30 AM PT")));
  assert.ok(event("customer-connect-expo").workstreams.sponsorship.some((item) => item === "Insurance is not needed for our pipe-and-drape booth"));
  assert.equal(event("icmi-contact-center-expo").status, "Confirmed");
  assert.deepEqual(event("genesys-xperience").team, ["Cat", "Holden", "Matt", "Taylor", "Josh", "Carter", "Deepti", "Richard", "Lars"]);
  assert.equal(event("genesys-xperience").guaranteedMeetings, "No");
  assert.ok(event("genesys-xperience").workstreams.marketing.some((item) => item.includes("quarter-mile taxi geofence")));
  assert.ok(event("genesys-xperience").workstreams.marketing.some((item) => item.includes("airport placement")));

  assert.equal(event("ccw-exchange-chicago").completedAt, "2026-08-07");
  assert.deepEqual(event("ccw-exchange-chicago").team, ["Taylor"]);
  assert.equal(event("ccw-exchange-chicago").attendeeCount, 1);
  assert.deepEqual(event("ccw-exchange-chicago").available, []);
  assert.equal(event("ccw-exchange-chicago").rating, "Negative · Taylor’s post-event feedback");
  assert.equal(event("ccw-exchange-chicago").followupMeetingsBooked, 2);
  assert.ok(event("ccw-exchange-chicago").workstreams.followup.some((item) => item.includes("Kemper")));
  assert.ok(event("ccw-exchange-chicago").outcomeNotes.some((item) => item.includes("No opportunities are confirmed")));

  assert.equal(event("ccw-vegas").meetingCountLabel, "54");
  assert.equal(event("ccw-vegas").demoCountLabel, "20");
  assert.match(event("ccw-vegas").meetingRecordSummary, /12 Booth · 20 Demo · 22 Intro/);

  assert.equal(getSpeakingOpportunitySignal(event("ccw-vegas-2027")), "1 Speaking Opp");
});
