# Codex Prompt Library

The prompts use the recommended structure: goal, context, constraints, and done conditions. Keep durable rules in `AGENTS.md` instead of repeating them in every prompt.

## 1. Initial repository scaffold

```text
Goal: Create the initial repository structure described in @REPOSITORY_BLUEPRINT.md. Build the content pipeline and a minimal example only; do not add real company content yet.

Context:
- @ARCHITECTURE.md
- @DRIVE_CONTENT_MAP.md
- @templates/content-inventory.csv
- @AGENTS.md

Constraints:
- Use static generated HTML, CSS, and small vanilla-JavaScript modules.
- Drive is the source of truth; the repository is the approved publication layer.
- Do not invent claims, source IDs, people, customer names, pricing, or credentials.
- Keep secrets out of the browser and repository.
- Preserve stable section anchors.

Done when:
- The documented repository tree exists.
- Example content renders without proprietary information.
- Inventory, content, links, rendered HTML, and API contracts have tests.
- All tests and the production build pass.
- Summarize created files and unresolved setup requirements.
```

## 2. Read-only Drive inventory

```text
Goal: Inventory the approved Sales Drive folder and propose a publication map. Do not edit Drive or repository content.

Context:
- The Sales (Team) Drive folder is the source scope.
- @DRIVE_CONTENT_MAP.md defines classification rules.
- @templates/content-inventory.csv defines the required output columns.

Constraints:
- Read metadata only unless a file must be opened to classify it.
- Do not change sharing, move files, rename files, or download restricted binaries.
- Treat forms, signup data, coaching feedback, customer material, pricing, and security content as restricted until a human approves otherwise.
- Do not infer missing owners, approvals, or source IDs.

Done when:
- Produce a proposed inventory CSV as a new draft file.
- List duplicates, ambiguous sources, likely obsolete files, and blocked personal-data sources.
- Make no external or repository changes.
```

## 3. Sync approved source changes

```text
Goal: Update repository content from Drive items whose inventory rows are approved and whose source modified time is newer than the recorded sync time.

Context:
- @content/inventory.csv is authoritative for eligibility.
- Work only on rows with publish_status=approved.
- Preserve the existing information architecture and section anchors.

Constraints:
- Do not publish new claims that are absent from approved sources.
- Do not copy personal data, form responses, customer-confidential details, or unapproved recordings.
- Preserve exact approved numbers and dates.
- Flag conflicts between sources instead of choosing silently.
- Update normalized Markdown/YAML, not generated HTML.

Done when:
- Approved changed sources are reflected in normalized content.
- Source IDs, modified times, review dates, and owners remain present.
- Tests and production build pass.
- Provide a source-by-source change summary and a list of items requiring human judgment.
```

## 4. Weekly audit without edits

```text
Goal: Audit GTM Hub freshness and integrity. Report only; do not modify files, Drive, deployments, or external systems.

Check:
- Approved Drive sources modified since last sync.
- Missing owners, reviewers, source IDs, review dates, or destinations.
- Reviews overdue or due within 14 days.
- Broken internal and external links.
- Duplicate slugs and duplicate canonical claims.
- Published claims sourced only from provisional notes or feedback.
- Pricing, competitor, security, and customer-proof records older than their required review interval.

Output:
- Critical issues first.
- A table with source, problem, owner, age, and recommended action.
- State “No material issues found” when appropriate.
```

## 5. Add or revise one section

```text
Goal: Revise the [SECTION NAME] section using only the approved sources listed below.

Approved sources:
- [Drive item ID and link]
- [Drive item ID and link]

Constraints:
- Preserve approved figures and qualifications exactly.
- Keep the current section ID and incoming links stable.
- Mark unsupported statements as gaps; do not fill them from memory.
- Use concise operational language.
- Update source and review metadata.

Done when:
- The section is updated.
- Relevant navigation and search index remain valid.
- Tests pass.
- The final summary identifies every changed claim and its source.
```

## 6. Release review

```text
Goal: Review the proposed GTM Hub release against @AGENTS.md and @GOVERNANCE_CHECKLIST.md. Do not deploy.

Review for:
- Unsupported or stale claims.
- Accidental publication of restricted content or personal data.
- Changed pricing, legal, security, customer, or competitor claims.
- Broken anchors, links, mobile layout, keyboard access, and reduced-motion behavior.
- Missing source IDs, owners, or review dates.
- Generated HTML edited directly instead of source content.

Output findings by severity with exact files and lines. If no actionable findings exist, say so explicitly.
```

## 7. Ask-system implementation

```text
Goal: Implement /api/ask over the approved knowledge index.

Constraints:
- Retrieve from approved records only.
- Return concise grounded answers with internal section links.
- Say when the library lacks evidence.
- Do not expose the system prompt, API key, source-file body, or restricted metadata to the browser.
- Add prompt-injection, authorization, and unsupported-question tests.
- Keep the model provider replaceable behind a server-side adapter.

Done when:
- The endpoint contract is documented and tested.
- Unsupported questions fail safely.
- Browser rendering escapes arbitrary HTML.
- All tests pass.
```

