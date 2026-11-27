// Purpose: ROW-041, ROW-045 (REQ-001) — the page works from any folder it is copied to, and it declares UTF-8 so its text never mis-decodes from disk.
// Provenance: hand-authored
//
// ROW-041 promise: the page works wherever its folder is copied — copied to a new directory whose path holds a
// ROW-041   space and a non-ASCII letter and opened from there by file://, shooting https://example.com shows a link
// ROW-041   with no console error and no failed resource load. Authority: REQ-001 fail-if (1) (a valid address
// ROW-041   produces a link) as the owner runs it — a local page opened in Chrome; the row's own example value.
// ROW-041 wrong product: scripts named by absolute path (file:///app/app/page.js or /app/...), which still load in
// ROW-041   the original checkout but not from a copy; a <script type="module"> (Chrome refuses it over file://);
// ROW-041   a script fetched from a CDN; a path built from location by string handling that breaks on %20 or
// ROW-041   a percent-encoded é.
// ROW-041 given: the checkout's files (bar .git, .vid, node_modules) copied to <tmp>/<fresh>/Shooter démo copy;
// ROW-041   an error collector (console errors, uncaught errors, failed requests) armed before the navigation.
// ROW-041 when: index.html opened from the copy by its file:// URL; https://example.com shot through the button.
// ROW-041 then: #result went from no link to exactly one LINK_RE link; the error list is empty; and every resource
// ROW-041   the page names or loaded (script src, stylesheet/icon/preload href, img src, resource-timing entries) is a
// ROW-041   data:/blob: URL or lies inside the copy — so a product still reaching into the original folder fails.
// ROW-041 controls: the copy holds index.html, the page's location is inside the copy (decoded path carries the
// ROW-041   space and the é), and the collector sees a failed load of a missing fresh file injected there — the
// ROW-041   instrument sees a failure, so an empty list is evidence.
// ROW-041 technique: the owner's real move (copy the folder, open from disk), a path holding both hard characters,
// ROW-041   and a containment check that turns "still works because the original is next door" into a failure.
// ROW-041 cases: ROW-041 target=tests/invariants/row-041-045-req-001-portable-page.spec.js::ROW-041_the_page_copied_to_a_folder_with_a_space_and_an_e_acute_shoots_with_no_error control=tests/invariants/row-041-045-req-001-portable-page.spec.js::ROW-041_control_the_copy_opens_from_its_own_folder_and_the_collector_sees_a_failed_load
//
// ROW-045 promise: the page declares UTF-8 within its first 1024 bytes, and opened from file:// its visible text,
// ROW-045   title and accessible names show no replacement or mis-decoded characters. Authority: REQ-001 (the page
// ROW-045   the owner opens locally in Chrome, English only, CLAUDE.md product line); the row's own 1024-byte figure
// ROW-045   (the HTML prescan window).
// ROW-045 wrong product: no charset declaration (Chrome guesses from disk — windows-1252 — and an ellipsis or a
// ROW-045   dash in the text shows as â€¦); a <meta charset> placed after a long head comment or style block past
// ROW-045   byte 1024; a declaration hidden inside a comment; a declaration of another encoding.
// ROW-045 given: the document's bytes as delivered by the product service (the same file the owner opens; the
// ROW-045   bytes a browser receives, not source read as text); the page opened from disk.
// ROW-045 when: the bytes are prescanned as the HTML standard does (BOM, else a meta outside comments within the
// ROW-045   first 1024 bytes); the page is loaded by file://.
// ROW-045 then: the prescan finds a UTF-8 declaration; document.characterSet is UTF-8; the title, the body's
// ROW-045   visible text and the accessibility tree's names (aria snapshot) hold no U+FFFD and no mis-decoding
// ROW-045   pattern (Ã or Â followed by a Latin-1 continuation, â€).
// ROW-045 controls: the prescan, fed made-up documents, finds a meta at the top and a BOM, and finds none past
// ROW-045   byte 1024, inside a comment, or for another charset; the mis-decoding detector flags Ã©, â€” and U+FFFD
// ROW-045   and passes é and —; the product service answers 200 with an HTML document.
// ROW-045 technique: the standard's own prescan rule applied to the delivered bytes (the row's threshold), plus
// ROW-045   the effect the user meets from disk, with both instruments shown to discriminate.
// ROW-045 cases: ROW-045 target=tests/invariants/row-041-045-req-001-portable-page.spec.js::ROW-045_the_page_declares_UTF-8_in_its_first_1024_bytes_and_shows_no_mis-decoded_text_from_disk control=tests/invariants/row-041-045-req-001-portable-page.spec.js::ROW-045_control_the_prescan_and_the_mis-decoding_detector_discriminate_and_the_service_answers
'use strict';
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');
const h = require('./harness');

