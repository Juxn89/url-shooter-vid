// Purpose: ROW-025, ROW-026, ROW-027, ROW-028, ROW-049 (REQ-007) — malformed addresses (partial match, inner whitespace, bad hosts, ports, bad separators) show no link, beside near misses that do.
// Provenance: hand-authored
//
// Shared by every row below. given: index.html from disk; a dialog recorder, a reload sentinel and a navigation
// watcher. when: each rejected input typed and pressed by the button and by Enter, first with no link on the page,
// then with a link L made by a fresh valid shot. then: the whole page state after each press (markup, visible and
// full text, element count, title, URL, the field's value, validationMessage, validity) equals the one just before
// it; the result area's links are [] before any link and exactly [L] after; no validation message, no dialog, no
// reload. Each row's control shoots the row's near misses — the same shape with the fault removed — through the
// same presses and sees a new link each time (absent before, present after): the check is reached and decides,
// so "no link" in the target is the rule refusing, not a dead page. Technique for all: named examples with a near
// miss either side of each rule, fresh decoys no product can hard-code, before/after on the whole page state.
//
// ROW-025 promise: the check covers the whole input — hello https://example.com, xhttps://example.com,
// ROW-025   javascript:https://example.com, https://example.com https://evil.com and two addresses separated by a
// ROW-025   newline each show no link and change nothing. Authority: REQ-007 ("accepts an address starting with
// ROW-025   http:// or https:// … and rejects anything else", fail-if 5, 11); A-006 (a regular expression on the input),
// ROW-025   A-020 (a space inside is rejected); REQ-006 and A-008 (a rejected input changes nothing).
// ROW-025 wrong product: an unanchored test /https?:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+/i.test(text) — it finds an
// ROW-025   address inside any of the five and accepts them; or one anchored only at the start (^https?://…) that
// ROW-025   accepts "https://example.com https://evil.com".
// ROW-025 given: the row's five (the newline pair as 'https://example.com\nhttps://evil.com'), plus a fresh decoy
// ROW-025   '<fresh> https://example.com'. Near misses: https://example.com, https://hello.example.com,
// ROW-025   https://example.com/javascript.
// ROW-025 cases: ROW-025 target=tests/invariants/row-025-026-027-028-049-req-007-malformed.spec.js::ROW-025_an_address_inside_other_text_shows_no_link control=tests/invariants/row-025-026-027-028-049-req-007-malformed.spec.js::ROW-025_control_the_whole_address_alone_shows_a_link
//
// ROW-026 promise: an address with any whitespace inside it is rejected, not only the plain space —
// ROW-026   https://exa<TAB>mple.com, and one with a non-breaking space, one with a zero-width space, one with a
// ROW-026   right-to-left override each show no link. Authority: REQ-007 ("a space inside it" rejected, fail-if 11);
// ROW-026   A-020 (an address with a space inside it is rejected).
// ROW-026 wrong product: a check that rejects only ' ' (e.g. [^ ]* for the path, or text.includes(' ')), so a tab,
// ROW-026   U+00A0, U+200B or U+202E passes; or a host class \S+ / \w with a Unicode flag.
// ROW-026 given: the row's four, each in the host (https://exa<c>mple.com) as the row's first example places it, and
// ROW-026   each again inside the path (https://example.com/a<c>b) — "inside it" names the whole address; plus a fresh
// ROW-026   decoy https://exa<TAB>mple.com/<fresh>. Near misses: https://example.com, https://exa-mple.com,
// ROW-026   https://example.com/a-b (the same places, a hyphen for the whitespace).
// ROW-026 cases: ROW-026 target=tests/invariants/row-025-026-027-028-049-req-007-malformed.spec.js::ROW-026_an_address_with_a_tab_or_invisible_space_inside_shows_no_link control=tests/invariants/row-025-026-027-028-049-req-007-malformed.spec.js::ROW-026_control_the_same_addresses_with_a_hyphen_show_a_link
//
// ROW-027 promise: a host that is not a real dotted name is rejected — https://., https://.., https://.com,
// ROW-027   https://a..b, https:///example.com and https://-.- each show no link. Authority: REQ-007 (a host name of
// ROW-027   letters, digits and hyphens with at least one dot and no trailing dot; fail-if 6); A-009, A-025.
// ROW-027 wrong product: a host class [a-z0-9.-]+ containing a dot — it accepts every one of the six; or
// ROW-027   ([a-z0-9-]*\.)+[a-z0-9-]+ with * that lets empty labels through.
// ROW-027 given: the row's six, plus a fresh decoy https://<fresh>..com. Near misses: https://a.co,
// ROW-027   https://example.com, https://a.b.co.
// ROW-027 cases: ROW-027 target=tests/invariants/row-025-026-027-028-049-req-007-malformed.spec.js::ROW-027_a_host_that_is_not_a_real_dotted_name_shows_no_link control=tests/invariants/row-025-026-027-028-049-req-007-malformed.spec.js::ROW-027_control_real_dotted_hosts_show_a_link
//
// ROW-028 promise: a port is rejected wherever it sits — https://example.com:8080/path and https://example.com:/
// ROW-028   each show no link. Authority: REQ-007 fail-if 10; A-019 (an address with a port is rejected).
// ROW-028 wrong product: a check that refuses a port only at the very end (:\d+$), so :8080/path passes; or one
// ROW-028   that refuses :\d+ but not an empty port ':' (https://example.com:/ accepted).
// ROW-028 given: the row's two, plus a fresh random port https://example.com:<n>/<fresh>. Near misses:
// ROW-028   https://example.com/path, https://example.com/, and https://example.com/x:8080 (digits after a colon in
// ROW-028   the PATH are no port — REQ-007 accepts a path, as ROW-018's https://example.com/a:b shows).
// ROW-028 cases: ROW-028 target=tests/invariants/row-025-026-027-028-049-req-007-malformed.spec.js::ROW-028_a_port_anywhere_after_the_host_shows_no_link control=tests/invariants/row-025-026-027-028-049-req-007-malformed.spec.js::ROW-028_control_the_same_addresses_without_a_port_show_a_link
//
// ROW-049 promise: a malformed scheme separator is rejected — https:\\example.com, https:/example.com,
// ROW-049   https:example.com and https//example.com each show no link and change nothing. Authority: REQ-007
// ROW-049   ("starting with http:// or https://", fail-if 4, 7); A-009; REQ-006, A-008.
// ROW-049 wrong product: a check built on new URL(text) and its protocol (the URL parser repairs https:\\,
// ROW-049   https:/ and https: into https://example.com/); or ^https?:\/*\/ that tolerates one slash; or one that only
// ROW-049   looks for "https" at the start.
// ROW-049 given: the row's four, plus a fresh decoy https:/<fresh>.example.com. Near misses: https://example.com,
// ROW-049   http://example.com, HTTPS://example.com.
// ROW-049 cases: ROW-049 target=tests/invariants/row-025-026-027-028-049-req-007-malformed.spec.js::ROW-049_a_malformed_scheme_separator_shows_no_link control=tests/invariants/row-025-026-027-028-049-req-007-malformed.spec.js::ROW-049_control_a_well_formed_separator_shows_a_link
'use strict';
const { test, expect } = require('@playwright/test');
const h = require('./harness');

