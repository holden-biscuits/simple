export type LatestScanReceiptState = "Checked" | "Unavailable" | "Not due";
export type LatestScanFindingState = "Needs review" | "No change";

export type LatestScanReceipt = {
  id: string;
  source: string;
  state: LatestScanReceiptState;
  scope: string;
  result: string;
};

export type LatestScanFinding = {
  id: string;
  event: string;
  field: string;
  state: LatestScanFindingState;
  destination: string;
  result: string;
};

const receipts: LatestScanReceipt[] = [
  {
    id: "2026-08-08-direct-decisions",
    source: "Direct decisions",
    state: "Checked",
    scope: "Protected event decisions in the current Codex task and site status",
    result: "Seventeen protected decisions remain in force; no newer direct event correction was found.",
  },
  {
    id: "2026-08-08-conference-tracker",
    source: "Conference tracker",
    state: "Not due",
    scope: "Roster, dates, participation and staffing for active events",
    result: "No event is due or overdue; no redundant tracker read was performed.",
  },
  {
    id: "2026-08-08-notion",
    source: "Notion",
    state: "Not due",
    scope: "Active Events projects",
    result: "No event is due or overdue; no redundant project read was performed.",
  },
  {
    id: "2026-08-08-events-drive",
    source: "Events Drive",
    state: "Not due",
    scope: "Contracts, creative and working files for active events",
    result: "No event is due or overdue; no redundant folder read was performed.",
  },
  {
    id: "2026-08-08-slack-self-dm",
    source: "Slack",
    state: "Checked",
    scope: "Holden’s private self-DM since the Aug 7 scheduled scan",
    result: "One new message was unrelated to events; no direct-confirmation candidate or follow-up was found.",
  },
  {
    id: "2026-08-08-slack-events",
    source: "Slack",
    state: "Not due",
    scope: "Event conversation signals",
    result: "No event is due or overdue; broader event-message searches were skipped under the freshness policy.",
  },
  {
    id: "2026-08-08-gmail",
    source: "Gmail",
    state: "Not due",
    scope: "Organizer correspondence for active events",
    result: "No event is due or overdue; organizer mail was not redundantly reread.",
  },
  {
    id: "2026-08-08-hubspot",
    source: "HubSpot",
    state: "Not due",
    scope: "Marketing Events and explicitly attributed meetings, demos, deals and pipeline",
    result: "No event is due or overdue; the Aug 7 controlled-pair and Marketing Event audits remain current.",
  },
  {
    id: "2026-08-08-organizer-sites",
    source: "Organizer sites",
    state: "Not due",
    scope: "Public event dates, venues and agendas",
    result: "No event is due or overdue; organizer sites were not redundantly reread.",
  },
  {
    id: "2026-08-08-granola",
    source: "Granola",
    state: "Unavailable",
    scope: "Shared event meeting notes or exports",
    result: "No direct source is available; no new shared artifact was detected in a connected source.",
  },
  {
    id: "2026-08-08-monaco",
    source: "Monaco",
    state: "Unavailable",
    scope: "Legacy event reporting references",
    result: "No direct source was available; Monaco remains indirect evidence only.",
  },
];

const findings: LatestScanFinding[] = [];

const countReceipts = (state: LatestScanReceiptState) => receipts.filter((receipt) => receipt.state === state).length;
const countFindings = (state: LatestScanFindingState) => findings.filter((finding) => finding.state === state).length;

export const latestSourceScan = {
  scanId: "scheduled-heartbeat-2026-08-08T09-12-58-PT",
  checkedAtISO: "2026-08-08T16:12:58.287Z",
  checkedAtLabel: "Aug 08, 2026 · 9:12 AM PT",
  runMode: "Scheduled heartbeat",
  audit: {
    complete: true,
    errors: [] as string[],
  },
  gates: {
    reviewBuild: "No publishable change",
    production: "Approval required",
    upstreamWriteback: "None from this scan",
  },
  summary: {
    total: findings.length,
    applyToReview: 0,
    needsReview: countFindings("Needs review"),
    noChange: countFindings("No change"),
    rejected: 0,
    checkedReceipts: countReceipts("Checked"),
    unavailableReceipts: countReceipts("Unavailable"),
    notDueReceipts: countReceipts("Not due"),
  },
  receipts,
  findings,
} as const;
