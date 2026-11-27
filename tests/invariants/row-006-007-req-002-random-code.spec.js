// Purpose: ROW-006, ROW-007 (REQ-002) — codes use all 62 letters and digits and nothing else, and they come from crypto.getRandomValues.
// Provenance: hand-authored
//
// ROW-006 promise: across 2,000 shots in one page load the codes together contain every one of the 62 characters
// ROW-006   A-Z, a-z, 0-9, and no other character. Authority: REQ-002 fail-if (1); A-010 (upper-case, lower-case
// ROW-006   and digits, each picked at random); REQ-001 / A-003 (letters and digits only).
// ROW-006 wrong product: an alphabet short of the promise — lower-case and digits only (base36), hex, upper-case
// ROW-006   only, or a "readable" alphabet that drops 0 O 1 l I — or one that adds - or _ (base64url).
// ROW-006 given: one page load from disk; 2,000 distinct fresh addresses https://example.com/<fresh>/<n>.
// ROW-006 when: the first shot through the real button; the next 1,999 through the page's own controls in one
// ROW-006   in-page loop (h.shootMany: the field's value set, the button's click(), wait per frame for the new link).
// ROW-006 then: every shot showed exactly one new LINK_RE link (so 2,000 codes were read, none skipped), and the
// ROW-006   set of characters over all codes equals the 62-character alphabet exactly — none missing, none extra.
// ROW-006   (12,000 uniform draws over 62 characters miss one with probability about 62·(61/62)^12000 ≈ 1e-83.)
// ROW-006 controls: one real-click shot and one in-page loop shot each show a new LINK_RE link in the same load —
// ROW-006   the fast door reaches the product; and the alphabet comparison, fed a base36 set, reports what is missing.
// ROW-006 technique: a property over generated inputs ("for all characters") with a count large enough that a
// ROW-006   right product cannot miss a character by chance; whole-set equality, never a subset check.
// ROW-006 cases: ROW-006 target=tests/invariants/row-006-007-req-002-random-code.spec.js::ROW-006_2000_shots_in_one_load_use_all_62_letters_and_digits_and_nothing_else control=tests/invariants/row-006-007-req-002-random-code.spec.js::ROW-006_control_a_real_click_and_an_in-page_shot_both_reach_the_product
//
// ROW-007 promise: the code comes from crypto.getRandomValues — with that function stubbed before load to return a
// ROW-007   fixed byte sequence (first 6 bytes within 0..61, then varying bytes): the same sequence gives the same
// ROW-007   first code on two fresh loads; a different sequence a different first code; changing any one of the first
// ROW-007   6 bytes to another value within 0..61 changes the first code; replacing Math.random with a constant
// ROW-007   changes nothing about the codes shown. Authority: REQ-002 fail-if (2), (3); A-015 (crypto.getRandomValues);
// ROW-007   D-008 (one byte per character, byte below 248 maps by modulo 62 — so bytes 0..61 are never redrawn).
// ROW-007 wrong product: the code from Math.random; or derived from the typed address (same address, same code);
// ROW-007   or crypto bytes mixed with Math.random or the clock; or a code that uses only some of the 6 bytes it
// ROW-007   draws (one character from a counter, or 12 bytes drawn and the last 6 used).
// ROW-007 given: a fresh 6-byte sequence S within 0..61 per run; S' with every byte different; six one-byte
// ROW-007   variants of S; the same fresh address on every load; each load a new page with the stub installed by
// ROW-007   h.stubRandomQueue before any page script runs (queued bytes first, real random after).
// ROW-007 when: one button shot per fresh load: S, S again, S', each variant, and S with Math.random = () => 0.5.
// ROW-007 then: code(S) = code(S again); code(S') ≠ code(S); each variant's code ≠ code(S); code(S with
// ROW-007   Math.random constant) = code(S); every code matches LINK_RE.
// ROW-007 controls: the stub is the page's crypto.getRandomValues before its scripts run and hands the queued
// ROW-007   bytes first then varying ones (a call made by the test in a fresh page returns S then other bytes), and a
// ROW-007   stubbed load still shows a link — the setup works and the decision is reached.
// ROW-007 technique: a fake of the external source checked against its real contract (fills a typed array,
// ROW-007   returns it); a relation between runs (same input same output, changed input changed output) instead of
// ROW-007   an expected code computed here — no expectation is computed from the product's own mapping.
// ROW-007 cases: ROW-007 target=tests/invariants/row-006-007-req-002-random-code.spec.js::ROW-007_the_first_code_follows_the_crypto_bytes_and_ignores_Math_random control=tests/invariants/row-006-007-req-002-random-code.spec.js::ROW-007_control_the_stub_is_the_page_random_source_before_load_and_a_stubbed_load_shows_a_link
'use strict';
const { test, expect } = require('@playwright/test');
const { randomInt } = require('crypto');
const h = require('./harness');

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const codeOf = (link) => link.slice('https://shooter.app/'.length);

/** Characters of the alphabet missing from `chars`, and characters of `chars` outside it. */
function alphabetGap(chars) {
  const seen = new Set(chars);
  return { missing: [...ALPHABET].filter((c) => !seen.has(c)).join(''), extra: [...seen].filter((c) => !ALPHABET.includes(c)).join('') };
}

// ---- ROW-006 ----

