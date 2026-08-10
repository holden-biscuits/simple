import { events, getWorkstreams, sourceLinks, type EventRecord } from "./events.ts";
import { eventPipelineSnapshot } from "./event-pipeline.ts";

export type EventCostLine = {
  category: string;
  detail: string;
  forecast: number | null;
  final: number | null;
  state: "Committed" | "Needs cost" | "Not applicable";
};

export type EventCostLedger = {
  eventSlug: string;
  eventName: string;
  dates: string;
  sourceUrl: string;
  lines: EventCostLine[];
  knownForecast: number;
  knownFinal: number;
  missingCount: number;
  opportunities: number | null;
  pipeline: number | null;
  revenue: number | null;
  commercialNote: string;
};

function categoryFor(detail: string) {
  if (/wish line|paid media|advertis/i.test(detail)) return "Paid media";
  if (/sponsor|booth|package|contract/i.test(detail)) return "Sponsorship";
  if (/gift|cookie|swag|material/i.test(detail)) return "Gifting & materials";
  if (/travel|hotel|flight/i.test(detail)) return "Travel";
  if (/ship|freight|local print|production|workshop|session/i.test(detail)) return "Production & logistics";
  return "Other direct cost";
}

function defaultLines(event: EventRecord): EventCostLine[] {
  const budgetItems = getWorkstreams(event).budget.filter((item) => !/^none/i.test(item));
  if (!budgetItems.length) return [{
    category: "Fully loaded event cost",
    detail: "No normalized cost record has been compiled yet.",
    forecast: null,
    final: null,
    state: "Needs cost",
  }];

  return budgetItems.map((detail) => ({
    category: categoryFor(detail),
    detail,
    forecast: null,
    final: null,
    state: "Needs cost" as const,
  }));
}

function linesFor(event: EventRecord): EventCostLine[] {
  if (event.slug !== "genesys-xperience") return defaultLines(event);
  return [
    {
      category: "Paid media",
      detail: "Wish Line taxi campaign · approved purchase; AP confirmation pending",
      forecast: 15000,
      final: null,
      state: "Committed",
    },
    { category: "Sponsorship", detail: "Booth package and contracted pre-event email", forecast: null, final: null, state: "Needs cost" },
    { category: "Production & logistics", detail: "Talk deck, booth video, printing, freight, and onsite production", forecast: null, final: null, state: "Needs cost" },
    { category: "Gifting & materials", detail: "Stanleys, steak cards, handouts, karaoke machines, and related materials", forecast: null, final: null, state: "Needs cost" },
    { category: "Travel", detail: "Flights, hotels, and ground transportation for nine attendees", forecast: null, final: null, state: "Needs cost" },
  ];
}

function commercialFor(event: EventRecord) {
  if (!event.crmSnapshot) return {
    opportunities: null,
    pipeline: null,
    revenue: null,
    commercialNote: "No exact event-level commercial rollup is linked yet.",
  };
  const excluded = new Set(["Closed lost", "Disqualified"]);
  const opportunities = event.crmSnapshot.stages.reduce((total, stage) => total + (excluded.has(stage.label) ? 0 : stage.count), 0);
  return {
    opportunities,
    pipeline: null,
    revenue: 0,
    commercialNote: "Exact opportunities are recorded; deal amounts are blank, so pipeline is not reportable. No attributed deal is Closed Won.",
  };
}

export function getEventCostLedgers(): EventCostLedger[] {
  return events.filter((event) => event.status !== "No").map((event) => {
    const lines = linesFor(event);
    const commercial = commercialFor(event);
    return {
      eventSlug: event.slug,
      eventName: event.name,
      dates: event.dates,
      sourceUrl: event.notionUrl ?? sourceLinks.sheet,
      lines,
      knownForecast: lines.reduce((total, line) => total + (line.forecast ?? 0), 0),
      knownFinal: lines.reduce((total, line) => total + (line.final ?? 0), 0),
      missingCount: lines.filter((line) => line.forecast === null || line.final === null).length,
      ...commercial,
    };
  });
}

export const eventCostPortfolio = {
  knownCommittedExpense: getEventCostLedgers().reduce((total, ledger) => total + ledger.knownForecast, 0),
  qualifyingOpportunities: eventPipelineSnapshot.opportunities,
  recordedPipeline: eventPipelineSnapshot.openPipeline,
  recordedRevenue: eventPipelineSnapshot.closedWonRevenue,
  dealsWithoutAmount: eventPipelineSnapshot.dealsWithoutAmount,
  costCoverageEvents: getEventCostLedgers().filter((ledger) => ledger.missingCount === 0).length,
  participatingEvents: getEventCostLedgers().length,
} as const;
