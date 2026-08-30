# Sales Drive Content Map

The observed Drive is the content repository behind much of the Sales library. Use it as a source system, not as the published information architecture.

## Observed top-level sources

| Drive item | Proposed destination | Default status | Handling rule |
|---|---|---:|---|
| `_Compliance and Security` | `knowledge/sales/reference/security` | Hold | Publish only approved customer-safe answers. Preserve source owner and review date. |
| `_Simple Forms` | Internal operations links | Hold | Link to forms; do not copy submissions or personal data into the repository. |
| `_Templates` | `knowledge/sales/templates` | Review | Copy only canonical, current templates. Archive superseded versions. |
| `AE feedback` | Editorial backlog | Hold | Treat as input, not fact. Require verification before incorporating it. |
| `Customers` | `knowledge/sales/proof` | Restricted | Require customer disclosure approval. Remove confidential details and personal data. |
| `Sales Materials` | Product, proof, and sales-motion sections | Review | Map each file to one canonical section; avoid duplicate claims. |
| `Sales Videos` | Calls and recordings index | Restricted | Publish metadata and approved links only. Do not mirror recordings without approval. |
| `SDR Weekly Prospecting + Email Reviews` | SDR coaching library | Restricted | Separate coaching examples from approved public/customer-facing language. |
| Commission-based pricing sheet | Pricing reference | Restricted | Keep behind SSO. Require Finance ownership and a short review interval. |
| `CCW Orlando 2026` | Event/reference archive | Hold | Do not elevate event notes into canonical product claims without verification. |
| Competitor battle card | Competitive section | Restricted | Date-stamp every claim and link to its source. |
| Competitor pricing | Competitive section | Restricted | High-volatility content; require explicit owner and frequent review. |
| Landing-page signups | Not publishable | Blocked | Contains lead/customer data. Keep outside the content pipeline. |

## Why underscore folders need special treatment

Folders prefixed with `_` appear to be administrative or canonical collections. Do not assume that naming convention means the files are safe to publish. Use the prefix only as an inventory hint.

## Inventory procedure

For each top-level folder:

1. List direct children without modifying Drive.
2. Capture Drive item ID, path, type, owner, modified time, and link.
3. Classify sensitivity: `public`, `internal`, `restricted`, or `blocked`.
4. Assign a human content owner and reviewer.
5. Decide whether the item is canonical, supporting evidence, provisional input, or obsolete.
6. Assign one destination section and stable slug.
7. Set `publish_status` to `approved` only after review.

## Normalization rules

- Convert approved narrative documents to Markdown.
- Represent structured facts in YAML or JSON rather than copied prose.
- Preserve the Drive item ID and canonical link in front matter.
- Preserve the source modified time separately from the repository review time.
- Record all transformations in Git.
- Link large videos and binary files instead of copying them by default.
- Store no personal information from signups, submissions, coaching notes, or customer records.

## Proposed published sections

```text
Sales Knowledge Library
├── Start Here / First Week
├── Industry and ICP
├── Product and Integrations
├── Customer Proof
├── Competitive
├── Discovery and Demo
├── Pilot, Pricing, and Agreements
├── Objections and FAQ
├── Compliance and Security
├── Templates and Forms
└── Calls and Videos
```

