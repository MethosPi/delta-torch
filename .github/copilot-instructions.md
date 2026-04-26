# DeltaTorch

When a task is long enough that another agent may need to continue it:

- Initialize DeltaTorch with `pnpm dlx delta-torch init` if `.handoff/` does not exist.
- If you are close to token, context, or rate limits, save automatically with `pnpm dlx delta-torch save --reason context-limit`.
- Tell the user the short task number to continue, for example: `Continue task #3 in another agent.`
- If the user asks to continue a saved task, run `pnpm dlx delta-torch resume <latest|task-number|reason>` yourself and continue from the saved prompt.
- Keep handoffs concise and never include secrets.
