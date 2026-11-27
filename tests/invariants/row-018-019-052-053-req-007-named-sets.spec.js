// Purpose: ROW-018, ROW-019, ROW-052, ROW-053 (REQ-007) — the web-address check's named accepted and rejected sets, shot through the page.
// Provenance: hand-authored
//
// ROW-018 promise: each address of the accepted set — https://example.com, http://example.com/a/b, with
// ROW-018   surrounding spaces, https://example.com/search?q=cats#top, HTTPS://EXAMPLE.COM,
// ROW-018   https://sub.example.co.uk/path, https://example.com/a:b, https://example.com/?t=10:30 — shot through the page
// ROW-018   shows a link. Authority: REQ-007 fail-if 1, 2, 3, 8, 9; A-009 (http(s) + dotted host + optional path,
// ROW-018   surrounding spaces trimmed), A-018 (query and anchor accepted), A-020 (scheme in any letter case).
// ROW-018 wrong product: a check written ^https?:\/\/[a-z0-9.-]+(\/[\w\/]*)?$ — case-sensitive (HTTPS:// refused),
// ROW-018   no ? or # or : after the host (the query, anchor and colon-in-path addresses refused), no trimming.
// ROW-018 given: the row's own addresses verbatim, "with surrounding spaces" read as both '  https://example.com  '
// ROW-018   and '  http://example.com/a/b  ', plus a fresh variant https://<fresh>.example.com/<fresh> no product can
// ROW-018   hard-code; one page load, each shot replacing the last link.
// ROW-018 when: each address typed and shot by the button, then again by Enter.
// ROW-018 then: after each shot #result holds exactly one link token matching https://shooter.app/<6 letters or
// ROW-018   digits>, different from the link before the shot (absent before, present after), visible on the page.
// ROW-018 controls: the control case shows the page opens from disk, the field reads back typed text and no link
// ROW-018   shows before any shot — the starting state is reached and "a link appears" is a change.
// ROW-018 technique: named examples, each a before/after through both real press paths.
// ROW-018 cases: ROW-018 target=tests/invariants/row-018-019-052-053-req-007-named-sets.spec.js::ROW-018_every_address_in_the_accepted_set_shows_a_link_by_the_button_and_by_Enter control=tests/invariants/row-018-019-052-053-req-007-named-sets.spec.js::ROW-018_control_the_page_opens_and_takes_typed_text_with_no_link_shown
//
// ROW-019 promise: each input of the rejected set — example.com, hello, https://localhost, https://localhost/a.b,
// ROW-019   https://localhost?x=a.b, https://localhost#a.b, ftp://example.com, https://example.com:8080,
// ROW-019   https://exa mple.com, https://, empty — shot through the page shows no link and changes nothing.
// ROW-019   Authority: REQ-007 fail-if 4, 5, 6, 7, 10, 11; REQ-006 (a rejected input changes nothing); A-009, A-019,
// ROW-019   A-020, A-008.
// ROW-019 wrong product: a check that looks for any dot anywhere after the scheme (https://localhost/a.b,
// ROW-019   ?x=a.b and #a.b accepted), or one that accepts any scheme:// (ftp), or allows :port, or tests
// ROW-019   /https?:\/\/\S+\.\S+/ without anchors (https://exa mple.com accepted on its tail).
// ROW-019 given: the row's own inputs verbatim, plus fresh decoys <fresh>.example.com (no scheme) and
// ROW-019   https://localhost/<fresh>.x (dot only in the path) no product can special-case.
// ROW-019 when: each typed and pressed by the button and by Enter, first with no link on the page, then with a link
// ROW-019   L made by a fresh valid shot.
// ROW-019 then: the whole page state after the press equals the one before it (markup, text, element count, title,
// ROW-019   URL, the field's value and validity), result links [] before any link and exactly [L] after; no dialog, no
// ROW-019   reload, no navigation.
// ROW-019 controls: ROW-018's target — the near neighbours (https://example.com, the query, anchor and colon forms)
// ROW-019   show a link through the same presses, so "no link" here is the check deciding, not a dead page.
// ROW-019 technique: named examples plus fresh decoys; before/after on the whole page state, both starting states.
// ROW-019 cases: ROW-019 target=tests/invariants/row-018-019-052-053-req-007-named-sets.spec.js::ROW-019_every_input_in_the_rejected_set_shows_no_link_and_changes_nothing control=tests/invariants/row-018-019-052-053-req-007-named-sets.spec.js::ROW-018_every_address_in_the_accepted_set_shows_a_link_by_the_button_and_by_Enter
//
// ROW-052 promise: https://example.com with a tab before it, and with a line break after it, pasted into the field
// ROW-052   and shot, shows a link. Authority: REQ-007 fail-if 12; A-021 (surrounding tabs and line breaks trimmed).
// ROW-052 wrong product: a check that trims only spaces (value.replace(/^ +| +$/g, '')), so the tab-led paste is
// ROW-052   refused; or a field that keeps the pasted line break and a check that does not trim it.
// ROW-052 given: '\thttps://example.com' and 'https://example.com\n' put on the browser's clipboard and pasted with
// ROW-052   the keyboard shortcut (the browser inserts what it takes into the field); the same two set by fill as a
// ROW-052   second path (fill keeps a line break when the field is multi-line).
// ROW-052 when: after each paste or fill, the button, then (for the paste) Enter on a fresh paste.
// ROW-052 then: before the press no new link; after it exactly one new link token of the promised shape in #result.
// ROW-052 controls: the control case pastes the same clipboard contents into a plain <input> the test owns, on a
// ROW-052   file:// document, and reads them back — the paste instrument works and keeps the tab, so the target
// ROW-052   reaches the product's trimming.
// ROW-052 technique: the row's own values through the real paste path, plus a fill path for a multi-line field.
// ROW-052 cases: ROW-052 target=tests/invariants/row-018-019-052-053-req-007-named-sets.spec.js::ROW-052_an_address_pasted_with_a_tab_before_or_a_line_break_after_shows_a_link control=tests/invariants/row-018-019-052-053-req-007-named-sets.spec.js::ROW-052_control_the_paste_instrument_puts_the_clipboard_text_into_a_plain_field
//
// ROW-053 promise: https://münchen.de, https://user:pass@example.com, https://google.com@evil.com and
// ROW-053   https://example. each show no link and change nothing. Authority: REQ-007 fail-if 13, 14, 15; A-022
// ROW-053   (non-English host refused), A-023 (user name before the host refused), A-025 (trailing dot refused); A-008.
// ROW-053 wrong product: a check using \w or \p{L} for host letters (münchen accepted), or [^/\s]+ for the host
// ROW-053   (user:pass@ and google.com@ accepted, the second sending the reader to evil.com), or (\.[a-z0-9-]*)+ that
// ROW-053   lets an empty last label through (https://example. accepted).
// ROW-053 given: the row's own four, plus fresh decoys https://<fresh>@example.com and https://<fresh>.example.
// ROW-053 when / then: as ROW-019 — each by the button and by Enter, with no link and with a link shown; whole
// ROW-053   state unchanged, no link / the same link, no dialog, no reload.
// ROW-053 controls: the control case shoots the near misses https://muenchen.de, https://example.com,
// ROW-053   https://evil.com and https://example.co through the same presses and sees a link each — the ASCII host,
// ROW-053   the host without user name, the host with its last label are accepted, so the refusal is the rule's.
// ROW-053 technique: named examples with near-miss decoys either side of each rule.
// ROW-053 cases: ROW-053 target=tests/invariants/row-018-019-052-053-req-007-named-sets.spec.js::ROW-053_a_non_English_host_a_user_name_before_the_host_and_a_trailing_dot_show_no_link control=tests/invariants/row-018-019-052-053-req-007-named-sets.spec.js::ROW-053_control_the_near_misses_show_a_link
'use strict';
const { test, expect } = require('@playwright/test');
const h = require('./harness');

