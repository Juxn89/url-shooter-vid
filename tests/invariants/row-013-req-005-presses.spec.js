// Purpose: ledger tests for REQ-005's presses — Enter shoots like the button, one press makes one change, the button works from the keyboard, holding Enter makes one link (ROW-013, ROW-015, ROW-031, ROW-044).
// Provenance: hand-authored
// Rows served: ROW-013, ROW-015, ROW-031, ROW-044 (REQ-005). Element ids are D-009, reached through the harness client.
'use strict';
const { test, expect } = require('@playwright/test');
const h = require('./harness');

/** A valid address no product can know in advance: REQ-007's accepted shape with a fresh path. */
const freshAddress = () => `https://example.com/${h.fresh('p')}`;

/** Asserts the result area now holds exactly one link token, of REQ-001's shape, and returns it. */
async function oneLink(page, row, what) {
  const links = await h.resultLinks(page);
  expect(links, `${row}: ${what} — #result must hold exactly one shooter.app link`).toHaveLength(1);
  expect(links[0], `${row}: ${what} — the link must be https://shooter.app/ plus 6 letters or digits`).toMatch(h.LINK_RE);
  return links[0];
}

// ROW-013 promise: Enter in the field holding a valid address shows a link, as the button does (REQ-005 fail-if (1);
//   A-011 "pressing Enter in the field does the same as pressing the button").
// ROW-013 wrong product: only the button's click listener shoots; Enter in the field does nothing — or the field sits
//   in a <form> whose submission reloads the page, so the link drawn by Enter is wiped at once.
// ROW-013 given, when, then: given the page from disk with an empty result and a fresh valid address in the field;
//   when Enter is pressed in the field (no click anywhere); then #result holds exactly one link of REQ-001's shape and
//   that link is the only shooter.app text visible on the page (one exact place).
// ROW-013 controls: before the press #result holds no link (the effect is absent before the action); the control
//   case shoots by the button with the same kind of address and sees a link, so the address and the page are good.
// ROW-013 technique: before/after on one exact element with a fresh value; Enter is the row's own trigger.
// cases: ROW-013 target=tests/invariants/row-013-req-005-presses.spec.js::ROW-013_REQ-005_enter_in_field_with_valid_address_shows_a_link control=tests/invariants/row-013-req-005-presses.spec.js::ROW-013_control_button_with_valid_address_shows_a_link
test('ROW-013_REQ-005_enter_in_field_with_valid_address_shows_a_link', async ({ page }) => {
  await h.openPage(page, 'file');
  expect(await h.resultLinks(page), 'ROW-013: before the press #result must hold no link').toEqual([]);
  await h.shoot(page, freshAddress(), 'enter');
  await h.waitForResultChange(page, []);
  const link = await oneLink(page, 'ROW-013', 'after Enter in the field');
  expect(await h.visibleLinks(page), 'ROW-013: the link from Enter must be the only shooter.app text shown').toEqual([link]);
});

test('ROW-013_control_button_with_valid_address_shows_a_link', async ({ page }) => {
  await h.openPage(page, 'file');
  expect(await h.resultLinks(page), 'ROW-013 control: before the click #result must hold no link').toEqual([]);
  await h.shoot(page, freshAddress(), 'button');
  await h.waitForResultChange(page, []);
  await oneLink(page, 'ROW-013 control', 'after the button click');
});

