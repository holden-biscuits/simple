import assert from "node:assert/strict";
import test from "node:test";
import { reconcileEventUpdate } from "../app/data/reconciliation.ts";
import { events } from "../app/data/events.ts";
import { eventFieldRoutes } from "../app/data/source-governance.ts";

test("every event field in the catalog has one declared source route", () => {
  const routedFields = new Set(eventFieldRoutes.map((route) => route.field));
  const catalogFields = new Set(events.flatMap((event) => Object.keys(event)));
  assert.deepEqual([...catalogFields].filter((field) => !routedFields.has(field)), []);
  assert.equal(new Set(eventFieldRoutes.map((route) => route.field)).size, eventFieldRoutes.length);
});

test("direct decisions protect fields from stale source updates", () => {
  const result = reconcileEventUpdate({
    id: "tracker-contact-status",
    eventKey: "contact-io",
    field: "status",
    proposedValue: "TBD",
    source: "sheet",
    confidence: "high",
    evidence: "Conference tracker",
  });

  assert.equal(result.decision, "needs-review");
  assert.equal(result.protectedOverride?.id, "contact-io-participation");
  assert.equal(result.writebackDestination, "Conference tracker");
});

test("high-confidence changes from the owning source may update a review build", () => {
  const result = reconcileEventUpdate({
    id: "hubspot-new-demo",
    eventKey: "genesys-xperience",
    field: "demosBooked",
    proposedValue: ["Example account"],
    source: "hubspot",
    confidence: "high",
    evidence: "Explicit event attribution",
  });

  assert.equal(result.decision, "apply-to-review");
  assert.equal(result.writebackDestination, "HubSpot");
});

test("message sources open review items instead of silently changing owned facts", () => {
  const result = reconcileEventUpdate({
    id: "email-date-change",
    eventKey: "genesys-xperience",
    field: "dates",
    proposedValue: "Sep 2–4, 2026",
    source: "gmail",
    confidence: "high",
    evidence: "Organizer email",
  });

  assert.equal(result.decision, "needs-review");
  assert.match(result.reason, /detect a change/);
  assert.equal(result.writebackDestination, "Conference tracker");
});

test("unchanged values leave a no-change receipt", () => {
  const result = reconcileEventUpdate({
    id: "genesys-meetings-match",
    eventKey: "genesys-xperience",
    field: "guaranteedMeetings",
    proposedValue: "No",
    source: "sheet",
    confidence: "high",
    evidence: "Conference tracker",
  });

  assert.equal(result.decision, "no-change");
});

test("unknown event keys and unrouted fields are rejected", () => {
  const unknownEvent = reconcileEventUpdate({
    id: "unknown-event",
    eventKey: "not-a-real-event",
    field: "status",
    proposedValue: "Confirmed",
    source: "sheet",
    confidence: "high",
    evidence: "Fixture",
  });
  const unroutedField = reconcileEventUpdate({
    id: "unrouted-field",
    eventKey: "genesys-xperience",
    field: "totallyUnknown",
    proposedValue: [],
    source: "sheet",
    confidence: "high",
    evidence: "Fixture",
  }, undefined, []);

  assert.equal(unknownEvent.decision, "reject");
  assert.equal(unroutedField.decision, "reject");
});
