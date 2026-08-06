import { RolePage } from "../components/role-page";

export default function AEPage() {
  return <RolePage code="AE" title="Prepare for the accounts you want to meet." intro="Read the account brief before the meeting. During the conversation, capture enough context for the next person to understand what changed and what should happen next." sections={[
    { label: "Before", title: "Do the account work", items: ["Review the target-account and VIP lists, then assign an owner to each priority account.", "Read the account history and active opportunities before every guaranteed or pre-booked meeting.", "Prepare a relevant demo for high-value contacts. Invite them to the right session, dinner, or VIP event.", "Decide what you want to ask for before the event starts."] },
    { label: "On site", title: "Record the useful details", items: ["Keep Granola on for meetings and substantive conversations.", "Write down the problem, urgency, stakeholders, and agreed next step.", "Help interested contacts add the speaking session to their calendar.", "Reserve premium gifts for contacts who complete a demo or share enough information for a real follow-up."] },
    { label: "After", title: "Follow up with context", items: ["Send a personal note with one clear next step.", "Add every meeting and demo to the tracker and CRM.", "Apply the event campaign, tag, and opportunity-source fields listed on the event page.", "Follow up with tier-one leads first. Put the remaining contacts into the right sequence after ownership is clear."] },
  ]} handoff="Your note should explain the account context, what changed in the conversation, who owns the next action, and when it is due." />;
}
