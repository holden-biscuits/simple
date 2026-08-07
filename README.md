# TeamSimple Event Basecamp

TeamSimple’s internal event fieldbook for the 2026–2027 program. It combines the event directory, role guides, event-specific briefs, marketing execution, leadership reporting, search, and the source-governance record in one deployed Sites project.

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

The site is a versioned read model, not a live database. Private GTM systems are read outside the visitor’s browser, reconciled into the governed event catalog, tested, saved as a review version, and deployed only after approval.

Core data modules live in `app/data/`:

- `events.ts` holds the published event catalog and shared source links.
- `source-governance.ts` declares field ownership, update routes, connector boundaries, the Event key rollout, and write-back work.
- `site-status.ts` records protected direct decisions, source receipts, and the change log.
- `source-scan.ts` and `reconciliation.ts` enforce the proposal, evidence, ownership, and approval contract.
- readiness, measurement, linkage, signals, filtering, and leadership modules derive views from the governed catalog instead of maintaining parallel totals.

The canonical Event key is the event URL slug, such as `genesys-xperience`. Carry that exact key into Sheets, Notion, Drive folder conventions, and HubSpot. Do not rebuild it from an event name after creation.

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
npm install
npm run dev
npm test
```

`npm test` builds the Cloudflare-compatible vinext output and runs the full contract suite. The tests cover event data integrity, dynamic visibility, source reconciliation, CRM attribution, readiness, search, internal links, responsive style contracts, and rendered HTML.

The Sites project identifier and optional logical storage bindings live in `.openai/hosting.json`. Runtime values belong in Sites, not in that file or the repository.

## Publishing rule

Push the exact validated source state, package the matching build, save one review version, and deploy that saved version after explicit approval. The production URL is:

<https://teamsimple-events-fieldbook.holden165736.chatgpt.site/>
