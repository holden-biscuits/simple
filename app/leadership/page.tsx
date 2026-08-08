import type { Metadata } from "next";
import Link from "next/link";
import { BackToTop, PageContentsLayout } from "../components/page-contents";
import { Footer } from "../components/footer";
import { PageMascot } from "../components/page-mascot";
import { SiteHeader } from "../components/site-header";
import { events, getProgramDate } from "../data/events";
import { getLeadershipBrief } from "../data/leadership-brief";

export const metadata: Metadata = {
  title: "Leadership brief · Event Basecamp",
  description: "The TeamSimple event portfolio, immediate priorities, and attributable outcomes.",
};

export const dynamic = "force-dynamic";

export default function LeadershipPage() {
  const brief = getLeadershipBrief(events, getProgramDate());
  const priorities = brief.portfolio.filter((item) => item.readiness.nextAction);

  return (
    <main id="page-top">
      <SiteHeader />
      <section className="role-hero leadership-hero leadership-hero-quiet">
        <div className="role-hero-copy">
          <p className="eyebrow">Leadership brief</p>
          <h1>The program, the next moves, and the results.</h1>
          <p className="lede">Start with the portfolio. Escalate decisions that change participation, spend, staffing, or the customer experience.</p>
        </div>
        <PageMascot variant="leadership" />
      </section>

      <PageContentsLayout primaryLabel="Leadership brief" items={[
        { id: "leadership-snapshot", label: "At a glance" },
        { id: "leadership-portfolio", label: "Portfolio" },
        { id: "leadership-decisions", label: "Next moves" },
        { id: "leadership-outcomes", label: "Outcomes" },
      ]}>
        <section className="shell leadership-snapshot" id="leadership-snapshot">
          <div className="section-intro"><p className="eyebrow">At a glance</p><h2>What matters now.</h2></div>
          <div className="leadership-metrics">
            <article><strong>{brief.pulse.active.length}</strong><span>Active events</span></article>
            <article><strong>{brief.pulse.next60Days.length}</strong><span>Within 60 days</span></article>
            <article className={brief.pulse.rosterGaps.length ? "metric-attention" : "metric-good"}><strong>{brief.pulse.rosterGaps.length}</strong><span>Rosters incomplete</span></article>
            <article className={priorities.length ? "metric-attention" : "metric-good"}><strong>{priorities.length}</strong><span>Next moves open</span></article>
          </div>
          <BackToTop />
        </section>

        <section className="leadership-portfolio" id="leadership-portfolio">
          <div className="shell">
            <div className="section-intro"><p className="eyebrow">Portfolio</p><h2>Every active commitment.</h2></div>
            <div className="leadership-table-wrap">
              <table className="leadership-table leadership-table-quiet">
                <thead><tr><th>Event</th><th>Activation</th><th>Team</th><th>Next move</th></tr></thead>
                <tbody>{brief.portfolio.map((item) => <tr key={item.eventKey}>
                  <th scope="row"><Link href={`/events/${item.eventKey}`}>{item.name}</Link><time dateTime={item.dateSort}>{item.dates}</time><small>{item.location}{item.phase === "now" ? " · happening now" : ""}</small></th>
                  <td data-label="Activation">{item.activation}</td>
                  <td data-label="Team"><strong>{item.staffing.summary}</strong>{item.staffing.state === "open" ? <small>{item.staffing.detail}</small> : null}</td>
                  <td data-label="Next move">{item.readiness.nextAction ? <><Link href={item.readiness.nextAction.href}>{item.readiness.nextAction.title}</Link><small>{item.readiness.nextAction.owner ? `Owner · ${item.readiness.nextAction.owner}` : "Owner · Open"} · {item.readiness.nextAction.due ? `Due · ${item.readiness.nextAction.due}` : "Due · Open"}</small></> : <span>Plan complete</span>}</td>
                </tr>)}</tbody>
              </table>
            </div>
            <BackToTop />
          </div>
        </section>

        <section className="shell leadership-decisions" id="leadership-decisions">
          <div className="section-intro"><p className="eyebrow">Next moves</p><h2>Open work with an owner—or an owner still needed.</h2></div>
          <ol className="leadership-priority-list">{priorities.map((item, index) => <li key={item.eventKey}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div><small>{item.name} · {item.dates}</small><h3>{item.readiness.nextAction!.title}</h3><p>{item.readiness.nextAction!.owner ? `Owner: ${item.readiness.nextAction!.owner}` : "Owner needed"} · {item.readiness.nextAction!.due ? `Due ${item.readiness.nextAction!.due}` : "Due date needed"}</p></div>
            <Link href={item.readiness.nextAction!.href}>Open →</Link>
          </li>)}</ol>
          <BackToTop />
        </section>

        <section className="leadership-outcomes" id="leadership-outcomes">
          <div className="shell">
            <div className="section-intro"><p className="eyebrow">Outcomes</p><h2>What the program has produced.</h2></div>
            <div className="leadership-outcome-grid">
              <article><span>Event opportunities</span><strong>{brief.outcomes.qualifyingOpportunities}</strong></article>
              <article><span>Open pipeline</span><strong>${brief.outcomes.openPipeline.toLocaleString()}</strong></article>
              <article><span>Closed-won revenue</span><strong>${brief.outcomes.closedWonRevenue.toLocaleString()}</strong></article>
              <article><span>Completed closeouts</span><strong>{brief.closeout.complete} / {brief.closeout.completedEvents}</strong></article>
            </div>
            <div className="leadership-outcome-note"><p>{brief.closeout.openCategories} outcome categories still need to be recorded across completed events.</p><Link href="/?attendance=going&attention=closeout#events">Open incomplete closeouts →</Link><Link href="/marketing#event-pipeline">Open event pipeline →</Link></div>
            <BackToTop />
          </div>
        </section>
      </PageContentsLayout>
      <Footer />
    </main>
  );
}
