# DeltaTorch

Use DeltaTorch for long tasks that may move between agents.

- If `.handoff/` is missing, run `pnpm dlx delta-torch init`.
- If the user asks to continue a saved task, run `pnpm dlx delta-torch resume <latest|task-number|reason>` yourself.
- If token, context, or rate pressure is getting close, save automatically with `pnpm dlx delta-torch save --reason context-limit`.
- After saving, tell the user which short task number to continue, for example: `Continue task #3 in another agent.`
- Keep handoffs short and useful. Never include secrets.
- Do not ask the user to run DeltaTorch commands manually if you can run them yourself.
