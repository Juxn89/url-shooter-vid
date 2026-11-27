// Purpose: ROW-003 (REQ-001, REQ-003, REQ-004, REQ-005) — the demonstrator's journey: shoot an address with the button, then shoot another with Enter that replaces it.
// Provenance: hand-authored
//
// ROW-003 promise: transition 1 (button shot: a link https://shooter.app/ + 6 letters and digits appears below the
// ROW-003   field, the field is empty and focused) and transition 2 (Enter shot: exactly one link is visible, its code
// ROW-003   differs from the first, the field is empty and focused). Authority: REQ-001 fail-if 1-5 (A-003, A-005);
// ROW-003   REQ-003 fail-if 2-3 (A-004: replaced, only the latest shown); REQ-004 fail-if 1-2 (A-013); REQ-005 fail-if
// ROW-003   1-2 (A-011); the element ids are D-009.
// ROW-003 wrong product: the second shot appends a second link instead of replacing the first; or Enter submits a
// ROW-003   form and reloads the page (field empty and autofocused after the reload, so "empty and focused" alone
// ROW-003   would pass); or focus stays on the button after the click, so the demonstrator's next typing goes nowhere;
// ROW-003   or the code is fixed, so the second link equals the first.
// ROW-003 given: index.html opened from disk as the owner runs it; the row's own addresses https://example.com/a and
// ROW-003   https://example.org; a fresh sentinel planted in the live document (a reload wipes it); a main-frame
// ROW-003   navigation watcher (a reload, a hash or history change records an entry); the count of shooter.app tokens
// ROW-003   in the page's visible text before the first shot, as the baseline.
// ROW-003 when: step 1 clicks the field, types https://example.com/a on the keyboard and clicks #shoot-button; step 2
// ROW-003   types https://example.org on the keyboard WITHOUT clicking the field (focus must already be there) and
// ROW-003   presses Enter.
// ROW-003 then: step 1 — #result went from no link to exactly one whole token matching LINK_RE, its text box below
// ROW-003   the field's bottom edge, visible link tokens = baseline + 1, field value '' and focused, sentinel intact, no
// ROW-003   navigation, same URL. Step 2 — the field held the typed address before Enter (focus proof), #result holds
// ROW-003   exactly one token matching LINK_RE whose code differs from step 1's, the first link appears nowhere in the
// ROW-003   visible text, visible link tokens still = baseline + 1, field '' and focused, sentinel intact, no navigation.
// ROW-003 controls: the control case shows the starting state is reachable and the field accepts the demonstrator's
// ROW-003   typing (value equals the typed address, result area holds no link before any press), and that the
// ROW-003   navigation watcher and sentinel see a reload when one happens — so "no navigation" in the target is evidence.
// ROW-003 technique: before/after per transition through the real controls in the browser (the boundary for
// ROW-003   operation); a reload sentinel plus a navigation watcher so a page that resets itself cannot fake "empty and
// ROW-003   focused"; whole-page token counts so a second link outside #result is caught.
// ROW-003 deployed-selector: none — the harness contract declares no deployed shape (the product ships no process
// ROW-003   beside the page).
// ROW-003 cases: ROW-003 target=tests/invariants/row-003-journey-demonstrator.spec.js::ROW-003_journey_shoot_with_the_button_then_shoot_another_with_Enter_that_replaces_it control=tests/invariants/row-003-journey-demonstrator.spec.js::ROW-003_control_page_opened_from_disk_accepts_typing_and_a_reload_is_seen
'use strict';
const { test, expect } = require('@playwright/test');
const h = require('./harness');

test('ROW-003 control page opened from disk accepts typing and a reload is seen', async ({ page }) => {
  await h.openPage(page, 'file');
  await page.click(h.SEL.field);
  await page.keyboard.type('https://example.com/a');
  expect(await h.fieldValue(page)).toBe('https://example.com/a');
  expect(await h.resultLinks(page)).toEqual([]);

  // The instruments that guard "no reload" can see one.
  const sentinel = await h.plantSentinel(page);
  const navs = h.watchNavigations(page);
  expect(await h.sentinelIntact(page, sentinel)).toBe(true);
  await page.reload({ waitUntil: 'load' });
  expect(navs.length).toBeGreaterThan(0);
  expect(await h.sentinelIntact(page, sentinel)).toBe(false);
});

test('ROW-003 journey shoot with the button then shoot another with Enter that replaces it', async ({ page }) => {
  const url = await h.openPage(page, 'file');
  const sentinel = await h.plantSentinel(page);
  const navs = h.watchNavigations(page);
  const baseline = (await h.visibleLinks(page)).length;
  let first;

  await test.step('ROW-003 transition 1 demonstrator at page opened types an address and presses the button', async () => {
    const before = await h.resultLinks(page);
    expect(before).toEqual([]);
    await page.click(h.SEL.field);
    await page.keyboard.type('https://example.com/a');
    expect(await h.fieldValue(page)).toBe('https://example.com/a');

    await page.click(h.SEL.button);
    await h.waitForResultChange(page, before);
    const after = await h.resultLinks(page);

    expect(after.length).toBe(1);
    expect(after[0]).toMatch(h.LINK_RE);
    first = after[0];
    const box = await h.linkBox(page);
    expect(box).not.toBeNull();
    expect(box.linkHeight).toBeGreaterThan(0);
    expect(box.linkTop).toBeGreaterThanOrEqual(box.fieldBottom - 0.5);
    expect((await h.visibleLinks(page)).length).toBe(baseline + 1);
    expect(await h.fieldValue(page)).toBe('');
    expect(await h.fieldFocused(page)).toBe(true);
    expect(await h.sentinelIntact(page, sentinel)).toBe(true);
    expect(navs).toEqual([]);
    expect(page.url()).toBe(url);
  });

  await test.step('ROW-003 transition 2 demonstrator at link shown types another address and presses Enter', async () => {
    // No click: the keystrokes reach the field only if focus was left there.
    await page.keyboard.type('https://example.org');
    expect(await h.fieldValue(page)).toBe('https://example.org');

    await page.keyboard.press('Enter');
    await h.waitForResultChange(page, [first]);
    const after = await h.resultLinks(page);

    expect(after.length).toBe(1);
    expect(after[0]).toMatch(h.LINK_RE);
    expect(after[0]).not.toBe(first);
    const visible = await h.visibleLinks(page);
    expect(visible.length).toBe(baseline + 1);
    expect(visible).not.toContain(first);
    expect(await h.fieldValue(page)).toBe('');
    expect(await h.fieldFocused(page)).toBe(true);
    expect(await h.sentinelIntact(page, sentinel)).toBe(true);
    expect(navs).toEqual([]);
    expect(page.url()).toBe(url);
  });
});
