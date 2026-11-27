// Purpose: ROW-024 (REQ-007) — a 30,000-character near miss and a ~100,000-character valid address are each decided within 1 second of the press.
// Provenance: hand-authored
//
// ROW-024 promise: shooting a 30,000-character near miss (https:// followed by 15,000 "a." pairs and a trailing
// ROW-024   space) and a valid address of about 100,000 characters are each decided within 1 second of the press; the
// ROW-024   near miss shows no link, the long valid one shows one link, and a following valid shot works. Authority:
// ROW-024   REQ-007 (the check is a regular expression on the whole trimmed input; a host with no trailing dot), A-006,
// ROW-024   A-025 (a trailing dot refused); REQ-006 (a rejected input changes nothing).
// ROW-024 wrong product: a regular expression with nested quantifiers such as ^https?:\/\/([a-z0-9-]+\.?)+[a-z]$
// ROW-024   or (([a-z0-9-]+)\.)+([a-z0-9-]+)+ that backtracks catastrophically on "a.a.a.…a." and freezes the page's
// ROW-024   one thread for seconds or forever; or a check that walks the input char by char with string concatenation,
// ROW-024   quadratic on 100,000 characters.
// ROW-024 given: index.html from disk; a capture-phase click and keydown listener installed before the page's own
// ROW-024   scripts, stamping performance.now() when the shoot button is clicked or Enter is pressed in the field (the
// ROW-024   press's moment, on the page's one clock); a mutation observer stamping the moment the result area first
// ROW-024   holds a link different from the one before. The near miss is the row's own: 'https://' + 'a.' x 15000 + ' '
// ROW-024   (30,009 characters); the long valid one is https://example.com/<fresh>/ + "abcdefghij/" segments padded to
// ROW-024   exactly 100,000 characters.
// ROW-024 when: the near miss by the button (no link yet), the long valid one by the button, the near miss again by
// ROW-024   Enter (link shown), then a short fresh valid address by the button.
// ROW-024 then: near miss — the page's thread is free again (a zero-delay timer queued after the press has run)
// ROW-024   less than 1000 ms after the press, no link before / the same link after, the field unchanged; long valid —
// ROW-024   a link of the promised shape appears less than 1000 ms after the press; following shot — a new link.
// ROW-024 controls: the control case shows the clock is live: a 300 ms busy listener the test adds to the button is
// ROW-024   measured as at least 300 ms, and a short valid shot's link moment is recorded and under 1000 ms — so a
// ROW-024   fast reading in the target is the product's speed, not a blind stopwatch.
// ROW-024 technique: the deadline measured from the press on the page's own clock, with inputs on the slow side of
// ROW-024   it (the row's own adversarial sizes); a case timeout of 60 s so a page frozen forever fails by name.
// ROW-024 cases: ROW-024 target=tests/invariants/row-024-req-007-long-input-in-time.spec.js::ROW-024_a_30000_character_near_miss_and_a_100000_character_address_are_decided_within_1_second control=tests/invariants/row-024-req-007-long-input-in-time.spec.js::ROW-024_control_the_press_clock_measures_a_slow_handler_and_a_short_shot
'use strict';
const { test, expect } = require('@playwright/test');
const h = require('./harness');

const LIMIT_MS = 1000;

/** Installs, before the page's scripts, the press stamps (capture phase, first listener on window). */
async function installPressClock(page) {
  await page.addInitScript(([button, field]) => {
    window.__vidPressAt = [];
    window.addEventListener('click', (e) => {
      if (e.target && e.target.closest && e.target.closest(button)) window.__vidPressAt.push(performance.now());
    }, true);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target && e.target.matches && e.target.matches(field)) window.__vidPressAt.push(performance.now());
    }, true);
  }, [h.SEL.button, h.SEL.field]);
}

/** Starts recording the moment the result area first holds link tokens different from the current ones. */
async function watchLinkMoment(page) {
  await page.evaluate((sel) => {
    const read = () => {
      const el = document.querySelector(sel);
      return JSON.stringify(((el && el.textContent) || '').split(/\s+/).filter((t) => t.toLowerCase().includes('shooter.app')));
    };
    const start = read();
    window.__vidLinkAt = null;
    if (window.__vidLinkObs) window.__vidLinkObs.disconnect();
    window.__vidLinkObs = new MutationObserver(() => {
      const now = read();
      if (window.__vidLinkAt === null && now !== start && now !== '[]') window.__vidLinkAt = performance.now();
    });
    window.__vidLinkObs.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  }, h.SEL.result);
}

