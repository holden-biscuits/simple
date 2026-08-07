import type { EventRecord } from "./events.ts";

export type ProspectingFilter = {
  label: string;
  value: string;
};

export type ProspectingProfileKey =
  | "contact-center"
  | "executive-exchange"
  | "retail"
  | "retail-exchange"
  | "genesys"
  | "nice"
  | "travel-hospitality"
  | "named-attendees-only"
  | "not-attending";

export type HubSpotProspectingSegment = {
  name: string;
  size: number;
  kind: "Static snapshot" | "Active segment";
  checkedAt: string;
  url: string;
};

export type EventProspectingBrief = {
  profile: ProspectingProfileKey;
  summary: string;
  companyFilters: ProspectingFilter[];
  contactFilters: ProspectingFilter[];
  workflow: string;
  confidence: "Event-shaped audience" | "Matched-account qualification" | "Names required" | "No active plan";
  zoomInfoCompanyUrl: string;
  zoomInfoContactUrl: string;
  hubspotStrategy: "maintained-segment" | "account-searches" | "zoominfo-only";
  hubspotSegment?: HubSpotProspectingSegment;
  hubspotAccountLinks: { name: string; url: string }[];
};

const hubspotAccountId = "245561359";
const zoomInfoCompanyUrl = "https://app.zoominfo.com/#/apps/searchV2/v2/results/company";
const zoomInfoContactUrl = "https://app.zoominfo.com/#/apps/searchV2/v2/results/person";

const profileBySlug: Record<string, ProspectingProfileKey> = {
  "ccw-orlando": "contact-center",
  "ccw-exchange-san-diego": "executive-exchange",
  "hbs-women-in-business": "named-attendees-only",
  "ccw-exchange-austin": "executive-exchange",
  "shoptalk-spring": "retail",
  "ccw-cxo-exchange-charlotte": "executive-exchange",
  "the-lead-summit": "retail",
  "nice-world": "nice",
  "ccw-vegas": "contact-center",
  "iqpc-cx-retail-uk": "retail-exchange",
  "ccw-exchange-denver": "executive-exchange",
  "consero-summit": "named-attendees-only",
  "ccw-exchange-chicago": "executive-exchange",
  "contact-io": "not-attending",
  "genesys-xperience": "genesys",
  "iqpc-cx-travel-hospitality": "travel-hospitality",
  "customer-connect-expo": "contact-center",
  "iqpc-cx-retail-atlanta": "retail-exchange",
  "shoptalk-fall": "not-attending",
  "consero-cx-forum": "executive-exchange",
  "ccw-amsterdam": "not-attending",
  "ccw-nashville": "contact-center",
  "icmi-contact-center-expo": "contact-center",
  "ccw-uk-executive-exchange": "executive-exchange",
  "ccw-executive-exchange-miami": "executive-exchange",
  "reuters-customer-service-east": "contact-center",
  "ccw-orlando-2027": "contact-center",
  "ccw-uk-executive-exchange-2027": "executive-exchange",
  "ccw-vegas-2027": "contact-center",
};

const liveSegments: Partial<Record<string, HubSpotProspectingSegment>> = {
  "ccw-vegas": {
    name: "Enriched ZI List — matched CCW attendees (pre-show)",
    size: 608,
    kind: "Static snapshot",
    checkedAt: "Aug 7, 2026",
    url: "https://app.hubspot.com/contacts/245561359/objectLists/62?utm_source=event_fieldbook&utm_medium=event_prospecting&utm_campaign=ccw_vegas_2026",
  },
  "nice-world": {
    name: "NiCE World 2026 — Tommy Prospects",
    size: 254,
    kind: "Static snapshot",
    checkedAt: "Aug 7, 2026",
    url: "https://app.hubspot.com/contacts/245561359/objectLists/46?utm_source=event_fieldbook&utm_medium=event_prospecting&utm_campaign=nice_world_2026",
  },
};

const commonContacts: ProspectingFilter[] = [
  { label: "Job function", value: "Customer service, operations, information technology" },
  { label: "Management level", value: "C-level, VP, director" },
  { label: "Job title", value: "Chief Customer Officer; VP/Head of Customer Experience, Customer Service, Customer Care, Contact Center or Support; Contact Center Operations; Conversational AI" },
];

