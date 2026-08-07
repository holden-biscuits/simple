import { getEventTrackerRowUrl, type EventRecord } from "./events.ts";
import { getMarketingEventRecord } from "./marketing-events.ts";
import { eventUpdateRoutes, type EventUpdateRoute } from "./source-governance.ts";

export function getEventUpdateRoutes(event: EventRecord): EventUpdateRoute[] {
  const marketingEvent = getMarketingEventRecord(event.slug);

  return eventUpdateRoutes
    .filter((route) => !route.attendingOnly || event.status !== "No")
    .map((route) => {
      if (route.id === "tracker") return {
        ...route,
        url: getEventTrackerRowUrl(event.slug),
        action: "Open event row",
      };

      if (route.id === "notion") return {
        ...route,
        url: event.notionUrl ?? route.url,
        system: event.notionUrl ? route.system : "Notion setup needed",
        detail: event.notionUrl ? route.detail : "Create or locate the event project before execution work starts.",
      };

      if (route.id === "hubspot" && marketingEvent) return {
        ...route,
        url: marketingEvent.url,
        system: "HubSpot Marketing Event",
        detail: "Use this keyed event record as the CRM spine. Associate participant states and evidence-backed meetings, demos, deals, and pipeline; record each activity outcome separately.",
        action: "Open Marketing Event",
      };

      return route;
    });
}
