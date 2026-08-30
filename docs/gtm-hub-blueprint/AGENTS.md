# GTM Hub repository instructions

## Objective

Maintain an accurate internal GTM directory and knowledge library sourced from approved Google Drive material.

## Source rules

- Google Drive is the source system. The Git repository is the approved publication layer.
- Work only from inventory rows with `publish_status=approved` when changing published content.
- Never invent source IDs, owners, approvals, customer facts, metrics, pricing, product capabilities, competitor facts, security answers, or legal terms.
- Flag missing or conflicting evidence instead of resolving it from memory.
- Preserve Drive item IDs, source modified times, content owners, reviewers, review dates, sensitivity, and destination slugs.
- Do not copy form responses, signup data, personal data, private feedback, or customer-confidential information into the repository.

## Repository behavior

- Edit normalized Markdown, YAML, JSON, and inventory files. Do not hand-edit generated HTML.
- Keep stable section IDs and links unless a redirect is added and validated.
- Keep browser behavior framework-free unless an approved architecture change says otherwise.
- Keep API keys and prompts server-side.
- Keep model-provider integration behind a replaceable adapter.
- Preserve access controls and SSO assumptions.

## Verification

- Run the inventory validator.
- Run content, link, rendered-HTML, and API-contract tests.
- Run the production build.
- Review the final diff for pricing, customer, competitor, legal, security, external-link, and permission changes.
- Report which source supports each material content change.

## Definition of done

- Requested behavior or content is complete.
- All changed claims are sourced and approved.
- Required tests and build pass.
- No restricted or personal data was added.
- The final response lists changed files, validation performed, unresolved gaps, and required human approvals.

## Prohibited autonomous actions

- Do not change Google Drive sharing or file organization.
- Do not send messages or request approvals from people.
- Do not commit, push, merge, or deploy unless the user explicitly requests that action.
- Do not publish a source merely because Codex can access it.

