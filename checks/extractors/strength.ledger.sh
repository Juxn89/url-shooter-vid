#!/bin/sh
# Purpose: strength census (report-only) — for each Tier-0 row, its test function's strongest assertion on the ladder
# Existence → Type → Status → Value → Behavioral; an orphan is a Tier-0 row whose strongest is Existence. Grain: the function.
set -eu
I=${1:-INVENTORY.md}
t0=$(grep -Eo '^REQ-[0-9]+( AMENDED)? \| [a-z_]+ \| T0 ' PRD.md 2>/dev/null | cut -d' ' -f1 | sort -u || true)
rows=$(awk -F' \\| ' '/^ROW-/ { print $1 "|" $3 "|" $8 }' "$I" | while IFS='|' read -r id subj test; do
  for t in $t0; do [ "$subj" = "$t" ] && echo "$id|$test"; done; done || true)
[ -n "$rows" ] || { echo "inactive no Tier-0 row in $I"; exit 0; }
n=0
for r in $rows; do id=${r%%|*}; f=${r#*|}; n=$((n + 1))
  [ -f "$f" ] || { echo "orphan $f unbound-row $id"; continue; }
  body=$(awk -v id="$id" 'index($0, id) && /test\(/ { on = 1 } on { print } on && /^}\);/ { exit }' "$f")
  [ -n "$body" ] || { echo "orphan $f unbound-row $id"; continue; }
  echo "$body" | grep -Eq 'toBe\(|toEqual\(|toMatch\(|toHaveText\(|toHaveValue\(|not\.toBe' && { echo "ok $id"; continue; }
  echo "orphan $f existence $id"
done
echo "population $n"
