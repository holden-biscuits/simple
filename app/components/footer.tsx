import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <a className="footer-back-to-top" href="#page-top"><span className="footer-mark" aria-hidden="true">▲</span><span>Back to top</span></a>
        <p>Use the checklist. Confirm the plan. Record what happened.</p>
      </div>
      <div className="source-links">
        <a href="https://app.zoominfo.com/" target="_blank" rel="noreferrer">ZoomInfo ↗</a>
        <a href="https://app.hubspot.com/" target="_blank" rel="noreferrer">HubSpot ↗</a>
        <Link href="/sources">About this site’s sources →</Link>
      </div>
    </footer>
  );
}
