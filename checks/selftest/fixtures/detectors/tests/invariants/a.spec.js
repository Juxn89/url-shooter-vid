// Purpose: labelled detector fixture — known weak and known good ledger tests.
test('ROW-001 weak literal', async () => { expect(true).toBe(true); });
test('ROW-002 weak or-constant', async () => { expect(ok || true).toBe(true); });
test('ROW-003 good apostrophe', async ({ page }) => { expect(await r(page), "it's the link").toMatch(/x/); });
test('ROW-004 weak existence', async ({ page }) => {
  await expect(page.locator('#result')).toBeVisible();
});
test('ROW-005 good value', async ({ page }) => {
  expect(await v(page)).toBe('https://shooter.app/abc123');
});
