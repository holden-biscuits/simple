import { events, type EventRecord } from "./events.ts";
import { reconcileEventUpdate, type EventUpdateProposal, type ReconciliationResult } from "./reconciliation.ts";
import { siteStatus, type SourceOverride } from "./site-status.ts";

export type SourceScanBatch = {
  scanId: string;
  checkedAt: string;
  runMode: "scheduled-heartbeat" | "task-review";
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
  records: SourceScanRecord[];
  summary: {
    total: number;
    applyToReview: number;
    needsReview: number;
    noChange: number;
    rejected: number;
  };
  publishable: SourceScanRecord[];
  reviewQueue: SourceScanRecord[];
  noChangeReceipts: SourceScanRecord[];
  rejected: SourceScanRecord[];
  writebackGroups: SourceScanWritebackGroup[];
  gates: {
    reviewBuild: "changes-ready" | "no-publishable-change";
    production: "approval-required";
    upstreamWriteback: "exact-approval-required" | "none";
  };
};

export const sourceScanContract = [
  { step: "01", title: "Normalize", detail: "Every run declares whether it is the scheduled heartbeat or a task review. Every finding becomes one proposal with an Event key, field, proposed value, source, confidence and evidence." },
  { step: "02", title: "Reconcile", detail: "The batch checks field ownership, protected direct decisions, confidence, current values and exact event identity." },
  { step: "03", title: "Partition", detail: "Each proposal lands in exactly one queue: apply to review, needs review, no change or rejected." },
  { step: "04", title: "Route", detail: "Valid changes name the owning write-back destination. Event-specific queue entries carry the Event key so they also appear on the relevant event page. Production and every upstream write still require explicit approval." },
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

export function processSourceScan(
  batch: SourceScanBatch,
  catalog: EventRecord[] = events,
  protectedOverrides: SourceOverride[] = siteStatus.sourceMonitor.protectedOverrides,
): SourceScanOutput {
  const seenProposalIds = new Set<string>();
  const records = batch.proposals.map((proposal) => {
    if (!proposal.id.trim()) return rejection(proposal, "The proposal ID is required.");
    if (seenProposalIds.has(proposal.id)) return rejection(proposal, "The proposal ID is duplicated in this scan.");
    seenProposalIds.add(proposal.id);
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
    records,
    summary: {
      total: records.length,
      applyToReview: publishable.length,
      needsReview: reviewQueue.length,
      noChange: noChangeReceipts.length,
      rejected: rejected.length,
    },
    publishable,
    reviewQueue,
    noChangeReceipts,
    rejected,
    writebackGroups,
    gates: {
      reviewBuild: publishable.length ? "changes-ready" : "no-publishable-change",
      production: "approval-required",
      upstreamWriteback: writebackGroups.length ? "exact-approval-required" : "none",
    },
  };
}
