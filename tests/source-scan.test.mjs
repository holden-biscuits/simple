import assert from "node:assert/strict";
import test from "node:test";
import { processSourceScan } from "../app/data/source-scan.ts";

const sourceReceipts = [
  { id: "tracker-check", source: "sheet", state: "checked", scope: "Active event rows due today", result: "Rows compared with the fieldbook." },
  { id: "granola-check", source: "granola", state: "unavailable", scope: "Conversation notes", result: "No direct connector or shared export is available." },
  { id: "later-events", source: "notion", state: "not-due", scope: "Events beyond the current freshness window", result: "No redundant project read required today." },
];

function scan(proposals, receipts = sourceReceipts) {
  return processSourceScan({ scanId: "scan-2026-08-07", checkedAt: "2026-08-07T16:00:00Z", runMode: "scheduled-heartbeat", sourceReceipts: receipts, proposals });
}

test("a source scan partitions every proposal into one auditable outcome", () => {
  const result = scan([
    { id: "new-demo", eventKey: "genesys-xperience", field: "demosBooked", proposedValue: ["Example account"], source: "hubspot", confidence: "high", evidence: "Exact Event key association" },
    { id: "email-date", eventKey: "genesys-xperience", field: "dates", proposedValue: "Sep 2–4, 2026", source: "gmail", confidence: "high", evidence: "Organizer email" },
    { id: "meeting-match", eventKey: "genesys-xperience", field: "guaranteedMeetings", proposedValue: "No", source: "sheet", confidence: "high", evidence: "Conference tracker" },
    { id: "unknown-event", eventKey: "not-a-real-event", field: "status", proposedValue: "Confirmed", source: "sheet", confidence: "high", evidence: "Conference tracker" },
  ]);

  assert.deepEqual(result.summary, { total: 4, applyToReview: 1, needsReview: 1, writebackOnly: 0, noChange: 1, rejected: 1, checkedReceipts: 1, unavailableReceipts: 1, notDueReceipts: 1 });
  assert.equal(result.runMode, "scheduled-heartbeat");
  assert.deepEqual(result.audit, { complete: true, errors: [] });
  assert.equal(result.publishable[0].proposal.id, "new-demo");
  assert.equal(result.reviewQueue[0].proposal.id, "email-date");
  assert.equal(result.noChangeReceipts[0].proposal.id, "meeting-match");
  assert.equal(result.rejected[0].proposal.id, "unknown-event");
  assert.deepEqual(result.writebackGroups.map((group) => group.destination), ["Conference tracker", "HubSpot"]);
  assert.deepEqual(result.gates, { reviewBuild: "changes-ready", production: "approval-required", upstreamWriteback: "exact-approval-required" });
});

test("a publishable change cannot clear the review gate without source receipts", () => {
  const result = scan([
    { id: "new-demo", eventKey: "genesys-xperience", field: "demosBooked", proposedValue: ["Example account"], source: "hubspot", confidence: "high", evidence: "Exact Event key association" },
  ], []);

  assert.equal(result.summary.applyToReview, 1);
  assert.equal(result.audit.complete, false);
  assert.match(result.audit.errors.join(" "), /source receipt is required/);
  assert.equal(result.gates.reviewBuild, "audit-incomplete");
});

test("malformed or duplicated source receipts keep the audit incomplete", () => {
  const result = scan([], [
    { id: "same", source: "slack", state: "checked", scope: "Event messages", result: "No new decision." },
    { id: " same ", source: "calendar", state: "unavailable", scope: "", result: "" },
  ]);

  assert.equal(result.audit.complete, false);
  assert.match(result.audit.errors.join(" "), /duplicated/);
  assert.match(result.audit.errors.join(" "), /needs a scope/);
  assert.match(result.audit.errors.join(" "), /needs a result/);
  assert.match(result.audit.errors.join(" "), /unsupported source/);
  assert.equal(result.gates.reviewBuild, "audit-incomplete");
});

test("duplicate proposal IDs are rejected without losing the first finding", () => {
  const proposal = { id: "same-id", eventKey: "genesys-xperience", field: "demosBooked", proposedValue: ["Example account"], source: "hubspot", confidence: "high", evidence: "Exact association" };
  const result = scan([proposal, { ...proposal, id: " same-id ", proposedValue: ["Another account"] }]);

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

test("a stale secondary system becomes an upstream-only correction when the site already matches its owner", () => {
  const result = processSourceScan({
    scanId: "task-review-customer-connect-date",
    checkedAt: "2026-08-07T23:45:00Z",
    runMode: "task-review",
    sourceReceipts: [
      { id: "tracker-customer-connect-date", source: "sheet", state: "checked", scope: "Customer Connect date row", result: "Tracker says Sep 9–10, 2026." },
      { id: "notion-customer-connect-date", source: "notion", state: "checked", scope: "Customer Connect date property", result: "Notion starts the event on Sep 8." },
      { id: "organizer-customer-connect-date", source: "organizer", state: "checked", scope: "Customer Connect registration page", result: "Organizer publishes Sep 9–10, 2026." },
    ],
    proposals: [{
      id: "customer-connect-notion-date",
      eventKey: "customer-connect-expo",
      field: "dates",
      proposedValue: "Sep 9–10, 2026",
      observedValue: "Sep 8–10, 2026",
      correctionTarget: "notion",
      source: "sheet",
      confidence: "high",
      evidence: "Fresh tracker row and organizer registration page agree; Notion begins one day early.",
    }],
  });

  assert.equal(result.gates.reviewBuild, "no-publishable-change");
  assert.equal(result.gates.upstreamWriteback, "exact-approval-required");
  assert.equal(result.summary.writebackOnly, 1);
  assert.equal(result.writebackOnly[0].proposal.id, "customer-connect-notion-date");
  assert.deepEqual(result.writebackGroups.map((group) => group.destination), ["Notion"]);
});

test("an incomplete upstream-only correction is rejected instead of silently becoming no change", () => {
  const result = scan([{
    id: "incomplete-upstream-correction",
    eventKey: "customer-connect-expo",
    field: "dates",
    proposedValue: "Sep 9–10, 2026",
    correctionTarget: "notion",
    source: "sheet",
    confidence: "high",
    evidence: "Tracker and organizer agree.",
  }]);

  assert.equal(result.summary.rejected, 1);
  assert.match(result.rejected[0].result.reason, /correctionTarget and observedValue/);
});
