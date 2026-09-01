import assert from "node:assert/strict";
import test from "node:test";

import { eventBySlug } from "../app/data/events.ts";
import { getEventPageModel, getEventWorkstreamState } from "../app/data/event-page-model.ts";

test("non-attending events remove prospecting and planning surfaces", () => {
  const event = eventBySlug("demo-event-28");
  assert.ok(event);
  const model = getEventPageModel(event, "2026-08-07");

  assert.equal(model.isNotAttending, true);
  assert.equal(model.showProspecting, false);
  assert.equal(model.showPlanningBody, false);
  assert.equal(model.showResults, false);
  assert.equal(model.tldrHeading, "Why there is no TeamSimple plan.");
});

test("current event pages use an onsite frame instead of a pre-event frame", () => {
  const event = eventBySlug("demo-event-12");
  assert.ok(event);
  const model = getEventPageModel({ ...event, completedAt: undefined }, "2026-08-06");

  assert.equal(model.phase, "now");
  assert.equal(model.tldrHeading, "What matters onsite today.");
  assert.equal(model.secondaryLabel, "Plan sections");
});

test("completed events distinguish recorded outcomes from the original plan", () => {
  const event = eventBySlug("demo-event-12");
  assert.ok(event);
  const model = getEventPageModel(event, "2026-08-07");

  assert.equal(model.phase, "past");
  assert.equal(model.hasRecordedResults, true);
  assert.equal(model.showResults, true);
  assert.equal(model.secondaryLabel, "Closeout sections");
  assert.equal(model.workstreamEyebrow, "Plan and closeout");
  assert.match(model.workstreamTitle, /record still needs/);
});

test("workstreams distinguish active plans, open confirmation, and explicit none", () => {
  const partnerPlatform = eventBySlug("demo-event-16");
  const icmi = eventBySlug("demo-event-07");
  const miami = eventBySlug("demo-event-03");
  assert.ok(partnerPlatform);
  assert.ok(icmi);
  assert.ok(miami);

  assert.equal(getEventWorkstreamState(partnerPlatform, "marketing"), "active");
  assert.equal(getEventWorkstreamState(partnerPlatform, "secondary"), "inactive");
  assert.equal(getEventWorkstreamState(icmi, "speaking"), "needs-confirmation");
  assert.equal(getEventWorkstreamState(miami, "speaking"), "active");
});
