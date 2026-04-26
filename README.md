# DeltaTorch

Save the task. Switch agent. Keep going.

DeltaTorch is a small handoff skill + CLI for long coding sessions. When one agent is close to token, context, or rate limits, it saves a compact checkpoint. The next agent resumes from that checkpoint instead of redoing the same work.

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
2. When the agent is close to limits, it saves a handoff and tells you something like: `Continue task #3 in another agent`.
3. Open the next agent and say: `continue task 3`.
4. The agent runs DeltaTorch, loads the checkpoint, and continues from the saved state.

Same project. Different agent. No restart.

## What It Does

- Saves compact task checkpoints in `.handoff/`
- Gives each handoff a short task number like `#3`
- Lets another agent resume by task number, reason, or `latest`
- Keeps the format simple and audit-friendly
- Avoids secrets from common private paths and token patterns

## CLI

No global install required.

```bash
pnpm dlx delta-torch init
pnpm dlx delta-torch save --reason auth-refactor
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
- The repo already includes CI plus automated releases/npm publish wiring.

## Manual Claude Install

If you want the Claude-only fallback:

```bash
pnpm dlx delta-torch install-skills --target project
```

## License

MIT
