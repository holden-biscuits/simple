import { sourceLinks, type EventRecord } from "./events.ts";
import { getMarketingEventRecord } from "./marketing-events.ts";

export type OpenItemRoute = {
  system: "Notion" | "HubSpot Marketing Event";
  href: string;
  label: string;
  setupNeeded: boolean;
};

const crmRecordPattern = /\b(?:hubspot|crm|campaign attribution|lead list|participant state|deal|pipeline|opportunit(?:y|ies)|meeting outcome|demo outcome|follow-up meeting)\b/i;

export function getOpenItemRoute(event: EventRecord, item: string): OpenItemRoute {
  if (crmRecordPattern.test(item)) {
    const marketingEvent = getMarketingEventRecord(event.slug);
    return marketingEvent ? {
      system: "HubSpot Marketing Event",
      href: marketingEvent.url,
      label: "Update the HubSpot event",
      setupNeeded: false,
    } : {
      system: "HubSpot Marketing Event",
      href: sourceLinks.hubspot,
      label: "Find or create the HubSpot event",
      setupNeeded: true,
    };
  }

  return event.notionUrl ? {
    system: "Notion",
    href: event.notionUrl,
    label: "Document the update in Notion",
    setupNeeded: false,
  } : {
    system: "Notion",
    href: sourceLinks.notion,
    label: "Create the Notion event project",
    setupNeeded: true,
  };
}
