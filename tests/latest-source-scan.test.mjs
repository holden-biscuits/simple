import assert from "node:assert/strict";
import test from "node:test";
import { latestSourceScan } from "../app/data/latest-source-scan.ts";

test("latest source scan exposes a complete and conservative audit receipt", () => {
  assert.equal(latestSourceScan.runMode, "Scheduled heartbeat");
  assert.equal(latestSourceScan.audit.complete, true);
  assert.deepEqual(latestSourceScan.audit.errors, []);
  assert.equal(latestSourceScan.gates.reviewBuild, "No publishable change");
  assert.equal(latestSourceScan.gates.production, "Approval required");
  assert.equal(latestSourceScan.gates.upstreamWriteback, "None from this scan");
  assert.equal(latestSourceScan.summary.applyToReview, 0);
  assert.equal(latestSourceScan.summary.rejected, 0);
});

test("latest source scan summaries match the underlying receipts and findings", () => {
  assert.equal(new Set(latestSourceScan.receipts.map((receipt) => receipt.id)).size, latestSourceScan.receipts.length);
  assert.equal(new Set(latestSourceScan.findings.map((finding) => finding.id)).size, latestSourceScan.findings.length);
  assert.equal(latestSourceScan.summary.total, latestSourceScan.findings.length);
  assert.equal(latestSourceScan.summary.checkedReceipts, latestSourceScan.receipts.filter((receipt) => receipt.state === "Checked").length);
  assert.equal(latestSourceScan.summary.unavailableReceipts, latestSourceScan.receipts.filter((receipt) => receipt.state === "Unavailable").length);
  assert.equal(latestSourceScan.summary.notDueReceipts, latestSourceScan.receipts.filter((receipt) => receipt.state === "Not due").length);
  assert.equal(latestSourceScan.summary.needsReview, latestSourceScan.findings.filter((finding) => finding.state === "Needs review").length);
  assert.equal(latestSourceScan.summary.noChange, latestSourceScan.findings.filter((finding) => finding.state === "No change").length);
});

test("latest scheduled scan stays quiet when every event remains inside its freshness window", () => {
  assert.deepEqual(latestSourceScan.findings, []);
  assert.equal(latestSourceScan.summary.needsReview, 0);
  assert.equal(latestSourceScan.summary.noChange, 0);
  assert.ok(latestSourceScan.receipts.some((receipt) => receipt.source === "Conference tracker" && receipt.state === "Not due"));
  assert.ok(latestSourceScan.receipts.some((receipt) => receipt.source === "Slack" && receipt.state === "Checked"));
  assert.ok(latestSourceScan.receipts.some((receipt) => receipt.source === "HubSpot" && receipt.state === "Not due"));
});
