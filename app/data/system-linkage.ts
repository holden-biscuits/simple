import { getEventPhase, type EventRecord } from "./events.ts";

export type LinkageState = "Located" | "Legacy join" | "Setup needed";

export type SystemLinkage = {
  system: "Conference tracker" | "Notion" | "Events Drive" | "HubSpot";
  state: LinkageState;
  detail: string;
};

export function getEventSystemLinkage(event: EventRecord): SystemLinkage[] {
  const tracker: SystemLinkage = {
    system: "Conference tracker",
    state: "Located",
    detail: "The source row is in the catalog. Its permanent Event key column still needs to be added upstream.",
  };

  if (event.status === "No") return [tracker];

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
    {
      system: "HubSpot",
      state: event.crmSnapshot ? "Legacy join" : "Setup needed",
      detail: event.crmSnapshot
        ? "The event resolves through controlled legacy fields; the canonical Event key property is still missing."
        : "No exact event association is available in the governed CRM snapshot.",
    },
  ];
}

export function getProgramSystemLinkage(catalog: EventRecord[], programDate: string) {
  const active = catalog.filter((event) => getEventPhase(event, programDate) !== "past" && event.status !== "No");
  const activeNotion = active.filter((event) => Boolean(event.notionUrl));
  const activeCrm = active.filter((event) => Boolean(event.crmSnapshot));
  const historicalCrm = catalog.filter((event) => Boolean(event.crmSnapshot));

  return {
    totalEvents: catalog.length,
    activeEvents: active.length,
    stableFieldbookKeys: catalog.length,
    trackerRowsLocated: catalog.length,
    activeNotionProjects: activeNotion.length,
    activeNotionMissing: active.filter((event) => !event.notionUrl).map((event) => ({ key: event.slug, name: event.name })),
    activeDriveFolders: 0,
    activeCrmEvents: activeCrm.length,
    historicalCrmEvents: historicalCrm.length,
  };
}
