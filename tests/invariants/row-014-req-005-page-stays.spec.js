// Purpose: ledger tests for REQ-005's "the page stays put" — no reload or navigation, no history entry, no console error from any shot (ROW-014, ROW-043, ROW-030).
// Provenance: hand-authored
// Rows served: ROW-014, ROW-030, ROW-043 (REQ-005). Element ids are D-009, reached through the harness client.
'use strict';
const { test, expect } = require('@playwright/test');
const h = require('./harness');

/** A valid address no product can know in advance: REQ-007's accepted shape with a fresh path. */
const freshAddress = () => `https://example.com/${h.fresh('p')}`;

/** The four shots the rows name: a valid and a rejected input, each by the button and by Enter. */
const SHOTS = [
  { kind: 'valid', via: 'button' },
  { kind: 'valid', via: 'enter' },
  { kind: 'rejected', via: 'button' },
  { kind: 'rejected', via: 'enter' },
];

/** Evaluates in the page; a navigation that destroyed the document answers `fallback` instead of throwing. */
async function safeEval(page, fn, arg, fallback) {
  try { return await page.evaluate(fn, arg); } catch { return fallback; }
}

/**
 * One press as a person makes it: the text put in the field, then Enter in the field or a mouse click on the button.
 * The click is dispatched at the button even when it reports disabled (a person's click on a disabled button does
 * nothing) — so a disabled button is ROW-040's failure, never a stalled click failing these rows.
 */
async function press(page, text, via) {
  await h.typeInto(page, text);
  if (via === 'enter') await page.press(h.SEL.field, 'Enter');
  else await page.click(h.SEL.button, { force: true });
}

/**
 * Shoots one of SHOTS and waits for the page to finish what the press started (a link for a valid input). Answers the
 * link tokens #result holds once the page has settled (null when the document was replaced).
 */
async function fire(page, shot) {
  const text = shot.kind === 'valid' ? freshAddress() : 'hello';
  await press(page, text, shot.via);
  if (shot.kind === 'valid') await h.waitForResultChange(page, []).catch(() => null); // a navigation may cut the wait
  await h.quietNetwork(page).catch(() => null);
  await page.waitForLoadState('load').catch(() => null);
  await safeEval(page, () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 0)))), null, null);
  return safeEval(page, (sel) => {
    const el = document.querySelector(sel);
    return ((el && el.textContent) || '').split(/\s+/).filter((t) => t.toLowerCase().includes('shooter.app'));
  }, h.SEL.result, null);
}

// ROW-014 promise: neither the button nor Enter reloads or navigates — a marker set on window before the shot survives
//   it and the page address is unchanged, for a valid and for a rejected input (REQ-005 fail-if (2); A-011).
// ROW-014 wrong product: the field and button sit in a <form> with no preventDefault (or a button of type submit), so
//   a press submits the form: the page reloads at index.html? and the link flashes and is gone; or a product that
//   calls location.reload() or sets location.search on a rejected input.
// ROW-014 given, when, then: given a fresh page from disk per shot, a fresh sentinel planted on window and a recorder
//   of main-frame navigations; when one shot is fired — valid by button, valid by Enter, rejected (hello) by button,
//   rejected by Enter, all four every run; then the sentinel is still there, no navigation was recorded, and the page
//   address equals the one it opened at.
// ROW-014 controls: the sentinel reads intact before each shot (before/after); each valid arm must draw its link and
//   still show it once the page settles — the harm (a link drawn, then the page gone) is reached, and a page whose
//   shot draws nothing fails here rather than passing by doing nothing; the control case proves the meters can see
//   the harm — after page.reload() the sentinel reads gone and the navigation recorder has an entry.
// ROW-014 technique: before/after on a fresh per-run sentinel (no product can preserve a value it never saw) across
//   the row's full 2x2 of trigger and input.
// cases: ROW-014 target=tests/invariants/row-014-req-005-page-stays.spec.js::ROW-014_REQ-005_no_shot_reloads_or_navigates_valid_or_rejected_by_button_or_enter control=tests/invariants/row-014-req-005-page-stays.spec.js::ROW-014_control_sentinel_and_navigation_recorder_see_a_reload
test('ROW-014_REQ-005_no_shot_reloads_or_navigates_valid_or_rejected_by_button_or_enter', async ({ page }) => {
  for (const shot of SHOTS) {
    const url = await h.openPage(page, 'file');
    const address = page.url();
    const sentinel = await h.plantSentinel(page);
    expect(await h.sentinelIntact(page, sentinel), `ROW-014 (${shot.kind} by ${shot.via}): sentinel set before the shot`).toBe(true);
    const navs = h.watchNavigations(page);
    const links = await fire(page, shot);
    const intact = await safeEval(page, (x) => window.__vidSentinel === x, sentinel, false);
    expect(intact, `ROW-014 (${shot.kind} by ${shot.via}): the window marker must survive the shot — the page reloaded or navigated`).toBe(true);
    expect(navs, `ROW-014 (${shot.kind} by ${shot.via}): the shot must cause no main-frame navigation`).toEqual([]);
    expect(page.url(), `ROW-014 (${shot.kind} by ${shot.via}): the page address must be unchanged (opened at ${url})`).toBe(address);
    if (shot.kind === 'valid') {
      // the harm is reached only when the shot draws its link: it must be drawn and still shown once the page settles
      expect(links, `ROW-014 (valid by ${shot.via}): the shot's link must be shown and still be there after the page settles`).toHaveLength(1);
      expect(links[0]).toMatch(h.LINK_RE);
    }
    page.removeAllListeners('framenavigated');
  }
});

