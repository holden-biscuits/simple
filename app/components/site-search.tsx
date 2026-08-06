"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type SearchRecord = {
  type: "Event" | "Guide" | "Role" | "Operations";
  title: string;
  description: string;
  href: string;
  keywords: string;
  details?: string[];
};

const types = ["All", "Event", "Guide", "Role", "Operations"] as const;

function matchDetail(record: SearchRecord, normalized: string) {
  if (!normalized || `${record.title} ${record.description}`.toLowerCase().includes(normalized)) return null;
  const terms = normalized.split(/\s+/);
  return record.details?.find((detail) => terms.some((term) => detail.toLowerCase().includes(term))) ?? null;
}

export function SiteSearch({ records }: { records: SearchRecord[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<(typeof types)[number]>("All");
  const normalized = query.trim().toLowerCase();
  const results = useMemo(() => records.filter((record) => {
    const typeMatch = type === "All" || record.type === type;
    const text = `${record.title} ${record.description} ${record.keywords}`.toLowerCase();
    return typeMatch && (!normalized || normalized.split(/\s+/).every((term) => text.includes(term)));
  }), [normalized, records, type]);

  return (
    <section className="shell search-tool" aria-label="Search the fieldbook">
      <label><span>Search the fieldbook</span><input autoFocus type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try Genesys, booth, HubSpot, travel, or ZoomInfo" /></label>
      <div className="search-types" role="group" aria-label="Result type">
        {types.map((item) => <button type="button" key={item} aria-pressed={type === item} onClick={() => setType(item)}>{item}</button>)}
      </div>
      <div className="search-result-heading"><strong>{results.length}</strong><span>{normalized ? `results for “${query.trim()}”` : "pages and event records"}</span></div>
      <div className="search-results">
        {results.map((record) => {
          const detail = matchDetail(record, normalized);
          return <Link href={record.href} key={`${record.href}-${record.title}`}>
            <span>{record.type}</span><h2>{record.title}</h2><p>{record.description}</p>{detail ? <p className="search-match"><strong>Matched detail</strong>{detail}</p> : null}<b aria-hidden="true">↗</b>
          </Link>;
        })}
      </div>
      {!results.length ? <p className="empty-state">No match. Try an event name, city, teammate, tool, workstream, or task.</p> : null}
    </section>
  );
}
