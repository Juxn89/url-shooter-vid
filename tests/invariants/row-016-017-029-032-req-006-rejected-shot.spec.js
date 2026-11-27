// Purpose: ROW-016, ROW-017, ROW-029, ROW-032 (REQ-006) — an empty, blank or invalid shot changes nothing, does not stick, and keeps the keyboard user's place.
// Provenance: hand-authored
//
// ROW-016 promise: with a link shown, the field emptied or holding only spaces, the button or Enter keeps the same
// ROW-016   link, leaves the field unchanged, shows no message, and the field reports no browser validation message
// ROW-016   (validationMessage '', checkValidity true); the same before any link exists. Authority: REQ-006 fail-if 1-4,
// ROW-016   A-002 (nothing happens without a value), A-008 (no link, no error message, no validation tooltip, the
// ROW-016   previous result and the field left as they were); element ids D-009.
// ROW-016 wrong product: the field is <input type="url" required> in a form, so an empty press raises the browser's
// ROW-016   "Please fill out this field" (validationMessage non-empty); or an empty press writes "Enter an address" in
// ROW-016   the result area, wiping the link; or the field is trimmed to '' on a spaces-only press; or the press
// ROW-016   submits a form and reloads the page (link gone).
// ROW-016 given: index.html from disk; inputs '' and '   ' (and a single ' '); a dialog recorder; a navigation
// ROW-016   watcher and a reload sentinel; for the "link shown" half, a link L made by one valid shot of a fresh address.
// ROW-016 when: for each input, by the button and by Enter, first with no link yet, then with L shown.
// ROW-016 then: the whole page state (markup, visible and full text, title, URL, element count, field value,
// ROW-016   validationMessage, validity) after the press equals the state just before it, and equals the state before
// ROW-016   typing apart from the field's value; validationMessage '' and validity true; result links [] before any
// ROW-016   link and exactly [L] after; no dialog; sentinel intact, no navigation.
// ROW-016 controls: the control case types a fresh valid address, presses, and sees the same instrument report a
// ROW-016   change (state differs, one new link) — so "state unchanged" is not a blind instrument, and the field
// ROW-016   and button are reached.
// ROW-016 technique: before/after on the whole page state, with a bounded window for a late change; both press
// ROW-016   paths; both "no link yet" and "link shown" starting states, as the row names them.
// ROW-016 cases: ROW-016 target=tests/invariants/row-016-017-029-032-req-006-rejected-shot.spec.js::ROW-016_empty_or_spaces-only_field_changes_nothing_before_and_after_a_link_exists control=tests/invariants/row-016-017-029-032-req-006-rejected-shot.spec.js::ROW-016_control_a_valid_shot_is_seen_by_the_same_state_instrument
//
// ROW-017 promise: with a link shown and the field holding hello, the button or Enter keeps the earlier link, keeps
// ROW-017   hello in the field, shows no message, and no browser validation message. Authority: REQ-006 fail-if 1-4,
// ROW-017   A-008, A-006 (the web-address check); ids D-009.
// ROW-017 wrong product: an invalid press shows "Not a valid address" (in the result area, beside it, or as an
// ROW-017   alert); or clears the field; or <input type="url"> makes validity typeMismatch with a message; or the check
// ROW-017   is skipped and hello gets a link replacing L.
// ROW-017 given: link L from one valid shot of a fresh address; the row's own value hello, plus a fresh decoy
// ROW-017   'hello<fresh>' no product can special-case.
// ROW-017 when: each value typed, then the button, then Enter (the field still holding it).
// ROW-017 then: the same whole-state equality as ROW-016; the field holds exactly the typed text; result links [L];
// ROW-017   validationMessage '' and validity true; no dialog; no navigation.
// ROW-017 controls: the ROW-016 control (the instrument sees a valid shot change the page).
// ROW-017 technique: before/after on the whole page state with a fresh decoy value.
// ROW-017 cases: ROW-017 target=tests/invariants/row-016-017-029-032-req-006-rejected-shot.spec.js::ROW-017_hello_with_a_link_shown_keeps_the_link_and_the_field_and_shows_no_message control=tests/invariants/row-016-017-029-032-req-006-rejected-shot.spec.js::ROW-016_control_a_valid_shot_is_seen_by_the_same_state_instrument
//
// ROW-029 promise: a rejection does not stick — after hello then an empty field, https://example.com by the button
// ROW-029   shows a link, and the same sequence by Enter does too. Authority: REQ-006 (rejected input changes nothing,
// ROW-029   so it leaves the page as able as before), A-008.
// ROW-029 wrong product: an invalid press sets an error flag or disables the button and nothing clears it, so the
// ROW-029   next valid shot shows nothing; or Enter's listener is removed after a rejection.
// ROW-029 given: a fresh page per path; the row's own sequence hello, '', https://example.com.
// ROW-029 when: by the button: hello, '', https://example.com each pressed with the button; by Enter: the same with
// ROW-029   Enter, on its own fresh page.
// ROW-029 then: before the last press #result holds no link; after it exactly one link matching
// ROW-029   https://shooter.app/<6 letters or digits>, visible on the page.
// ROW-029 controls: the control case shoots https://example.com on a fresh page with no prior rejection, by each
// ROW-029   path, and sees a link — the path works when nothing came before, so the target isolates "sticking".
// ROW-029 technique: before/after on the path the row names, both presses, fresh page each.
// ROW-029 cases: ROW-029 target=tests/invariants/row-016-017-029-032-req-006-rejected-shot.spec.js::ROW-029_after_hello_and_an_empty_field_a_valid_shot_shows_a_link_by_the_button_and_by_Enter control=tests/invariants/row-016-017-029-032-req-006-rejected-shot.spec.js::ROW-029_control_a_valid_shot_on_a_fresh_page_shows_a_link_by_each_path
//
// ROW-032 promise: after Enter with an invalid input focus stays in the field; after the button with an invalid
// ROW-032   input focus is on the button, never on the page body. Authority: REQ-006 (a rejected input changes nothing
// ROW-032   on the page), A-008.
// ROW-032 wrong product: an invalid press re-renders the form (innerHTML), or disables the button for a moment, or
// ROW-032   calls blur(), so document.activeElement falls to <body>; or it moves focus to the field after the button.
// ROW-032 given: inputs hello, '', '   ', https://example.com:8080, and a fresh 'x<fresh>'; once with no link, once
// ROW-032   with a link shown.
// ROW-032 when: Enter pressed in the field; the button clicked; the button pressed from the keyboard (focused, then
// ROW-032   Enter and Space).
// ROW-032 then: after Enter, document.activeElement is #url-input; after the button (click or key), it is
// ROW-032   #shoot-button — never body, never null.
// ROW-032 controls: the control case shows the focus reader tells the field, the button and body apart on this page
// ROW-032   (focus each, blur), so the target's reading is evidence.
// ROW-032 technique: before/after on document.activeElement through each real control path.
// ROW-032 cases: ROW-032 target=tests/invariants/row-016-017-029-032-req-006-rejected-shot.spec.js::ROW-032_after_a_rejected_shot_focus_stays_in_the_field_after_Enter_and_on_the_button_after_the_button control=tests/invariants/row-016-017-029-032-req-006-rejected-shot.spec.js::ROW-032_control_the_focus_reader_tells_the_field_the_button_and_the_body_apart
'use strict';
const { test, expect } = require('@playwright/test');
const h = require('./harness');

