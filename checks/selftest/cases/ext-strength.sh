#!/bin/sh
# Purpose: selftest case — strength.ledger reads at function grain: a Tier-0 row bound to an existence-only function is flagged
# though a value assertion sits elsewhere in the file; a row naming no function is unbound. Env: CHECKS.
set -eu
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
cd "$T"
fail() { echo "ext-strength: $*" >&2; exit 1; }
mkdir -p tests/invariants
printf 'REQ-001 | functional | T0 | x | fail-if: (1) y\nREQ-002 | functional | T0 | x | fail-if: (1) y\n' > PRD.md
printf 'ROW-001 | behavior | REQ-001 | a | n/a | o | REQ-001 | tests/invariants/a.spec.js\nROW-002 | behavior | REQ-002 | a | n/a | o | REQ-002 | tests/invariants/a.spec.js\n' > INVENTORY.md
cat > tests/invariants/a.spec.js <<'X'
test('ROW-001 the link shows', async ({ page }) => {
  await expect(page.locator('#result')).toBeVisible();
});
test('another check', async ({ page }) => {
  expect(await v(page)).toBe('x');
});
X
o=$(sh "$CHECKS/extractors/strength.ledger.sh")
echo "$o" | grep -q 'existence ROW-001' || fail "existence-only row not flagged: $o"
echo "$o" | grep -q 'unbound-row ROW-002' || fail "unbound row not flagged: $o"
