// Purpose: ROW-002 (REQ-001) — the page works opened straight from disk with no server: a shot shows a link and no request leaves the page.
// Provenance: hand-authored
//
// ROW-002 promise: shooting https://example.com from a file:// load shows a link, and no request leaves the page.
// ROW-002   Authority: REQ-001 (a valid address becomes https://shooter.app/ + exactly 6 letters and digits; fail-if 1-4)
// ROW-002   — A-003, A-005; A-001 (only shown; there is no server); the element ids are D-009.
// ROW-002 wrong product: a page that works only when served over http (an ES-module script Chrome blocks on file://,
// ROW-002   a fetch to a local API) so from disk the button does nothing; or a page that calls a shortening API, pings
// ROW-002   analytics or pulls a CDN script, so a request leaves the page even though a link shows.
// ROW-002 given: index.html opened as file:///app/index.html with an outbound-request watcher on the whole browser
// ROW-002   context (every scheme but file:, data:, blob:, about:, chrome-extension:, and every WebSocket) attached
// ROW-002   before the navigation, so the page's own load is watched too.
// ROW-002 when: the user types https://example.com in #url-input and clicks #shoot-button.
// ROW-002 then: before the click #result holds no link token; after it, exactly one token, whole, matching
// ROW-002   ^https://shooter.app/[A-Za-z0-9]{6}$ (the whole token, so http://, www. or a 7th character fails); the page is
// ROW-002   still the file:// address; after the network has been quiet for 500 ms the watcher's list is empty.
// ROW-002 controls: the control case proves the watcher can see a request at all — on the same file:// page an image
// ROW-002   and a fetch to the product service, each carrying its own fresh token, are both recorded (matched by token:
// ROW-002   Chromium normalises the URL, e.g. drops :80) — so an empty list in the target is evidence, not blindness.
// ROW-002 technique: before/after on the result plus an absence over a proven-sighted watcher, waited to network
// ROW-002   quiet; the whole-token match keeps a near-miss prefix or length from being cut to fit.
// ROW-002 cases: ROW-002 target=tests/invariants/row-002-reachability-file.spec.js::ROW-002_shot_from_disk_shows_a_link_and_no_request_leaves_the_page control=tests/invariants/row-002-reachability-file.spec.js::ROW-002_control_outbound_watcher_sees_requests_sent_from_a_file_page
'use strict';
const { test, expect } = require('@playwright/test');
const h = require('./harness');

test('ROW-002 control outbound watcher sees requests sent from a file page', async ({ page, context }) => {
  const outbound = h.watchOutbound(context);
  await h.openPage(page, 'file');
  const img = h.fresh('i');
  const fet = h.fresh('f');
  await page.evaluate(([base, a, b]) => {
    const i = new Image();
    i.src = `${base}/index.html?vid-probe=${a}`;
    document.body.appendChild(i);
    fetch(`${base}/index.html?vid-probe=${b}`).catch(() => {});
  }, [h.PRODUCT_URL, img, fet]);
  await expect.poll(() => h.seenWith(outbound, img), { timeout: 5000 }).toBe(true);
  await expect.poll(() => h.seenWith(outbound, fet), { timeout: 5000 }).toBe(true);
});

test('ROW-002 shot from disk shows a link and no request leaves the page', async ({ page, context }) => {
  const outbound = h.watchOutbound(context);
  const url = await h.openPage(page, 'file');

  // Before: no link in the result area.
  const before = await h.resultLinks(page);
  expect(before).toEqual([]);

  await h.shoot(page, 'https://example.com', 'button');
  await h.waitForResultChange(page, before);
  const after = await h.resultLinks(page);

  // After: exactly one link, whole token, of the promised shape.
  expect(after.length).toBe(1);
  expect(after[0]).toMatch(h.LINK_RE);

  // Still the same page from disk, and nothing left it — load, shot, or anything late.
  expect(page.url()).toBe(url);
  await h.quietNetwork(page);
  expect(outbound).toEqual([]);
});
