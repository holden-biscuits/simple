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
  context?: string;
  status?: string;
  hiddenUntilQuery?: boolean;
};

export const searchTypes = ["All", "Event", "Guide", "Role", "Operations"] as const;
export type SearchType = (typeof searchTypes)[number];

const quickSearches = [
  { label: "Who’s going?", query: "who is attending" },
  { label: "What needs attention?", query: "what needs attention" },
  { label: "Open event work", query: "open event task" },
  { label: "Where do I update it?", query: "where should I update event data" },
  { label: "What can write back?", query: "what can write back to source systems" },
  { label: "What changed?", query: "what changed" },
  { label: "Live data feeds", query: "which data feeds are live" },
  { label: "HubSpot results", query: "HubSpot event results" },
  { label: "Booth rules", query: "Booth etiquette" },
] as const;

const stopWords = new Set(["a", "an", "and", "are", "at", "can", "do", "does", "for", "from", "how", "i", "in", "is", "it", "me", "my", "of", "on", "our", "should", "show", "site", "the", "this", "to", "we", "what", "where", "which", "who", "with"]);

const searchAliases: Record<string, string[]> = {
  going: ["going", "attending", "attendee", "team", "roster", "staffing"],
  attending: ["attending", "attendee", "team", "roster", "staffing", "going"],
  attendees: ["attendees", "attendee", "team", "roster", "staffing"],
  people: ["people", "attendee", "team", "roster", "staffing"],
  meetings: ["meetings", "meeting"],
  tasks: ["tasks", "task", "work", "action"],
  work: ["work", "task", "action"],
  changed: ["changed", "change", "updated", "update"],
  changes: ["changes", "change", "updated", "update"],
  updated: ["updated", "update", "changed", "change"],
  live: ["live", "scheduled", "active"],
  feeds: ["feeds", "feed", "stream"],
  missing: ["missing", "open", "needed", "unnamed", "incomplete"],
  needs: ["needs", "need", "open", "attention", "incomplete"],
  needed: ["needed", "need", "open", "attention", "incomplete"],
  conflicts: ["conflicts", "conflict", "mismatch", "review"],
  mismatch: ["mismatch", "conflict", "review"],
  results: ["results", "outcomes", "meetings", "demos", "deals", "pipeline", "revenue"],
  cost: ["cost", "spend", "budget", "investment"],
  costs: ["costs", "spend", "budget", "investment"],
};

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[’']s\b/g, "").replace(/[^a-z0-9+#]+/g, " ").trim();
}

function queryTerms(value: string) {
  return normalizeText(value).split(/\s+/).filter((term) => term && !stopWords.has(term));
}

function termMatches(text: string, term: string) {
  return (searchAliases[term] ?? [term]).some((candidate) => text.includes(candidate));
}

function matchDetail(record: SearchRecord, normalized: string) {
  if (!normalized || `${record.title} ${record.description}`.toLowerCase().includes(normalized)) return null;
  const terms = queryTerms(normalized);
  return record.details?.find((detail) => terms.every((term) => termMatches(normalizeText(detail), term)))
    ?? record.details?.find((detail) => terms.some((term) => termMatches(normalizeText(detail), term)))
    ?? null;
}

function searchScore(record: SearchRecord, normalized: string) {
  if (!normalized) return 0;
  const terms = queryTerms(normalized);
  if (!terms.length) return 0;
  const title = normalizeText(record.title);
  const description = normalizeText(record.description);
  const details = normalizeText((record.details ?? []).join(" "));
  const keywords = normalizeText(record.keywords);
  const fullText = `${title} ${description} ${details} ${keywords}`;
  if (!terms.every((term) => termMatches(fullText, term))) return -1;

  const normalizedQuery = normalizeText(normalized);
  let score = title === normalizedQuery ? 100 : title.startsWith(normalizedQuery) ? 70 : title.includes(normalizedQuery) ? 50 : 0;
  for (const term of terms) {
    if (termMatches(title, term)) score += 12;
    if (termMatches(description, term)) score += 6;
    if (termMatches(details, term)) score += 4;
    if (termMatches(keywords, term)) score += 1;
  }
  return score;
}

export function SiteSearch({ records, initialQuery = "", initialType = "All" }: { records: SearchRecord[]; initialQuery?: string; initialType?: SearchType }) {
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState<SearchType>(initialType);
  const normalized = normalizeText(query);
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
      <label><span>Search the fieldbook</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try Genesys, booth, HubSpot, travel, or ZoomInfo" /></label>
      <div className="search-quick">
        <span>Useful starting points</span>
        <div>{quickSearches.map((item) => <button type="button" key={item.query} onClick={() => { setQuery(item.query); setType("All"); }}>{item.label}</button>)}</div>
      </div>
      <div className="search-types" role="group" aria-label="Result type">
        {searchTypes.map((item) => <button type="button" key={item} aria-pressed={type === item} onClick={() => setType(item)}><span>{item}</span><b>{typeCounts[item]}</b></button>)}
      </div>
      <div className="search-result-heading" aria-live="polite" aria-atomic="true"><strong>{results.length}</strong><span>{normalized ? `results for “${query.trim()}”` : "pages and event records"}</span></div>
      <div className="search-results">
        {results.map((record) => {
          const detail = matchDetail(record, normalized);
          return <Link href={record.href} key={`${record.href}-${record.title}`}>
            <div className="search-result-meta"><span>{record.type}</span>{record.context ? <span>{record.context}</span> : null}{record.status ? <span>{record.status}</span> : null}</div><h2>{record.title}</h2><p>{record.description}</p>{detail ? <p className="search-match"><strong>Matched detail</strong>{detail}</p> : null}<b aria-hidden="true">↗</b>
          </Link>;
        })}
      </div>
      {!results.length ? <div className="empty-state search-empty">
        <span>No match</span>
        <h2>Nothing found for “{query.trim()}.”</h2>
        <p>Try an event name, city, teammate, tool, workstream, or task—or reset the search and start from the full index.</p>
        <div><button type="button" onClick={() => { setQuery(""); setType("All"); }}>Clear search</button><Link href="/#events">Browse events →</Link><Link href="/guides">Open guides →</Link></div>
      </div> : null}
    </section>
  );
}
