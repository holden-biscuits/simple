import { sourceLinks } from "../data/events";

export function Footer() {
  return (
    <footer className="footer">
      <p>One fieldbook. Every event. Clear ownership from first invite to final follow-up.</p>
      <div className="source-links">
        <a href={sourceLinks.sheet} target="_blank" rel="noreferrer">Conference tracker ↗</a>
        <a href={sourceLinks.notion} target="_blank" rel="noreferrer">Events in Notion ↗</a>
        <a href={sourceLinks.ccwPlan} target="_blank" rel="noreferrer">CCW Vegas plan ↗</a>
      </div>
    </footer>
  );
}
