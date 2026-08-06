import type { Metadata } from "next";
import { SiteHeader } from "../components/site-header";
import { Footer } from "../components/footer";
import { BackToTop, PageContents } from "../components/page-contents";
import { sourceLinks } from "../data/events";

export const metadata: Metadata = {
  title: "About this site’s sources · Event Basecamp",
  description: "Where the TeamSimple event program data comes from and which source controls each type of information.",
};

export default function SourcesPage() {
  return (
    <main id="page-top">
      <SiteHeader />
      <section className="role-hero sources-hero">
        <p className="eyebrow">About this site’s sources</p>
        <h1>Where the event data comes from.</h1>
        <p className="lede">Use this page when two sources disagree or you need the underlying planning files.</p>
      </section>
      <PageContents items={[
        { id: "source-hierarchy", label: "Source hierarchy" },
        { id: "source-files", label: "Open source files" },
      ]} />
      <section className="shell guide-layout sources-layout">
        <article className="guide-panel source-order" id="source-hierarchy">
          <p className="eyebrow">Source hierarchy</p>
          <h2>Use the right source.</h2>
          <ol>
            <li><strong>Conference tracker</strong><span>Controls the event roster, dates, status and topline staffing.</span></li>
            <li><strong>Events in Notion</strong><span>Controls execution detail for active event projects.</span></li>
            <li><strong>Events Drive</strong><span>Stores contracts, creative, attendee files and post-event artifacts.</span></li>
            <li><strong>Event page</strong><span>Combines the planning details and links to the organizer site.</span></li>
          </ol>
          <div className="source-links vertical" id="source-files">
            <a href={sourceLinks.sheet} target="_blank" rel="noreferrer">Open tracker ↗</a>
            <a href={sourceLinks.notion} target="_blank" rel="noreferrer">Open Notion ↗</a>
            <a href={sourceLinks.eventsDrive} target="_blank" rel="noreferrer">Open Events Drive ↗</a>
            <a href={sourceLinks.ccwPlan} target="_blank" rel="noreferrer">Open Vegas reference ↗</a>
          </div>
          <BackToTop />
        </article>
      </section>
      <Footer />
    </main>
  );
}