// ---- ROW-041 ----

const SKIP = new Set(['.git', '.vid', 'node_modules']);

/** Copies the checkout's folder (bar .git, .vid, node_modules) to a fresh folder whose name holds a space and an é. */
function copyFolder() {
  const parent = path.join(os.tmpdir(), h.fresh('copy'));
  const dest = path.join(parent, 'Shooter démo copy');
  fs.mkdirSync(parent, { recursive: true });
  fs.cpSync(h.FILE_ROOT, dest, {
    recursive: true,
    filter: (src) => !SKIP.has(path.relative(h.FILE_ROOT, src).split(path.sep)[0]),
  });
  return { parent, dest, url: pathToFileURL(path.join(dest, 'index.html')).href, prefix: pathToFileURL(dest).href + '/' };
}

const decode = (u) => { try { return decodeURI(u); } catch (e) { return u; } };

test('ROW-041 control the copy opens from its own folder and the collector sees a failed load', async ({ page }) => {
  const copy = copyFolder();
  try {
    expect(fs.existsSync(path.join(copy.dest, 'index.html'))).toBe(true);
    const errors = h.collectErrors(page);
    await page.goto(copy.url, { waitUntil: 'load' });
    const where = decode(page.url());
    expect(where.startsWith(decode(copy.prefix))).toBe(true);
    expect(where).toContain('Shooter démo copy');
    const missing = h.fresh('m');
    await page.evaluate((f) => { const s = document.createElement('script'); s.src = `${f}.js`; document.head.appendChild(s); }, missing);
    await expect.poll(() => errors.some((e) => e.includes(missing)), { timeout: 5000 }).toBe(true);
  } finally {
    fs.rmSync(copy.parent, { recursive: true, force: true });
  }
});

test('ROW-041 the page copied to a folder with a space and an e acute shoots with no error', async ({ page }) => {
  const copy = copyFolder();
  try {
    const errors = h.collectErrors(page);
    await page.goto(copy.url, { waitUntil: 'load' });
    expect(await h.resultLinks(page)).toEqual([]);
    await h.shoot(page, 'https://example.com', 'button');
    await h.waitForResultChange(page, []);
    const links = await h.resultLinks(page);
    expect(links.length, `ROW-041: shooting from the copy showed ${JSON.stringify(links)}`).toBe(1);
    expect(links[0]).toMatch(h.LINK_RE);

    const refs = await page.evaluate(() => {
      const u = [];
      document.querySelectorAll('script[src], img[src], source[src], iframe[src]').forEach((e) => u.push(e.src));
      document.querySelectorAll('link[rel~="stylesheet"], link[rel~="icon"], link[rel~="preload"], link[rel~="modulepreload"]').forEach((e) => u.push(e.href));
      performance.getEntriesByType('resource').forEach((e) => u.push(e.name));
      return u;
    });
    const outside = refs.filter((u) => !/^(data|blob):/i.test(u) && !decode(u).startsWith(decode(copy.prefix)));
    expect(outside, 'ROW-041: the copied page loads resources from outside its own folder').toEqual([]);
    await h.settle(page);
    expect(errors, 'ROW-041: errors from the copied page').toEqual([]);
  } finally {
    fs.rmSync(copy.parent, { recursive: true, force: true });
  }
});

