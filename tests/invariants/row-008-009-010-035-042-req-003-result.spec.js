// Purpose: ROW-008, ROW-009, ROW-010, ROW-035, ROW-042 (REQ-003) — the result area: empty at first, plain selectable text, never clickable, replaced on each shot, fresh after a reload.
// Provenance: hand-authored
//
// ROW-008 promise: the link is not clickable — the result area holds no anchor or element with a navigating href,
// ROW-008   and clicking the link text leaves the page address unchanged. Authority: REQ-003 fail-if (1); A-001
// ROW-008   (only shown, never redirects); A-012 (plain text, not a clickable link).
// ROW-008 wrong product: <a href="https://shooter.app/aB3dE9"> (offline: Chrome goes to an error page); <a href="#">
// ROW-008   (hash change); a span whose click handler sets location or calls window.open; #result wrapped in an <a>.
// ROW-008 given: the page opened from disk, a fresh address shot through the button; a main-frame navigation
// ROW-008   watcher, a popup watcher on the context and a reload sentinel, all armed before the click.
// ROW-008 when: a real mouse click at the centre of the text carrying the link (inside #result).
// ROW-008 then: neither #result nor any ancestor or descendant is a, area or [href]; after the click — and a
// ROW-008   bounded wait for a navigation or popup event that must not come — the URL is unchanged, no main-frame
// ROW-008   navigation and no new page were recorded, the sentinel is intact, and the link is still shown.
// ROW-008 controls: the point clicked lies inside #result (elementFromPoint) and the link was shown before the
// ROW-008   click — the harmful case is reached; a test-owned <a href="#<fresh>"> clicked on the same page IS
// ROW-008   recorded as a navigation with a changed URL — the watcher is not blind.
// ROW-008 technique: the effect a user meets (the address, a navigation, a popup) observed by events, plus the
// ROW-008   structural absence of navigating elements over #result's whole subtree and ancestry.
// ROW-008 cases: ROW-008 target=tests/invariants/row-008-009-010-035-042-req-003-result.spec.js::ROW-008_clicking_the_link_text_navigates_nowhere_and_the_result_holds_no_href control=tests/invariants/row-008-009-010-035-042-req-003-result.spec.js::ROW-008_control_the_navigation_watcher_sees_a_test_owned_anchor_click
//
// ROW-009 promise: after a second valid shot exactly one link is visible and it is the second one; the first
// ROW-009   link's text appears nowhere on the page. Authority: REQ-003 fail-if (2), (3); A-004 (replaced, only
// ROW-009   the latest result shown).
// ROW-009 wrong product: the second link appended under the first (a history list); the first kept but hidden
// ROW-009   (display:none, a data- attribute, an aria-live log); the second shot ignored (first link still shown).
// ROW-009 given: the page opened from disk; two distinct fresh addresses.
// ROW-009 when: two shots through the button.
// ROW-009 then: after shot 1 exactly one LINK_RE link L1 is shown; after shot 2 the visible page's shooter.app
// ROW-009   tokens are exactly [L2], L2 matches LINK_RE and differs from L1, #result's tokens are [L2], and L1's
// ROW-009   full text occurs neither in the visible text, nor anywhere in the serialised document (text, attributes).
// ROW-009 controls: after shot 1, L1 IS found by the same visible-text and serialised-document searches — the
// ROW-009   searches see a link when it is there, so its absence after shot 2 is evidence.
// ROW-009 technique: before/after on one exact place (#result) plus whole-page counts and a whole-document search,
// ROW-009   so a copy kept anywhere — shown or hidden — is caught.
// ROW-009 cases: ROW-009 target=tests/invariants/row-008-009-010-035-042-req-003-result.spec.js::ROW-009_a_second_shot_replaces_the_first_link_which_appears_nowhere_on_the_page control=tests/invariants/row-008-009-010-035-042-req-003-result.spec.js::ROW-009_control_after_one_shot_the_link_is_found_by_both_searches
//
// ROW-010 promise: before the first shot the result area shows nothing — innerText empty, no child elements, the
// ROW-010   computed content of ::before and ::after none or empty. Authority: REQ-003 fail-if (4); A-012 (before
// ROW-010   the first shot the result area is empty).
// ROW-010 wrong product: a placeholder ("Your link will appear here") as text or as #result::before content; an
// ROW-010   empty <span class="link"></span> pre-rendered inside #result; a live preview that writes a link (or
// ROW-010   "press Shoot") into #result while the address is typed, before any press.
// ROW-010 given: the page opened from disk; a fresh valid address typed into the field (no press).
// ROW-010 when: the page has loaded; and again after the field is focused and the address typed.
// ROW-010 then: at both moments #result exists once, its innerText is '', it has 0 child elements, and its
// ROW-010   ::before and ::after content is none, normal or empty; and then the first press puts exactly one
// ROW-010   LINK_RE link in that same #result (before/after: the empty area is the one the shot fills, so the
// ROW-010   emptiness is not a page that never fills it).
// ROW-010 controls: after a real shot on the same page, the same reader reports non-empty innerText — it sees
// ROW-010   content when there is some.
// ROW-010 technique: exact emptiness on one exact element, read at load and after typing (a typing preview is
// ROW-010   the near miss), with a reader proven to see content.
// ROW-010 cases: ROW-010 target=tests/invariants/row-008-009-010-035-042-req-003-result.spec.js::ROW-010_before_the_first_shot_the_result_area_is_empty_at_load_and_while_typing control=tests/invariants/row-008-009-010-035-042-req-003-result.spec.js::ROW-010_control_after_a_shot_the_emptiness_reader_sees_content
//
// ROW-035 promise: the link is real page text that can be selected and copied — after a shot, selecting the result
// ROW-035   area gives exactly the shown link text, and the link is not drawn by CSS content, a canvas or an image.
// ROW-035   Authority: REQ-003 (shown as plain text); A-012 (plain text below the field).
// ROW-035 wrong product: the link drawn as #result::after { content: attr(data-link) } (seen, not selectable); on
// ROW-035   a canvas or an SVG/img; user-select:none on the result; a copy handler that cancels copying; extra
// ROW-035   text in the result so a selection carries more than the link.
// ROW-035 given: the page opened from disk; a fresh address shot through the button.
// ROW-035 when: the whole result area selected (a Selection over #result's contents); then a real triple-click on
// ROW-035   the link's text (the user's select gesture), then Ctrl+C.
// ROW-035 then: each selection's text, trimmed, equals exactly the link token shown, which matches LINK_RE; a DOM
// ROW-035   text node inside #result carries that link; no canvas/img/svg/picture/object/embed/video and no
// ROW-035   background-image inside #result; no ::before/::after content on #result or any descendant; the copy
// ROW-035   event fired and was not cancelled.
// ROW-035 controls: on a test-made page (setContent), the same select reader returns the link for a text link and
// ROW-035   nothing for a link drawn by ::after content — the instrument discriminates.
// ROW-035 technique: the user's real gesture (triple-click, Ctrl+C) and the browser's own Selection, so the
// ROW-035   promise is observed as a user meets it; a structural sweep for drawn-not-text media.
// ROW-035 cases: ROW-035 target=tests/invariants/row-008-009-010-035-042-req-003-result.spec.js::ROW-035_the_link_is_page_text_that_a_triple_click_selects_exactly_and_copy_is_not_cancelled control=tests/invariants/row-008-009-010-035-042-req-003-result.spec.js::ROW-035_control_the_select_reader_returns_text_links_and_not_css_drawn_ones
//
// ROW-042 promise: a reload starts fresh — after typing https://example.com without shooting, or after a shot, a
// ROW-042   reload shows an empty field and an empty result area. Authority: A-014 (a session is one page load;
// ROW-042   nothing is stored, so a reload starts fresh); REQ-003 (before the first shot the result area is empty).
// ROW-042 wrong product: the last link restored from localStorage/sessionStorage; the field's typed text kept by
// ROW-042   the browser's form-state restoration on reload (a plain input without autocomplete off) or by storage.
// ROW-042 given: the row's own value https://example.com; the page opened from disk; a reload sentinel.
// ROW-042 when: (a) type the address, do not shoot, reload; (b) on a fresh load shoot the address, reload.
// ROW-042 then: before each reload the state exists (the field holds the text; in (b) #result holds a link);
// ROW-042   after it the sentinel is gone (a real reload) and the field's value is '' and #result's innerText is ''
// ROW-042   with no shooter.app token.
// ROW-042 controls: a reload is seen by the sentinel, and the field and result readers report the pre-reload
// ROW-042   state (typed text, a link) — the readers see state when there is some.
// ROW-042 technique: before/after around the real browser reload (page.reload), the path where form restoration
// ROW-042   and storage both act.
// ROW-042 cases: ROW-042 target=tests/invariants/row-008-009-010-035-042-req-003-result.spec.js::ROW-042_a_reload_after_typing_or_after_a_shot_shows_an_empty_field_and_an_empty_result control=tests/invariants/row-008-009-010-035-042-req-003-result.spec.js::ROW-042_control_typed_and_shot_state_is_seen_and_a_reload_is_seen
'use strict';
const { test, expect } = require('@playwright/test');
const h = require('./harness');

