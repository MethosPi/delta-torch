---
name: handoff-guard
description: Standing instruction for long-running tasks that need token-efficient continuity across context pressure, usage/rate limits, user token budgets, or mid-task stops.
when_to_use: Use at session start when the user wants long task continuity, agent-to-agent handoff, or clean switching between planning, implementation, and review.
---

While this skill is active:

1. Keep working normally, but save a handoff whenever the task should move cleanly to another agent, another model, or another phase such as planning, implementation, or review.
2. Save proactively when visible warnings show context pressure, usage/rate limits, or a user-provided token budget threshold. As a default, offer a handoff around 10% remaining and save immediately around 5% remaining. Do not wait for the agent to hit a hard stop.
3. Execute the CLI yourself. Do not ask the user to copy-paste commands.
4. Run `pnpm dlx delta-torch init` once per project if `.handoff/` is missing.
5. Save with `pnpm dlx delta-torch save --reason <reason>` and use short reasons such as `plan-complete`, `ready-for-implementation`, `ready-for-review`, or `context-limit`.
6. After saving, tell the user to continue the task in another agent using the short task number, for example: `Continue task #3 in Codex`.
7. Never include secrets, `.env` contents, tokens, or private keys in the checkpoint.

If the user asks to continue a suspended task by number, name, or `latest`, run `pnpm dlx delta-torch resume <selector>` yourself and continue from the saved prompt.
