# DeltaTorch

When a task is long enough that another agent may need to continue it, or when the current agent may hit context, usage, rate, or token-budget limits:

- Initialize DeltaTorch with `pnpm dlx delta-torch init` if `.handoff/` does not exist.
- Save automatically when switching agent, switching phase, seeing visible context/usage/rate-limit warnings, or approaching a user-provided token budget threshold. As a default, offer a handoff around 10% remaining and save immediately around 5% remaining.
- Prefer short reasons such as `plan-complete`, `ready-for-implementation`, `ready-for-review`, or `context-limit`.
- Tell the user the short task number to continue, for example: `Continue task #3 in another agent.`
- If the user asks to continue a saved task, run `pnpm dlx delta-torch resume <latest|task-number|reason>` yourself and continue from the saved prompt.
- Keep handoffs concise and never include secrets.
