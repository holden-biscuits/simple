export type MeasurementField = {
  field: string;
  owner: string;
  timing: string;
  rule: string;
};

export type MeasurementWindow = {
  window: string;
  action: string;
  output: string;
};

export type MetricDefinition = {
  metric: string;
  definition: string;
  formula?: string;
};

export const measurementFields: MeasurementField[] = [
  {
    field: "Primary objective",
    owner: "Event project · Notion",
    timing: "Before spend is approved",
    rule: "Choose the main job: sourced pipeline, acceleration, customer expansion, partner development or thought leadership. Secondary goals stay secondary.",
  },
  {
    field: "Canonical Event key",
    owner: "Tracker · Notion · HubSpot",
    timing: "Before outreach or registration starts",
    rule: "Use the immutable Event key from the Event Basecamp URL on the event, campaign, meeting, deal and cost record.",
  },
  {
    field: "Fully loaded cost",
    owner: "Event cost ledger · conference tracker",
    timing: "Forecast at approval · final by 7 days after",
    rule: "Record sponsorship, travel, production, paid media, activation, freight and other direct cost separately. Keep forecast and final values.",
  },
  {
    field: "Target and attendance",
    owner: "Event app · tracker · HubSpot Marketing Event",
    timing: "Target before the event · reconcile 1 day after",
    rule: "Keep target accounts, invited people, actual attendees and captured contacts distinct. A scan is not a qualified conversation.",
  },
  {
    field: "Meetings and outcomes",
    owner: "HubSpot",
    timing: "Before the event day ends",
    rule: "Record booked, held, canceled and no-show separately. Include owner, account, next action and Event key.",
  },
  {
    field: "Pipeline and revenue",
    owner: "HubSpot",
    timing: "Review 30 and 90 days after",
    rule: "Separate sourced from influenced. Count pipeline and revenue only from associated deals with an amount and a controlled attribution rule.",
  },
];

export const measurementWindows: MeasurementWindow[] = [
  { window: "Before approval", action: "Name the objective and expected commercial behavior.", output: "One primary objective · success threshold · decision owner" },
  { window: "14 days before", action: "Freeze the capture and attribution plan.", output: "Event key · campaign · target list · required HubSpot fields" },
  { window: "Each event day", action: "Reconcile meetings and missing context before the team leaves.", output: "Booked · held · canceled · no-show · next action" },
  { window: "1 day after", action: "Import, deduplicate and assign every usable record.", output: "Attendance · qualified conversations · owners · follow-up status" },
  { window: "7 days after", action: "Finish the operating closeout.", output: "Final cost · deliverables · demos · lessons · unresolved follow-up" },
  { window: "30 and 90 days after", action: "Read the CRM, not memories of the event.", output: "Opportunities · sourced pipeline · influenced pipeline · closed revenue" },
];

export const metricDefinitions: MetricDefinition[] = [
  { metric: "Held meeting", definition: "A substantive event-sourced conversation occurred and the HubSpot outcome confirms it. Scheduled, blank-outcome and no-show records do not count." },
  { metric: "Qualified opportunity", definition: "A deal exists, is associated to the event through the Event key and meets the team’s normal qualification standard." },
  { metric: "Sourced pipeline", definition: "The event created the first qualified opportunity. It is mutually exclusive from influenced pipeline for the same reporting view." },
  { metric: "Influenced pipeline", definition: "A pre-existing opportunity had a documented event interaction. Report it separately; do not add it to sourced pipeline." },
  { metric: "Meeting show rate", definition: "How much of the booked calendar became a real conversation.", formula: "Held meetings ÷ booked meetings" },
  { metric: "Meeting-to-opportunity rate", definition: "How efficiently real event conversations created qualified pipeline.", formula: "Event-sourced opportunities ÷ held meetings" },
  { metric: "Cost per held meeting", definition: "Useful for comparing meeting-led events only after final cost is complete.", formula: "Fully loaded event cost ÷ held meetings" },
  { metric: "Sourced pipeline multiple", definition: "A pipeline efficiency indicator—not revenue ROI and not a promise that pipeline will close.", formula: "Event-sourced pipeline ÷ fully loaded event cost" },
];

export const measurementReadiness = {
  normalizedCostEvents: 0,
  marketingEventRecords: 0,
  eventKeyCoverageReady: false,
  portfolioRoiReady: false,
} as const;

type MeasurementEvent = {
  meetingsBooked: string[];
  meetingCountLabel?: string;
  meetingRecordSummary?: string;
  crmSnapshot?: unknown;
};

export function getEventMeasurementCheckpoint(event: MeasurementEvent, phase: "past" | "now" | "upcoming") {
  const meetingEvidence = event.meetingsBooked.length
    ? `${event.meetingsBooked.length} account${event.meetingsBooked.length === 1 ? "" : "s"} recorded`
    : event.meetingCountLabel
      ? event.meetingRecordSummary ?? `${event.meetingCountLabel} meeting records · account names missing`
      : "No meeting records yet";
  const nextAction = phase === "now"
    ? "Reconcile booked, held, canceled and no-show outcomes before the team leaves today."
    : phase === "past"
      ? "Finish final cost, then review opportunities and pipeline at 30 and 90 days."
      : "Name the primary objective and cost forecast before spend or promotion moves forward.";

  return {
    state: "Setup needed" as const,
    objective: "Not recorded as a governed field",
    cost: "No normalized cost record",
    crm: event.crmSnapshot ? "Controlled legacy join" : "Exact Event key join missing",
    meetings: meetingEvidence,
    nextAction,
  };
}
