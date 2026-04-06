#!/usr/bin/env bash
set -euo pipefail

QUERY="$1"

gemini \
  -p "@research-only $QUERY

Constraint: only quote from fetched page content. Do not generate quotes from memory."

