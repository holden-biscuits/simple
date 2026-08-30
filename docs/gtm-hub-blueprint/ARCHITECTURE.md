# Architecture

## System map

```text
Google Drive: Sales (Team)
        │
        │ read-only inventory/sync
        ▼
content-inventory.csv ───────► approval and sensitivity gate
        │
        │ approved sources only
        ▼
Normalized repository content
  ├─ content/tools.yaml
  ├─ content/knowledge/sales/*.md
  ├─ content/sources/*.json
  └─ public/source attachments, if explicitly approved
        │
        │ build + validate
        ▼
Static publication
  ├─ /                         GTM directory
  ├─ /knowledge/sales          sales library
  ├─ /knowledge/assessments    optional assessments
  └─ /api/*                    small dynamic services
        │
        ▼
Vercel + team SSO
```

## Recommended technology

Use a static-first implementation:

- Semantic HTML for the directory and knowledge pages.
- One shared CSS file per surface.
- Vanilla JavaScript for filtering, FAQ accordions, tooltips, and lightweight widgets.
- Markdown or YAML as editable repository content.
- Node scripts to validate and render the content.
- Vercel for hosting, SSO, and serverless API routes.
- GitHub for change history and review.

This matches the inspected deployment more closely than a client-side SPA. A build generator is recommended so maintainers do not hand-edit a large HTML file.

## Components

### Directory

- Revenue lifecycle stages in ordered data.
- Tool groups such as Build Pipeline, Win the Deal, and Deliver & Grow.
- Each tool declares the stages it supports.
- Frontend JavaScript matches `data-stage` to `data-stages` for filter/highlight behavior.
- Each tool stores owner, source, review date, and status.

### Knowledge library

- One stable anchor per section.
- Persistent left table of contents on desktop.
- Long-form sections rendered from Markdown.
- Reusable cards, metrics, callouts, tables, FAQ items, and video links.
- Source references and review metadata stored with each section.

### Ask endpoint

Minimum safe contract:

```json
POST /api/ask
{ "question": "How should we structure a pilot?" }
```

The server should retrieve only approved knowledge records, return a concise answer, link to internal anchors, and explicitly say when the library lacks evidence. Do not put API keys or system prompts in browser code.

### Comments endpoint

Keep comments separate from published content. Store the source anchor, selected text, author, status, timestamps, and replies. Comments require authentication and should never silently alter the source material.

### Freshness endpoint

`GET /api/last-updated` should return repository review or commit metadata by logical surface. The frontend formats timestamps in the viewer's local timezone.

## Source-of-truth hierarchy

1. Signed agreements, approved security documentation, and current product documentation.
2. Approved Drive source files with a named owner and review date.
3. Repository-normalized content with a source reference.
4. Meeting notes and feedback as provisional evidence only.
5. Memory, chat summaries, and model output are never authoritative sources.

## Boundaries

- Never publish directly from a broad Drive folder.
- Never copy folder permissions into site permissions automatically.
- Never let the knowledge assistant answer from unapproved or private source files.
- Never treat a generated summary as the source record.
- Keep Sales, customer-confidential, legal, pricing, and security material behind the appropriate access control.

