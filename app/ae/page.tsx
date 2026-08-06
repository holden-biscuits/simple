import { RolePage } from "../components/role-page";

export default function AEPage() {
  return <RolePage code="AE" title="Turn presence into progress." intro="AEs own the quality of the conversation, the clarity of the next step, and the context that makes follow-up feel inevitable—not generic." sections={[
    { label: "Before", title: "Know who matters", items: ["Review the target account and VIP list; assign owners before travel.", "Research the account, current motion and likely pain before every guaranteed or pre-booked meeting.", "Prepare a personalized demo for high-value people; invite the right contacts to the session, dinner or VIP activation.", "Make the next-step ask explicit before the event starts."] },
    { label: "On site", title: "Capture the real conversation", items: ["Keep Granola on for every meaningful conversation and meeting.", "Write the problem, urgency, stakeholders and next step—not just that you met.", "Route engaged people to the speaking session and help them add it to their calendar.", "Use swag by value tier: small for traffic, meaningful for contact capture, premium only after a real demo or commitment."] },
    { label: "After", title: "Move while memory is warm", items: ["Send a personal follow-up with one clear call to action.", "Confirm every meeting and demo is represented in the tracker and CRM.", "Apply the event campaign/tag and opportunity-source fields defined for the event.", "Escalate tier-one leads immediately; do not wait for a broad nurture motion."] },
  ]} handoff="A complete note has account context, what changed, who owns the next action, and the date it will happen." />;
}
