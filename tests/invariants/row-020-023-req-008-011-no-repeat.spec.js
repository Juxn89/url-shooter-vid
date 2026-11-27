// Purpose: ROW-020, ROW-023 (REQ-008, REQ-011) — within one page load no code is shown twice, even for the same address and even when the random draw repeats.
// Provenance: hand-authored
//
// ROW-020 promise: across 500 shots in one page load, half of them the same address, no code is shown twice.
// ROW-020   Authority: REQ-008 fail-if (1), (2), (3); A-007 (keep the guarantee); A-014 (a session is one page
// ROW-020   load; the same address shot twice gets a new code each time).
// ROW-020 wrong product: a code derived from the address (hash, or a per-address cache) — the same address
// ROW-020   gets the same code; a code space so small it repeats within 500 (e.g. 2 random characters padded); a
// ROW-020   repeat of the same address that shows nothing new.
// ROW-020 given: one page load from disk; a fresh address A used for 250 shots, alternating with 250 distinct
// ROW-020   fresh addresses; a reload sentinel.
// ROW-020 when: the first shot (A) through the real button, the other 499 through the page's own controls in one
// ROW-020   in-page loop (h.shootMany: the field's value set, the button's click(), wait per frame for a new link).
// ROW-020 then: all 500 shots were taken, each showed exactly one new LINK_RE link, the 500 codes are pairwise
// ROW-020   distinct (set size 500), and the sentinel is intact (one page load).
// ROW-020 controls: two shots of A through the fast door each show a LINK_RE link — the loop reaches the product
// ROW-020   on the repeated address; and the duplicate finder, fed a list with one repeat, names it.
// ROW-020 technique: a property over generated inputs ("never twice") with the row's own count and mix, the
// ROW-020   repeated address being the near miss that a derived-code product cannot pass.
// ROW-020 cases: ROW-020 target=tests/invariants/row-020-023-req-008-011-no-repeat.spec.js::ROW-020_500_shots_in_one_load_half_the_same_address_never_show_a_code_twice control=tests/invariants/row-020-023-req-008-011-no-repeat.spec.js::ROW-020_control_the_fast_door_reaches_a_repeated_address_and_the_duplicate_finder_names_a_repeat
//
// ROW-023 promise: after at least 5 shots, with the random source stubbed to repeat once the bytes of the first
// ROW-023   code shown and then vary, the next shot shows a link whose code differs from every earlier code in the
// ROW-023   page load. Authority: REQ-011 fail-if (1), (2); REQ-008 fail-if (3); A-007, A-014 (a clash is retried
// ROW-023   until a free code is found); D-006 (a forced repeat is testable); D-008 (crypto bytes, one per character).
// ROW-023 wrong product: no memory (the forced repeat shows the first code again); memory of only the previous
// ROW-023   code (the first code is not the previous one after 5 shots, so it slips through); a clash that shows no
// ROW-023   link, keeps the old link, or shows an error instead of drawing again.
// ROW-023 given: a fresh 6-byte sequence B within 0..61; the page loaded from disk with crypto.getRandomValues
// ROW-023   stubbed before load (h.stubRandomQueue) to hand B first and real random bytes after.
// ROW-023 when: shot 1 (draws B, shows C1); shots 2-5 on real random bytes; B queued again; shot 6.
// ROW-023 then: shot 1 consumed the 6 queued bytes; shot 6 consumed B again (the harmful case reached) and shows
// ROW-023   exactly one LINK_RE link whose code is none of C1..C5 — and #result changed from C5's link to it.
// ROW-023 controls: two fresh loads with B queued show the same first code — so B really reproduces C1 and the
// ROW-023   repeat at shot 6 is a real clash, not a different draw.
// ROW-023 technique: a fake of the external random source (checked against its contract: fills the typed array)
// ROW-023   used to force the one input — the repeated draw — that a right product must reject.
// ROW-023 cases: ROW-023 target=tests/invariants/row-020-023-req-008-011-no-repeat.spec.js::ROW-023_a_forced_repeat_of_the_first_code_after_5_shots_shows_a_fresh_code control=tests/invariants/row-020-023-req-008-011-no-repeat.spec.js::ROW-023_control_the_same_queued_bytes_give_the_same_first_code_on_two_fresh_loads
'use strict';
const { test, expect } = require('@playwright/test');
const { randomInt } = require('crypto');
const h = require('./harness');

const codeOf = (link) => link.slice('https://shooter.app/'.length);
/** Values that occur more than once in a list. */
const repeats = (list) => [...new Set(list.filter((v, i) => list.indexOf(v) !== i))];

// ---- ROW-020 ----

test('ROW-020 control the fast door reaches a repeated address and the duplicate finder names a repeat', async ({ page }) => {
  await h.openPage(page, 'file');
  const A = `https://example.com/${h.fresh('c20')}`;
  const shots = await h.shootMany(page, [A, A], { stopAfter: 2 });
  expect(shots.length).toBe(2);
  for (const s of shots) {
    expect(s.links.length).toBeGreaterThan(0);
    expect(s.links[0]).toMatch(h.LINK_RE);
  }
  expect(repeats(['aB3dE9', 'x1y2z3', 'aB3dE9'])).toEqual(['aB3dE9']);
  expect(repeats(['aB3dE9', 'x1y2z3'])).toEqual([]);
});

