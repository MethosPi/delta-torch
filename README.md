# DeltaTorch

DeltaTorch is a minimal open-source token handoff skill pack for Claude Code style workflows. It ships a small CLI plus installable skills that save a compact markdown checkpoint under `.handoff/` before context pressure, rate limits, or a mid-task stop make continuation expensive.

It is intentionally not an MCP server, not an orchestrator, and not a daemon. Version 1 only manages project-local handoff files.

## What It Does

- `init` creates `.handoff/` storage.
- `install-skills` copies four Claude Code compatible skills into either project or personal skill directories.
- `save` writes a compact markdown checkpoint using flags, stdin, and filtered git metadata.
- `resume` prints a saved checkpoint plus a clean continuation prompt.
- `list` shows recent checkpoints and the active project handoff state.

## CLI

```bash
pnpm dlx agent-handoff init
pnpm dlx agent-handoff install-skills --target project
pnpm dlx agent-handoff save --reason context-limit
pnpm dlx agent-handoff resume latest
pnpm dlx agent-handoff list
```

### Save From Structured Stdin

```bash
pnpm dlx agent-handoff save --reason context-limit <<'EOF'
## Original Prompt
Build the new handoff package and push it to GitHub.

## Goal
Ship the minimal v1 CLI and Claude Code skills.

## Work Completed
- Scaffolded the TypeScript package.
- Implemented checkpoint persistence.

## Current State
Tests are passing locally.

## Problems / Risks
- The npm name may conflict with an existing package.

## Next Steps
1. Create the public repository.
2. Push the first release commit.
EOF
```

## Installed Skills

- `handoff-guard`: standing instruction for long-running continuity.
- `handoff-save`: explicit `/handoff-save [reason]`.
- `handoff-resume`: explicit `/handoff-resume [latest|id]`.
- `handoff-status`: explicit `/handoff-status`.

Each skill is a short `SKILL.md` plus an optional tiny shell wrapper that forwards to `pnpm dlx agent-handoff ...`.

## File Layout

```text
.handoff/
  config.json
  registry.json
  handoffs/
    2026-04-26T12-30-00Z-context-limit.md
```

## Security Defaults

- Git-derived file lists are filtered to avoid `.env`, private key files, and common private credential paths.
- Freeform checkpoint text is passed through lightweight secret redaction for common key and token patterns.
- No file contents are read automatically.

## Development

```bash
pnpm install
pnpm test
```

## Publish Note

The desired unscoped npm package name `agent-handoff` is already in use on npm as of April 26, 2026. This repository keeps that working name in the codebase because it matches the intended CLI UX, but publishing the exact `pnpm dlx agent-handoff ...` flow will require acquiring that name or renaming before release.
