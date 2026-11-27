// Purpose: ROW-001 (REQ-003, REQ-010) — the page opened from disk draws one labelled field, one named button, an empty result area, and no console error.
// Provenance: hand-authored
//
// ROW-001 promise: opened from disk (file://) in Chrome, the page shows one text field with a visible associated
// ROW-001   label, one button with visible text and an empty result area, and logs no console error. Authority:
// ROW-001   REQ-010 fail-if (1) no programmatically associated label, (2) button has no text — A-017; REQ-003 fail-if (4)
// ROW-001   anything shown in the result area before the first shot — A-012; the element ids are D-009.
// ROW-001 wrong product: the field is "labelled" only by a placeholder, by a <span> not tied to it, or by a label
// ROW-001   hidden off-screen (sr-only, 1px); the result area ships pre-filled ("Your link will appear here", as text or
// ROW-001   as CSS ::before content); a second input or button sits on the page; or a script that only loads over http
// ROW-001   (a module script, a missing file) logs an error or fails to load when opened from disk.
// ROW-001 given: index.html opened from the read-only checkout as file:///app/index.html, errors (console, uncaught,
// ROW-001   failed requests) collected from before the navigation. when: the page finishes loading.
// ROW-001 then: exactly one visible text-entry control on the whole page and it is #url-input; its .labels holds the
// ROW-001   label[for=url-input], which is visible, larger than a screen-reader-only box and has non-empty text; exactly
// ROW-001   one visible button on the whole page and it is #shoot-button with non-empty visible text; #result is attached
// ROW-001   and holds no text, no content elements and no generated ::before/::after text; the error list is empty.
// ROW-001 controls: the control case shows the file load works (location is the file:// address, readyState
// ROW-001   complete) AND that the error collector is not blind — a console.error and a failed file:// load, each with a
// ROW-001   fresh value, injected on the same page, both land in the list — so an empty list in the target is evidence.
// ROW-001 technique: exact counts over the whole page (never "the box the implementation labelled"), so a decoy second
// ROW-001   control or a detached label is caught; the error list compared whole, so one stray error fails; a
// ROW-001   proven-sighted collector, because an absence is only evidence from an instrument shown to see.
// ROW-001 cases: ROW-001 target=tests/invariants/row-001-shell-index.spec.js::ROW-001_shell_from_disk_shows_labelled_field_named_button_empty_result_no_console_error control=tests/invariants/row-001-shell-index.spec.js::ROW-001_control_index_html_loads_from_disk_and_the_error_collector_sees_errors
'use strict';
const { test, expect } = require('@playwright/test');
const h = require('./harness');

test('ROW-001 control index html loads from disk and the error collector sees errors', async ({ page }) => {
  const errors = h.collectErrors(page);
  const url = await h.openPage(page, 'file');
  expect(url.startsWith('file://')).toBe(true);
  expect(page.url()).toBe(url);
  expect(await page.evaluate(() => document.readyState)).toBe('complete');

  const said = h.fresh('e');
  const missing = h.fresh('m');
  await page.evaluate(([msg, file]) => {
    console.error(msg);
    const s = document.createElement('script');
    s.src = `${file}.js`;
    document.head.appendChild(s);
  }, [said, missing]);
  await expect.poll(() => errors.some((e) => e.includes(said)), { timeout: 5000 }).toBe(true);
  await expect.poll(() => errors.some((e) => e.includes(missing)), { timeout: 5000 }).toBe(true);
});

test('ROW-001 shell from disk shows labelled field named button empty result no console error', async ({ page }) => {
  const errors = h.collectErrors(page);
  await h.openPage(page, 'file');

  // One text field on the whole page, and it is #url-input (D-009).
  const fields = await page.evaluate(() => {
    const nonText = new Set(['hidden', 'button', 'submit', 'reset', 'image', 'checkbox', 'radio', 'file', 'range', 'color']);
    const visible = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
    const all = [...document.querySelectorAll('input, textarea, [contenteditable=""], [contenteditable="true"]')]
      .filter((el) => !(el.tagName === 'INPUT' && nonText.has((el.getAttribute('type') || 'text').toLowerCase())))
      .filter(visible);
    return all.map((el) => el.id || el.tagName);
  });
  expect(fields).toEqual(['url-input']);

  // Its label is visible, non-empty, really drawn (not a 1px sr-only box) and programmatically tied to it (REQ-010 fail-if 1).
  const label = page.locator(h.SEL.label);
  await expect(label).toHaveCount(1);
  await expect(label).toBeVisible();
  const tie = await page.evaluate((sel) => {
    const f = document.querySelector(sel.field);
    const l = document.querySelector(sel.label);
    const r = l ? l.getBoundingClientRect() : { width: 0, height: 0 };
    return { tied: !!(f && l && [...f.labels].includes(l)), text: l ? l.innerText.trim() : '', w: r.width, hgt: r.height };
  }, h.SEL);
  expect(tie.tied).toBe(true);
  expect(tie.text).not.toBe('');
  expect(tie.w).toBeGreaterThan(2);
  expect(tie.hgt).toBeGreaterThan(2);

  // One button on the whole page, it is #shoot-button, and its visible text is non-empty (REQ-010 fail-if 2).
  const buttons = await page.evaluate(() => {
    const visible = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
    return [...document.querySelectorAll('button, input[type=button], input[type=submit], input[type=reset], input[type=image], [role=button]')]
      .filter(visible).map((el) => el.id || el.tagName);
  });
  expect(buttons).toEqual(['shoot-button']);
  const button = page.locator(h.SEL.button);
  await expect(button).toBeVisible();
  const buttonText = await button.evaluate((el) => (el.tagName === 'INPUT' ? el.value : el.innerText).trim());
  expect(buttonText).not.toBe('');

  // The result area exists and shows nothing before the first shot (REQ-003 fail-if 4): no text, no content
  // elements, no CSS-generated text.
  await expect(page.locator(h.SEL.result)).toHaveCount(1);
  const result = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    const gen = (pseudo) => {
      const c = getComputedStyle(el, pseudo).content;
      return c === 'none' || c === 'normal' || c === '""' || c === "''" ? '' : c;
    };
    return {
      text: el.textContent.trim(),
      content: el.querySelectorAll('img, svg, canvas, video, input, textarea, button, a, iframe, object').length,
      generated: gen('::before') + gen('::after'),
    };
  }, h.SEL.result);
  expect(result).toEqual({ text: '', content: 0, generated: '' });

  // No console error, uncaught error or failed load, as the owner opens it (from disk).
  await h.settle(page);
  expect(errors).toEqual([]);
});
