---
name: handoff-guard
description: Standing instruction for long-running tasks that need token-efficient continuity across context pressure, rate limits, or mid-task stops.
when_to_use: Use at session start when the user wants long task continuity, or whenever a task is large enough that a compact checkpoint will likely help.
---

While this skill is active:

1. Keep working normally, but save a checkpoint before context pressure, compaction risk, rate limits, or an interrupted session would make continuation harder.
2. Prefer saving early instead of waiting for the session to become unstable.
3. Keep checkpoints short, factual, and useful for the next agent.
4. Never include secrets, `.env` contents, tokens, or private keys in the checkpoint.
5. Use `/handoff-save context-limit` or run `pnpm dlx agent-handoff save --reason context-limit` when it is time to hand off.

If the task is still active near the end of a session, create a fresh handoff before stopping.
