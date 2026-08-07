import assert from "node:assert/strict";
import test from "node:test";
import { processSourceScan } from "../app/data/source-scan.ts";

function scan(proposals) {
  return processSourceScan({ scanId: "scan-2026-08-07", checkedAt: "2026-08-07T16:00:00Z", proposals });
}

test("a source scan partitions every proposal into one auditable outcome", () => {
  const result = scan([
    { id: "new-demo", eventKey: "genesys-xperience", field: "demosBooked", proposedValue: ["Example account"], source: "hubspot", confidence: "high", evidence: "Exact Event key association" },
    { id: "email-date", eventKey: "genesys-xperience", field: "dates", proposedValue: "Sep 2–4, 2026", source: "gmail", confidence: "high", evidence: "Organizer email" },
    { id: "meeting-match", eventKey: "genesys-xperience", field: "guaranteedMeetings", proposedValue: "No", source: "sheet", confidence: "high", evidence: "Conference tracker" },
    { id: "unknown-event", eventKey: "not-a-real-event", field: "status", proposedValue: "Confirmed", source: "sheet", confidence: "high", evidence: "Conference tracker" },
  ]);

  assert.deepEqual(result.summary, { total: 4, applyToReview: 1, needsReview: 1, noChange: 1, rejected: 1 });
  assert.equal(result.publishable[0].proposal.id, "new-demo");
  assert.equal(result.reviewQueue[0].proposal.id, "email-date");
  assert.equal(result.noChangeReceipts[0].proposal.id, "meeting-match");
  assert.equal(result.rejected[0].proposal.id, "unknown-event");
  assert.deepEqual(result.writebackGroups.map((group) => group.destination), ["Conference tracker", "HubSpot"]);
  assert.deepEqual(result.gates, { reviewBuild: "changes-ready", production: "approval-required", upstreamWriteback: "exact-approval-required" });
});

test("duplicate proposal IDs are rejected without losing the first finding", () => {
  const proposal = { id: "same-id", eventKey: "genesys-xperience", field: "demosBooked", proposedValue: ["Example account"], source: "hubspot", confidence: "high", evidence: "Exact association" };
  const result = scan([proposal, { ...proposal, proposedValue: ["Another account"] }]);

  assert.equal(result.summary.applyToReview, 1);
  assert.equal(result.summary.rejected, 1);
  assert.match(result.rejected[0].result.reason, /duplicated/);
});

test("protected direct decisions remain review items in a batch", () => {
  const result = scan([
    { id: "stale-contact-status", eventKey: "contact-io", field: "status", proposedValue: "TBD", source: "sheet", confidence: "high", evidence: "Conference tracker" },
  ]);

  assert.equal(result.summary.needsReview, 1);
  assert.equal(result.summary.applyToReview, 0);
  assert.equal(result.reviewQueue[0].result.protectedOverride?.id, "contact-io-participation");
  assert.equal(result.gates.reviewBuild, "no-publishable-change");
});

test("findings without evidence never enter reconciliation", () => {
  const result = scan([
    { id: "unsupported", eventKey: "genesys-xperience", field: "demosBooked", proposedValue: ["Example account"], source: "hubspot", confidence: "high", evidence: "" },
  ]);

  assert.equal(result.summary.rejected, 1);
  assert.match(result.rejected[0].result.reason, /Evidence is required/);
  assert.equal(result.gates.upstreamWriteback, "none");
});
