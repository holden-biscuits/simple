import { events, type EventRecord } from "./events.ts";
import { siteStatus, type SourceOverride } from "./site-status.ts";
import { eventFieldRoutes, type SourceSystem } from "./source-governance.ts";

export type UpdateConfidence = "high" | "medium" | "low";
export type ReconciliationDecision = "apply-to-review" | "needs-review" | "no-change" | "reject";

export type EventUpdateProposal = {
  id: string;
  eventKey: string;
  field: keyof EventRecord;
  proposedValue: unknown;
  source: SourceSystem;
  confidence: UpdateConfidence;
  evidence: string;
  evidenceUrl?: string;
};

export type ReconciliationResult = {
  decision: ReconciliationDecision;
  reason: string;
  eventKey: string;
  field: keyof EventRecord;
  currentValue?: unknown;
  proposedValue: unknown;
  writebackDestination?: string;
  protectedOverride?: SourceOverride;
};

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonicalize(item)]));
  }
  return value;
}

function valuesMatch(left: unknown, right: unknown) {
  return JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right));
}

const signalOnlySources = new Set<SourceSystem>(["gmail", "slack", "granola", "monaco"]);

export function reconcileEventUpdate(
  proposal: EventUpdateProposal,
  catalog: EventRecord[] = events,
  protectedOverrides: SourceOverride[] = siteStatus.sourceMonitor.protectedOverrides,
): ReconciliationResult {
  const event = catalog.find((item) => item.slug === proposal.eventKey);
  const base = { eventKey: proposal.eventKey, field: proposal.field, proposedValue: proposal.proposedValue };

  if (!event) return { ...base, decision: "reject", reason: "The Event key does not match a published event." };

  const route = eventFieldRoutes.find((item) => item.field === proposal.field);
  const currentValue = event[proposal.field];
  if (!route) return { ...base, currentValue, decision: "reject", reason: "The field has no declared system of record." };
  if (valuesMatch(currentValue, proposal.proposedValue)) {
    return { ...base, currentValue, decision: "no-change", reason: "The proposed value already matches Event Basecamp.", writebackDestination: route.destination };
  }

  const protectedOverride = protectedOverrides.find((item) => item.eventSlug === proposal.eventKey && item.fieldKey === proposal.field);
  if (protectedOverride && proposal.source !== "direct") {
    return {
      ...base,
      currentValue,
      decision: "needs-review",
      reason: "A direct decision protects this field from an automatic source update.",
      writebackDestination: route.destination,
      protectedOverride,
    };
  }

  if (proposal.source === "direct") {
    return { ...base, currentValue, decision: "apply-to-review", reason: "A new direct confirmation may update the review build.", writebackDestination: route.destination };
  }
  if (signalOnlySources.has(proposal.source)) {
    return { ...base, currentValue, decision: "needs-review", reason: "This source can detect a change but cannot own the final value.", writebackDestination: route.destination };
  }
  if (proposal.confidence !== "high") {
    return { ...base, currentValue, decision: "needs-review", reason: "Only high-confidence changes from the owning source may update a review build.", writebackDestination: route.destination };
  }
  if (proposal.source !== route.owner) {
    return { ...base, currentValue, decision: "needs-review", reason: `The proposed source does not own this field; reconcile it in ${route.destination}.`, writebackDestination: route.destination };
  }

  return { ...base, currentValue, decision: "apply-to-review", reason: "A high-confidence change from the owning source may update the review build.", writebackDestination: route.destination };
}
