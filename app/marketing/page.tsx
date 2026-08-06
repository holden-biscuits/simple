import { RolePage } from "../components/role-page";

export default function MarketingPage() {
  return <RolePage code="MKT" title="Get the event ready before the team arrives." intro="Marketing coordinates the contract, event presence, materials, promotion, and lead-capture setup. After the event, marketing reconciles the results and stores what the next team will need." sections={[
    { label: "Plan", title: "Confirm the brief", items: ["Confirm the contract, sponsor deliverables, booth footprint, speaking slot, guaranteed meetings, and deadlines.", "Create the landing page, promotion plan, and source-tracked forms or QR codes.", "Write down the audience, message, target accounts, goals, and final attendee roster.", "Assign an owner to each workstream. Use ‘None’ when no activity is planned."] },
    { label: "Produce", title: "Prepare the event materials", items: ["Finish the booth, backdrop, hardware, shipping, lead capture, and session assets.", "Order swag by value tier and document who can distribute premium items.", "Rehearse the speaking content and send invitations before the event.", "Plan dinners, parties, raffle mechanics, photos, and VIP demos separately so each has an owner and deadline."] },
    { label: "Close", title: "Reconcile the event", items: ["Match every list and form to the sales notes. Do not leave event contacts in private spreadsheets.", "Publish a short recap with attendance, meetings, demos, pipeline, content, and lessons.", "Update the conference tracker, Notion project, budget, and vendor notes.", "Hold the debrief and record what the team should repeat, change, or stop."] },
  ]} handoff="The event is finished when the contacts are usable, the numbers match, the files are stored, and the next team can find the lessons." />;
}