const VIAS = ['button', 'enter'];

/** Shoots each address by each path; each must replace the shown link with exactly one new link of the promised shape. */
async function expectEachShowsALink(page, row, addresses) {
  for (const s of await h.shootEach(page, addresses, VIAS)) {
    const label = `${row} ${JSON.stringify(s.address)} by ${s.via}`;
    expect(s.after.length, `${label}: one link in the result area`).toBe(1);
    expect(s.after[0], `${label}: the link's shape`).toMatch(h.LINK_RE);
    expect(s.after, `${label}: a new link replaced the one before`).not.toEqual(s.before);
    expect(s.visible, `${label}: the link is visible`).toContain(s.after[0]);
  }
}

/** Each input, by each path, with no link and then with a link shown, must change nothing at all. */
async function expectEachChangesNothing(page, row, inputs) {
  const dialogs = h.watchDialogs(page);
  await h.openPage(page, 'file');
  const sentinel = await h.plantSentinel(page);
  const navs = h.watchNavigations(page);
  let links = [];
  for (const phase of ['no link yet', 'link shown']) {
    if (phase === 'link shown') {
      const [s] = await h.shootEach(page, [`https://example.com/${h.fresh('p')}`], ['button']);
      links = s.after;
      expect(links.length, `${row} setup: a valid shot shows one link`).toBe(1);
    }
    for (const p of await h.pressEach(page, inputs, VIAS)) {
      const label = `${row} ${phase}, ${JSON.stringify(p.text)} by ${p.via}`;
      expect(p.after, `${label}: the page state after the press equals the state before it`).toEqual(p.before);
      expect(p.links, `${label}: the result area's links`).toEqual(links);
      expect(p.after.validationMessage, `${label}: no browser validation message`).toBe('');
      expect(dialogs, `${label}: no dialog`).toEqual([]);
      expect(navs, `${label}: no navigation`).toEqual([]);
      expect(await h.sentinelIntact(page, sentinel), `${label}: no reload`).toBe(true);
    }
  }
}