test('ROW-014_control_sentinel_and_navigation_recorder_see_a_reload', async ({ page }) => {
  await h.openPage(page, 'file');
  await expect(page.locator(h.SEL.field), 'ROW-014 control: the field must be on the page').toHaveCount(1);
  const sentinel = await h.plantSentinel(page);
  expect(await h.sentinelIntact(page, sentinel)).toBe(true);
  const navs = h.watchNavigations(page);
  await page.reload({ waitUntil: 'load' });
  expect(await h.sentinelIntact(page, sentinel), 'ROW-014 control: a reload must wipe the sentinel').toBe(false);
  expect(navs.length, 'ROW-014 control: a reload must be recorded as a navigation').toBeGreaterThan(0);
});

// ROW-043 promise: a shot adds no browser history entry — history.length is the same before and after a valid shot
//   and a rejected shot, by the button and by Enter (REQ-005 fail-if (2) "changes its address").
// ROW-043 wrong product: each shot writes its code into the address (location.hash = code, or history.pushState with
//   ?u=…) so Back walks through old links; or a form submission that adds an entry per press.
// ROW-043 given, when, then: given a fresh page from disk per shot; when one of the four shots (valid/rejected x
//   button/Enter) is fired; then history.length equals what it read just before the shot.
// ROW-043 controls: each valid arm must draw its link before the meter is read (the shot is reached, not skipped by a
//   page that does nothing); the control
//   case shows the meter moves — setting location.hash to a fresh value on the loaded page raises history.length by
//   one — without shooting, so a fault in the shot cannot touch it.
// ROW-043 technique: before/after of the browser's own counter over the row's full 2x2 of trigger and input.
// cases: ROW-043 target=tests/invariants/row-014-req-005-page-stays.spec.js::ROW-043_REQ-005_no_shot_adds_a_history_entry_valid_or_rejected_by_button_or_enter control=tests/invariants/row-014-req-005-page-stays.spec.js::ROW-043_control_history_meter_moves_on_a_hash_change
test('ROW-043_REQ-005_no_shot_adds_a_history_entry_valid_or_rejected_by_button_or_enter', async ({ page }) => {
  for (const shot of SHOTS) {
    await h.openPage(page, 'file');
    const before = await page.evaluate(() => history.length);
    const links = await fire(page, shot);
    const after = await safeEval(page, () => history.length, null, -1);
    expect(after, `ROW-043 (${shot.kind} by ${shot.via}): history.length must stay ${before} after the shot`).toBe(before);
    if (shot.kind === 'valid') {
      // the shot is reached: its link is drawn (the point where an address-writing product adds its entry)
      expect(links, `ROW-043 (valid by ${shot.via}): the shot's link must be shown`).toHaveLength(1);
      expect(links[0]).toMatch(h.LINK_RE);
    }
  }
});

test('ROW-043_control_history_meter_moves_on_a_hash_change', async ({ page }) => {
  await h.openPage(page, 'file');
  await expect(page.locator(h.SEL.button), 'ROW-043 control: the button must be on the page').toHaveCount(1);
  const before = await page.evaluate(() => history.length);
  const tag = h.fresh('h');
  await page.evaluate((t) => { location.hash = t; }, tag);
  await page.waitForFunction((t) => location.hash === '#' + t, tag);
  expect(await page.evaluate(() => history.length), 'ROW-043 control: a hash change must add one history entry').toBe(before + 1);
});

