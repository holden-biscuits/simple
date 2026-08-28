import Link from "next/link";
import { publicDemo } from "../data/demo-mode";

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <a className="footer-back-to-top" href="#page-top"><span className="footer-mark" aria-hidden="true">▲</span><span>Back to top</span></a>
        <p>{publicDemo.enabled ? "Explore the workflow with safe, synthetic event data." : "Use the checklist. Confirm the plan. Record what happened."}</p>
      </div>
      <div className="source-links">
        <Link href={publicDemo.sourceHref}>Demo data policy →</Link>
        <Link href="/sources">Source architecture →</Link>
      </div>
    </footer>
  );
}
