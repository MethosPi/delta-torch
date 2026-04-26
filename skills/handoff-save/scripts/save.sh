#!/usr/bin/env bash
set -euo pipefail

reason="${1:-manual}"
if [[ -z "${reason}" ]]; then
  reason="manual"
fi

shift || true
pnpm dlx agent-handoff save --reason "${reason}" "$@"