test('ROW-020 500 shots in one load half the same address never show a code twice', async ({ page }) => {
  test.setTimeout(300000);
  await h.openPage(page, 'file');
  const sentinel = await h.plantSentinel(page);
  const tag = h.fresh('r20');
  const A = `https://example.com/${tag}/same`;
  const addrs = Array.from({ length: 500 }, (_, i) => (i % 2 === 0 ? A : `https://example.com/${tag}/other/${i}`));

  await h.shoot(page, addrs[0], 'button');
  await h.waitForResultChange(page, []);
  const first = await h.resultLinks(page);
  expect(first.length, 'ROW-020: the first real shot showed no single link').toBe(1);
  expect(first[0]).toMatch(h.LINK_RE);

  const shots = await h.shootMany(page, addrs.slice(1));
  expect(await h.sentinelIntact(page, sentinel), 'ROW-020: the page reloaded during the shots').toBe(true);
  const stuck = shots.map((s, i) => ({ shot: i + 2, address: s.address, links: s.links, changed: s.changed }))
    .filter((s) => !s.changed || s.links.length !== 1 || !h.LINK_RE.test(s.links[0]));
  expect(stuck.slice(0, 5), `ROW-020: shots that showed no single new link — a repeat or nothing (${stuck.length})`).toEqual([]);
  expect(shots.length + 1, 'ROW-020: fewer than 500 shots were taken').toBe(500);

  const codes = [first[0], ...shots.map((s) => s.links[0])].map(codeOf);
  expect(repeats(codes), 'ROW-020: codes shown more than once in one page load').toEqual([]);
  expect(new Set(codes).size).toBe(500);
});

// ---- ROW-023 ----

/** A fresh page with B queued as the first random bytes, loaded from disk, one button shot; its link and draw record. */
async function firstLinkWith(browser, B) {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await h.stubRandomQueue(page, B);
    await h.openPage(page, 'file');
    await h.shoot(page, `https://example.com/${h.fresh('c23')}`, 'button');
    await h.waitForResultChange(page, []);
    return { links: await h.resultLinks(page), random: await h.randomState(page) };
  } finally {
    await context.close();
  }
}

test('ROW-023 control the same queued bytes give the same first code on two fresh loads', async ({ browser }) => {
  const B = Array.from({ length: 6 }, () => randomInt(0, 62));
  const one = await firstLinkWith(browser, B);
  const two = await firstLinkWith(browser, B);
  expect(one.links.length).toBe(1);
  expect(one.links[0]).toMatch(h.LINK_RE);
  expect(one.random.served).toBe(6);
  expect(two.links).toEqual(one.links);
});

test('ROW-023 a forced repeat of the first code after 5 shots shows a fresh code', async ({ page }) => {
  const B = Array.from({ length: 6 }, () => randomInt(0, 62));
  await h.stubRandomQueue(page, B);
  await h.openPage(page, 'file');
  const sentinel = await h.plantSentinel(page);
  const tag = h.fresh('r23');

  const shown = [];
  for (let i = 1; i <= 5; i++) {
    const before = await h.resultLinks(page);
    await h.shoot(page, `https://example.com/${tag}/${i}`, 'button');
    await h.waitForResultChange(page, before);
    const links = await h.resultLinks(page);
    expect(links.length, `ROW-023: shot ${i} showed ${JSON.stringify(links)}`).toBe(1);
    expect(links[0]).toMatch(h.LINK_RE);
    shown.push(links[0]);
    if (i === 1) {
      const r = await h.randomState(page);
      expect(r.queued, 'ROW-023: the first shot did not draw the queued bytes from crypto.getRandomValues').toBe(0);
    }
  }
  expect(repeats(shown), 'ROW-023: a code repeated within the first 5 shots').toEqual([]);

  await h.queueRandomBytes(page, B);
  const before = await h.randomState(page);
  await h.shoot(page, `https://example.com/${tag}/6`, 'button');
  await h.waitForResultChange(page, [shown[4]]);
  const after = await h.randomState(page);
  expect(after.queued, 'ROW-023: shot 6 did not draw the repeated bytes — the clash was not reached').toBe(0);
  expect(after.served - before.served).toBe(6);

  const links = await h.resultLinks(page);
  expect(links.length, `ROW-023: after the forced repeat #result holds ${JSON.stringify(links)}`).toBe(1);
  expect(links[0]).toMatch(h.LINK_RE);
  expect(shown.map(codeOf), `ROW-023: the forced repeat showed an earlier code ${links[0]}`).not.toContain(codeOf(links[0]));
  expect(await h.sentinelIntact(page, sentinel)).toBe(true);
});
