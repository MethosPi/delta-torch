#!/usr/bin/env bash
set -euo pipefail

pnpm dlx agent-handoff list "$@"