const VIAS = ['button', 'enter'];

/** Opens the page, shoots each address by each path, and asserts each replaces the shown link with one new link. */
async function expectEachShowsALink(page, row, addresses) {
  await h.openPage(page, 'file');
  expect(await h.resultLinks(page), `${row}: no link before any shot`).toEqual([]);
  for (const s of await h.shootEach(page, addresses, VIAS)) {
    const label = `${row} ${JSON.stringify(s.address)} by ${s.via}`;
    expect(s.after.length, `${label}: one link in the result area`).toBe(1);
    expect(s.after[0], `${label}: the link's shape`).toMatch(h.LINK_RE);
    expect(s.after, `${label}: a new link replaced the one before`).not.toEqual(s.before);
    expect(s.visible, `${label}: the link is visible`).toContain(s.after[0]);
  }
}

/** Opens the page; each input, by each path, with no link and then with a link shown, must change nothing at all. */
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

test('ROW-025 control the whole address alone shows a link', async ({ page }) => {
  await expectEachShowsALink(page, 'ROW-025 control', [
    'https://example.com', 'https://hello.example.com', 'https://example.com/javascript',
  ]);
});

test('ROW-025 an address inside other text shows no link', async ({ page }) => {
  await expectEachChangesNothing(page, 'ROW-025', [
    'hello https://example.com',
    'xhttps://example.com',
    'javascript:https://example.com',
    'https://example.com https://evil.com',
    'https://example.com\nhttps://evil.com',
    `${h.fresh('w')} https://example.com`,
  ]);
});

const INNER = { tab: '\t', 'no-break space': ' ', 'zero-width space': '​', 'right-to-left override': '‮' };

test('ROW-026 control the same addresses with a hyphen show a link', async ({ page }) => {
  await expectEachShowsALink(page, 'ROW-026 control', [
    'https://example.com', 'https://exa-mple.com', 'https://example.com/a-b',
  ]);
});

test('ROW-026 an address with a tab or invisible space inside shows no link', async ({ page }) => {
  const inputs = [];
  for (const c of Object.values(INNER)) inputs.push(`https://exa${c}mple.com`, `https://example.com/a${c}b`);
  inputs.push(`https://exa\tmple.com/${h.fresh('t')}`);
  await expectEachChangesNothing(page, 'ROW-026', inputs);
});

test('ROW-027 control real dotted hosts show a link', async ({ page }) => {
  await expectEachShowsALink(page, 'ROW-027 control', ['https://a.co', 'https://example.com', 'https://a.b.co']);
});

test('ROW-027 a host that is not a real dotted name shows no link', async ({ page }) => {
  await expectEachChangesNothing(page, 'ROW-027', [
    'https://.', 'https://..', 'https://.com', 'https://a..b', 'https:///example.com', 'https://-.-',
    `https://${h.fresh('d')}..com`,
  ]);
});

test('ROW-028 control the same addresses without a port show a link', async ({ page }) => {
  await expectEachShowsALink(page, 'ROW-028 control', [
    'https://example.com/path', 'https://example.com/', 'https://example.com/x:8080',
  ]);
});

test('ROW-028 a port anywhere after the host shows no link', async ({ page }) => {
  const port = 1 + Math.floor(Math.random() * 65534);
  await expectEachChangesNothing(page, 'ROW-028', [
    'https://example.com:8080/path', 'https://example.com:/', `https://example.com:${port}/${h.fresh('o')}`,
  ]);
});

test('ROW-049 control a well formed separator shows a link', async ({ page }) => {
  await expectEachShowsALink(page, 'ROW-049 control', [
    'https://example.com', 'http://example.com', 'HTTPS://example.com',
  ]);
});

test('ROW-049 a malformed scheme separator shows no link', async ({ page }) => {
  await expectEachChangesNothing(page, 'ROW-049', [
    'https:\\\\example.com', 'https:/example.com', 'https:example.com', 'https//example.com',
    `https:/${h.fresh('s')}.example.com`,
  ]);
});
