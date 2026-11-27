#!/bin/sh
# Purpose: the results reader — Playwright's JUnit report into `case <path>::<name> <status> <seconds>` lines.
# A testcase's classname is the spec file relative to tests/invariants; failure, error and skipped children set its status.
set -eu
R=${1:-}
[ -n "$R" ] && [ -r "$R" ] || { echo "inactive no readable report: ${R:-none}"; exit 0; }
grep -q '<testsuites\|<testsuite' "$R" || { echo "inactive not a JUnit report: $R"; exit 0; }
awk '
function attr(s, k,   m) { if (match(s, k "=\"[^\"]*\"")) { m = substr(s, RSTART + length(k) + 2, RLENGTH - length(k) - 3); return m } return "" }
function emit() { if (open) { gsub(/[ \t]+/, "_", name); printf "case tests/invariants/%s::%s %s %s\n", cls, name, st, (t == "" ? 0 : t) } open = 0 }
/<testcase / { emit(); name = attr($0, "name"); cls = attr($0, "classname"); t = attr($0, "time"); st = "passed"; open = 1 }
/<failure/ { if (open) st = "failed" } /<error/ { if (open) st = "error" } /<skipped/ { if (open) st = "skipped" }
/<\/testcase>/ || /<testcase [^>]*\/>/ { emit() }
END { emit() }' "$R"
