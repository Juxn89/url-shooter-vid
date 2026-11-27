// Purpose: ledger tests for REQ-010's live region — #result is a polite live region from load, rendered, and every new link is announced whole (ROW-022, ROW-033, ROW-038, ROW-046).
// Provenance: hand-authored
// Rows served: ROW-022, ROW-033, ROW-038, ROW-046 (REQ-010). Element ids are D-009, reached through the harness client.
'use strict';
const { test, expect } = require('@playwright/test');
const h = require('./harness');
const { measure } = require('./measure');

/** A valid address no product can know in advance: REQ-007's accepted shape with a fresh path. */
const freshAddress = () => `https://example.com/${h.fresh('p')}`;

/** Tags the element now at #result with a fresh value; false when there is no #result. */
async function markResult(page, token) {
  return page.evaluate(([sel, t]) => {
    const el = document.querySelector(sel);
    if (!el) return false;
    el.__vidMark = t;
    return true;
  }, [h.SEL.result, token]);
}

/** True when the element now at #result is the one tagged earlier with token. */
async function sameResult(page, token) {
  return page.evaluate(([sel, t]) => { const el = document.querySelector(sel); return !!el && el.__vidMark === t; }, [h.SEL.result, token]);
}

/** The aria-live value #result carries, lower-cased and trimmed ('' when absent, null when there is no #result). */
async function ariaLive(page) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    return el ? (el.getAttribute('aria-live') || '').trim().toLowerCase() : null;
  }, h.SEL.result);
}

/** Shoots and waits until #result's links differ from `before`; returns the link tokens now in #result. */
async function shotLinks(page, via, before) {
  await h.shoot(page, freshAddress(), via);
  await h.waitForResultChange(page, before);
  return h.resultLinks(page);
}

// ROW-022 promise: the result area carries aria-live polite and its text changes on every shot, including one that
//   replaces an earlier link, so each new link is announced (REQ-010 fail-if (3); A-017 "the result area is a polite
//   live region so a screen reader announces each new link").
// ROW-022 wrong product: aria-live="assertive" (interrupts the reader — fail-if (3)'s named harm), or no aria-live at
//   all, or a product that writes the first link and leaves later shots' text the same (nothing new to announce), or
//   one that swaps in a fresh #result element without the attribute when it replaces a link.
// ROW-022 given, when, then: given the page from disk with #result tagged by a fresh value; when three valid shots
//   are fired (button, button, Enter); then after each, #result is still the tagged element, still carries
//   aria-live="polite", and its text has changed to one link different from every earlier one.
// ROW-022 controls: #result holds no link before the first shot; the control case shows one shot puts a link in
//   #result, so the region is reached.
// ROW-022 technique: before/after per shot on one exact element, three shots so "every shot" covers replacement
//   by both triggers.
// cases: ROW-022 target=tests/invariants/row-022-req-010-live-region.spec.js::ROW-022_REQ-010_result_is_aria_live_polite_and_its_text_changes_on_every_shot control=tests/invariants/row-022-req-010-live-region.spec.js::ROW-022_control_a_shot_puts_a_link_in_result
test('ROW-022_REQ-010_result_is_aria_live_polite_and_its_text_changes_on_every_shot', async ({ page }) => {
  await h.openPage(page, 'file');
  const token = h.fresh('m');
  expect(await markResult(page, token), 'ROW-022: #result must exist').toBe(true);
  expect(await ariaLive(page), 'ROW-022: #result must carry aria-live="polite"').toBe('polite');
  expect(await h.resultLinks(page), 'ROW-022: before the first shot #result holds no link').toEqual([]);
  const seen = [];
  let prevText = await h.resultText(page);
  for (const via of ['button', 'button', 'enter']) {
    const links = await shotLinks(page, via, seen.length ? [seen[seen.length - 1]] : []);
    const n = seen.length + 1;
    const text = await h.resultText(page);
    expect(text, `ROW-022: shot ${n} (${via}) must change #result's text`).not.toBe(prevText);
    expect(links, `ROW-022: after shot ${n} #result must hold exactly one link`).toHaveLength(1);
    expect(links[0]).toMatch(h.LINK_RE);
    expect(seen, `ROW-022: shot ${n} must show a link not shown before`).not.toContain(links[0]);
    expect(await sameResult(page, token), `ROW-022: after shot ${n} the live region must be the same #result element`).toBe(true);
    expect(await ariaLive(page), `ROW-022: after shot ${n} #result must still carry aria-live="polite"`).toBe('polite');
    seen.push(links[0]);
    prevText = text;
  }
});

test('ROW-022_control_a_shot_puts_a_link_in_result', async ({ page }) => {
  await h.openPage(page, 'file');
  const links = await shotLinks(page, 'button', []);
  expect(links, 'ROW-022 control: one shot must put one link in #result').toHaveLength(1);
  expect(links[0]).toMatch(h.LINK_RE);
});

