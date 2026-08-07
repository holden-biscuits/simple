import { getEventPhase, type EventRecord } from "./events.ts";
import { getMarketingEventRecord } from "./marketing-events.ts";

export type LinkageState = "Located" | "Legacy join" | "Setup needed";

export type SystemLinkage = {
  system: "Conference tracker" | "Notion" | "Events Drive" | "HubSpot";
  state: LinkageState;
  detail: string;
  url?: string;
};

export function getEventSystemLinkage(event: EventRecord): SystemLinkage[] {
  const marketingEvent = getMarketingEventRecord(event.slug);
  const tracker: SystemLinkage = {
    system: "Conference tracker",
    state: "Located",
    detail: "The source row is in the catalog. Its permanent Event key column still needs to be added upstream.",
  };

  const hubspot: SystemLinkage = marketingEvent ? {
    system: "HubSpot",
    state: "Located",
    detail: event.crmSnapshot
      ? "The keyed Marketing Event exists and a controlled legacy commercial join is available. Participant, campaign, meeting, and deal associations still require their own evidence."
      : "The keyed Marketing Event exists. It is the CRM event spine; participant, campaign, meeting, and deal associations still require their own evidence.",
    url: marketingEvent.url,
  } : {
    system: "HubSpot",
    state: event.crmSnapshot ? "Legacy join" : "Setup needed",
    detail: event.crmSnapshot
      ? "The event resolves through controlled legacy fields, but no keyed Marketing Event was found."
      : "No keyed Marketing Event or exact commercial association is available in the governed CRM snapshot.",
  };

  if (event.status === "No") return [tracker, hubspot];

  return [
    tracker,
    {
      system: "Notion",
      state: event.notionUrl ? "Located" : "Setup needed",
      detail: event.notionUrl
        ? "The event project is linked. Its Event key property still needs to be added upstream."
        : "No event project is linked yet.",
    },
    {
      system: "Events Drive",
      state: "Setup needed",
      detail: "No event-specific Drive folder is linked from the governed event record.",
    },
    hubspot,
  ];
}

export function getProgramSystemLinkage(catalog: EventRecord[], programDate: string) {
  const active = catalog.filter((event) => getEventPhase(event, programDate) !== "past" && event.status !== "No");
  const activeNotion = active.filter((event) => Boolean(event.notionUrl));
  const activeCrm = active.filter((event) => Boolean(event.crmSnapshot));
  const historicalCrm = catalog.filter((event) => Boolean(event.crmSnapshot));
  const activeMarketingEvents = active.filter((event) => Boolean(getMarketingEventRecord(event.slug)));
  const keyedMarketingEvents = catalog.filter((event) => Boolean(getMarketingEventRecord(event.slug)));

  return {
    totalEvents: catalog.length,
    activeEvents: active.length,
    stableFieldbookKeys: catalog.length,
    trackerRowsLocated: catalog.length,
    activeNotionProjects: activeNotion.length,
    activeNotionMissing: active.filter((event) => !event.notionUrl).map((event) => ({ key: event.slug, name: event.name })),
    activeDriveFolders: 0,
    activeMarketingEvents: activeMarketingEvents.length,
    keyedMarketingEvents: keyedMarketingEvents.length,
    activeCrmEvents: activeCrm.length,
    historicalCrmEvents: historicalCrm.length,
  };
}
