---
name: handoff-resume
description: Loads the latest or named handoff checkpoint and prints the continuation prompt for the next agent.
argument-hint: [latest|id]
disable-model-invocation: true
---

Load the saved checkpoint and continue from it instead of restarting the task.

1. Use `$ARGUMENTS` as the checkpoint selector. Default to `latest` if none was provided.
2. Run the bundled wrapper script:

```bash
"${CLAUDE_SKILL_DIR}/scripts/resume.sh" "$ARGUMENTS"
```

The wrapper forwards to `pnpm dlx agent-handoff resume latest` or the selected checkpoint id. Read the output carefully, then continue from the `Resume Prompt` and `Next Steps` sections.