const VIAS = ['button', 'enter'];

/** Opens the page with the recorders every case here uses. */
async function open(page) {
  const dialogs = h.watchDialogs(page);
  const url = await h.openPage(page, 'file');
  const sentinel = await h.plantSentinel(page);
  const navs = h.watchNavigations(page);
  return { dialogs, url, sentinel, navs };
}

/** One valid shot of a fresh address; returns the link it shows. */
async function makeLink(page, via = 'button') {
  const before = await h.resultLinks(page);
  await h.shoot(page, `https://example.com/${h.fresh('p')}`, via);
  await h.waitForResultChange(page, before);
  const links = await h.resultLinks(page);
  expect(links.length, 'setup: a valid shot shows one link').toBe(1);
  expect(links[0], 'setup: the link has the promised shape').toMatch(h.LINK_RE);
  return links[0];
}

/** Asserts a press changed nothing: whole state equal, no validation message, links as expected, no dialog, no reload. */
async function expectNothingChanged(page, ctx, row, label, obs, links) {
  const { base, before, after } = obs;
  expect(after, `${row} ${label}: the page state after the press equals the state before it`).toEqual(before);
  expect({ ...after, field: null }, `${row} ${label}: nothing but the typed field differs from before typing`)
    .toEqual({ ...base, field: null });
  expect(after.validationMessage, `${row} ${label}: no browser validation message`).toBe('');
  expect(after.valid, `${row} ${label}: the field reports valid (checkValidity true)`).toBe(true);
  expect(await h.resultLinks(page), `${row} ${label}: the result area's links`).toEqual(links);
  expect(ctx.dialogs, `${row} ${label}: no dialog`).toEqual([]);
  expect(ctx.navs, `${row} ${label}: no navigation`).toEqual([]);
  expect(await h.sentinelIntact(page, ctx.sentinel), `${row} ${label}: no reload`).toBe(true);
}

test('ROW-016 control a valid shot is seen by the same state instrument', async ({ page }) => {
  const ctx = await open(page);
  expect(await h.resultLinks(page)).toEqual([]);
  const address = `https://example.com/${h.fresh('c')}`;
  const obs = await h.pressAndObserve(page, address, 'button', 2000);
  expect(obs.before.field).toBe(address);
  expect(obs.after).not.toEqual(obs.before);
  const links = await h.resultLinks(page);
  expect(links.length).toBe(1);
  expect(links[0]).toMatch(h.LINK_RE);
  expect(ctx.dialogs).toEqual([]);
});