// ROW-030 inputs: the accepted and rejected sets as ratified in INVENTORY ROW-018 and ROW-019 (REQ-007), verbatim,
//   plus one fresh accepted address per run.
const ACCEPTED = [
  'https://example.com', 'http://example.com/a/b', '   https://example.com   ',
  'https://example.com/search?q=cats#top', 'HTTPS://EXAMPLE.COM', 'https://sub.example.co.uk/path',
  'https://example.com/a:b', 'https://example.com/?t=10:30',
];
const REJECTED = [
  'example.com', 'hello', 'https://localhost', 'https://localhost/a.b', 'https://localhost?x=a.b',
  'https://localhost#a.b', 'ftp://example.com', 'https://example.com:8080', 'https://exa mple.com', 'https://', '',
];

// ROW-030 promise: shots log nothing to the console — shooting every input of the accepted and rejected sets, by
//   button and by Enter, raises no uncaught error and logs no console error (REQ-005, origin domain; REQ-006 "stay
//   quiet otherwise").
// ROW-030 wrong product: the rejected path reports itself with console.error('invalid address'), or the check returns
//   null for a rejected input and the next line reads a property of it — an uncaught TypeError on every bad press,
//   invisible on screen.
// ROW-030 given, when, then: given the page from disk with the error collector (console errors, page errors, failed
//   loads) attached before it opens; when a fresh valid address and then every input of both sets is shot by the
//   button on one load and by Enter on another; then the collector holds nothing.
// ROW-030 controls: the collector is asserted empty after load and before any shot; the fresh valid address shot
//   first must draw its link (the shot path is reached — a page that shoots nothing logs nothing and must not pass);
//   the count of shots fired is asserted (no input skipped); the control case proves the collector catches a console.error raised in the page
//   and that a valid shot reaches the product (a link appears).
// ROW-030 technique: "every" — the row's whole named population, both triggers, no sampling.
// cases: ROW-030 target=tests/invariants/row-014-req-005-page-stays.spec.js::ROW-030_REQ-005_shooting_every_accepted_and_rejected_input_by_button_and_enter_logs_no_error control=tests/invariants/row-014-req-005-page-stays.spec.js::ROW-030_control_collector_catches_a_console_error_and_a_shot_reaches_the_page
test('ROW-030_REQ-005_shooting_every_accepted_and_rejected_input_by_button_and_enter_logs_no_error', async ({ page }) => {
  const inputs = [...ACCEPTED, ...REJECTED];
  for (const via of ['button', 'enter']) {
    const errors = h.collectErrors(page);
    await h.openPage(page, 'file');
    await h.settle(page);
    expect(errors, `ROW-030 (${via}): nothing may be logged at load, before any shot`).toEqual([]);
    // the shot path is reached: a fresh valid address, shot first, draws its link
    await press(page, freshAddress(), via);
    await h.waitForResultChange(page, []);
    const first = await h.resultLinks(page);
    expect(first, `ROW-030 (${via}): a fresh valid address must draw its link (the shot path is reached)`).toHaveLength(1);
    let fired = 0;
    for (const text of inputs) {
      await press(page, text, via);
      await h.settle(page);
      fired += 1;
    }
    await h.quietNetwork(page).catch(() => null);
    await h.settle(page);
    expect(fired, `ROW-030 (${via}): every input must be shot`).toBe(inputs.length);
    expect(errors, `ROW-030 (${via}): shooting the accepted and rejected sets must log no console error and raise no uncaught error`).toEqual([]);
    page.removeAllListeners('console');
    page.removeAllListeners('pageerror');
    page.removeAllListeners('requestfailed');
  }
});

test('ROW-030_control_collector_catches_a_console_error_and_a_shot_reaches_the_page', async ({ page }) => {
  const errors = h.collectErrors(page);
  await h.openPage(page, 'file');
  await h.shoot(page, freshAddress(), 'button');
  await h.waitForResultChange(page, []);
  const links = await h.resultLinks(page);
  expect(links, 'ROW-030 control: a valid shot must show a link').toHaveLength(1);
  const tag = h.fresh('e');
  await page.evaluate((t) => console.error(t), tag);
  await expect.poll(() => errors.some((e) => e.includes(tag)), { message: 'ROW-030 control: the collector must see a console.error' }).toBe(true);
});