/** Shoots a fresh address through the button on the loaded page and returns the result's link tokens. */
async function shootFresh(page, tag) {
  const before = await h.resultLinks(page);
  await h.shoot(page, `https://example.com/${h.fresh(tag)}`, 'button');
  await h.waitForResultChange(page, before);
  return h.resultLinks(page);
}

/** innerText, child count and pseudo content of #result (null when #result is absent). */
async function resultEmptiness(page) {
  return page.evaluate((sel) => {
    const els = document.querySelectorAll(sel);
    if (els.length !== 1) return { count: els.length };
    const el = els[0];
    const gen = (p) => { const c = getComputedStyle(el, p).content; return c === 'none' || c === 'normal' || c === '""' || c === "''" ? '' : c; };
    return { count: 1, innerText: el.innerText, children: el.children.length, before: gen('::before'), after: gen('::after') };
  }, h.SEL.result);
}
const EMPTY = { count: 1, innerText: '', children: 0, before: '', after: '' };

// ---- ROW-008 ----

/** Centre of the text node carrying the link inside #result (or of #result itself when there is none), and what lies there. */
async function linkPoint(page) {
  return page.evaluate((sel) => {
    const result = document.querySelector(sel);
    if (!result) return null;
    let r = result.getBoundingClientRect();
    const walker = document.createTreeWalker(result, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      if (n.textContent.includes('shooter.app')) { const range = document.createRange(); range.selectNodeContents(n); r = range.getBoundingClientRect(); break; }
    }
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const hit = document.elementFromPoint(x, y);
    return { x, y, inside: !!hit && (hit === result || result.contains(hit)) };
  }, h.SEL.result);
}

