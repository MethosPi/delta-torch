---
name: delta-torch
description: Use DeltaTorch to preserve, resume, and hand off long-running coding tasks between Codex, Claude Code, Copilot, and local agents. Trigger when the user asks to continue a saved task, switch agents or models, checkpoint work before another phase, survive context limits, or inspect recent handoffs in a repo that stores task state in `.handoff/`.
---

# DeltaTorch

Use the CLI directly. Do not ask the user to copy commands.

## Core Flow

1. If `.handoff/` is missing, run `pnpm dlx delta-torch init`.
2. If the user wants recent checkpoints or active task state, run `pnpm dlx delta-torch list`.
3. If the user wants to continue a saved task, run `pnpm dlx delta-torch resume <latest|task-number|reason|id>`.
4. If the task should move to another agent, another model, or another phase, save a checkpoint with `pnpm dlx delta-torch save --reason <reason>`.

## Save a Checkpoint

Use short reasons such as `plan-complete`, `ready-for-implementation`, `ready-for-review`, or `context-limit`.

Include compact, concrete sections:

- `Original Prompt`
- `Goal`
- `Work Completed`
- `Current State`
- `Files Changed`
- `Commands Run`
- `Problems / Risks`
- `Next Steps`
- `Resume Prompt`

After saving, report the short task number and tell the user how to continue it, for example `Continue task #3 in another agent.`

## Resume a Checkpoint

Accept `latest`, a short task number such as `3`, a reason, or a full checkpoint id. Read the resumed checkpoint carefully, then continue from the `Resume Prompt` and `Next Steps` sections instead of rebuilding context from scratch.

## Guardrails

- Keep handoffs short and useful.
- Never include secrets, `.env` contents, tokens, or private keys.
- Prefer explicit file paths, commands, and open risks over long narrative summaries.
- Save before context pressure becomes a problem, not after.
