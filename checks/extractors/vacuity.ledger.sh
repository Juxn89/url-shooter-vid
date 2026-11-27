#!/bin/sh
# Purpose: vacuity census (report-only) — assertions in the ledger's spec files that no wrong product can fail.
# Shapes: expect(<literal>), an or-constant (|| true), test.skip, presence-only toBeDefined/toBeTruthy on a locator,
# a regex filter that matches the empty string, and a fixture whose Provenance: header is absent or names the product.
set -eu
D=${1:-tests/invariants}
files=$(ls "$D"/*.spec.js 2>/dev/null || true)
[ -n "$files" ] || { echo "inactive no spec file under $D"; exit 0; }
n=0
for f in $files; do
  n=$((n + $(grep -c 'expect(' "$f" || true)))
  grep -n 'expect([0-9"'"'"'tfn][^)]*)\.' "$f" | grep -E 'expect\((true|false|null|[0-9]+|"[^"]*"|'"'"'[^'"'"']*'"'"')\)' | sed "s|^\([0-9]*\):.*|orphan $f:\1 literal-assert|" || true
  grep -n '|| *true' "$f" | sed "s|^\([0-9]*\):.*|orphan $f:\1 or-constant|" || true
  grep -n 'test\.skip(' "$f" | sed "s|^\([0-9]*\):.*|orphan $f:\1 skip-on-condition|" || true
  grep -n 'expect(page\.locator([^)]*))\.\(toBeDefined\|toBeTruthy\)()' "$f" | sed "s|^\([0-9]*\):.*|orphan $f:\1 presence-only|" || true
done
for x in $(ls "$D"/fixtures/* 2>/dev/null || true); do head -n 3 "$x" | grep -q 'Provenance: \(hand-authored\|captured\|generated\|regression\)' || echo "orphan $x circular-fixture"; done
echo "population $n"