// ROW-033 promise: the polite live region exists at page load, before the first shot, is not aria-hidden, and is the
//   same element whose text later becomes the link (REQ-010 fail-if (3): a region created or revealed with its first
//   content is commonly not announced).
// ROW-033 wrong product: #result is created (or given aria-live) by the first shot, so the first link goes unannounced;
//   or #result sits inside an aria-hidden="true" wrapper; or the link is drawn into a new element replacing #result.
// ROW-033 given, when, then: given the page just loaded from disk, before any shot; then #result exists, carries
//   aria-live="polite", and neither it nor any ancestor carries aria-hidden="true"; it is tagged with a fresh value;
//   when a valid shot is fired; then the element now at #result is the tagged one and the link text
//   sits inside it.
// ROW-033 controls: the link is absent before the shot and present after (the shot is reached); the control case
//   shows a shot puts a link in #result.
// ROW-033 technique: identity by a fresh per-run tag on the load-time element (no product can copy it to a new node).
// cases: ROW-033 target=tests/invariants/row-022-req-010-live-region.spec.js::ROW-033_REQ-010_polite_live_region_exists_at_load_not_hidden_and_is_the_element_that_gets_the_link control=tests/invariants/row-022-req-010-live-region.spec.js::ROW-033_control_a_shot_puts_a_link_in_result
test('ROW-033_REQ-010_polite_live_region_exists_at_load_not_hidden_and_is_the_element_that_gets_the_link', async ({ page }) => {
  await h.openPage(page, 'file');
  const atLoad = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    return {
      live: (el.getAttribute('aria-live') || '').trim().toLowerCase(),
      hiddenBy: el.closest('[aria-hidden="true" i]') ? el.closest('[aria-hidden="true" i]').tagName + '#' + el.closest('[aria-hidden="true" i]').id : '',
    };
  }, h.SEL.result);
  expect(atLoad, 'ROW-033: #result must exist at page load, before any shot').not.toBeNull();
  expect(atLoad.live, 'ROW-033: at load #result must already carry aria-live="polite"').toBe('polite');
  expect(atLoad.hiddenBy, 'ROW-033: at load neither #result nor an ancestor may be aria-hidden="true"').toBe('');
  const token = h.fresh('m');
  await markResult(page, token);
  expect(await h.resultLinks(page), 'ROW-033: before the shot #result holds no link').toEqual([]);
  const links = await shotLinks(page, 'button', []);
  expect(links, 'ROW-033: the shot must put one link in #result').toHaveLength(1);
  expect(await sameResult(page, token), 'ROW-033: the link must land in the very #result element present at load').toBe(true);
  const inside = await page.evaluate(([sel, link]) => document.querySelector(sel).textContent.includes(link), [h.SEL.result, links[0]]);
  expect(inside, 'ROW-033: the link text must sit inside the load-time #result').toBe(true);
  expect(await page.evaluate((sel) => !document.querySelector(sel).closest('[aria-hidden="true" i]'), h.SEL.result),
    'ROW-033: after the shot #result must still not be aria-hidden').toBe(true);
});

test('ROW-033_control_a_shot_puts_a_link_in_result', async ({ page }) => {
  await h.openPage(page, 'file');
  const links = await shotLinks(page, 'enter', []);
  expect(links, 'ROW-033 control: one shot must put one link in #result').toHaveLength(1);
  expect(links[0]).toMatch(h.LINK_RE);
});

// ROW-038 promise: at page load the result area is rendered — computed display not none, visibility visible, no
//   hidden attribute — while its text is empty (REQ-010 fail-if (3): a live region not rendered when content arrives is
//   often not announced; REQ-003 "before the first shot the result area is empty").
// ROW-038 wrong product: <div id="result" hidden aria-live="polite"> (or display:none / visibility:hidden, or inside a
//   display:none wrapper) revealed only when the first link is written — empty and quiet, so it looks right on screen.
// ROW-038 given, when, then: given the page just loaded from disk, no shot; when its computed style is read through
//   the measure module in one evaluate; then display is not none (and no ancestor is display none), visibility is
//   visible, there is no hidden attribute, and the text is empty.
// ROW-038 controls: the control case shows the measure reads #result at all (not "missing element") and that a shot
//   later fills it with a link — the element measured is the one that matters.
// ROW-038 technique: the load state is the "before"; exact computed values of one element, through the shared
//   measure module.
// cases: ROW-038 target=tests/invariants/row-022-req-010-live-region.spec.js::ROW-038_REQ-010_result_area_is_rendered_and_empty_at_load control=tests/invariants/row-022-req-010-live-region.spec.js::ROW-038_control_result_is_measured_and_later_holds_a_link
test('ROW-038_REQ-010_result_area_is_rendered_and_empty_at_load', async ({ page }) => {
  await h.openPage(page, 'file');
  const m = await measure(page, { [h.SEL.result]: ['display', 'visibility'] });
  expect(m[h.SEL.result], 'ROW-038: #result must exist at load').not.toBe('missing element');
  expect(m[h.SEL.result].display, 'ROW-038: at load #result must not be display:none').not.toBe('none');
  expect(m[h.SEL.result].visibility, 'ROW-038: at load #result must be visibility:visible').toBe('visible');
  const more = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    let a = el.parentElement;
    let noneAncestor = '';
    while (a) { if (getComputedStyle(a).display === 'none') { noneAncestor = a.tagName + '#' + a.id; break; } a = a.parentElement; }
    return { hiddenAttr: el.hasAttribute('hidden'), noneAncestor, text: el.textContent };
  }, h.SEL.result);
  expect(more.hiddenAttr, 'ROW-038: at load #result must not carry the hidden attribute').toBe(false);
  expect(more.noneAncestor, 'ROW-038: at load no ancestor of #result may be display:none').toBe('');
  expect(more.text.trim(), 'ROW-038: at load #result text must be empty').toBe('');
});

