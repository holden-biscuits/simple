import { events, type EventRecord } from "./events.ts";
import { reconcileEventUpdate, type EventUpdateProposal, type ReconciliationResult } from "./reconciliation.ts";
import { siteStatus, type SourceOverride } from "./site-status.ts";
import type { SourceSystem } from "./source-governance.ts";

export type SourceReceiptState = "checked" | "unavailable" | "not-due";

export type SourceScanReceipt = {
  id: string;
  source: SourceSystem;
  state: SourceReceiptState;
  scope: string;
  result: string;
  evidenceUrl?: string;
};

export type SourceScanBatch = {
  scanId: string;
  checkedAt: string;
  runMode: "scheduled-heartbeat" | "task-review";
  sourceReceipts: SourceScanReceipt[];
  proposals: EventUpdateProposal[];
};

export type SourceScanRecord = {
  proposal: EventUpdateProposal;
  result: ReconciliationResult;
};

export type SourceScanWritebackGroup = {
  destination: string;
  records: SourceScanRecord[];
};

export type SourceScanOutput = {
  scanId: string;
  checkedAt: string;
  runMode: SourceScanBatch["runMode"];
  sourceReceipts: SourceScanReceipt[];
  records: SourceScanRecord[];
  summary: {
    total: number;
    applyToReview: number;
    needsReview: number;
    noChange: number;
    rejected: number;
    checkedReceipts: number;
    unavailableReceipts: number;
    notDueReceipts: number;
  };
  audit: {
    complete: boolean;
    errors: string[];
  };
  publishable: SourceScanRecord[];
  reviewQueue: SourceScanRecord[];
  noChangeReceipts: SourceScanRecord[];
  rejected: SourceScanRecord[];
  writebackGroups: SourceScanWritebackGroup[];
  gates: {
    reviewBuild: "changes-ready" | "no-publishable-change" | "audit-incomplete";
    production: "approval-required";
    upstreamWriteback: "exact-approval-required" | "none";
  };
};

export const sourceScanContract = [
  { step: "01", title: "Normalize", detail: "Every run declares whether it is the scheduled heartbeat or a task review, then records each source as checked, unavailable or not due. Every finding becomes one proposal with an Event key, field, proposed value, source, confidence and evidence." },
  { step: "02", title: "Reconcile", detail: "The batch checks field ownership, protected direct decisions, confidence, current values and exact event identity." },
  { step: "03", title: "Partition", detail: "Each proposal lands in exactly one queue: apply to review, needs review, no change or rejected." },
  { step: "04", title: "Route", detail: "Valid changes name the owning write-back destination. Event-specific queue entries carry the Event key so they also appear on the relevant event page. Production and every upstream write still require explicit approval." },
] as const;

export const sourceReceiptStates = [
  { state: "Checked", detail: "The source was read for the named scope. The receipt records what was reviewed and what it returned." },
  { state: "Unavailable", detail: "The source could not be read. The receipt names the missing access or artifact instead of silently omitting it." },
  { state: "Not due", detail: "The event remains inside its freshness window. The receipt records why a redundant source read was skipped." },
] as const;

function rejection(proposal: EventUpdateProposal, reason: string): SourceScanRecord {
  return {
    proposal,
    result: {
      decision: "reject",
      reason,
      eventKey: proposal.eventKey,
      field: proposal.field,
      proposedValue: proposal.proposedValue,
    },
  };
}

function groupWritebacks(records: SourceScanRecord[]): SourceScanWritebackGroup[] {
  const grouped = new Map<string, SourceScanRecord[]>();
  for (const record of records) {
    if (record.result.decision !== "apply-to-review" && record.result.decision !== "needs-review") continue;
    const destination = record.result.writebackDestination;
    if (!destination) continue;
    grouped.set(destination, [...(grouped.get(destination) ?? []), record]);
  }
  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([destination, items]) => ({ destination, records: items }));
}

