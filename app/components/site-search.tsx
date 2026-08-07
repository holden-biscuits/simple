"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type SearchRecord = {
  type: "Event" | "Guide" | "Role" | "Operations";
  title: string;
  description: string;
  href: string;
  keywords: string;
  details?: string[];
  hiddenUntilQuery?: boolean;
};

export const searchTypes = ["All", "Event", "Guide", "Role", "Operations"] as const;
export type SearchType = (typeof searchTypes)[number];

const quickSearches = [
  { label: "Genesys", query: "Genesys" },
  { label: "Staffing gaps", query: "names open" },
  { label: "Meeting count TBD", query: "meeting package count TBD" },
  { label: "Open event tasks", query: "open event task" },
  { label: "HubSpot", query: "HubSpot" },
  { label: "Booth etiquette", query: "Booth etiquette" },
] as const;

function matchDetail(record: SearchRecord, normalized: string) {
  if (!normalized || `${record.title} ${record.description}`.toLowerCase().includes(normalized)) return null;
  const terms = normalized.split(/\s+/);
  return record.details?.find((detail) => terms.every((term) => detail.toLowerCase().includes(term)))
    ?? record.details?.find((detail) => terms.some((term) => detail.toLowerCase().includes(term)))
    ?? null;
}

function searchScore(record: SearchRecord, normalized: string) {
  if (!normalized) return 0;
  const terms = normalized.split(/\s+/);
  const title = record.title.toLowerCase();
  const description = record.description.toLowerCase();
  const details = (record.details ?? []).join(" ").toLowerCase();
  const keywords = record.keywords.toLowerCase();
  const fullText = `${title} ${description} ${details} ${keywords}`;
  if (!terms.every((term) => fullText.includes(term))) return -1;

  let score = title === normalized ? 100 : title.startsWith(normalized) ? 70 : title.includes(normalized) ? 50 : 0;
  for (const term of terms) {
    if (title.includes(term)) score += 12;
    if (description.includes(term)) score += 6;
    if (details.includes(term)) score += 4;
    if (keywords.includes(term)) score += 1;
  }
  return score;
}

export function SiteSearch({ records, initialQuery = "", initialType = "All" }: { records: SearchRecord[]; initialQuery?: string; initialType?: SearchType }) {
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState<SearchType>(initialType);
  const normalized = query.trim().toLowerCase();
  const matchingRecords = useMemo(() => records
    .filter((record) => normalized || !record.hiddenUntilQuery)
    .map((record, index) => ({ record, index, score: searchScore(record, normalized) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score || a.index - b.index), [normalized, records]);
  const results = useMemo(() => matchingRecords
    .filter(({ record }) => type === "All" || record.type === type)
    .map(({ record }) => record), [matchingRecords, type]);
  const typeCounts = useMemo(() => Object.fromEntries(searchTypes.map((item) => [
    item,
    item === "All" ? matchingRecords.length : matchingRecords.filter(({ record }) => record.type === item).length,
  ])) as Record<SearchType, number>, [matchingRecords]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (query.trim()) params.set("q", query.trim()); else params.delete("q");
    if (type !== "All") params.set("type", type); else params.delete("type");
    const search = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`);
  }, [query, type]);

  return (
    <section className="shell search-tool" aria-label="Search the fieldbook">
      <label><span>Search the fieldbook</span><input autoFocus type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try Genesys, booth, HubSpot, travel, or ZoomInfo" /></label>
      <div className="search-quick">
        <span>Useful starting points</span>
        <div>{quickSearches.map((item) => <button type="button" key={item.query} onClick={() => { setQuery(item.query); setType("All"); }}>{item.label}</button>)}</div>
      </div>
      <div className="search-types" role="group" aria-label="Result type">
        {searchTypes.map((item) => <button type="button" key={item} aria-pressed={type === item} onClick={() => setType(item)}><span>{item}</span><b>{typeCounts[item]}</b></button>)}
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
