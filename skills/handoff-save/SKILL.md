---
name: handoff-save
description: Saves a compact handoff checkpoint into .handoff/ before the current session loses useful context or hits usage, rate, or token-budget pressure.
argument-hint: [reason]
disable-model-invocation: true
---

Create a concise checkpoint for the current project state before continuity is at risk.

1. Gather these sections:
   - Original Prompt
   - Goal
   - Work Completed
   - Current State
   - Problems / Risks
   - Next Steps
   - Resume Prompt
2. Keep it compact and useful for another terminal agent.
3. Use the supplied reason from `$ARGUMENTS`, or `manual` if none was provided.
4. Save the checkpoint by running the CLI directly:

```bash
pnpm dlx delta-torch save --reason "${ARGUMENTS:-manual}" <<'EOF'
## Original Prompt
...

## Goal
...

## Work Completed
...

## Current State
...

## Problems / Risks
...

## Next Steps
...

## Resume Prompt
...
EOF
```

Execute the command yourself. Do not ask the user to run it. After saving, report the short task number and suggest continuing it in another agent if needed.