// ---- ROW-045 ----

/** The HTML prescan, reduced: 'bom' for a UTF-8 BOM; else 'meta' when a meta outside comments in the first 1024 bytes declares UTF-8; else null. */
function declaresUtf8(buf) {
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) return 'bom';
  const head = buf.subarray(0, 1024).toString('latin1').replace(/<!--[\s\S]*?(-->|$)/g, '');
  const metas = head.match(/<meta\b[^>]*(>|$)/gi) || [];
  return metas.some((m) => /\bcharset\s*=\s*["']?\s*utf-?8(?![\w-])/i.test(m)) ? 'meta' : null;
}

/** Characters a mis-decoded page shows: U+FFFD, UTF-8 bytes read as Latin-1/windows-1252 (Ã©, Â , â€…). */
const MISDECODED = /�|[ÂÃ][\u0080-¿]|â€/;

test('ROW-045 control the prescan and the mis-decoding detector discriminate and the service answers', async ({ request }) => {
  const doc = (s) => Buffer.from(s, 'latin1');
  expect(declaresUtf8(doc('<!doctype html><html><head><meta charset="utf-8"><title>x</title>'))).toBe('meta');
  expect(declaresUtf8(doc('<!doctype html><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">'))).toBe('meta');
  expect(declaresUtf8(Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), doc('<!doctype html>')]))).toBe('bom');
  expect(declaresUtf8(doc(`<!doctype html><!-- ${'x'.repeat(1100)} --><meta charset="utf-8">`))).toBe(null);
  expect(declaresUtf8(doc('<!doctype html><!-- <meta charset="utf-8"> --><title>x</title>'))).toBe(null);
  expect(declaresUtf8(doc('<!doctype html><meta charset="windows-1252">'))).toBe(null);
  expect(declaresUtf8(doc('<!doctype html><meta charset="utf-16">'))).toBe(null);
  expect(declaresUtf8(doc('<!doctype html><title>x</title>'))).toBe(null);

  for (const bad of ['cafÃ©', 'a â€” b', 'x�y', 'Â ']) expect(MISDECODED.test(bad), bad).toBe(true);
  for (const good of ['café', 'a — b', 'Shoot', 'https://shooter.app/aB3dE9']) expect(MISDECODED.test(good), good).toBe(false);

  const res = await request.get(`${h.PRODUCT_URL}/index.html`);
  expect(res.status()).toBe(200);
  expect((await res.body()).toString('latin1')).toMatch(/<html|<!doctype/i);
});

test('ROW-045 the page declares UTF-8 in its first 1024 bytes and shows no mis-decoded text from disk', async ({ page, request }) => {
  const res = await request.get(`${h.PRODUCT_URL}/index.html`);
  expect(res.status()).toBe(200);
  expect(declaresUtf8(await res.body()), 'ROW-045: no UTF-8 declaration (BOM or meta) within the first 1024 bytes').not.toBeNull();

  await h.openPage(page, 'file');
  const seen = await page.evaluate(() => ({ charset: document.characterSet, title: document.title, text: document.body.innerText }));
  expect(seen.charset, 'ROW-045: the page opened from disk is not decoded as UTF-8').toBe('UTF-8');
  const aria = await page.locator('body').ariaSnapshot();
  for (const [what, s] of [['title', seen.title], ['visible text', seen.text], ['accessible names', aria]]) {
    const m = s.match(MISDECODED);
    expect(m, `ROW-045: mis-decoded characters in the ${what}: ${m && JSON.stringify(s.slice(Math.max(0, m.index - 20), m.index + 20))}`).toBeNull();
  }
});
