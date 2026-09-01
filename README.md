# TeamSimple Event Basecamp

[![Public demo quality gate](https://github.com/holden-biscuits/simple/actions/workflows/ci.yml/badge.svg)](https://github.com/holden-biscuits/simple/actions/workflows/ci.yml)
[![CodeQL](https://github.com/holden-biscuits/simple/actions/workflows/codeql.yml/badge.svg)](https://github.com/holden-biscuits/simple/actions/workflows/codeql.yml)

A public, interactive demonstration of an event-operations control center. It combines an event directory, role guides, event briefs, marketing execution, leadership reporting, search, and source governance in one Sites project.

![Event Basecamp social preview](public/og-2026-2027.png)

> **Public demo:** Every person, account, activity, cost, source record, and outcome in this repository is synthetic. The public branch cannot load private operating data.

## Public demo boundary

- `app/data/demo-mode.ts` permanently identifies this branch as a public demo and routes simulated source actions to the in-product data-policy page.
- Event keys, event names, people, companies, record identifiers, source links, commitments, and outcomes use synthetic fixtures.
- `npm run check:public-demo` scans every tracked text file for private-system URLs, CRM identifiers, email addresses, and protected personal data.
- The same safety check runs on every pull request and push to `main` before the build and test suite.
- Real operational data belongs in access-controlled upstream systems or a separate private repository. It must never be copied into this public repository, an issue, or a pull request.

## Product map

- `/` — searchable event directory, lifecycle guide, and active-program pulse
- `/events/[slug]` — dynamic event brief with TL;DR, role routes, relevant workstreams, results, and upstream update destinations
- `/ae` and `/sdr` — event field guides by role
- `/guides` — shared preparation, onsite, and follow-up rules
- `/marketing` — workload pulse, event task workspaces, support matrix, HubSpot setup, and measurement contract
- `/leadership` — commitments, readiness, decisions, source coverage, and CRM-supported outcomes
- `/search` — full-text index of pages, event facts, tasks, source changes, and saved operating views
- `/sources` — source monitor, reconciliation rules, system ownership, update routes, write-back queue, and audit receipts

## Architecture

The site is a versioned read model, not a live database. In the public repository, synthetic source records are reconciled into the governed event catalog and tested exactly like production-shaped records without exposing an upstream system.

Core data modules live in `app/data/`:

- `events.ts` holds the published event catalog and shared source links.
- `source-governance.ts` declares field ownership, update routes, connector boundaries, the Event key rollout, and write-back work.
- `site-status.ts` records protected direct decisions, source receipts, and the change log.
- `source-scan.ts` and `reconciliation.ts` enforce the proposal, evidence, ownership, and approval contract.
- readiness, measurement, linkage, signals, filtering, and leadership modules derive views from the governed catalog instead of maintaining parallel totals.

The canonical Event key is the event URL slug, such as `demo-event-01`. The demo preserves that cross-system join contract while using identifiers that cannot resolve to real records.

## Source ownership

| Change | Owning system |
| --- | --- |
| Dates, participation, package, topline roster | Conference tracker in Google Sheets |
| Tasks, owners, deadlines, event decisions | Event project in Notion |
| Contracts, approved creative, attendee files, artifacts | Events Drive |
| Meetings, demos, deals, pipeline, revenue | HubSpot |
| Organizer email or Slack message | Signal only; promote the confirmed fact to an owning system |

`eventUpdateRoutes` in `app/data/source-governance.ts` is the shared contract used by the source page and every event page. Change it once rather than editing those surfaces separately.

## Update flow

1. Detect a source change with exact evidence and an Event key.
2. Reconcile it against the declared field owner and protected direct decisions.
3. Apply supported facts to a review build; hold conflicts for a decision.
4. Run the complete build and test suite.
5. Save a Sites review version and deploy only after approval.
6. Write an approved correction back to the owning system as an exact diff.

Never infer attribution, turn a scheduled meeting into a held meeting, publish confidential contract terms, or let a message thread silently overrule an owning system.

## Development

Requires Node.js 22.13 or newer.

```bash
npm ci
npm run dev
npm test
```

`npm test` first runs the public-data safety gate, builds the Cloudflare-compatible vinext output, and runs the full contract suite. The tests cover event data integrity, dynamic visibility, source reconciliation, CRM attribution, readiness, search, internal links, responsive style contracts, and rendered HTML.

The Sites project identifier and optional logical storage bindings live in `.openai/hosting.json`. Runtime values belong in Sites, not in that file or the repository.

## Publishing rules

Push the exact validated source state, package the matching build, save one review version, and deploy that saved version after explicit approval. Production data must remain in an access-controlled deployment sourced from private systems; public deployments must use only the synthetic fixtures in this repository.