test('ROW-008 control the navigation watcher sees a test owned anchor click', async ({ page }) => {
  const url = await h.openPage(page, 'file');
  const links = await shootFresh(page, 'c8');
  expect(links.length).toBe(1);
  const navs = h.watchNavigations(page);
  const frag = h.fresh('f');
  await page.evaluate((f) => {
    const a = document.createElement('a');
    a.id = 'vid-decoy';
    a.href = `#${f}`;
    a.textContent = 'decoy';
    a.style.cssText = 'position:fixed;top:0;left:0;z-index:2147483647;background:#fff;padding:4px';
    document.body.appendChild(a);
  }, frag);
  await page.click('#vid-decoy');
  await expect.poll(() => navs.length, { timeout: 3000 }).toBeGreaterThan(0);
  expect(page.url()).not.toBe(url);
  expect(page.url().endsWith(`#${frag}`)).toBe(true);
});

test('ROW-008 clicking the link text navigates nowhere and the result holds no href', async ({ page, context }) => {
  const url = await h.openPage(page, 'file');
  const shown = await shootFresh(page, 'r8');
  expect(shown.length, 'ROW-008: no single link was shown to click').toBe(1);

  const structure = await page.evaluate((sel) => {
    const r = document.querySelector(sel);
    return { inside: r.querySelectorAll('a, area, [href]').length, around: !!r.closest('a, area, [href]') };
  }, h.SEL.result);
  expect(structure, 'ROW-008: #result holds or sits in an anchor or an element with href').toEqual({ inside: 0, around: false });

  const pt = await linkPoint(page);
  expect(pt && pt.inside, 'ROW-008: the link text is not clickable at its own position (covered or outside #result)').toBe(true);
  const sentinel = await h.plantSentinel(page);
  const navs = h.watchNavigations(page);
  const popups = [];
  context.on('page', (p) => popups.push(p.url()));

  await page.mouse.click(pt.x, pt.y);
  await Promise.all([
    page.waitForEvent('framenavigated', { timeout: 1500 }).catch(() => null),
    context.waitForEvent('page', { timeout: 1500 }).catch(() => null),
  ]);
  await h.settle(page);

  expect(page.url(), 'ROW-008: clicking the link changed the page address').toBe(url);
  expect(navs, 'ROW-008: clicking the link navigated').toEqual([]);
  expect(popups, 'ROW-008: clicking the link opened a page').toEqual([]);
  expect(await h.sentinelIntact(page, sentinel)).toBe(true);
  expect(await h.resultLinks(page)).toEqual(shown);
});

