#!/bin/sh
# Purpose: selftest case — results.sh reads a JUnit report with one case of each status as four lines. Env: CHECKS.
set -eu
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
cd "$T"
fail() { echo "ext-results: $*" >&2; exit 1; }
cat > r.xml <<'X'
<testsuites><testsuite name="a.spec.js">
<testcase name="ROW-001 passes" classname="a.spec.js" time="1.5"></testcase>
<testcase name="ROW-002 fails" classname="a.spec.js" time="2"><failure message="x">boom</failure></testcase>
<testcase name="ROW-003 skips" classname="a.spec.js" time="0"><skipped/></testcase>
<testcase name="ROW-004 errs" classname="a.spec.js" time="0.1"><error message="y"/></testcase>
</testsuite></testsuites>
X
o=$(sh "$CHECKS/extractors/results.sh" r.xml)
[ "$(echo "$o" | wc -l)" -eq 4 ] || fail "not four lines: $o"
echo "$o" | grep -qx 'case tests/invariants/a.spec.js::ROW-002_fails failed 2' || fail "failure not read: $o"
echo "$o" | grep -q '::ROW-003_skips skipped' || fail 'skipped not read'
echo "$o" | grep -q '::ROW-004_errs error' || fail 'error not read'
sh "$CHECKS/extractors/results.sh" missing.xml | grep -q '^inactive ' || fail 'missing report not inactive'
