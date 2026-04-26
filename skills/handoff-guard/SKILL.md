---
name: handoff-guard
description: Standing instruction for long-running tasks that need token-efficient continuity across context pressure, rate limits, or mid-task stops.
when_to_use: Use at session start when the user wants long task continuity, or whenever a task is large enough that a compact checkpoint will likely help.
---

While this skill is active:

1. Keep working normally, but if context pressure, compaction risk, rate limits, or session expiry may interrupt the task, save a handoff before it becomes urgent.
2. Execute the CLI yourself. Do not ask the user to copy-paste commands.
3. Run `pnpm dlx delta-torch init` once per project if `.handoff/` is missing.
4. Save with `pnpm dlx delta-torch save --reason context-limit` and include concise sections for completed work, current state, risks, and next steps.
5. After saving, tell the user to continue the task in another agent using the short task number, for example: `Continue task #3 in Codex`.
6. Never include secrets, `.env` contents, tokens, or private keys in the checkpoint.

If the user asks to continue a suspended task by number, name, or `latest`, run `pnpm dlx delta-torch resume <selector>` yourself and continue from the saved prompt.
