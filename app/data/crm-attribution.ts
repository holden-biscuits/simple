export type AttributionConfidence = "explicit" | "needs-review" | "excluded";

export type CrmAttributionInput = {
  eventKey: string;
  recordedEventKey?: string;
  marketingEventKey?: string;
  dealSource?: string;
  dealSourceDetail?: string;
  activityText?: string;
  eventAliases?: string[];
  withinEventWindow?: boolean;
};

export type CrmAttributionResult = {
  confidence: AttributionConfidence;
  reason: string;
};

const eventDealDetails: Record<string, string> = {
  ccw_vegas_follow_up: "ccw-vegas",
};

const eventDealSources = new Set(["Event - Trade Show", "Event - Field/Dinner", "Event / Conference"]);

function normalize(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export function classifyCrmAttribution(input: CrmAttributionInput): CrmAttributionResult {
  const eventKey = normalize(input.eventKey);
  const recordedEventKey = normalize(input.recordedEventKey);
  const marketingEventKey = normalize(input.marketingEventKey);

  if (recordedEventKey && recordedEventKey === eventKey) {
    return { confidence: "explicit", reason: "The CRM record carries the canonical Event key." };
  }

  if (marketingEventKey && marketingEventKey === eventKey) {
    return { confidence: "explicit", reason: "The record is linked to a Marketing Event with the canonical Event key." };
  }

  if (input.dealSource && eventDealSources.has(input.dealSource)) {
    const mappedEventKey = eventDealDetails[normalize(input.dealSourceDetail)];
    if (mappedEventKey === eventKey) {
      return { confidence: "explicit", reason: "The controlled Deal Source and Deal Source Detail resolve to this event." };
    }
  }

  const text = normalize(input.activityText);
  if (text.includes(`[evt:${eventKey}]`)) {
    return { confidence: "explicit", reason: "The activity contains the canonical Event key token." };
  }

  const matchesAlias = (input.eventAliases ?? []).some((alias) => {
    const normalizedAlias = normalize(alias);
    return normalizedAlias.length >= 4 && text.includes(normalizedAlias);
  });
  if (matchesAlias && input.withinEventWindow) {
    return { confidence: "needs-review", reason: "The activity text and date fit the event, but the record has no canonical Event key." };
  }

  return { confidence: "excluded", reason: "The record lacks an explicit event join. Date proximity or a vendor mention alone is not attribution." };
}

export const crmAttributionAudit = {
  checkedAt: "Aug 7, 2026",
  accountId: "245561359",
  hubspotUrl: "https://app.hubspot.com/contacts/245561359/objects/0-3/views/all/list?utm_source=app_12360546_mcp&utm_medium=ai_agent&utm_campaign=event_fieldbook",
  exactDeals: 29,
  representedEvents: 1,
  representedEventLabel: "CCW Vegas",
  marketingEvents: marketingEventCoverage.totalRecords,
  keyedMarketingEvents: marketingEventCoverage.keyedRecords,
  marketingEventUrl: marketingEventCoverage.indexUrl,
  pairMismatch: {
    count: 2,
    note: "The source and detail searches each return 30 deals, but only 29 records intersect. One source-only record and one detail-only record stay out of exact attribution until RevOps reconciles both controlled fields.",
    sourceOnly: {
      count: 1,
      dealName: "Home Warranty, Inc. — New Deal",
      currentSource: "Event — Trade Show",
      currentDetail: "Field / dinner",
      url: "https://app.hubspot.com/contacts/245561359/record/0-3/340489431764?utm_source=app_12360546_mcp&utm_medium=ai_agent&utm_campaign=event_fieldbook",
    },
    detailOnly: {
      count: 1,
      dealName: "Memorial Hermann Health System",
      currentSource: "Outbound — SDR",
      currentDetail: "CCW Vegas follow-up",
      url: "https://app.hubspot.com/contacts/245561359/record/0-3/338921491147?utm_source=app_12360546_mcp&utm_medium=ai_agent&utm_campaign=event_fieldbook",
    },
  },
  meetingWindow: {
    eventKey: "ccw-vegas",
    eventLabel: "CCW Vegas",
    recordsReviewed: 8,
    possibleEventMeetings: 4,
    completedOutcomes: 0,
    outcomeNote: "Two possible event meetings still say Scheduled; two have no outcome. Four unrelated account meetings in the same date window are excluded.",
  },
  rules: [
    {
      label: "Publish",
      title: "Exact event join",
      detail: "Use a canonical Event key, a matching Marketing Event key, or a controlled Deal Source + Deal Source Detail pair that resolves to one event.",
    },
    {
      label: "Review",
      title: "Text and timing agree",
      detail: "A meeting title, body or location names the event and falls inside its dates, but the record has no canonical key. A person must confirm it before it counts.",
    },
    {
      label: "Exclude",
      title: "Weak or ambiguous signal",
      detail: "Do not count date proximity, a vendor mention, a planning call, or a downstream meeting that merely references where the introduction happened.",
    },
  ],
} as const;
import { marketingEventCoverage } from "./marketing-events.ts";
