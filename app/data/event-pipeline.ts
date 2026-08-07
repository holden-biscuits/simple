export const eventPipelineSnapshot = {
  checkedAt: "Aug 7, 2026",
  refreshRule: "Refresh from HubSpot during the daily source scan.",
  hubspotUrl: "https://app.hubspot.com/contacts/245561359/objects/0-3/views/all/list?utm_source=app_12360546_mcp&utm_medium=ai_agent&utm_campaign=event_basecamp_pipeline",
  sourceValues: ["Event — Trade Show", "Event — Field / Dinner", "Event / Conference"],
  excludedStages: ["Closed Lost", "Disqualified"],
  opportunities: 22,
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
