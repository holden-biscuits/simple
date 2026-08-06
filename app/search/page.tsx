import type { Metadata } from "next";
import { Footer } from "../components/footer";
import { SiteHeader } from "../components/site-header";
import { SiteSearch, type SearchRecord } from "../components/site-search";
import { events, getWorkstreams, workstreamLabels } from "../data/events";

export const metadata: Metadata = { title: "Search · Event Basecamp" };

const referenceRecords: SearchRecord[] = [
  { type: "Guide", title: "Standard event checklist", href: "/guides#standard-checklist", description: "The nine workstreams used to plan every event.", keywords: Object.values(workstreamLabels).join(" ") },
  { type: "Guide", title: "Planning sequence", href: "/guides#planning-sequence", description: "Suggested planning windows from contract through debrief.", keywords: "timeline t-minus production travel ship rehearse follow-up" },
  { type: "Guide", title: "ZoomInfo for events", href: "/guides#zoominfo", description: "Use event apps, attendee names, technographics, and ICP filters to build a useful list.", keywords: "prospecting mobile app attendees contacts technology vendor HubSpot" },
  { type: "Guide", title: "Booth etiquette", href: "/guides#booth-etiquette", description: "Coverage, breaks, attention, handoffs, food, phones, and keeping the booth approachable.", keywords: "sit eating team questions floor visitor coverage" },
  { type: "Guide", title: "Lead tiers", href: "/guides#lead-tiers", description: "Prioritize meeting-booked, premium activation, meaningful engagement, and attendee-only contacts.", keywords: "follow-up lead capture tier qualification" },
  { type: "Role", title: "AE field guide", href: "/ae", description: "Account preparation, onsite discovery, demos, HubSpot notes, Granola, and next steps.", keywords: "account executive meeting hypothesis deal booked meeting CRM follow-up" },
  { type: "Role", title: "SDR field guide", href: "/sdr", description: "Targeting, event outreach, qualification, handoffs, and post-event follow-up.", keywords: "sales development representative sequence phone email LinkedIn ZoomInfo event app" },
  { type: "Operations", title: "Marketing operations", href: "/marketing", description: "Event support matrix, operating lessons, production, capture, reporting, and measurement.", keywords: "campaign creative booth contract sponsor deliverables ROI budget support matrix lessons" },
  { type: "Operations", title: "Source monitor and approval queue", href: "/sources", description: "What controls the site, what the recurring scan checks, and which source conflicts need a decision.", keywords: "source hierarchy conference tracker notion google drive slack gmail hubspot granola monaco contracts files automation cadence conflict approval queue" },
];

const eventRecords: SearchRecord[] = events.map((event) => {
  const outcomeCounts = [
    event.meetingsBooked.length ? `${event.meetingsBooked.length} meeting${event.meetingsBooked.length === 1 ? "" : "s"}` : "",
    event.demosBooked.length ? `${event.demosBooked.length} demo${event.demosBooked.length === 1 ? "" : "s"}` : "",
    event.closed.length ? `${event.closed.length} closed` : "",
    event.crmSnapshot ? `${event.crmSnapshot.totalDeals} HubSpot deal${event.crmSnapshot.totalDeals === 1 ? "" : "s"}` : "",
  ].filter(Boolean).join(" · ");
  const details = [
    event.venue ? `Venue · ${event.venue}` : "",
    event.team.length ? `Team · ${event.team.join(", ")}` : "",
    event.available.length ? `Available · ${event.available.join(", ")}` : "",
    `Speaking · ${event.speaking}`,
    `Sponsorship · ${event.sponsorship}`,
    `Guaranteed meetings · ${event.guaranteedMeetings}`,
    event.notes ? `Plan note · ${event.notes}` : "",
    event.credentials ? `Credentials · ${event.credentials}` : "",
    ...(event.specialConsiderations ?? []).map((item) => `Rule · ${item}`),
    ...(event.priorityActions ?? []).map((item) => `Open item · ${item}`),
    ...(event.relatedLinks ?? []).map((link) => `Link · ${link.label}`),
    ...(event.outcomeNotes ?? []).map((item) => `Result · ${item}`),
    ...Object.entries(getWorkstreams(event)).flatMap(([key, items]) => items.map((item) => `${workstreamLabels[key as keyof typeof workstreamLabels]} · ${item}`)),
    ...event.meetingsBooked.map((item) => `Meeting · ${item}`),
    ...event.demosBooked.map((item) => `Demo · ${item}`),
    ...event.closed.map((item) => `Closed · ${item}`),
    ...(event.crmSnapshot ? [
      `${event.crmSnapshot.system} attribution · ${event.crmSnapshot.attribution}`,
      `${event.crmSnapshot.system} deals · ${event.crmSnapshot.totalDeals}`,
      ...event.crmSnapshot.stages.map((stage) => `${event.crmSnapshot?.system} stage · ${stage.label}: ${stage.count}`),
      `Data quality · ${event.crmSnapshot.dataQualityNote}`,
    ] : []),
  ].filter(Boolean);
  return {
    type: "Event",
    title: event.name,
    href: `/events/${event.slug}`,
    description: `${event.dates} · ${event.location}${event.venue ? ` · ${event.venue}` : ""} · ${event.status === "No" ? "Not attending" : event.status}${outcomeCounts ? ` · ${outcomeCounts} recorded` : ""}`,
    keywords: details.join(" "),
    details,
  };
});

export default function SearchPage() {
  return <main id="page-top"><SiteHeader /><section className="search-hero"><p className="eyebrow">Fieldbook search</p><h1>Find the detail, not the page.</h1><p>Search events, cities, people, tools, workstreams, meeting records, and role instructions.</p></section><SiteSearch records={[...referenceRecords, ...eventRecords]} /><Footer /></main>;
}
