#!/bin/sh
# Purpose: selftest case — memory.sh prints exactly one line of one of its two shapes. Env: CHECKS.
set -eu
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
cd "$T"
fail() { echo "ext-memory: $*" >&2; exit 1; }
o=$(sh "$CHECKS/extractors/memory.sh")
[ "$(echo "$o" | wc -l)" -eq 1 ] || fail "not one line: $o"
echo "$o" | grep -Eq '^(free-mb [0-9]+|inactive .+)$' || fail "wrong shape: $o"
