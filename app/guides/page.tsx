import Link from "next/link";
import { SiteHeader } from "../components/site-header";
import { Footer } from "../components/footer";
import { sourceLinks, workstreamLabels } from "../data/events";

const timeline = [
  ["T−8 to T−6", "Decide & contract", "Confirm fit, status, budget, sponsor package, speaking, meetings and owner."],
  ["T−6 to T−4", "Message & target", "Build target accounts, landing page, session narrative, attendee roster and promotion plan."],
  ["T−4 to T−2", "Produce & book", "Finish creative and demos, order materials, book travel and secure meetings."],
  ["T−2 to T−0", "Rehearse & ship", "Rehearse content, confirm logistics, ship the field kit and brief every attendee."],
  ["On site", "Capture & qualify", "Keep Granola on, log context, tier the interaction and make a next-step ask."],
  ["T+0 to T+2", "Reconcile & act", "Merge sources, dedupe, tag, route and send personalized follow-up."],
  ["T+7", "Debrief & learn", "Reconcile outcomes and budget; document repeat, change and stop decisions."],
];

export default function GuidesPage() {
  return (
    <main>
      <SiteHeader />
      <section className="role-hero guides-hero">
        <p className="eyebrow">Central rules & guides</p>
        <h1>One pattern.<br />Nine workstreams.</h1>
        <p className="lede">The CCW Vegas plan becomes the default operating system. Every event uses the same categories; a real absence is written as “None.”</p>
      </section>
      <section className="shell guide-layout">
        <article className="guide-panel source-order">
          <p className="eyebrow">Source hierarchy</p>
          <h2>Know what wins when sources disagree.</h2>
          <ol>
            <li><strong>Conference tracker</strong><span>Controls the event roster, dates, status and topline staffing.</span></li>
            <li><strong>Events in Notion</strong><span>Controls execution detail for active event projects.</span></li>
            <li><strong>Event page</strong><span>Publishes the combined operating view and official organizer link.</span></li>
          </ol>
          <div className="source-links vertical">
            <a href={sourceLinks.sheet} target="_blank" rel="noreferrer">Open tracker ↗</a>
            <a href={sourceLinks.notion} target="_blank" rel="noreferrer">Open Notion ↗</a>
            <a href={sourceLinks.ccwPlan} target="_blank" rel="noreferrer">Open Vegas reference ↗</a>
          </div>
        </article>
        <article className="guide-panel">
          <p className="eyebrow">Workstream directory</p>
          <h2>Every event answers the same questions.</h2>
          <div className="workstream-index">
            {Object.values(workstreamLabels).map((label, index) => <div key={label}><span>{String(index + 1).padStart(2, "0")}</span><strong>{label}</strong></div>)}
          </div>
        </article>
      </section>
      <section className="shell timeline">
        <div className="section-intro"><p className="eyebrow">Operating timeline</p><h2>Work backward from the room.</h2></div>
        {timeline.map(([time, title, body]) => <article key={time}><time>{time}</time><h3>{title}</h3><p>{body}</p></article>)}
      </section>
      <section className="shell tiering">
        <div><p className="eyebrow">Lead tiers</p><h2>Prioritize by demonstrated intent.</h2></div>
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
