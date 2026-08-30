# Maintenance Runbook

## Every change

1. Identify the Drive source and item ID.
2. Confirm the source is approved for the target audience.
3. Update the normalized Markdown/YAML, never generated HTML directly.
4. Preserve source modified time and set a new repository review date.
5. Run inventory, content, link, and rendered-page checks.
6. Review the diff for changed numbers, pricing, customer claims, security language, and external links.
7. Preview behind SSO.
8. Obtain the named owner's approval.
9. Merge and deploy.

## Weekly: freshness audit

- Compare Drive modified times against the inventory.
- Report approved sources that changed after `last_source_sync`.
- Report missing owners, reviewers, IDs, destinations, or review dates.
- Report broken links and duplicate destination slugs.
- Report content due for review in the next 14 days.
- Do not edit or publish automatically during the audit.

## Monthly: content-owner review

- Finance reviews pricing and commercial terms.
- Security/Legal reviews compliance and security answers.
- Product reviews integrations, capabilities, and terminology.
- Sales Enablement reviews talk tracks, onboarding, and templates.
- Customer Success or Marketing reviews customer proof and disclosure status.
- Revenue Operations reviews the tool directory, lifecycle mapping, and ownership.

## Quarterly: structural review

- Remove obsolete or duplicate pages.
- Validate that the published information architecture still matches how the team works.
- Review search failures and unanswered library questions.
- Archive stale recordings, event notes, and superseded collateral.
- Review access control, API keys, service accounts, and deployment permissions.
- Update `AGENTS.md` when Codex repeats a mistake or the workflow changes.

## Emergency correction

For incorrect pricing, security, legal, customer, or product information:

1. Hide or revert the affected page immediately.
2. Record the incorrect claim and its source.
3. Notify the content owner.
4. Correct the approved source first.
5. Re-sync, test, review, and redeploy.
6. Add a validation rule if the failure pattern can recur.

## Definition of done

- Every published claim has an approved source.
- Sensitive content is behind the correct authentication boundary.
- Owners and review dates are present.
- Tests pass.
- No unapproved Drive item or personal data entered the repository.
- The preview matches the intended directory and knowledge navigation.
- A human reviewed the final diff.

