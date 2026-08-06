import Link from "next/link";
import { SiteHeader } from "../components/site-header";
import { Footer } from "../components/footer";
import { workstreamLabels } from "../data/events";

const timeline = [
  ["T−8 to T−6 weeks", "Decide & contract", "Confirm fit, status, budget, sponsor package, speaking, meetings and owner."],
  ["T−6 to T−4 weeks", "Message & target", "Build target accounts, landing page, session narrative, attendee roster and promotion plan."],
  ["T−4 to T−2 weeks", "Produce & book", "Finish creative and demos, order materials, book travel and secure meetings."],
  ["T−2 to T−0 weeks", "Rehearse & ship", "Rehearse content, confirm logistics, ship event materials and brief every attendee."],
  ["Event days", "Capture & qualify", "Keep Granola on, log context, tier the interaction and make a next-step ask."],
  ["T+0 to T+2 days", "Reconcile & act", "Merge sources, dedupe, tag, route and send personalized follow-up."],
  ["T+7 days", "Debrief & learn", "Reconcile outcomes and budget; document repeat, change and stop decisions."],
];

export default function GuidesPage() {
  return (
    <main>
      <SiteHeader />
      <section className="role-hero guides-hero">
        <p className="eyebrow">Event process</p>
        <h1>How we prepare, work the floor, and follow up.</h1>
        <p className="lede">Every event page uses the same nine workstreams. If the team is not doing something, the page says “None.”</p>
      </section>
      <section className="shell guide-layout">
        <article className="guide-panel">
          <p className="eyebrow">Workstream directory</p>
          <h2>The standard event checklist.</h2>
          <div className="workstream-index">
            {Object.values(workstreamLabels).map((label, index) => <div key={label}><span>{String(index + 1).padStart(2, "0")}</span><strong>{label}</strong></div>)}
          </div>
        </article>
      </section>
      <section className="shell timeline">
        <div className="section-intro"><p className="eyebrow">Suggested sequence</p><h2>Use the timing that fits the event.</h2><p>These are planning windows, not performance deadlines. Adjust them to the event.</p></div>
        {timeline.map(([time, title, body]) => <article key={time}><time>{time}</time><h3>{title}</h3><p>{body}</p></article>)}
      </section>
      <section className="shell tiering">
        <div><p className="eyebrow">Lead tiers</p><h2>Follow up in this order.</h2></div>
        <ol>
          <li><span>1</span><div><strong>Meeting booked</strong><p>Fast, personal AE follow-up with a dated next step.</p></div></li>
          <li><span>2</span><div><strong>Premium activation</strong><p>Omaha Steaks voucher or equivalent high-intent signup.</p></div></li>
          <li><span>3</span><div><strong>Meaningful engagement</strong><p>Booth, session, dinner or event interaction without a meeting.</p></div></li>
          <li><span>4</span><div><strong>Attendee only</strong><p>Known attendee without demonstrated engagement.</p></div></li>
        </ol>
      </section>
      <section className="shell role-links">
        <Link href="/ae"><span>AE field guide</span><b>↗</b></Link>
        <Link href="/sdr"><span>SDR field guide</span><b>↗</b></Link>
        <Link href="/marketing"><span>Marketing field guide</span><b>↗</b></Link>
      </section>
      <Footer />
    </main>
  );
}
