import Link from "next/link";
import { SiteHeader } from "../components/site-header";
import { Footer } from "../components/footer";
import { BackToTop, PageContents } from "../components/page-contents";
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
    <main id="page-top">
      <SiteHeader />
      <section className="role-hero guides-hero">
        <p className="eyebrow">Event process</p>
        <h1>How we prepare, work the floor, and follow up.</h1>
        <p className="lede">Event pages show the field workstreams that apply. Empty sections stay out of the way, while marketing production and budget work live in the event tabs on the marketing page.</p>
      </section>
      <PageContents items={[
        { id: "standard-checklist", label: "Standard checklist" },
        { id: "planning-sequence", label: "Planning sequence" },
        { id: "zoominfo", label: "ZoomInfo" },
        { id: "booth-etiquette", label: "Booth etiquette" },
        { id: "lead-tiers", label: "Lead tiers" },
        { id: "role-guides", label: "Role guides" },
      ]} />
      <section className="shell guide-layout">
        <article className="guide-panel" id="standard-checklist">
          <p className="eyebrow">Workstream directory</p>
          <h2>The standard event checklist.</h2>
          <div className="workstream-index">
            {Object.values(workstreamLabels).map((label, index) => <div key={label}><span>{String(index + 1).padStart(2, "0")}</span><strong>{label}</strong></div>)}
          </div>
          <BackToTop />
        </article>
      </section>
      <section className="shell timeline" id="planning-sequence">
        <div className="section-intro"><p className="eyebrow">Suggested sequence</p><h2>Use the timing that fits the event.</h2><p>These are planning windows, not performance deadlines. Adjust them to the event.</p></div>
        {timeline.map(([time, title, body]) => <article key={time}><time>{time}</time><h3>{title}</h3><p>{body}</p></article>)}
        <BackToTop />
      </section>
      <section className="role-grid shell">
        <article className="role-block" id="zoominfo">
          <div className="role-number">01</div>
          <div>
            <p className="eyebrow">Prospecting</p>
            <h2>Use ZoomInfo before and during the event.</h2>
            <ul>
              <li>AEs and SDRs should download the event mobile app as soon as attendee access opens. Use it to find attendees, companies, sessions, and meeting opportunities.</li>
              <li>Use names and companies from the mobile app to find and verify work emails, direct numbers, titles, and account ownership in <a className="inline-link" href="https://app.zoominfo.com/" target="_blank" rel="noreferrer">ZoomInfo ↗</a>.</li>
              <li>For vendor-specific events, use <a className="inline-link" href="https://app.zoominfo.com/" target="_blank" rel="noreferrer">ZoomInfo technographics ↗</a> to find companies using that vendor’s technology, then layer in our ICP criteria and relevant account signals.</li>
              <li>Research two to four likely stakeholders per priority company instead of relying on one contact.</li>
              <li>Check <a className="inline-link" href="https://app.hubspot.com/" target="_blank" rel="noreferrer">HubSpot ↗</a> ownership and remove duplicates before enrolling anyone in outreach. The event app supplies the lead; ZoomInfo enriches it; HubSpot holds the record.</li>
            </ul>
            <BackToTop />
          </div>
        </article>
        <article className="role-block" id="booth-etiquette">
          <div className="role-number">02</div>
          <div>
            <p className="eyebrow">On the floor</p>
            <h2>Booth etiquette.</h2>
            <ul>
              <li>Do not sit unless you are talking with someone who is also sitting. Do not eat at the booth; step away and coordinate coverage first.</li>
              <li>Stay attentive to people approaching the booth. Keep phones away, face the aisle, and acknowledge visitors quickly.</li>
              <li>Do not gather in a team huddle that blocks the booth or makes it feel closed. Leave clear space for someone to walk in.</li>
              <li>Coordinate coverage before taking a break or leaving for a meeting. At least one person should be ready to greet visitors.</li>
              <li>If someone asks a question you cannot answer, say so and bring in the right teammate. Make a warm introduction instead of pointing across the booth.</li>
              <li>After each conversation, capture the useful notes, clear away cups or materials, and reset the space for the next person.</li>
            </ul>
            <BackToTop />
          </div>
        </article>
      </section>
      <section className="shell tiering" id="lead-tiers">
        <div><p className="eyebrow">Lead tiers</p><h2>Follow up in this order.</h2><BackToTop /></div>
        <ol>
          <li><span>1</span><div><strong>Meeting booked</strong><p>Fast, personal AE follow-up with a dated next step.</p></div></li>
          <li><span>2</span><div><strong>Premium activation</strong><p>Omaha Steaks voucher or equivalent high-intent signup.</p></div></li>
          <li><span>3</span><div><strong>Meaningful engagement</strong><p>Booth, session, dinner or event interaction without a meeting.</p></div></li>
          <li><span>4</span><div><strong>Attendee only</strong><p>Known attendee without demonstrated engagement.</p></div></li>
        </ol>
      </section>
      <section className="shell role-links" id="role-guides">
        <Link href="/ae"><span>AE field guide</span><b>↗</b></Link>
        <Link href="/sdr"><span>SDR field guide</span><b>↗</b></Link>
        <Link href="/marketing"><span>Marketing field guide</span><b>↗</b></Link>
      </section>
      <div className="shell section-return"><BackToTop /></div>
      <Footer />
    </main>
  );
}