test('ROW-018 control the page opens and takes typed text with no link shown', async ({ page }) => {
  await h.openPage(page, 'file');
  const text = `https://example.com/${h.fresh('c')}`;
  await h.typeInto(page, text);
  expect(await h.fieldValue(page)).toBe(text);
  expect(await h.resultLinks(page)).toEqual([]);
  expect(await h.visibleLinks(page)).toEqual([]);
});

test('ROW-018 every address in the accepted set shows a link by the button and by Enter', async ({ page }) => {
  await h.openPage(page, 'file');
  const f = h.fresh('a');
  await expectEachShowsALink(page, 'ROW-018', [
    'https://example.com',
    'http://example.com/a/b',
    '  https://example.com  ',
    '  http://example.com/a/b  ',
    'https://example.com/search?q=cats#top',
    'HTTPS://EXAMPLE.COM',
    'https://sub.example.co.uk/path',
    'https://example.com/a:b',
    'https://example.com/?t=10:30',
    `https://${f}.example.com/${f}`,
  ]);
});

test('ROW-019 every input in the rejected set shows no link and changes nothing', async ({ page }) => {
  const f = h.fresh('r');
  await expectEachChangesNothing(page, 'ROW-019', [
    'example.com',
    'hello',
    'https://localhost',
    'https://localhost/a.b',
    'https://localhost?x=a.b',
    'https://localhost#a.b',
    'ftp://example.com',
    'https://example.com:8080',
    'https://exa mple.com',
    'https://',
    '',
    `${f}.example.com`,
    `https://localhost/${f}.x`,
  ]);
});

test('ROW-052 control the paste instrument puts the clipboard text into a plain field', async ({ page }) => {
  await h.openPage(page, 'file');
  // A field the test owns, on a file:// document (a secure context, as the product's page is).
  await page.setContent('<input id="vid-probe" type="text">');
  expect(new URL(page.url()).protocol).toBe('file:');
  await h.pasteInto(page, '#vid-probe', { text: '\thttps://example.com' });
  expect(await page.inputValue('#vid-probe')).toBe('\thttps://example.com');
  await h.pasteInto(page, '#vid-probe', { text: 'https://example.com\n' });
  expect((await page.inputValue('#vid-probe')).startsWith('https://example.com')).toBe(true);
});

test('ROW-052 an address pasted with a tab before or a line break after shows a link', async ({ page }) => {
  await h.openPage(page, 'file');
  for (const text of ['\thttps://example.com', 'https://example.com\n']) {
    for (const via of VIAS) {
      const label = `ROW-052 pasted ${JSON.stringify(text)} then ${via}`;
      const before = await h.resultLinks(page);
      await h.pasteInto(page, h.SEL.field, { text });
      expect(await h.resultLinks(page), `${label}: no new link before the press`).toEqual(before);
      if (via === 'enter') await page.press(h.SEL.field, 'Enter');
      else await page.click(h.SEL.button);
      await h.waitForResultChange(page, before);
      const after = await h.resultLinks(page);
      expect(after.length, `${label}: one link`).toBe(1);
      expect(after[0], `${label}: the link's shape`).toMatch(h.LINK_RE);
      expect(after, `${label}: a new link`).not.toEqual(before);
    }
  }
  for (const text of ['\thttps://example.com', 'https://example.com\n', '\thttps://example.com\r\n']) {
    const label = `ROW-052 filled ${JSON.stringify(text)}`;
    const before = await h.resultLinks(page);
    await h.shoot(page, text, 'button');
    await h.waitForResultChange(page, before);
    const after = await h.resultLinks(page);
    expect(after.length, `${label}: one link`).toBe(1);
    expect(after[0], `${label}: the link's shape`).toMatch(h.LINK_RE);
    expect(after, `${label}: a new link`).not.toEqual(before);
  }
});

test('ROW-053 control the near misses show a link', async ({ page }) => {
  await h.openPage(page, 'file');
  await expectEachShowsALink(page, 'ROW-053 control', [
    'https://muenchen.de',
    'https://example.com',
    'https://evil.com',
    'https://example.co',
  ]);
});

test('ROW-053 a non English host a user name before the host and a trailing dot show no link', async ({ page }) => {
  const f = h.fresh('u');
  await expectEachChangesNothing(page, 'ROW-053', [
    'https://münchen.de',
    'https://user:pass@example.com',
    'https://google.com@evil.com',
    'https://example.',
    `https://${f}@example.com`,
    `https://${f}.example.`,
  ]);
});
