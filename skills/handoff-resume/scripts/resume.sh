#!/usr/bin/env bash
set -euo pipefail

target="${1:-latest}"
if [[ -z "${target}" ]]; then
  target="latest"
fi

shift || true
pnpm dlx delta-torch resume "${target}" "$@"
