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
    id: "2026-08-07-direct-decisions",
    source: "Direct decisions",
    state: "Checked",
    scope: "Protected participation, roster, meeting and speaking decisions",
    result: "Six direct overrides remain protected; no newer controlling value was found.",
  },
  {
    id: "2026-08-07-conference-tracker",
    source: "Conference tracker",
    state: "Not due",
    scope: "Current event roster, dates, status and staffing",
    result: "All event records remain inside their freshness windows.",
  },
  {
    id: "2026-08-07-notion",
    source: "Notion",
    state: "Checked",
    scope: "Customer Connect and Genesys event projects",
    result: "Customer Connect is still blank; Genesys retains the existing execution plan.",
  },
  {
    id: "2026-08-07-events-drive",
    source: "Events Drive",
    state: "Not due",
    scope: "Current event contracts, creative and working files",
    result: "No event record was due for a redundant file review.",
  },
  {
    id: "2026-08-07-gmail",
    source: "Gmail",
    state: "Checked",
    scope: "Customer Connect and Genesys event updates",
    result: "Customer Connect supplied three review signals; Genesys supplied no site change.",
  },
  {
    id: "2026-08-07-slack",
    source: "Slack",
    state: "Checked",
    scope: "Customer Connect and Genesys updates since Aug 6",
    result: "No new event-specific message matched the reviewed scope.",
  },
  {
    id: "2026-08-07-hubspot",
    source: "HubSpot",
    state: "Checked",
    scope: "Controlled event Deal Source and Deal Source Detail pair",
    result: "29 exact CCW deals remain publishable; one detail-only mismatch remains excluded.",
  },
  {
    id: "2026-08-07-organizer-sites",
    source: "Organizer sites",
    state: "Not due",
    scope: "Current event dates, venues and public program details",
    result: "No event record was due for another organizer-site check.",
  },
  {
    id: "2026-08-07-granola",
    source: "Granola",
    state: "Unavailable",
    scope: "Shared event meeting notes or exports",
    result: "No direct connector or newly shared artifact was available.",
  },
  {
    id: "2026-08-07-monaco",
    source: "Monaco",
    state: "Unavailable",
    scope: "Shared event references only",
    result: "No direct source was available; Monaco remains indirect evidence only.",
  },
];

const findings: LatestScanFinding[] = [
  {
    id: "customer-connect-priority-actions",
    event: "Customer Connect Expo",
    field: "Priority actions",
    state: "Needs review",
    destination: "Customer Connect project in Notion",
    result: "Confirm the rescheduled organizer call before the fieldbook changes.",
  },
  {
    id: "customer-connect-marketing-tasks",
    event: "Customer Connect Expo",
    field: "Marketing tasks",
    state: "Needs review",
    destination: "Customer Connect project in Notion",
    result: "Add the organizer call and insurance follow-up to the owned task plan.",
  },
  {
    id: "customer-connect-workstreams",
    event: "Customer Connect Expo",
    field: "Sponsorship workstream",
    state: "Needs review",
    destination: "Customer Connect project in Notion",
    result: "Record that insurance is advised, not mandatory, in the execution plan.",
  },
  {
    id: "genesys-team",
    event: "Genesys Xperience",
    field: "Team",
    state: "No change",
    destination: "Conference tracker",
    result: "The nine-person roster still matches Holden’s protected decision.",
  },
  {
    id: "ccw-vegas-crm",
    event: "CCW Vegas 2026",
    field: "CRM snapshot",
    state: "No change",
    destination: "HubSpot",
    result: "The exact 29-deal CCW attribution baseline still holds.",
  },
];

const countReceipts = (state: LatestScanReceiptState) => receipts.filter((receipt) => receipt.state === state).length;
const countFindings = (state: LatestScanFindingState) => findings.filter((finding) => finding.state === state).length;

export const latestSourceScan = {
  scanId: "scheduled-heartbeat-2026-08-07T09-00-20-PT",
  checkedAtISO: "2026-08-07T16:00:20.069Z",
  checkedAtLabel: "Aug 07, 2026 · 9:00 AM PT",
  runMode: "Scheduled heartbeat",
  audit: {
    complete: true,
    errors: [] as string[],
  },
  gates: {
    reviewBuild: "No publishable change",
    production: "Approval required",
    upstreamWriteback: "Exact approval required",
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
