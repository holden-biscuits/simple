import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <span className="footer-mark">▲</span>
        <p>Use the checklist. Confirm the plan. Record what happened.</p>
      </div>
      <div className="source-links">
        <Link href="/sources">About this site’s sources →</Link>
      </div>
    </footer>
  );
}