// ---- ROW-009 ----

/** Whether the link's full text occurs in the visible text and in the serialised document. */
async function foundOnPage(page, link) {
  return page.evaluate((l) => ({ visible: document.body.innerText.includes(l), anywhere: document.documentElement.outerHTML.includes(l) }), link);
}

test('ROW-009 control after one shot the link is found by both searches', async ({ page }) => {
  await h.openPage(page, 'file');
  const l1 = await shootFresh(page, 'c9');
  expect(l1.length).toBe(1);
  expect(l1[0]).toMatch(h.LINK_RE);
  expect(await foundOnPage(page, l1[0])).toEqual({ visible: true, anywhere: true });
});

test('ROW-009 a second shot replaces the first link which appears nowhere on the page', async ({ page }) => {
  await h.openPage(page, 'file');
  const l1 = await shootFresh(page, 'r9a');
  expect(l1.length, 'ROW-009: the first shot showed no single link').toBe(1);
  expect(l1[0]).toMatch(h.LINK_RE);

  const l2 = await shootFresh(page, 'r9b');
  expect(l2.length, `ROW-009: #result after the second shot holds ${JSON.stringify(l2)}`).toBe(1);
  expect(l2[0]).toMatch(h.LINK_RE);
  expect(l2[0], 'ROW-009: the second shot still shows the first link').not.toBe(l1[0]);
  expect(await h.visibleLinks(page), 'ROW-009: the visible page shows other links than the second').toEqual(l2);
  expect(await foundOnPage(page, l1[0]), 'ROW-009: the first link is still on the page').toEqual({ visible: false, anywhere: false });
});

// ---- ROW-010 ----

test('ROW-010 control after a shot the emptiness reader sees content', async ({ page }) => {
  await h.openPage(page, 'file');
  const links = await shootFresh(page, 'c10');
  expect(links.length).toBe(1);
  const e = await resultEmptiness(page);
  expect(e.count).toBe(1);
  expect(e.innerText).toContain(links[0]);
});

test('ROW-010 before the first shot the result area is empty at load and while typing', async ({ page }) => {
  await h.openPage(page, 'file');
  await h.settle(page);
  expect(await resultEmptiness(page), 'ROW-010: #result at load').toEqual(EMPTY);
  await page.click(h.SEL.field);
  await page.keyboard.type(`https://example.com/${h.fresh('r10')}`);
  await h.settle(page);
  expect(await resultEmptiness(page), 'ROW-010: #result after typing an address, before any press').toEqual(EMPTY);

  // Before and after: the area that was empty is the one the first shot fills — an empty #result proves nothing
  // on a page whose link would appear elsewhere, or never.
  await page.click(h.SEL.button);
  await h.waitForResultChange(page, []);
  const links = await h.resultLinks(page);
  expect(links.length, 'ROW-010: the first shot did not put a link in the result area that was empty').toBe(1);
  expect(links[0]).toMatch(h.LINK_RE);
});

// ---- ROW-035 ----

/** Triple-clicks the centre of the text carrying the link (or #result's centre) and returns the selection's text. */
async function tripleSelect(page) {
  const pt = await linkPoint(page);
  if (!pt) return null;
  await page.mouse.click(pt.x, pt.y, { clickCount: 3 });
  return page.evaluate(() => String(window.getSelection()));
}

