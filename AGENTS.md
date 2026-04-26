# DeltaTorch

Use DeltaTorch for long tasks that may move between agents or survive context, usage, rate, or token-budget limits.

- If `.handoff/` is missing, run `pnpm dlx delta-torch init`.
- If the user asks to continue a saved task, run `pnpm dlx delta-torch resume <latest|task-number|reason>` yourself.
- Save automatically when the task should move to another agent or phase, or when visible warnings show context pressure, usage/rate limits, or a user-provided token budget threshold. As a default, offer a handoff around 10% remaining and save immediately around 5% remaining. Use reasons such as `plan-complete`, `ready-for-implementation`, `ready-for-review`, or `context-limit`.
- After saving, tell the user which short task number to continue, for example: `Continue task #3 in another agent.`
- Keep handoffs short and useful. Never include secrets.
- Do not ask the user to run DeltaTorch commands manually if you can run them yourself.
