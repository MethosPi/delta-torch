# delta-torch

All notable changes to this project are documented in this file. Versions
from `v0.1.5` onward are managed with [changesets](https://github.com/changesets/changesets);
versions before that were backfilled from the git tag history.

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