test('ROW-035 control the select reader returns text links and not css drawn ones', async ({ page }) => {
  await page.setContent('<!doctype html><meta charset="utf-8"><input id="url-input"><div id="result">https://shooter.app/aB3dE9</div>');
  expect((await tripleSelect(page)).trim()).toBe('https://shooter.app/aB3dE9');
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>#result{min-height:20px}#result::after{content:attr(data-link)}</style>
    <input id="url-input"><div id="result" data-link="https://shooter.app/aB3dE9"></div>`);
  expect((await tripleSelect(page)).trim()).toBe('');
});

test('ROW-035 the link is page text that a triple click selects exactly and copy is not cancelled', async ({ page }) => {
  await h.openPage(page, 'file');
  const shown = await shootFresh(page, 'r35');
  expect(shown.length, 'ROW-035: no single link was shown').toBe(1);
  expect(shown[0]).toMatch(h.LINK_RE);

  const drawn = await page.evaluate(([sel, link]) => {
    const r = document.querySelector(sel);
    const all = [r, ...r.querySelectorAll('*')];
    const gen = (el, p) => { const c = getComputedStyle(el, p).content; return c === 'none' || c === 'normal' || c === '""' || c === "''" ? '' : c; };
    const walker = document.createTreeWalker(r, NodeFilter.SHOW_TEXT);
    let n; let textNode = false;
    while ((n = walker.nextNode())) if (n.textContent.trim() === link) textNode = true;
    return {
      textNode,
      media: r.querySelectorAll('canvas, img, svg, picture, object, embed, video, iframe').length,
      backgrounds: all.filter((el) => getComputedStyle(el).backgroundImage !== 'none').length,
      pseudo: all.map((el) => gen(el, '::before') + gen(el, '::after')).filter(Boolean),
    };
  }, [h.SEL.result, shown[0]]);
  expect(drawn, 'ROW-035: the link is not plain DOM text in #result').toEqual({ textNode: true, media: 0, backgrounds: 0, pseudo: [] });

  const whole = await page.evaluate((sel) => {
    const s = window.getSelection();
    s.removeAllRanges();
    const range = document.createRange();
    range.selectNodeContents(document.querySelector(sel));
    s.addRange(range);
    const text = String(s);
    s.removeAllRanges();
    return text;
  }, h.SEL.result);
  expect(whole.trim(), 'ROW-035: selecting the whole result area does not give exactly the link').toBe(shown[0]);

  const selected = await tripleSelect(page);
  expect((selected || '').trim(), 'ROW-035: a triple-click on the link does not select exactly the link').toBe(shown[0]);

  await page.evaluate(() => {
    window.__vidCopy = null;
    window.addEventListener('copy', (e) => { window.__vidCopy = { cancelled: e.defaultPrevented }; });
  });
  await page.keyboard.press('Control+C');
  await expect.poll(() => page.evaluate(() => window.__vidCopy), { timeout: 2000 }).toEqual({ cancelled: false });
});

// ---- ROW-042 ----

test('ROW-042 control typed and shot state is seen and a reload is seen', async ({ page }) => {
  await h.openPage(page, 'file');
  await page.click(h.SEL.field);
  await page.keyboard.type('https://example.com');
  expect(await h.fieldValue(page)).toBe('https://example.com');
  const s = await h.plantSentinel(page);
  await page.reload({ waitUntil: 'load' });
  expect(await h.sentinelIntact(page, s)).toBe(false);
  await h.openPage(page, 'file');
  await h.shoot(page, 'https://example.com', 'button');
  await h.waitForResultChange(page, []);
  expect((await h.resultLinks(page)).length).toBe(1);
});

test('ROW-042 a reload after typing or after a shot shows an empty field and an empty result', async ({ page }) => {
  const fresh = async (what) => {
    await h.settle(page);
    const state = await page.evaluate((sel) => ({
      field: document.querySelector(sel.field) ? document.querySelector(sel.field).value : null,
      result: document.querySelector(sel.result) ? document.querySelector(sel.result).innerText : null,
    }), h.SEL);
    expect(state, `ROW-042: after a reload ${what}`).toEqual({ field: '', result: '' });
  };

  // (a) typed, not shot.
  await h.openPage(page, 'file');
  await page.click(h.SEL.field);
  await page.keyboard.type('https://example.com');
  expect(await h.fieldValue(page)).toBe('https://example.com');
  let s = await h.plantSentinel(page);
  await page.reload({ waitUntil: 'load' });
  expect(await h.sentinelIntact(page, s)).toBe(false);
  await fresh('after typing without shooting');

  // (b) shot.
  await h.openPage(page, 'file');
  await h.shoot(page, 'https://example.com', 'button');
  await h.waitForResultChange(page, []);
  expect((await h.resultLinks(page)).length, 'ROW-042: the shot before the reload showed no link').toBe(1);
  s = await h.plantSentinel(page);
  await page.reload({ waitUntil: 'load' });
  expect(await h.sentinelIntact(page, s)).toBe(false);
  await fresh('after a shot');
  expect(await h.resultLinks(page)).toEqual([]);
});
