# Repository Blueprint

## Recommended tree

```text
gtm-hub/
├── AGENTS.md
├── README.md
├── package.json
├── vercel.json
│
├── content/
│   ├── inventory.csv
│   ├── tools.yaml
│   ├── stages.yaml
│   ├── sources/
│   │   └── drive-index.json
│   └── knowledge/
│       ├── sales/
│       │   ├── index.yaml
│       │   ├── industry.md
│       │   ├── product.md
│       │   ├── proof.md
│       │   ├── competitive.md
│       │   ├── sales-motion.md
│       │   └── reference.md
│       └── sdr/
│
├── site/
│   ├── directory/
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── directory.js
│   └── knowledge/
│       ├── site.css
│       ├── library.js
│       └── comments/
│
├── api/
│   ├── ask.js
│   ├── last-updated.js
│   └── knowledge-comments.js
│
├── scripts/
│   ├── inventory-drive.mjs
│   ├── sync-approved-content.mjs
│   ├── build-site.mjs
│   └── validate-content.mjs
│
├── tests/
│   ├── content.test.mjs
│   ├── links.test.mjs
│   ├── rendered-html.test.mjs
│   └── api-contracts.test.mjs
│
└── docs/
    ├── architecture.md
    ├── content-model.md
    ├── maintenance.md
    └── deployment.md
```

## Content contract

Every published knowledge file should begin with:

```yaml
---
id: pricing
title: Pricing and Commercial Process
owner: finance@example.com
reviewer: sales-ops@example.com
status: approved
sensitivity: restricted
source_drive_ids:
  - "replace-with-drive-item-id"
source_modified: 2026-08-27
reviewed: 2026-08-28
review_due: 2026-09-28
---
```

## Stage/tool contract

```yaml
- id: roi-tools
  name: Value and ROI Tools
  href: /tools/roi
  group: win-the-deal
  stages: [validation, negotiation]
  owner: value-consulting@example.com
  reviewed: 2026-08-20
  source_drive_ids: [replace-me]
```

## Build order

1. Validate inventory and content front matter.
2. Load stages and tools.
3. Render the directory.
4. Render each knowledge library from its index and Markdown sections.
5. Generate table-of-contents links from stable section IDs.
6. Emit a searchable approved-content index for `/api/ask`.
7. Run link, accessibility, API-contract, and rendered-HTML tests.
8. Produce a preview deployment.
9. Require human review before production promotion.

## Closest-to-reference implementation

If fidelity to the inspected implementation matters, keep the browser layer framework-free. Use a Node build script to produce HTML rather than maintaining HTML by hand. Dynamic features remain small isolated JavaScript files.

