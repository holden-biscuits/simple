import { RolePage } from "../components/role-page";

export default function MarketingPage() {
  return <RolePage code="MKT" title="Make the room work harder." intro="Marketing owns the system around the event: the promise before it, the physical experience inside it, and the evidence and data that survive it." sections={[
    { label: "Plan", title: "Lock the operating brief", items: ["Confirm contract, sponsorship deliverables, booth footprint, speaking slot, guaranteed meetings and deadlines.", "Create the event landing page, promotion plan and source-tracked forms or QR codes.", "Define audience, message, target accounts, goals and the final attendee roster.", "Assign all nine workstreams; use ‘None’ when there is no real activation."] },
    { label: "Produce", title: "Build the field kit", items: ["Finalize booth, backdrop, hardware, shipping, lead capture and session assets.", "Produce swag by value tier and document who can distribute premium items.", "Rehearse speaking content and publish invites before the event.", "Plan dinners, parties, raffle mechanics, photos and any VIP demos as distinct activations."] },
    { label: "Close", title: "Make the event legible", items: ["Reconcile every list and form with sales notes; no private spreadsheets after the event.", "Publish a short recap with attendance, meetings, demos, pipeline signals, content and lessons.", "Update the source sheet, Notion project, budget and vendor notes.", "Run a debrief, record what to repeat or stop, and close each workstream owner’s loop."] },
  ]} handoff="The event is done when the contacts are usable, the numbers reconcile, the assets are stored, and the next team can learn from it." />;
}