function geography(event: EventRecord) {
  return /London|Amsterdam|UK/i.test(event.location) ? "United Kingdom and Europe" : "United States";
}

function profileFor(event: EventRecord, profile: ProspectingProfileKey): Omit<EventProspectingBrief, "profile" | "zoomInfoCompanyUrl" | "zoomInfoContactUrl" | "hubspotSegment" | "hubspotAccountLinks" | "hubspotStrategy"> {
  const region = geography(event);
  if (profile === "genesys") return {
    summary: "Prioritize large Genesys customers with meaningful inbound call volume and a customer-service leader who can own a voice-AI evaluation. TeamSimple is the only external voice-AI partner in the current sponsor plan, so relevance starts with Genesys usage—not a generic CX title list.",
    companyFilters: [
      { label: "Technology products", value: "Genesys" },
      { label: "Company attribute", value: "Has a call center" },
      { label: "Employees", value: "500+" },
      { label: "Revenue", value: "$100M+" },
      { label: "Location", value: region },
    ],
    contactFilters: commonContacts,
    workflow: "Start with the technology filter, then cross-check names in the Xperience app. Enrich the named people and route only qualified accounts to an AE.",
    confidence: "Event-shaped audience",
  };
  if (profile === "nice") return {
    summary: "Prioritize enterprise NiCE customers with complex inbound service operations and leaders responsible for contact-center performance, automation, or customer experience.",
    companyFilters: [
      { label: "Technology products", value: "NiCE or CXone" },
      { label: "Company attribute", value: "Has a call center" },
      { label: "Employees", value: "500+" },
      { label: "Revenue", value: "$100M+" },
      { label: "Location", value: region },
    ],
    contactFilters: commonContacts,
    workflow: "Use the event app or known attendee list to narrow the technographic audience. The HubSpot segment is the working contact view; ZoomInfo is the enrichment and net-new route.",
    confidence: "Event-shaped audience",
  };
  if (profile === "retail" || profile === "retail-exchange") return {
    summary: profile === "retail-exchange"
      ? "Use the organizer's matched-account schedule as the attendance truth. Qualify for retailers and consumer brands with enough service volume and operating complexity to justify a voice-AI conversation."
      : "Prioritize scaled retailers, e-commerce businesses, and consumer brands with high-volume customer-service or order-support operations—not every brand at the show.",
    companyFilters: [
      { label: "Industry", value: "Retail, e-commerce, consumer products, apparel & accessories, food & beverage" },
      { label: "Company attribute", value: "Has a call center" },
      { label: "Employees", value: "200+" },
      { label: "Revenue", value: "$50M+" },
      { label: "Location", value: region },
    ],
    contactFilters: [
      { label: "Job function", value: "Customer service, operations, e-commerce, information technology" },
      { label: "Management level", value: "C-level, VP, director" },
      { label: "Job title", value: "Customer Experience, Customer Care, Contact Center, Support, Digital Operations, E-commerce Operations" },
    ],
    workflow: profile === "retail-exchange"
      ? "Do not manufacture an attendee list. Start with the matched accounts, use these filters to prioritize them, and enrich the named buyers in ZoomInfo."
      : "Start with the event app and sponsor/meeting evidence, then apply these filters. Use HubSpot only for companies already grounded in a named event signal.",
    confidence: profile === "retail-exchange" ? "Matched-account qualification" : "Event-shaped audience",
  };
  if (profile === "travel-hospitality") return {
    summary: "Use the organizer's matched accounts, then prioritize travel and hospitality operators with large reservation, guest-service, loyalty, or disruption call volumes.",
    companyFilters: [
      { label: "Industry", value: "Hospitality, airlines, travel agencies & services, transportation, leisure" },
      { label: "Company attribute", value: "Has a call center" },
      { label: "Employees", value: "500+" },
      { label: "Revenue", value: "$100M+" },
      { label: "Location", value: region },
    ],
    contactFilters: [
      { label: "Job function", value: "Customer service, operations, information technology" },
      { label: "Management level", value: "C-level, VP, director" },
      { label: "Job title", value: "Guest Experience, Customer Care, Contact Center, Reservations, Loyalty, Service Operations" },
    ],
    workflow: "The matched-meeting list is the attendance source. Use ZoomInfo to qualify companies and enrich named contacts; do not create a parallel guessed roster.",
    confidence: "Matched-account qualification",
  };
  if (profile === "executive-exchange") return {
    summary: "Treat the organizer's matched-account list as the audience. Prioritize companies with a real contact-center operation and senior owners of customer service, CX, support, or automation.",
    companyFilters: [
      { label: "Company attribute", value: "Has a call center" },
      { label: "Employees", value: "500+" },
      { label: "Revenue", value: "$100M+" },
      { label: "Location", value: region },
    ],
    contactFilters: commonContacts,
    workflow: "Use ZoomInfo to qualify and enrich the organizer's matched accounts. This is a meeting-led event, so no inferred HubSpot attendee segment should be created.",
    confidence: "Matched-account qualification",
  };
  if (profile === "contact-center") return {
    summary: "Prioritize scaled organizations with meaningful inbound service volume, a real contact-center operation, and a senior owner who can evaluate automation or voice AI.",
    companyFilters: [
      { label: "Company attribute", value: "Has a call center" },
      { label: "Employees", value: "500+" },
      { label: "Revenue", value: "$100M+" },
      { label: "Location", value: region },
      { label: "Technology products", value: "Genesys, NiCE/CXone, Five9, Talkdesk or another enterprise CCaaS platform" },
    ],
    contactFilters: commonContacts,
    workflow: "Start with names and companies from the event app, sponsor file, meetings, booth scans, or sessions. Use the filters to prioritize and enrich—not to claim attendance.",
    confidence: "Event-shaped audience",
  };
  if (profile === "not-attending") return {
    summary: "There is no active TeamSimple prospecting plan for this event. If a real attendee or company signal appears, verify it in ZoomInfo before deciding whether it belongs in another campaign.",
    companyFilters: [{ label: "Starting point", value: "Known attendee or company names only" }],
    contactFilters: [{ label: "Starting point", value: "Named contacts from a credible event source only" }],
    workflow: "Research only. Do not build or maintain an event segment while TeamSimple is not attending.",
    confidence: "No active plan",
  };
  return {
    summary: "There is not enough evidence to infer a useful company audience from the event brand alone. Start with named attendees, speakers, or companies from the app or organizer materials.",
    companyFilters: [{ label: "Starting point", value: "Known attendee companies from the event app or organizer materials" }],
    contactFilters: [{ label: "Starting point", value: "Named attendees and speakers; then filter by customer-service relevance" }],
    workflow: "Open ZoomInfo only after a name or company is known. Do not create a speculative HubSpot segment.",
    confidence: "Names required",
  };
}