/** The last press stamp, and the moment the page's thread ran a zero-delay timer queued after the press returned. */
async function pressAndFreeAt(page) {
  return page.evaluate(() => new Promise((r) => setTimeout(() => r({
    pressAt: window.__vidPressAt[window.__vidPressAt.length - 1], freeAt: performance.now(), linkAt: window.__vidLinkAt,
  }), 0)));
}

function longValid() {
  let s = `https://example.com/${h.fresh('l')}/`;
  while (s.length + 11 <= 100000) s += 'abcdefghij/';
  return s + 'a'.repeat(100000 - s.length);
}

test('ROW-024 control the press clock measures a slow handler and a short shot', async ({ page }) => {
  await installPressClock(page);
  await h.openPage(page, 'file');
  // A listener the test owns (not the product's), busy for 300 ms on each click of the button.
  await page.evaluate((sel) => {
    window.__vidBusy = (e) => { const t = performance.now(); while (performance.now() - t < 300) { /* busy */ } };
    document.querySelector(sel).addEventListener('click', window.__vidBusy);
  }, h.SEL.button);
  await h.typeInto(page, 'hello');
  await page.click(h.SEL.button);
  const slow = await pressAndFreeAt(page);
  expect(slow.freeAt - slow.pressAt).toBeGreaterThanOrEqual(300);
  await page.evaluate((sel) => document.querySelector(sel).removeEventListener('click', window.__vidBusy), h.SEL.button);

  await watchLinkMoment(page);
  await h.typeInto(page, `https://example.com/${h.fresh('c')}`);
  await page.click(h.SEL.button);
  await h.waitForResultChange(page, []);
  const short = await pressAndFreeAt(page);
  expect(short.linkAt).not.toBeNull();
  expect(short.linkAt - short.pressAt).toBeLessThan(LIMIT_MS);
});

test('ROW-024 a 30000 character near miss and a 100000 character address are decided within 1 second', async ({ page }) => {
  test.setTimeout(60_000);
  await installPressClock(page);
  await h.openPage(page, 'file');
  const nearMiss = `https://${'a.'.repeat(15000)} `;
  const valid = longValid();
  expect(nearMiss.length).toBe(30009);
  expect(valid.length).toBe(100000);

  await test.step('ROW-024 near miss by the button with no link shown', async () => {
    await h.typeInto(page, nearMiss);
    await page.click(h.SEL.button);
    const t = await pressAndFreeAt(page);
    expect(t.freeAt - t.pressAt, 'ROW-024 near miss: decided within 1 s of the press').toBeLessThan(LIMIT_MS);
    await h.settle(page);
    expect(await h.resultLinks(page), 'ROW-024 near miss: no link').toEqual([]);
    expect(await h.fieldValue(page), 'ROW-024 near miss: the field unchanged').toBe(nearMiss);
  });

  let link;
  await test.step('ROW-024 long valid address by the button', async () => {
    await h.typeInto(page, valid);
    await watchLinkMoment(page);
    await page.click(h.SEL.button);
    await h.waitForResultChange(page, [], 5000);
    const t = await pressAndFreeAt(page);
    expect(t.linkAt, 'ROW-024 long valid: a link appeared').not.toBeNull();
    expect(t.linkAt - t.pressAt, 'ROW-024 long valid: the link appeared within 1 s of the press').toBeLessThan(LIMIT_MS);
    const links = await h.resultLinks(page);
    expect(links.length, 'ROW-024 long valid: one link').toBe(1);
    expect(links[0]).toMatch(h.LINK_RE);
    link = links[0];
  });

  await test.step('ROW-024 near miss by Enter with a link shown', async () => {
    await h.typeInto(page, nearMiss);
    await page.press(h.SEL.field, 'Enter');
    const t = await pressAndFreeAt(page);
    expect(t.freeAt - t.pressAt, 'ROW-024 near miss by Enter: decided within 1 s of the press').toBeLessThan(LIMIT_MS);
    await h.settle(page);
    expect(await h.resultLinks(page), 'ROW-024 near miss by Enter: the same link').toEqual([link]);
    expect(await h.fieldValue(page), 'ROW-024 near miss by Enter: the field unchanged').toBe(nearMiss);
  });

  await test.step('ROW-024 a following valid shot works', async () => {
    const [s] = await h.shootEach(page, [`https://example.com/${h.fresh('n')}`], ['button']);
    expect(s.after.length, 'ROW-024 following shot: one link').toBe(1);
    expect(s.after[0]).toMatch(h.LINK_RE);
    expect(s.after[0], 'ROW-024 following shot: a new link').not.toBe(link);
  });
});
