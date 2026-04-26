# DeltaTorch

Save the task. Switch agent. Keep going.

DeltaTorch is a small handoff skill + CLI for coding sessions that move between agents. One agent saves a compact checkpoint. The next agent resumes from that checkpoint instead of redoing the same work.

Works with Claude Code, Codex, Copilot, and local agents too. The handoff is just Markdown in `.handoff/`.

[npm](https://www.npmjs.com/package/delta-torch)

## Install

Pick your agent. One command. Done.

| Agent | Install |
| --- | --- |
| Claude Code | `npx skills add MethosPi/delta-torch -a claude-code -y` |
| Codex | `npx skills add MethosPi/delta-torch -a codex -y` |
| GitHub Copilot | `npx skills add MethosPi/delta-torch -a github-copilot -y` |
| Any other | `npx skills add MethosPi/delta-torch -y` |

Install once. After that, the agent should run DeltaTorch itself instead of asking you to copy commands.

## Flow

1. Work in Claude Code, Codex, Copilot, or a local Ollama-based agent.
2. Save a handoff when you want to switch agent, switch model, switch phase, or just preserve progress.
3. Open the next agent and say: `continue task 3`.
4. The agent runs DeltaTorch, loads the checkpoint, and continues from the saved state.

Same project. Different agent. No restart.

Use it for:

- Claude writes the plan, Codex executes it
- Codex implements, Claude reviews
- Claude prepares the task, local Ollama finishes it
- Local model explores, stronger model takes the final pass
- Any agent saves before limits, then another agent continues

## What It Does

- Saves compact task checkpoints in `.handoff/`
- Gives each handoff a short task number like `#3`
- Lets another agent resume by task number, reason, or `latest`
- Works for intentional handoffs, not only limit recovery
- Keeps the format simple and audit-friendly
- Avoids secrets from common private paths and token patterns

## CLI

No global install required.

```bash
pnpm dlx delta-torch init
pnpm dlx delta-torch save --reason ready-for-review
pnpm dlx delta-torch resume 3
pnpm dlx delta-torch list
```

If you want the CLI in the repo:

```bash
pnpm add -D delta-torch
```

## File Layout

```text
.handoff/
  config.json
  registry.json
  handoffs/
    2026-04-26T12-30-00Z-context-limit.md
```

Each handoff stores:

- original prompt
- goal
- completed work
- current state
- changed files
- commands run
- risks
- next steps
- a ready-to-use resume prompt

## Notes

- DeltaTorch is not an MCP server, not an orchestrator, and not a daemon.
- Claude Code gets slash-friendly skills. Other agents use the same handoff files and CLI.
- Every push to `main` runs tests and publishes a new npm/GitHub release.

## Manual Claude Install

If you want the Claude-only fallback:

```bash
pnpm dlx delta-torch install-skills --target project
```

## License

MIT