test('ROW-006 control a real click and an in-page shot both reach the product', async ({ page }) => {
  await h.openPage(page, 'file');
  await h.shoot(page, `https://example.com/${h.fresh('c6')}`, 'button');
  await h.waitForResultChange(page, []);
  const first = await h.resultLinks(page);
  expect(first.length).toBe(1);
  expect(first[0]).toMatch(h.LINK_RE);
  const shots = await h.shootMany(page, [`https://example.com/${h.fresh('c6')}`]);
  expect(shots.length).toBe(1);
  expect(shots[0].changed).toBe(true);
  expect(shots[0].links.length).toBe(1);
  expect(shots[0].links[0]).toMatch(h.LINK_RE);
  expect(shots[0].links[0]).not.toBe(first[0]);
  expect(alphabetGap('0123456789abcdefghijklmnopqrstuvwxyz').missing).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  expect(alphabetGap('aB3-_').extra).toBe('-_');
});

test('ROW-006 2000 shots in one load use all 62 letters and digits and nothing else', async ({ page }) => {
  test.setTimeout(300000);
  await h.openPage(page, 'file');
  const sentinel = await h.plantSentinel(page);
  const tag = h.fresh('r6');

  await h.shoot(page, `https://example.com/${tag}/0`, 'button');
  await h.waitForResultChange(page, []);
  const first = await h.resultLinks(page);
  expect(first.length, 'ROW-006: the first real shot showed no single link').toBe(1);

  const addrs = Array.from({ length: 1999 }, (_, i) => `https://example.com/${tag}/${i + 1}`);
  const shots = await h.shootMany(page, addrs);
  expect(await h.sentinelIntact(page, sentinel), 'ROW-006: the page reloaded during the 2,000 shots').toBe(true);

  const links = [first, ...shots.map((s) => s.links)];
  const bad = shots.map((s, i) => ({ i: i + 1, s })).filter(({ s }) => !s.changed || s.links.length !== 1 || !h.LINK_RE.test(s.links[0]));
  expect(bad.slice(0, 5), `ROW-006: shots that showed no single new well-formed link (${bad.length})`).toEqual([]);
  expect(links.length, 'ROW-006: fewer than 2,000 shots were taken').toBe(2000);
  expect(first[0]).toMatch(h.LINK_RE);

  const chars = links.map((l) => codeOf(l[0])).join('');
  expect(chars.length).toBe(12000);
  expect(alphabetGap(chars), 'ROW-006: the codes\' characters are not exactly A-Z, a-z, 0-9').toEqual({ missing: '', extra: '' });
});

// ---- ROW-007 ----

/** One fresh load with the random source stubbed to hand `bytes` first; optionally Math.random made constant. One button shot; its link. */
async function firstCode(browser, bytes, addr, { constantMath = false } = {}) {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    if (constantMath) await page.addInitScript(() => { Math.random = () => 0.5; });
    await h.stubRandomQueue(page, bytes);
    await h.openPage(page, 'file');
    await h.shoot(page, addr, 'button');
    await h.waitForResultChange(page, []);
    const links = await h.resultLinks(page);
    return { links, random: await h.randomState(page) };
  } finally {
    await context.close();
  }
}

test('ROW-007 control the stub is the page random source before load and a stubbed load shows a link', async ({ page, browser }) => {
  const S = Array.from({ length: 6 }, () => randomInt(0, 62));
  await h.stubRandomQueue(page, S);
  await h.openPage(page, 'file');
  const drawn = await page.evaluate(() => {
    const a = new Uint8Array(8);
    const ret = crypto.getRandomValues(a);
    const b = new Uint8Array(64);
    crypto.getRandomValues(b);
    return { same: ret === a, a: [...a], distinctLater: new Set(b).size };
  });
  expect(drawn.same).toBe(true);
  expect(drawn.a.slice(0, 6)).toEqual(S);
  expect(drawn.distinctLater).toBeGreaterThan(8);

  const run = await firstCode(browser, S, `https://example.com/${h.fresh('c7')}`);
  expect(run.links.length).toBe(1);
  expect(run.links[0]).toMatch(h.LINK_RE);
});

test('ROW-007 the first code follows the crypto bytes and ignores Math random', async ({ browser }) => {
  test.setTimeout(300000);
  const addr = `https://example.com/${h.fresh('r7')}`;
  const S = Array.from({ length: 6 }, () => randomInt(0, 62));
  const S2 = S.map((b) => (b + 31) % 62);
  const one = async (bytes, opts) => {
    const r = await firstCode(browser, bytes, addr, opts);
    expect(r.links.length, `ROW-007: bytes ${JSON.stringify(bytes)} showed ${JSON.stringify(r.links)}`).toBe(1);
    expect(r.links[0]).toMatch(h.LINK_RE);
    return codeOf(r.links[0]);
  };

  const a = await one(S);
  const b = await one(S);
  expect(b, `ROW-007: the same crypto bytes ${JSON.stringify(S)} gave ${a} then ${b} on two fresh loads`).toBe(a);

  const c = await one(S2);
  expect(c, `ROW-007: a different byte sequence ${JSON.stringify(S2)} gave the same code`).not.toBe(a);

  for (let i = 0; i < 6; i++) {
    const v = S.slice();
    v[i] = (S[i] + 1 + randomInt(0, 61)) % 62;
    const d = await one(v);
    expect(d, `ROW-007: changing byte ${i} from ${S[i]} to ${v[i]} left the code ${a} unchanged`).not.toBe(a);
  }

  const m = await one(S, { constantMath: true });
  expect(m, 'ROW-007: making Math.random constant changed the code').toBe(a);
});
