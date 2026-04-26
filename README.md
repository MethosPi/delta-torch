# DeltaTorch

Save tokens. Survive context limits. Finish the task.

DeltaTorch is a tiny CLI that lets any terminal agent save a compact checkpoint before context pressure, rate limits, or token exhaustion force a stop. The next agent reads that checkpoint, gets a clean resume prompt, and keeps going without burning tokens rediscovering the project state.

It works with Claude Code, Codex, OpenCode, Hermes Agent, and local agents running through Ollama or other providers, because the handoff format is plain Markdown under `.handoff/`.

npm package: [delta-torch](https://www.npmjs.com/package/delta-torch)

## Why It Exists

- Stop paying for the same context twice.
- Keep long tasks moving when one agent hits limits.
- Switch from a cloud agent to a cheaper or local model without losing momentum.
- Leave behind a checkpoint another human or agent can audit in seconds.

DeltaTorch is intentionally small. It is not an MCP server, not an orchestrator, not a daemon, and not a dashboard. It just creates portable handoff files that help agents continue real work.

## The Core Loop

```bash
pnpm dlx delta-torch init
pnpm dlx delta-torch save --reason context-limit
pnpm dlx delta-torch resume latest
pnpm dlx delta-torch list
```

1. Start a task with your preferred CLI agent.
2. Before the session gets expensive or unstable, save a handoff.
3. Launch another agent.
4. Resume from the generated checkpoint and keep shipping.

## Cross-Agent Example

You start a refactor in Claude Code.

Claude is near its context limit, so you save:

```bash
pnpm dlx delta-torch save --reason context-limit <<'EOF'
## Original Prompt
Refactor the auth flow and keep tests green.

## Goal
Ship the refactor without restarting the work.

## Work Completed
- Moved session parsing into a shared module.
- Updated API handlers.

## Current State
- Most code is done.
- Two integration tests still fail.

## Problems / Risks
- Cookie parsing may still differ in edge runtime.

## Next Steps
1. Fix the failing tests.
2. Re-run the auth suite.
3. Commit only the refactor files.
EOF
```

Now Claude stops. You open Codex, OpenCode, Hermes Agent, or a local Ollama-powered agent and run:

```bash
pnpm dlx delta-torch resume latest
```

DeltaTorch prints the saved checkpoint plus a ready-to-paste `Resume Prompt`. Paste it into the next agent and continue the same task instead of re-explaining the repo from scratch.

That is the whole point: less wasted context, lower cost, more completed tasks.

## Works With Any CLI Agent

The handoff artifact is the product.

- The checkpoint is a Markdown file in `.handoff/handoffs/`.
- The resume payload is plain text, so any agent can consume it.
- Claude Code gets optional skills because it supports folder-based `SKILL.md` skills natively.
- Everyone else can use DeltaTorch directly from the CLI without any plugin system.

## Optional Claude Code Skills

If you use Claude Code, you can install the skill pack:

```bash
pnpm dlx delta-torch install-skills --target project
```

Installed skills:

- `handoff-guard`: reminds the agent to save before context pressure becomes a problem.
- `handoff-save`: creates a checkpoint on demand.
- `handoff-resume`: loads the latest or requested checkpoint.
- `handoff-status`: shows recent handoffs for the current project.

These skills are convenience wrappers around the CLI. They are not required for Codex, Ollama-based agents, or any other terminal workflow.

## Commands

```bash
pnpm dlx delta-torch init
pnpm dlx delta-torch install-skills --target project
pnpm dlx delta-torch save --reason context-limit
pnpm dlx delta-torch resume latest
pnpm dlx delta-torch list
```

### `save`

`save` accepts structured Markdown on stdin and merges it with safe git metadata such as the current branch and filtered `git status --short`.

```bash
pnpm dlx delta-torch save --reason handoff <<'EOF'
## Goal
Finish the migration.

## Work Completed
- Replaced the old queue consumer.

## Current State
- Production config still needs validation.

## Next Steps
1. Run staging smoke tests.
2. Roll forward if metrics stay clean.
EOF
```

### `resume`

`resume` prints the checkpoint and a continuation prompt that can be pasted into another agent.

```bash
pnpm dlx delta-torch resume latest
```

### `list`

`list` shows the recent checkpoint history for the current project.

```bash
pnpm dlx delta-torch list
```

## File Layout

```text
.handoff/
  config.json
  registry.json
  handoffs/
    2026-04-26T12-30-00Z-context-limit.md
```

Each checkpoint contains:

- original prompt
- goal
- work completed
- current state
- changed files
- commands run
- problems or risks
- next steps
- a resume prompt for the next agent

## Security Defaults

- DeltaTorch never reads your file contents automatically.
- Git-derived file lists are filtered to avoid `.env`, private keys, and common private credential paths.
- Freeform checkpoint text is passed through lightweight secret redaction for common token and key patterns.

## Release Automation

This repository is wired for automated versioning, GitHub Releases, and npm publishing.

- CI runs on push and pull request.
- Release Please opens version PRs from conventional commits.
- Publishing happens from GitHub Actions to [npm](https://www.npmjs.com/package/delta-torch).

One-time setup still required on npm:

1. Create the `delta-torch` package in the `MethosPi` npm account.
2. Configure npm Trusted Publishing for the `MethosPi/delta-torch` GitHub repository and `.github/workflows/release.yml`.

After that, merging releasable commits to `main` is enough to cut versions and publish.

## Development

```bash
pnpm install
pnpm test
```

Use conventional commits such as `feat:` and `fix:` if you want the automated release flow to produce clean version bumps and release notes.
