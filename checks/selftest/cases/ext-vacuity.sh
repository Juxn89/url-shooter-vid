#!/bin/sh
# Purpose: selftest case — vacuity.ledger flags each planted vacuous shape, a second spelling of a literal assertion among them. Env: CHECKS.
set -eu
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
cd "$T"
fail() { echo "ext-vacuity: $*" >&2; exit 1; }
mkdir -p tests/invariants/fixtures
cat > tests/invariants/a.spec.js <<'X'
test('ROW-001 literal', async () => { expect(true).toBe(true); });
test('ROW-002 literal quoted', async () => { expect('x').toBe('x'); });
test('ROW-003 or-constant', async () => { expect(ok || true).toBe(true); });
test.skip('ROW-004 skipped', async () => {});
test('ROW-005 presence', async ({ page }) => { expect(page.locator('#r')).toBeDefined(); });
test('ROW-006 good, a message with an apostrophe', async ({ page }) => { expect(await r(page), "it's the link").toMatch(/x/); });
X
echo 'no header' > tests/invariants/fixtures/f.txt
o=$(sh "$CHECKS/extractors/vacuity.ledger.sh")
for k in a.spec.js:1 a.spec.js:2 a.spec.js:3 a.spec.js:4 a.spec.js:5 circular-fixture; do echo "$o" | grep -q "$k" || fail "missed $k: $o"; done
echo "$o" | grep -q 'a.spec.js:6 ' && fail "flagged the good case: $o"
exit 0
