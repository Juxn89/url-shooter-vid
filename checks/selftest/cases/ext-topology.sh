#!/bin/sh
# Purpose: selftest case — dead-path.topology flags a schedule no declared process consumes, and is inactive without one. Env: CHECKS.
set -eu
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
cd "$T"
fail() { echo "ext-topology: $*" >&2; exit 1; }
mkdir app; echo 'x();' > app/page.js; printf 'x-vid-harness:\n  product: product\n' > docker-compose.test.yml
sh "$CHECKS/extractors/dead-path.topology.sh" | grep -q '^inactive ' || fail 'no schedule, but not inactive'
echo 'setInterval(tick, 1000);' > app/page.js
sh "$CHECKS/extractors/dead-path.topology.sh" | grep -q '^orphan schedule:' || fail 'unconsumed schedule not flagged'
