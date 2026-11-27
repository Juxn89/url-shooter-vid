#!/bin/sh
# Purpose: selftest case — routes.sh lists every top-level page, and declares itself inactive with none. Env: CHECKS.
set -eu
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
cd "$T"
fail() { echo "ext-routes: $*" >&2; exit 1; }
sh "$CHECKS/extractors/routes.sh" | grep -q '^inactive ' || fail 'no page, but not inactive'
touch index.html about.html; mkdir sub; touch sub/x.html
[ "$(sh "$CHECKS/extractors/routes.sh" | sort | tr '\n' ' ')" = 'ok about.html ok index.html ' ] || fail 'wrong route table'
