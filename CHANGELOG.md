# delta-torch

All notable changes to this project are documented in this file. Versions
from `v0.1.5` onward are managed with [changesets](https://github.com/changesets/changesets);
versions before that were backfilled from the git tag history.

## 0.1.6

### Patch Changes

- Tag-driven release pipeline: pushes to `main` no longer auto-publish; releases now require a `v*` tag (or manual `workflow_dispatch`) and refuse to publish unless the tag matches `package.json`.
- CI now runs `pnpm lint` and `pnpm audit --prod` in addition to `pnpm test`, so type errors and runtime-dependency CVEs fail the build.
- `delta-torch resume` reports a clean user-facing error (with a hint to run `delta-torch list`) instead of a stack trace when no checkpoint matches, and only resolves exact id, file basename, task number, or reason — no more silent substring fallbacks.
- Unexpected `git` failures (missing binary, permission errors, corrupted repo) now surface a one-line warning on stderr instead of producing an empty git snapshot in the saved handoff. The "not a git repository" detection path stays silent.
- Secret redaction now covers standalone assignments like `API_KEY=`, `DATABASE_URL=`, `PRIVATE_KEY=`, `ACCESS_KEY=`, `TOKEN=`, `SECRET=`, `PASSWORD=`, `PASS=`, and `DSN=`. Previously these slipped through because the regex required at least one character of prefix before the keyword.
- New unit test suites for `src/security.ts` and `src/text.ts` (45 live assertions across the project, up from 10).
- `.agents/` is now ignored and `marketplace.json` is no longer tracked; the file was developer-local Claude Code state.
- Adopt [changesets](https://github.com/changesets/changesets) for changelog management. CHANGELOG backfilled from git tag history.
- README: replace the placeholder `YYYY-MM-DDTHH-MM-SSZ` timestamp in the Quick Demo with a concrete example matching the real id format, and document the new tag-driven release flow.

## 0.1.5

### Patch Changes

- Polish README copy. ([3d8b45e](https://github.com/MethosPi/delta-torch/commit/3d8b45e))

## 0.1.4

### Patch Changes

- Rework README positioning and add a handoff-metadata filter so git snapshots in checkpoints no longer recursively describe `.handoff/` itself. ([397a45d](https://github.com/MethosPi/delta-torch/commit/397a45d))

## 0.1.3

### Patch Changes

- Integrate the DeltaTorch plugin and skill bundle so `npx skills add MethosPi/delta-torch` installs cleanly into Claude Code, Codex, and Copilot. ([bcd759a](https://github.com/MethosPi/delta-torch/commit/bcd759a))

## 0.1.2

### Patch Changes

- Push annotated tags from the release workflow to make automatic releases reliable. ([ab1d43c](https://github.com/MethosPi/delta-torch/commit/ab1d43c))

## 0.1.1

### Patch Changes

- Publish on every push to `main` from the release workflow. ([fbde5f6](https://github.com/MethosPi/delta-torch/commit/fbde5f6))

## 0.1.0

### Initial release

- Initial DeltaTorch handoff CLI: `init`, `save`, `resume`, `list`, `install-skills`. ([58d3bbb](https://github.com/MethosPi/delta-torch/commit/58d3bbb))
- Rename package to `delta-torch` and automate the release pipeline. ([1ec547d](https://github.com/MethosPi/delta-torch/commit/1ec547d))
- Simplify the cross-agent handoff flow and document planned planner/executor/reviewer handoffs. ([655b301](https://github.com/MethosPi/delta-torch/commit/655b301), [1ca54d9](https://github.com/MethosPi/delta-torch/commit/1ca54d9))
- Bootstrap npm publish workflow with trusted-publishing fallback. ([bfb4767](https://github.com/MethosPi/delta-torch/commit/bfb4767), [919db55](https://github.com/MethosPi/delta-torch/commit/919db55))
- Make skill install portable across runners. ([6c6e5c0](https://github.com/MethosPi/delta-torch/commit/6c6e5c0))
