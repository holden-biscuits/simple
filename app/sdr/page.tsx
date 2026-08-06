import { RolePage } from "../components/role-page";

export default function SDRPage() {
  return <RolePage code="SDR" title="Build the signal before the noise." intro="SDRs turn attendee data and field conversations into a clean, prioritized queue. The job is orchestration: the right person, the right reason, the right moment." sections={[
    { label: "Before", title: "Create the meeting surface", items: ["Import, enrich and deduplicate attendee or sponsor-provided lists.", "Segment named accounts, active opportunities, VIPs and high-fit net-new contacts.", "Run one coordinated pre-event sequence with a specific meeting or session CTA.", "Stop ‘see you next week’ language when the event begins; switch to on-site timing and location."] },
    { label: "On site", title: "Qualify at the point of contact", items: ["Capture badge scans, booth conversations, dinners, parties, session attendance, raffle entries and meeting notes.", "Use Granola for substantive conversations and route qualified people to the right AE.", "Classify the interaction before the day ends: meeting, demo, engaged, or attendee-only.", "Invite strong-fit contacts to the highest-value available next step."] },
    { label: "After", title: "Turn raw contacts into a queue", items: ["Merge every lead source and deduplicate before outreach.", "Tier contacts: 1 meeting booked, 2 premium voucher/signup, 3 real engagement, 4 other attendees.", "Apply the event tag, SDR attribution and opportunity-source detail.", "Launch personalized tier-one and tier-two follow-up first; sequence the rest only after ownership is clear."] },
  ]} handoff="No orphaned contacts: every record has a source, tier, owner, note and next action." />;
}
