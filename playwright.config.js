// Purpose: the ledger runner's configuration — Chromium only (D-002), output outside the read-only /app mount.
const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests/invariants',
  testMatch: '**/*.spec.js',
  outputDir: '/tmp/pw-output',
  workers: 1,
  retries: 0,
  use: { browserName: 'chromium', headless: true },
});
