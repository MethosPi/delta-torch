---
name: handoff-status
description: Shows recent handoff checkpoints and the active project handoff state.
disable-model-invocation: true
---

Inspect the current project handoff state before creating or resuming a checkpoint.

Run:

```bash
"${CLAUDE_SKILL_DIR}/scripts/status.sh"
```

The wrapper forwards to `pnpm dlx agent-handoff list`. Summarize the active checkpoint, recent reasons, timestamps, and agent names for the user.