test('ROW-016 empty or spaces-only field changes nothing before and after a link exists', async ({ page }) => {
  const ctx = await open(page);
  const inputs = ['', '   ', ' '];
  for (const text of inputs) {
    for (const via of VIAS) {
      const obs = await h.pressAndObserve(page, text, via);
      await expectNothingChanged(page, ctx, 'ROW-016', `no link yet, ${JSON.stringify(text)} by ${via}`, obs, []);
    }
  }
  const link = await makeLink(page);
  for (const text of inputs) {
    for (const via of VIAS) {
      const obs = await h.pressAndObserve(page, text, via);
      await expectNothingChanged(page, ctx, 'ROW-016', `link shown, ${JSON.stringify(text)} by ${via}`, obs, [link]);
      expect(obs.after.field, `ROW-016 link shown, ${JSON.stringify(text)} by ${via}: field unchanged`).toBe(text);
    }
  }
});

test('ROW-017 hello with a link shown keeps the link and the field and shows no message', async ({ page }) => {
  const ctx = await open(page);
  const link = await makeLink(page);
  for (const text of ['hello', `hello${h.fresh('d')}`]) {
    for (const via of VIAS) {
      const obs = await h.pressAndObserve(page, text, via);
      await expectNothingChanged(page, ctx, 'ROW-017', `${text} by ${via}`, obs, [link]);
      expect(obs.after.field, `ROW-017 ${text} by ${via}: the field keeps the text`).toBe(text);
    }
  }
});

test('ROW-029 control a valid shot on a fresh page shows a link by each path', async ({ page }) => {
  for (const via of VIAS) {
    await h.openPage(page, 'file');
    expect(await h.resultLinks(page)).toEqual([]);
    await h.shoot(page, 'https://example.com', via);
    await h.waitForResultChange(page, []);
    const links = await h.resultLinks(page);
    expect(links.length, `ROW-029 control by ${via}`).toBe(1);
    expect(links[0]).toMatch(h.LINK_RE);
  }
});

test('ROW-029 after hello and an empty field a valid shot shows a link by the button and by Enter', async ({ page }) => {
  for (const via of VIAS) {
    await h.openPage(page, 'file');
    await h.shoot(page, 'hello', via);
    await h.settle(page);
    await h.shoot(page, '', via);
    await h.settle(page);
    expect(await h.resultLinks(page), `ROW-029 by ${via}: no link before the valid shot`).toEqual([]);
    await h.shoot(page, 'https://example.com', via);
    await h.waitForResultChange(page, []);
    const links = await h.resultLinks(page);
    expect(links.length, `ROW-029 by ${via}: one link after the valid shot`).toBe(1);
    expect(links[0], `ROW-029 by ${via}: the link's shape`).toMatch(h.LINK_RE);
    expect(await h.visibleLinks(page), `ROW-029 by ${via}: the link is visible`).toContain(links[0]);
  }
});

test('ROW-032 control the focus reader tells the field the button and the body apart', async ({ page }) => {
  await h.openPage(page, 'file');
  await page.focus(h.SEL.field);
  expect(await h.focusedId(page)).toBe('url-input');
  await page.focus(h.SEL.button);
  expect(await h.focusedId(page)).toBe('shoot-button');
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  expect(await h.focusedId(page)).toBeNull();
});

test('ROW-032 after a rejected shot focus stays in the field after Enter and on the button after the button', async ({ page }) => {
  await h.openPage(page, 'file');
  const inputs = ['hello', '', '   ', 'https://example.com:8080', `x${h.fresh('f')}`];
  for (const phase of ['no link yet', 'link shown']) {
    if (phase === 'link shown') await makeLink(page);
    for (const text of inputs) {
      const label = `${phase}, ${JSON.stringify(text)}`;

      await h.typeInto(page, text);
      await page.press(h.SEL.field, 'Enter');
      await h.settle(page);
      expect(await h.focusedId(page), `ROW-032 ${label} by Enter: focus stays in the field`).toBe('url-input');

      await h.typeInto(page, text);
      await page.click(h.SEL.button);
      await h.settle(page);
      expect(await h.focusedId(page), `ROW-032 ${label} by a click on the button: focus on the button`).toBe('shoot-button');

      for (const key of ['Enter', 'Space']) {
        await h.typeInto(page, text);
        await page.focus(h.SEL.button);
        await page.keyboard.press(key);
        await h.settle(page);
        expect(await h.focusedId(page), `ROW-032 ${label} by ${key} on the button: focus on the button`).toBe('shoot-button');
      }
    }
  }
});
