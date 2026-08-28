import { publicDemo, demoSourceUrl } from "./demo-mode.ts";
import { events } from "./events.ts";

export type MarketingEventRecord = {
  eventKey: string;
  recordId: string;
  name: string;
  url: string;
};

export const marketingEventRecords: MarketingEventRecord[] = events.map((event, index) => ({
  eventKey: event.slug,
  recordId: `demo-marketing-event-${String(index + 1).padStart(2, "0")}`,
  name: event.name,
  url: demoSourceUrl("crm-marketing-event", event.slug),
}));

const recordsByEventKey = new Map(marketingEventRecords.map((record) => [record.eventKey, record]));

export function getMarketingEventRecord(eventKey: string) {
  return recordsByEventKey.get(eventKey);
}

export const marketingEventCoverage = {
  checkedAt: "Demo snapshot",
  totalRecords: marketingEventRecords.length,
  keyedRecords: marketingEventRecords.filter((record) => Boolean(record.eventKey)).length,
  readAccess: "Simulated",
  writeAccess: "Disabled in public demo",
  indexUrl: publicDemo.sourceHref,
} as const;
