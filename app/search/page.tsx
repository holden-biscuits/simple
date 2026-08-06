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
  { type: "Operations", title: "About this site’s sources", href: "/sources", description: "What the tracker, Notion, Events Drive, and individual event pages control.", keywords: "source hierarchy conference tracker notion google drive contracts files" },
];

const eventRecords: SearchRecord[] = events.map((event) => ({
  type: "Event",
  title: event.name,
  href: `/events/${event.slug}`,
  description: `${event.dates} · ${event.location} · ${event.status === "No" ? "Not attending" : event.status}`,
  keywords: [
    event.team.join(" "), event.available.join(" "), event.speaking, event.sponsorship,
    event.guaranteedMeetings, event.notes, event.credentials ?? "", event.rating,
    ...(event.specialConsiderations ?? []), ...Object.values(getWorkstreams(event)).flat(),
    ...event.meetingsBooked, ...event.demosBooked, ...event.closed,
  ].join(" "),
}));

export default function SearchPage() {
  return <main id="page-top"><SiteHeader /><section className="search-hero"><p className="eyebrow">Fieldbook search</p><h1>Find the detail, not the page.</h1><p>Search events, cities, people, tools, workstreams, meeting records, and role instructions.</p></section><SiteSearch records={[...referenceRecords, ...eventRecords]} /><Footer /></main>;
}