function auditBatch(batch: SourceScanBatch) {
  const errors: string[] = [];
  const validSources = new Set<SourceSystem>(["direct", "sheet", "notion", "drive", "hubspot", "organizer", "gmail", "slack", "granola", "monaco"]);
  if (!batch.scanId.trim()) errors.push("The scan ID is required.");
  if (!Number.isFinite(Date.parse(batch.checkedAt))) errors.push("The scan timestamp must be a valid date.");
  if (batch.runMode !== "scheduled-heartbeat" && batch.runMode !== "task-review") errors.push("The run mode must be scheduled-heartbeat or task-review.");
  if (!batch.sourceReceipts.length) errors.push("At least one source receipt is required.");

  const receiptIds = new Set<string>();
  for (const receipt of batch.sourceReceipts) {
    const id = receipt.id.trim();
    if (!id) errors.push("Every source receipt needs an ID.");
    else if (receiptIds.has(id)) errors.push(`Source receipt ID ${id} is duplicated.`);
    receiptIds.add(id);
    if (!receipt.scope.trim()) errors.push(`Source receipt ${id || "without an ID"} needs a scope.`);
    if (!receipt.result.trim()) errors.push(`Source receipt ${id || "without an ID"} needs a result.`);
    if (!validSources.has(receipt.source)) errors.push(`Source receipt ${id || "without an ID"} names an unsupported source.`);
    if (!["checked", "unavailable", "not-due"].includes(receipt.state)) errors.push(`Source receipt ${id || "without an ID"} has an invalid state.`);
  }

  return { complete: errors.length === 0, errors };
}

export function processSourceScan(
  batch: SourceScanBatch,
  catalog: EventRecord[] = events,
  protectedOverrides: SourceOverride[] = siteStatus.sourceMonitor.protectedOverrides,
): SourceScanOutput {
  const audit = auditBatch(batch);
  const seenProposalIds = new Set<string>();
  const records = batch.proposals.map((proposal) => {
    const proposalId = proposal.id.trim();
    if (!proposalId) return rejection(proposal, "The proposal ID is required.");
    if (seenProposalIds.has(proposalId)) return rejection(proposal, "The proposal ID is duplicated in this scan.");
    seenProposalIds.add(proposalId);
    if (!proposal.eventKey.trim()) return rejection(proposal, "The Event key is required.");
    if (!proposal.evidence.trim()) return rejection(proposal, "Evidence is required before a source finding can enter reconciliation.");
    return { proposal, result: reconcileEventUpdate(proposal, catalog, protectedOverrides) };
  });

  const publishable = records.filter((record) => record.result.decision === "apply-to-review");
  const reviewQueue = records.filter((record) => record.result.decision === "needs-review");
  const noChangeReceipts = records.filter((record) => record.result.decision === "no-change");
  const rejected = records.filter((record) => record.result.decision === "reject");
  const writebackGroups = groupWritebacks(records);

  return {
    scanId: batch.scanId,
    checkedAt: batch.checkedAt,
    runMode: batch.runMode,
    sourceReceipts: batch.sourceReceipts,
    records,
    summary: {
      total: records.length,
      applyToReview: publishable.length,
      needsReview: reviewQueue.length,
      noChange: noChangeReceipts.length,
      rejected: rejected.length,
      checkedReceipts: batch.sourceReceipts.filter((receipt) => receipt.state === "checked").length,
      unavailableReceipts: batch.sourceReceipts.filter((receipt) => receipt.state === "unavailable").length,
      notDueReceipts: batch.sourceReceipts.filter((receipt) => receipt.state === "not-due").length,
    },
    audit,
    publishable,
    reviewQueue,
    noChangeReceipts,
    rejected,
    writebackGroups,
    gates: {
      reviewBuild: !audit.complete ? "audit-incomplete" : publishable.length ? "changes-ready" : "no-publishable-change",
      production: "approval-required",
      upstreamWriteback: writebackGroups.length ? "exact-approval-required" : "none",
    },
  };
}