// ROW-015 promise: one press of the button, and one press of Enter, each change the result exactly once; ten rapid
//   presses yield ten distinct codes in sequence (REQ-005 fail-if (3) "one press … makes more than one link").
// ROW-015 wrong product: Enter is wired twice — a keydown listener on the field AND the form's submit listener both
//   shoot — so one Enter draws two codes, the second overwriting the first; or a click listener on both the button
//   and its container fires twice per click.
// ROW-015 given, when, then: given the page from disk and a recorder of every change of #result's text (it reads the
//   text after each listener the browser runs, so two listeners of one press are seen apart); when the button is
//   clicked once, then Enter pressed once, then ten fill-and-click presses and ten fill-and-Enter presses fired back
//   to back without waiting for the result; then each single press is exactly one recorded change to a link, and each
//   run of ten presses is exactly ten recorded changes, every one a link of REQ-001's shape, all ten distinct.
// ROW-015 controls: the recorder starts empty (nothing changes before a press); the control case shows one button
//   press does make a link, so a count of zero would be the path not reached rather than a pass.
// ROW-015 technique: an exact count of observed changes (not "at least one"), the row's own number ten, fresh
//   addresses per press (the field empties after a shot, REQ-004, so each press gets its own address).
// cases: ROW-015 target=tests/invariants/row-013-req-005-presses.spec.js::ROW-015_REQ-005_one_press_changes_result_once_and_ten_presses_make_ten_distinct_codes control=tests/invariants/row-013-req-005-presses.spec.js::ROW-015_control_one_button_press_makes_a_link
test('ROW-015_REQ-005_one_press_changes_result_once_and_ten_presses_make_ten_distinct_codes', async ({ page }) => {
  await h.openPage(page, 'file');
  await h.watchResultText(page);
  expect(await h.resultTextLog(page), 'ROW-015: nothing may change before the first press').toEqual([]);

  // one click
  await h.shoot(page, freshAddress(), 'button');
  await h.waitForResultTextCount(page, 1);
  await h.settle(page);
  let log = await h.resultTextLog(page);
  expect(log, 'ROW-015: one button press must change #result exactly once').toHaveLength(1);
  expect(h.linkTokens(log[0]), 'ROW-015: the one change of a button press must be one link').toHaveLength(1);
  expect(h.linkTokens(log[0])[0]).toMatch(h.LINK_RE);

  // one Enter
  await h.shoot(page, freshAddress(), 'enter');
  await h.waitForResultTextCount(page, 2);
  await h.settle(page);
  log = await h.resultTextLog(page);
  expect(log, 'ROW-015: one Enter press must change #result exactly once').toHaveLength(2);
  expect(h.linkTokens(log[1]), 'ROW-015: the one change of an Enter press must be one link').toHaveLength(1);
  expect(h.linkTokens(log[1])[0]).toMatch(h.LINK_RE);

  // ten rapid presses by each trigger
  for (const via of ['button', 'enter']) {
    const start = (await h.resultTextLog(page)).length;
    for (let i = 0; i < 10; i++) await h.shoot(page, freshAddress(), via);
    await h.waitForResultTextCount(page, start + 10);
    await h.settle(page);
    const run = (await h.resultTextLog(page)).slice(start);
    expect(run, `ROW-015: ten rapid ${via} presses must change #result exactly ten times`).toHaveLength(10);
    const codes = run.map((t) => {
      const toks = h.linkTokens(t);
      expect(toks, `ROW-015: every change of the ${via} run must be exactly one link, got "${t}"`).toHaveLength(1);
      expect(toks[0]).toMatch(h.LINK_RE);
      return toks[0];
    });
    expect(new Set(codes).size, `ROW-015: the ten ${via} presses must yield ten distinct codes`).toBe(10);
  }
});

test('ROW-015_control_one_button_press_makes_a_link', async ({ page }) => {
  await h.openPage(page, 'file');
  await h.shoot(page, freshAddress(), 'button');
  await h.waitForResultChange(page, []);
  await oneLink(page, 'ROW-015 control', 'after one button press');
});

// ROW-031 promise: the button is a real control for keyboard users — reached by Tab right after the field, and with
//   focus on it both Space and Enter shoot the address in the field exactly as a click does (REQ-005: Enter and the
//   button do the same; serves "keyboard and mouse users both get one link per press").
// ROW-031 wrong product: the "button" is a styled <div> with a click listener — Tab skips it (or lands on it via
//   tabindex but Space and Enter do nothing), or another focusable element sits between the field and the button.
// ROW-031 given, when, then: given the page from disk and the result-change recorder; when a fresh address is put in
//   the field and Tab pressed, focus must be on #shoot-button; Space is pressed there; then again a fresh address,
//   Tab, Enter; then a fresh address and a mouse click; then each of the three presses is exactly one recorded change
//   to a link of REQ-001's shape, and the three links differ.
// ROW-031 controls: #result holds no link before the first press; the control case shows a mouse click alone makes a
//   link, so a failing keyboard press is the keyboard path, not the page.
// ROW-031 technique: operate the real keys (Tab, Space, Enter) through the browser's keyboard; exact change count per
//   press compared with the click's.
// cases: ROW-031 target=tests/invariants/row-013-req-005-presses.spec.js::ROW-031_REQ-005_button_reached_by_tab_after_field_and_space_and_enter_shoot_like_a_click control=tests/invariants/row-013-req-005-presses.spec.js::ROW-031_control_mouse_click_on_button_makes_a_link
test('ROW-031_REQ-005_button_reached_by_tab_after_field_and_space_and_enter_shoot_like_a_click', async ({ page }) => {
  await h.openPage(page, 'file');
  await h.watchResultText(page);
  expect(await h.resultLinks(page), 'ROW-031: before any press #result must hold no link').toEqual([]);
  const links = [];
  for (const [n, key] of [[1, 'Space'], [2, 'Enter'], [3, 'click']]) {
    await h.typeInto(page, freshAddress());
    if (key === 'click') {
      await page.click(h.SEL.button);
    } else {
      expect(await h.focusedId(page), `ROW-031: filling the field must leave focus in it before Tab (${key})`).toBe('url-input');
      await page.keyboard.press('Tab');
      expect(await h.focusedId(page), `ROW-031: Tab from the field must land on #shoot-button (before ${key})`).toBe('shoot-button');
      await page.keyboard.press(key);
    }
    await h.waitForResultTextCount(page, n);
    await h.settle(page);
    const log = await h.resultTextLog(page);
    expect(log, `ROW-031: one ${key} press on the button must change #result exactly once`).toHaveLength(n);
    const toks = h.linkTokens(log[n - 1]);
    expect(toks, `ROW-031: the ${key} press must show exactly one link`).toHaveLength(1);
    expect(toks[0], `ROW-031: the ${key} press must show a link of REQ-001's shape`).toMatch(h.LINK_RE);
    links.push(toks[0]);
  }
  expect(new Set(links).size, 'ROW-031: Space, Enter and the click must each make their own new link').toBe(3);
});

