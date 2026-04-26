---
name: handoff-save
description: Saves a compact handoff checkpoint into .handoff/ before the current session loses useful context.
argument-hint: [reason]
disable-model-invocation: true
---

Create a concise checkpoint for the current project state.

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
4. Save the checkpoint by running the bundled wrapper script:

```bash
"${CLAUDE_SKILL_DIR}/scripts/save.sh" "$ARGUMENTS" <<'EOF'
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

The wrapper forwards to `pnpm dlx delta-torch save --reason ...`. After saving, report the checkpoint id and path.
