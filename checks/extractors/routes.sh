#!/bin/sh
# Purpose: the route table — every page the product serves is a top-level .html file (one page today: index.html).
set -eu
n=0
for f in *.html; do [ -f "$f" ] || continue; echo "ok $f"; n=$((n + 1)); done
[ "$n" -gt 0 ] || echo "inactive no .html page at the repository root"
