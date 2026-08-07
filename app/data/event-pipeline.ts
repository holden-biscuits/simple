export type HubSpotEventDeal = {
  id?: string;
  dealSource?: string;
  dealSourceDetail?: string;
  dealStage?: string;
  amountInHomeCurrency?: string | number | null;
};

export const eventPipelineFilter = {
  sourceValues: ["Event - Trade Show", "Event - Field/Dinner", "Event / Conference"],
  sourceLabels: ["Event — Trade Show", "Event — Field / Dinner", "Event / Conference"],
  detailValues: ["ccw_vegas_follow_up"],
  excludedStageValues: ["closedlost", "4028516043", "4040945398"],
  excludedStageLabels: ["Closed Lost", "Disqualified"],
  closedWonStageValues: ["closedwon", "4040945397"],
} as const;

export function reconcileEventAttributionCoverage(deals: HubSpotEventDeal[]) {
  const uniqueDeals = new Map<string, HubSpotEventDeal>();
  deals.forEach((deal, index) => uniqueDeals.set(deal.id ?? `record-${index}`, deal));

  const sourceValues = new Set<string>(eventPipelineFilter.sourceValues);
  const detailValues = new Set<string>(eventPipelineFilter.detailValues);
  const all = [...uniqueDeals.values()];
  const sourceEligible = all.filter((deal) => deal.dealSource && sourceValues.has(deal.dealSource));
  const detailEligible = all.filter((deal) => deal.dealSourceDetail && detailValues.has(deal.dealSourceDetail));
  const exact = all.filter((deal) => deal.dealSource && sourceValues.has(deal.dealSource) && deal.dealSourceDetail && detailValues.has(deal.dealSourceDetail));
  const sourceOnly = sourceEligible.filter((deal) => !deal.dealSourceDetail || !detailValues.has(deal.dealSourceDetail));
  const detailOnly = detailEligible.filter((deal) => !deal.dealSource || !sourceValues.has(deal.dealSource));

  return { sourceEligible, detailEligible, exact, sourceOnly, detailOnly };
}

const pipelineStageGroups = [
  { label: "Meeting booked", values: ["appointmentscheduled", "4040945392"] },
  { label: "Qualification", values: ["qualifiedtobuy", "4040945393"] },
  { label: "Demo completed", values: ["presentationscheduled", "4040945394"] },
  { label: "Validation", values: ["decisionmakerboughtin", "4040945395"] },
  { label: "Negotiation", values: ["contractsent", "4040945396"] },
  { label: "Finalization", values: ["stage_1"] },
  { label: "Pilot", values: ["stage_0"] },
  { label: "Nurture", values: ["4028516042"] },
  { label: "Closed won", values: [...eventPipelineFilter.closedWonStageValues] },
] as const;

function numericAmount(value: HubSpotEventDeal["amountInHomeCurrency"]) {
  const amount = typeof value === "number" ? value : Number.parseFloat(value ?? "");
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

export function summarizeEventPipeline(deals: HubSpotEventDeal[]) {
  const sourceValues = new Set<string>(eventPipelineFilter.sourceValues);
  const excludedStages = new Set<string>(eventPipelineFilter.excludedStageValues);
  const closedWonStages = new Set<string>(eventPipelineFilter.closedWonStageValues);
  const qualifying = deals.filter((deal) => deal.dealSource && sourceValues.has(deal.dealSource) && deal.dealStage && !excludedStages.has(deal.dealStage));
  const counts = new Map<string, number>();
  let openPipeline = 0;
  let closedWonRevenue = 0;
  let dealsWithoutAmount = 0;

  for (const deal of qualifying) {
    const amount = numericAmount(deal.amountInHomeCurrency);
    if (!amount) dealsWithoutAmount += 1;
    if (closedWonStages.has(deal.dealStage ?? "")) closedWonRevenue += amount;
    else openPipeline += amount;

    const group = pipelineStageGroups.find((item) => item.values.some((value) => value === deal.dealStage));
    const label = group?.label ?? "Other active stage";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  const stages = pipelineStageGroups
    .map((group) => ({ label: group.label, count: counts.get(group.label) ?? 0 }))
    .filter((stage) => stage.count > 0);
  const otherCount = counts.get("Other active stage") ?? 0;
  if (otherCount) stages.push({ label: "Other active stage", count: otherCount });

  return { opportunities: qualifying.length, openPipeline, closedWonRevenue, dealsWithoutAmount, stages };
}

export const eventPipelineRefreshContract = {
  objectType: "DEAL",
  properties: ["deal_source", "deal_source_detail_standardized", "dealstage", "amount_in_home_currency"],
  rule: "Read the three controlled Deal Source values and every controlled Event detail independently, reconcile their union, and publish exact attribution only from the intersection. The source-based operating view excludes Closed Lost and Disqualified; positive active amounts become open pipeline and positive Closed Won amounts become revenue.",
} as const;

export const eventPipelineSnapshot = {
  checkedAt: "Aug 7, 2026",
  refreshRule: "Refresh from HubSpot during the daily source scan.",
  hubspotUrl: "https://app.hubspot.com/contacts/245561359/objects/0-3/views/all/list?utm_source=app_12360546_mcp&utm_medium=ai_agent&utm_campaign=event_basecamp_pipeline",
  sourceValues: eventPipelineFilter.sourceLabels,
  excludedStages: eventPipelineFilter.excludedStageLabels,
  sourceEligibleRecords: 30,
  detailEligibleRecords: 30,
  opportunities: 22,
  exactAttributionRecords: 29,
  exactQualifyingOpportunities: 21,
  pairMismatchCount: 2,
  sourceOnlyRecords: 1,
  detailOnlyRecords: 1,
  openPipeline: 0,
  closedWonRevenue: 0,
  dealsWithoutAmount: 22,
  stages: [
    { label: "Meeting booked", count: 6 },
    { label: "Qualification", count: 6 },
    { label: "Demo completed", count: 8 },
    { label: "Validation", count: 2 },
    { label: "Negotiation", count: 0 },
    { label: "Closed won", count: 0 },
  ],
} as const;
