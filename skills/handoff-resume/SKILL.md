---
name: handoff-resume
description: Loads the latest or named handoff checkpoint and continues the task from a short task number, reason, or full id.
argument-hint: [latest|task-number|reason|id]
disable-model-invocation: true
---

Load the saved checkpoint and continue from it instead of restarting the task.

1. Use `$ARGUMENTS` as the checkpoint selector. Accept `latest`, a short task number such as `3`, a reason such as `auth-refactor`, or a full checkpoint id.
2. Run the CLI directly:

```bash
pnpm dlx delta-torch resume "${ARGUMENTS:-latest}"
```

Execute the command yourself. Do not ask the user to run it. Read the output carefully, then continue from the `Resume Prompt` and `Next Steps` sections.