test('ROW-038_control_result_is_measured_and_later_holds_a_link', async ({ page }) => {
  await h.openPage(page, 'file');
  const m = await measure(page, { [h.SEL.result]: ['display'] });
  expect(m[h.SEL.result], 'ROW-038 control: the measure must find #result').not.toBe('missing element');
  const links = await shotLinks(page, 'button', []);
  expect(links, 'ROW-038 control: a shot must put a link in #result').toHaveLength(1);
});

// ROW-046 promise: each new link is announced whole — after a second shot, either #result carries aria-atomic="true",
//   or its whole content is replaced at once by one text holding the full link, prefix included (REQ-010 fail-if (3)).
// ROW-046 wrong product: #result holds a fixed "https://shooter.app/" text and a code <span>; a new shot rewrites only
//   the span, without aria-atomic, so the screen reader says "k3P9xq" and never the link.
// ROW-046 given, when, then: given the page from disk after a first shot, with every text node then under #result
//   remembered and a recorder of text-node edits and of #result text changes; when a second shot is fired; then
//   either aria-atomic is "true" on #result, or every non-empty text node now under #result is new or edited during
//   the shot, one of them holds the full new link in its own text, and #result's text changed exactly once.
// ROW-046 controls: the second link differs from the first (the replacement happened — the case the row is about is
//   reached); the control case shows two shots give two different links in #result.
// ROW-046 technique: the row's own either/or, both arms computed from what the DOM did; the unconditional assertions
//   on the second link keep the case from passing on a page that never replaced anything.
// cases: ROW-046 target=tests/invariants/row-022-req-010-live-region.spec.js::ROW-046_REQ-010_second_link_is_announced_whole control=tests/invariants/row-022-req-010-live-region.spec.js::ROW-046_control_two_shots_give_two_different_links
test('ROW-046_REQ-010_second_link_is_announced_whole', async ({ page }) => {
  await h.openPage(page, 'file');
  const first = await shotLinks(page, 'button', []);
  expect(first, 'ROW-046: the first shot must put one link in #result').toHaveLength(1);
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    const old = new Set();
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) old.add(n);
    const edited = new Set();
    window.__vid46 = { old, edited };
    new MutationObserver((recs) => { for (const r of recs) if (r.type === 'characterData') edited.add(r.target); })
      .observe(document.documentElement, { subtree: true, characterData: true });
  }, h.SEL.result);
  await h.watchResultText(page);
  const second = await shotLinks(page, 'button', first);
  expect(second, 'ROW-046: the second shot must leave exactly one link in #result').toHaveLength(1);
  expect(second[0]).toMatch(h.LINK_RE);
  expect(second[0], 'ROW-046: the second shot must show a new link').not.toBe(first[0]);
  const verdict = await page.evaluate(([sel, link]) => {
    const el = document.querySelector(sel);
    const { old, edited } = window.__vid46;
    const atomic = (el.getAttribute('aria-atomic') || '').trim().toLowerCase() === 'true';
    const texts = [];
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) if (n.data.trim() !== '') texts.push(n);
    const stale = texts.filter((t) => old.has(t) && !edited.has(t)).map((t) => t.data);
    const holder = texts.some((t) => t.data.includes(link));
    return { atomic, stale, holder };
  }, [h.SEL.result, second[0]]);
  const log = await h.resultTextLog(page);
  const replacedWhole = verdict.stale.length === 0 && verdict.holder && log.length === 1;
  expect(verdict.atomic || replacedWhole,
    `ROW-046: without aria-atomic="true" the second link must arrive as one replacement holding the full link — ` +
    `unchanged old text: ${JSON.stringify(verdict.stale)}, one text holds "${second[0]}": ${verdict.holder}, ` +
    `#result text changes during the shot: ${log.length}`).toBe(true);
});

test('ROW-046_control_two_shots_give_two_different_links', async ({ page }) => {
  await h.openPage(page, 'file');
  const first = await shotLinks(page, 'button', []);
  const second = await shotLinks(page, 'button', first);
  expect(first, 'ROW-046 control: the first shot must show a link').toHaveLength(1);
  expect(second, 'ROW-046 control: the second shot must show a link').toHaveLength(1);
  expect(second[0], 'ROW-046 control: the two links must differ').not.toBe(first[0]);
});
