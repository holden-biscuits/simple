"use client";

import { useEffect, useRef, type ReactNode } from "react";

const adminHashes = new Set(["#event-admin", "#event-changes", "#event-writebacks", "#event-update-route"]);

export function EventAdmin({ changes, writebacks, children }: { changes: number; writebacks: number; children: ReactNode }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const openForHash = () => {
      if (adminHashes.has(window.location.hash) && detailsRef.current) detailsRef.current.open = true;
    };
    openForHash();
    window.addEventListener("hashchange", openForHash);
    return () => window.removeEventListener("hashchange", openForHash);
  }, []);

  const summary = writebacks
    ? `${writebacks} source update${writebacks === 1 ? "" : "s"} still open`
    : changes
      ? `${changes} recent change${changes === 1 ? "" : "s"} recorded`
      : "No source updates open";

  return <section className="event-admin shell" id="event-admin">
    <details ref={detailsRef}>
      <summary>
        <span><small>For event owners</small><strong>Update records</strong></span>
        <span><b>{summary}</b><i aria-hidden="true">+</i></span>
      </summary>
      <div className="event-admin-body">{children}</div>
    </details>
  </section>;
}