function accountSearchUrl(name: string) {
  return `https://app.hubspot.com/contacts/${hubspotAccountId}/objects/0-1/views/all/list?query=${encodeURIComponent(name)}&utm_source=event_fieldbook&utm_medium=event_prospecting`;
}

export function getEventProspectingBrief(event: EventRecord): EventProspectingBrief {
  const profile = profileBySlug[event.slug] ?? (event.status === "No" ? "not-attending" : "named-attendees-only");
  const base = profileFor(event, profile);
  const hubspotSegment = liveSegments[event.slug];
  const canUseGroundedAccounts = !["executive-exchange", "retail-exchange", "travel-hospitality", "named-attendees-only", "not-attending"].includes(profile);
  const hubspotAccountLinks = hubspotSegment || !canUseGroundedAccounts
    ? []
    : [...new Set(event.meetingsBooked)].slice(0, 3).map((name) => ({ name, url: accountSearchUrl(name) }));
  return {
    profile,
    ...base,
    zoomInfoCompanyUrl,
    zoomInfoContactUrl,
    hubspotSegment,
    hubspotAccountLinks,
    hubspotStrategy: hubspotSegment ? "maintained-segment" : hubspotAccountLinks.length ? "account-searches" : "zoominfo-only",
  };
}

export function hasExplicitProspectingProfile(slug: string) {
  return Object.hasOwn(profileBySlug, slug);
}

export const prospectingTaxonomySource = "ZoomInfo company filters: industry, revenue, employee count, location, technology products and company attributes. Contact filters: job function, title and management level.";
