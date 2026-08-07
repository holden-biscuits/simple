import assert from "node:assert/strict";
import test from "node:test";

import { eventBySlug } from "../app/data/events.ts";
import { getEventPageModel, getEventWorkstreamState } from "../app/data/event-page-model.ts";

test("non-attending events remove prospecting and planning surfaces", () => {
  const event = eventBySlug("contact-io");
  assert.ok(event);
  const model = getEventPageModel(event, "2026-08-07");

  assert.equal(model.isNotAttending, true);
  assert.equal(model.showProspecting, false);
  assert.equal(model.showPlanningBody, false);
  assert.equal(model.showResults, false);
  assert.equal(model.tldrHeading, "Why there is no TeamSimple plan.");
});

test("current event pages use an onsite frame instead of a pre-event frame", () => {
  const event = eventBySlug("ccw-exchange-chicago");
  assert.ok(event);
  const model = getEventPageModel({ ...event, completedAt: undefined }, "2026-08-06");

  assert.equal(model.phase, "now");
  assert.equal(model.tldrHeading, "What matters onsite today.");
  assert.equal(model.secondaryLabel, "Plan sections");
});

test("completed events distinguish recorded outcomes from the original plan", () => {
  const event = eventBySlug("ccw-exchange-chicago");
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
  const genesys = eventBySlug("genesys-xperience");
  const icmi = eventBySlug("icmi-contact-center-expo");
  const miami = eventBySlug("ccw-executive-exchange-miami");
  assert.ok(genesys);
  assert.ok(icmi);
  assert.ok(miami);

  assert.equal(getEventWorkstreamState(genesys, "marketing"), "active");
  assert.equal(getEventWorkstreamState(genesys, "secondary"), "inactive");
  assert.equal(getEventWorkstreamState(icmi, "speaking"), "needs-confirmation");
  assert.equal(getEventWorkstreamState(miami, "speaking"), "active");
});
