# Governance and Release Checklist

## Source integrity

- [ ] Every changed claim has an approved Drive source ID.
- [ ] Source modified time and repository review time are recorded separately.
- [ ] Conflicting sources are flagged and resolved by an owner.
- [ ] Generated summaries are not treated as authoritative sources.
- [ ] Event notes and AE/SDR feedback are labeled provisional until verified.

## Privacy and confidentiality

- [ ] No signup records, form responses, personal data, or private coaching details are included.
- [ ] Customer names, quotes, metrics, and recordings have disclosure approval.
- [ ] Pricing, competitor, security, and legal material has the correct sensitivity classification.
- [ ] Restricted content is protected by authentication.
- [ ] No credentials, access tokens, service-account files, or API keys are committed.

## Content quality

- [ ] The content owner and reviewer are named.
- [ ] Review date and next review date are present.
- [ ] Stable anchors and inbound links remain valid.
- [ ] Duplicate claims and superseded templates are removed or archived.
- [ ] Unknowns are stated rather than guessed.

## Technical validation

- [ ] Inventory validation passes.
- [ ] Content-schema tests pass.
- [ ] Internal and external link tests pass.
- [ ] Rendered HTML tests pass.
- [ ] API contract and authorization tests pass.
- [ ] Keyboard, mobile, print, and reduced-motion behavior is checked.

## Release

- [ ] Human diff review completed.
- [ ] Preview reviewed behind the intended access boundary.
- [ ] Sensitive claim owners approved the change.
- [ ] Rollback path is known.
- [ ] Production promotion is explicitly approved.

