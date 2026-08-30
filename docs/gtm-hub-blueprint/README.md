# GTM Hub Repository Blueprint

This package explains how to create and maintain a GTM directory and sales knowledge library similar in structure to the inspected system. It contains directions, data contracts, prompts, checklists, and a small inventory validator. It does not contain a finished website or proprietary sales content.

## Recommended operating model

- Google Drive is the source of truth for sales material.
- The Git repository is the publication layer and audit trail.
- A curated inventory controls what may be published.
- Codex performs bounded inventory, transformation, validation, and update tasks.
- Vercel serves static HTML/CSS/JavaScript and small serverless endpoints.
- A human owner approves sensitive material and every production release.

## Read in this order

1. `ARCHITECTURE.md` — system design and data flow.
2. `DRIVE_CONTENT_MAP.md` — how the observed Sales Drive maps to the library.
3. `REPOSITORY_BLUEPRINT.md` — recommended folder and file structure.
4. `templates/content-inventory.csv` — the publication control sheet.
5. `MAINTENANCE_RUNBOOK.md` — weekly, monthly, and quarterly procedures.
6. `CODEX_PROMPTS.md` — ready-to-use implementation and maintenance prompts.
7. `AUTOMATION_PLAN.md` — how to schedule a safe recurring audit.
8. `GOVERNANCE_CHECKLIST.md` — privacy, source, and release controls.
9. `AGENTS.md` — durable repository instructions for Codex.

## First setup

1. Create a private Git repository.
2. Copy `AGENTS.md`, `templates/`, and `scripts/` into it.
3. Create the structure in `REPOSITORY_BLUEPRINT.md`.
4. Assign an owner and sensitivity classification to every Drive source in `templates/content-inventory.csv`.
5. Set all rows to `hold` initially. Approve rows one at a time.
6. Run `node scripts/check-inventory.mjs templates/content-inventory.csv`.
7. Use the initial scaffold prompt in `CODEX_PROMPTS.md`.

## Critical rule

Drive access does not imply publication approval. Files are eligible for the site only when the inventory row has an owner, reviewer, sensitivity level, destination, review date, and `publish_status=approved`.