test('ROW-031_control_mouse_click_on_button_makes_a_link', async ({ page }) => {
  await h.openPage(page, 'file');
  await h.typeInto(page, freshAddress());
  await page.click(h.SEL.button);
  await h.waitForResultChange(page, []);
  await oneLink(page, 'ROW-031 control', 'after a mouse click');
});

// ROW-044 promise: holding Enter makes one link — with a valid address in the field, one Enter keydown, then at least
//   10 keydown events with repeat true, then one keyup, change the result area exactly once (REQ-005 fail-if (3)).
// ROW-044 wrong product: the shot answers every keydown (repeats included) and the field keeps the address, or a
//   product answering keydown and again on keyup, or one that clears #result when a repeat finds the field empty —
//   any of them changes #result more than once for one held key.
// ROW-044 given, when, then: given the page from disk, the result-change recorder, and a fresh valid address in the
//   focused field; when the browser's keyboard sends one Enter keydown, eleven more keydowns of the still-held key
//   (the browser marks them repeat true), then one keyup; then exactly one change is recorded, and it is one link.
// ROW-044 controls: the recorder holds nothing before the key goes down; the control case shows a plain Enter press
//   (down then up) makes one link, so the held key reaches the shot path. Limit, stated: a product that clears the
//   field after a shot (REQ-004) and answers repeats finds an empty field and is not separated here.
// ROW-044 technique: the row's own event sequence through the real keyboard (Playwright marks a keydown of a key
//   already down as autoRepeat), with an exact change count.
// cases: ROW-044 target=tests/invariants/row-013-req-005-presses.spec.js::ROW-044_REQ-005_holding_enter_with_repeats_changes_result_once control=tests/invariants/row-013-req-005-presses.spec.js::ROW-044_control_one_enter_press_makes_one_link
test('ROW-044_REQ-005_holding_enter_with_repeats_changes_result_once', async ({ page }) => {
  await h.openPage(page, 'file');
  await h.watchResultText(page);
  await h.typeInto(page, freshAddress());
  await page.focus(h.SEL.field);
  // records, at the window's capture phase (before any page listener on the field), each Enter keydown's repeat flag
  await page.evaluate(() => {
    window.__vidKeydowns = [];
    window.addEventListener('keydown', (e) => { if (e.key === 'Enter') window.__vidKeydowns.push(e.repeat); }, true);
  });
  expect(await h.resultTextLog(page), 'ROW-044: nothing may change before Enter goes down').toEqual([]);
  await page.keyboard.down('Enter');
  for (let i = 0; i < 11; i++) await page.keyboard.down('Enter');
  await page.keyboard.up('Enter');
  await h.waitForResultTextCount(page, 1);
  await h.settle(page);
  // the sequence the row names reached the page: one first keydown, then at least 10 with repeat true
  const seen = await page.evaluate(() => window.__vidKeydowns || null);
  expect(seen, 'ROW-044 setup: the Enter keydowns must be recorded (no reload since)').not.toBeNull();
  expect(seen[0], 'ROW-044 setup: the first Enter keydown must not be a repeat').toBe(false);
  expect(seen.slice(1).filter((r) => r === true).length, 'ROW-044 setup: at least 10 repeat keydowns must reach the page').toBeGreaterThanOrEqual(10);
  const log = await h.resultTextLog(page);
  expect(log, 'ROW-044: holding Enter (1 keydown, 11 repeats, 1 keyup) must change #result exactly once').toHaveLength(1);
  expect(h.linkTokens(log[0]), 'ROW-044: the one change must be one link').toHaveLength(1);
  expect(h.linkTokens(log[0])[0]).toMatch(h.LINK_RE);
});

test('ROW-044_control_one_enter_press_makes_one_link', async ({ page }) => {
  await h.openPage(page, 'file');
  await h.watchResultText(page);
  await h.shoot(page, freshAddress(), 'enter');
  await h.waitForResultTextCount(page, 1);
  const log = await h.resultTextLog(page);
  expect(log, 'ROW-044 control: one Enter press must change #result').toHaveLength(1);
  expect(h.linkTokens(log[0])[0]).toMatch(h.LINK_RE);
});
