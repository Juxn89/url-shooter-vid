// Purpose: ROW-011, ROW-012 (REQ-004) — after a valid shot the field is empty and the keyboard types straight into it.
// Provenance: hand-authored
//
// ROW-011 promise: after a valid shot the field's value is empty. Authority: REQ-004 fail-if (1); A-013 (back to
// ROW-011   the emptied field).
// ROW-011 wrong product: the field keeps the shot address; the field is cleared on a button click but not on Enter
// ROW-011   (or the reverse); or the "clearing" is a form submit that reloads the page (empty field, but the link and
// ROW-011   the page's state are gone).
// ROW-011 given: the page opened from disk, a fresh valid address typed into the field; a reload sentinel.
// ROW-011 when: a shot by the button; on a second load, a shot by Enter.
// ROW-011 then: before the press the field holds exactly the typed address; after it #result shows one LINK_RE
// ROW-011   link, the field's value is '', and the sentinel is intact (no reload produced the emptiness).
// ROW-011 controls: the field keeps typed text when nothing is pressed (its value equals the address after a
// ROW-011   settle) — the reader sees a value when there is one, and the page does not clear it on its own.
// ROW-011 technique: before/after on one exact field per press kind, with a reload sentinel so emptiness is the
// ROW-011   product's doing and not a page reset.
// ROW-011 cases: ROW-011 target=tests/invariants/row-011-012-req-004-field-reset.spec.js::ROW-011_after_a_shot_by_button_or_by_Enter_the_field_is_empty control=tests/invariants/row-011-012-req-004-field-reset.spec.js::ROW-011_control_typed_text_stays_in_the_field_while_nothing_is_pressed
//
// ROW-012 promise: after a valid shot made by clicking the button, typing on the keyboard without clicking enters
// ROW-012   the text into the field. Authority: REQ-004 fail-if (2); A-013 (focus back in the field).
// ROW-012 wrong product: focus left on the button after the click (typing goes nowhere, or a space re-presses
// ROW-012   it); focus moved to the result area or the body; focus returned only after an Enter shot.
// ROW-012 given: the page opened from disk; a fresh address put in the field and the button clicked with the real
// ROW-012   mouse (which moves focus to the button); a second fresh value to type.
// ROW-012 when: after the link appears, the keyboard types the second value, with no click anywhere.
// ROW-012 then: the field's value contains the typed value (contains, not equals, so a field the product failed
// ROW-012   to clear — ROW-011's fault — does not fail this row).
// ROW-012 controls: on a fresh load, clicking the field and typing puts exactly the value in the field — the
// ROW-012   keyboard reaches the field when it has focus.
// ROW-012 technique: the user's real gesture sequence (mouse click on the button, then bare keystrokes), the only
// ROW-012   way to observe "without clicking".
// ROW-012 cases: ROW-012 target=tests/invariants/row-011-012-req-004-field-reset.spec.js::ROW-012_after_a_button_shot_typing_without_a_click_enters_the_field control=tests/invariants/row-011-012-req-004-field-reset.spec.js::ROW-012_control_typing_after_clicking_the_field_enters_it
'use strict';
const { test, expect } = require('@playwright/test');
const h = require('./harness');

// ---- ROW-011 ----

test('ROW-011 control typed text stays in the field while nothing is pressed', async ({ page }) => {
  await h.openPage(page, 'file');
  const addr = `https://example.com/${h.fresh('c11')}`;
  await h.typeInto(page, addr);
  await h.settle(page);
  expect(await h.fieldValue(page)).toBe(addr);
});

test('ROW-011 after a shot by button or by Enter the field is empty', async ({ page }) => {
  for (const via of ['button', 'enter']) {
    await h.openPage(page, 'file');
    const sentinel = await h.plantSentinel(page);
    const addr = `https://example.com/${h.fresh('r11')}`;
    await h.typeInto(page, addr);
    expect(await h.fieldValue(page)).toBe(addr);
    await h.shoot(page, undefined, via);
    await h.waitForResultChange(page, []);
    const links = await h.resultLinks(page);
    expect(links.length, `ROW-011 (${via}): no single link was shown`).toBe(1);
    expect(links[0]).toMatch(h.LINK_RE);
    expect(await h.sentinelIntact(page, sentinel), `ROW-011 (${via}): the page reloaded`).toBe(true);
    expect(await h.fieldValue(page), `ROW-011 (${via}): the field was not emptied`).toBe('');
  }
});

// ---- ROW-012 ----

test('ROW-012 control typing after clicking the field enters it', async ({ page }) => {
  await h.openPage(page, 'file');
  const v = h.fresh('c12');
  await page.click(h.SEL.field);
  await page.keyboard.type(v);
  expect(await h.fieldValue(page)).toBe(v);
});

test('ROW-012 after a button shot typing without a click enters the field', async ({ page }) => {
  await h.openPage(page, 'file');
  await h.typeInto(page, `https://example.com/${h.fresh('r12')}`);
  await page.click(h.SEL.button);
  await h.waitForResultChange(page, []);
  const links = await h.resultLinks(page);
  expect(links.length, 'ROW-012: the button shot showed no single link').toBe(1);

  const typed = h.fresh('t');
  await page.keyboard.type(typed);
  await h.settle(page);
  expect(await h.fieldValue(page), 'ROW-012: keystrokes after the button shot did not reach the field').toContain(typed);
});
