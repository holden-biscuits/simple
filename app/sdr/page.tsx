import { RolePage } from "../components/role-page";

export default function SDRPage() {
  return <RolePage code="SDR" title="Build the list before anyone travels." intro="SDRs prepare the account list, coordinate pre-event outreach, and turn the contacts collected on site into an ordered follow-up queue." sections={[
    { label: "Before", title: "Prepare the target list", items: ["Import, enrich, and deduplicate the attendee and sponsor-provided lists.", "Separate named accounts, active opportunities, VIPs, and strong net-new prospects.", "Run one coordinated sequence with a specific meeting or session ask.", "When the event begins, stop using ‘see you next week’ copy. Use the current day, time, and location."] },
    { label: "On site", title: "Classify each interaction", items: ["Collect badge scans, booth conversations, dinner and party contacts, session attendees, raffle entries, and meeting notes.", "Use Granola for substantive conversations and send qualified contacts to the right AE.", "Before the day ends, mark each contact as meeting, demo, engaged, or attendee-only.", "Invite strong-fit contacts to the next useful step available at that event."] },
    { label: "After", title: "Build the follow-up queue", items: ["Combine every lead source and remove duplicates before outreach begins.", "Tier contacts: 1 for a booked meeting, 2 for a premium signup, 3 for real engagement, and 4 for other attendees.", "Add the event tag, SDR attribution, and opportunity-source detail.", "Start with tier-one and tier-two contacts. Sequence the rest after each record has an owner."] },
  ]} handoff="Every contact needs a source, tier, owner, useful note, and next action." />;
}
