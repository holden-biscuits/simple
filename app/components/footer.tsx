import { sourceLinks } from "../data/events";

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <span className="footer-mark">▲</span>
        <p>Check the route. Pack what you need. Write down what happened.</p>
      </div>
      <div className="source-links">
        <a href={sourceLinks.eventsDrive} target="_blank" rel="noreferrer">Events Drive ↗</a>
        <a href={sourceLinks.sheet} target="_blank" rel="noreferrer">Conference tracker ↗</a>
        <a href={sourceLinks.notion} target="_blank" rel="noreferrer">Events in Notion ↗</a>
        <a href={sourceLinks.ccwPlan} target="_blank" rel="noreferrer">CCW Vegas plan ↗</a>
      </div>
    </footer>
  );
}
