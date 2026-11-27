// Purpose: ledger test for REQ-012 — opened from file://, typing without clicking puts the text into the field (ROW-054).
// Provenance: hand-authored
// Rows served: ROW-054 (REQ-012). Element ids are D-009, reached through the harness client.
'use strict';
const { test, expect } = require('@playwright/test');
const h = require('./harness');

// ROW-054 promise: when the page opens from file://, typing on the keyboard without clicking puts the text into the
//   field (REQ-012 fail-if (1); A-024, human: "Should the field have the cursor in it as soon as the page opens? —
//   yes").
// ROW-054 wrong product: no autofocus and no focus() call — the page opens with focus on the body, and the
//   demonstrator's first keystrokes go nowhere; or focus set only over http(s) by a script Chrome blocks from file://.
// ROW-054 given, when, then: given the page opened from disk (file://), the field empty, nothing clicked, the page
//   allowed to finish its first rendering (autofocus is applied then); when a fresh word is typed on the keyboard;
//   then the field's value is exactly that word, and the word appears in no other text box.
// ROW-054 controls: the address is asserted file:// and the field empty before typing (before/after); the control
//   case clicks into the field first and types — the keyboard path works, so a failure is the missing focus.
// ROW-054 technique: before/after with a fresh value on one exact element, through the real keyboard; the clock is
//   the page's own rendering (two frames), never a fixed sleep.
// cases: ROW-054 target=tests/invariants/row-054-req-012-file-focus.spec.js::ROW-054_REQ-012_typing_without_clicking_on_file_page_fills_the_field control=tests/invariants/row-054-req-012-file-focus.spec.js::ROW-054_control_typing_after_clicking_the_field_fills_it
test('ROW-054_REQ-012_typing_without_clicking_on_file_page_fills_the_field', async ({ page }) => {
  await h.openPage(page, 'file');
  expect(page.url(), 'ROW-054: the page must be opened from file://').toMatch(/^file:\/\//);
  await h.settle(page);
  expect(await h.fieldValue(page), 'ROW-054: the field must be empty before typing').toBe('');
  const word = h.fresh('t');
  await page.keyboard.type(word);
  expect(await h.fieldValue(page), 'ROW-054: typing without clicking must put the text into the field').toBe(word);
  const elsewhere = await page.evaluate(([w, sel]) =>
    [...document.querySelectorAll('input, textarea, [contenteditable=""], [contenteditable="true"]')]
      .filter((e) => !e.matches(sel) && ((e.value || e.textContent || '').includes(w))).length, [word, h.SEL.field]);
  expect(elsewhere, 'ROW-054: the typed text must land in #url-input only').toBe(0);
});

test('ROW-054_control_typing_after_clicking_the_field_fills_it', async ({ page }) => {
  await h.openPage(page, 'file');
  expect(page.url()).toMatch(/^file:\/\//);
  await page.click(h.SEL.field);
  const word = h.fresh('t');
  await page.keyboard.type(word);
  expect(await h.fieldValue(page), 'ROW-054 control: typing after a click must fill the field').toBe(word);
});
