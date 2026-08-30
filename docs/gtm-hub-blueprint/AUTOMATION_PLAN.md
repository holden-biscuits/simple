# Recurring Update Automation

## Start manually

Run the weekly audit prompt from `CODEX_PROMPTS.md` manually until it produces reliable, reviewable output. Do not schedule a workflow that still requires frequent correction.

## Recommended schedule

- Weekly Monday morning: read-only freshness audit.
- Monthly first business day: owner review report.
- Quarterly: structural and access-control review.

## Safe scheduled-task setup

In the Codex desktop app, create a scheduled task for the repository project. Use an isolated Git worktree for any task that may write files. The weekly task should be report-only and should not commit, push, deploy, modify Drive, or change sharing.

Suggested weekly task prompt:

```text
Run the “Weekly audit without edits” procedure in @CODEX_PROMPTS.md for this repository. Use @AGENTS.md and @templates/content-inventory.csv. Compare connected Drive metadata only when the Google Drive connection is available and authorized. Do not edit Drive, repository files, Git state, deployments, or external systems. Report critical issues first and stop if required access or source metadata is missing.
```

## Escalation policy

- Pricing issue → Finance owner.
- Security/compliance issue → Security or Legal owner.
- Customer disclosure issue → Customer owner plus Legal/Marketing approval.
- Product capability conflict → Product owner.
- Missing source or unclear approval → leave unpublished.

## Automation boundaries

- The audit may read approved metadata and repository files.
- It may not publish, merge, push, deploy, or mutate Drive.
- A separate human-reviewed task may prepare a branch with approved updates.
- Production deployment remains a human-approved action.
- Use the narrowest sandbox and network permissions that allow the audit to succeed.

