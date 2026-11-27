// Purpose: ROW-047, ROW-048, ROW-050 (REQ-007) — host characters a host name cannot hold, the hyphenated multi-label host beside them, and 200 generated addresses with their rejected mutants.
// Provenance: hand-authored
//
// ROW-047 promise: a host holding characters a host name cannot hold is rejected — https://exa%20mple.com,
// ROW-047   https://exa<mple.com, https://a"b.com, https://exa_mple.com/ and https://a*b.com each show no link and change
// ROW-047   nothing. Authority: REQ-007 (a host name of plain letters, digits and hyphens); A-009, A-022; REQ-006 and
// ROW-047   A-008 (a rejected input changes nothing).
// ROW-047 wrong product: a host class [^\/\s:?#]+ or \w[\w.-]* — it lets %, <, ", _ (\w holds _) or * into the host.
// ROW-047 given: index.html from disk; the row's five, plus a fresh decoy https://<fresh>_x.com; a dialog recorder,
// ROW-047   a reload sentinel and a navigation watcher.
// ROW-047 when: each typed and pressed by the button and by Enter, with no link, then with a link L shown.
// ROW-047 then: the whole page state after each press (markup, text, element count, title, URL, the field's value,
// ROW-047   validationMessage, validity) equals the state before it; links [] before any link, exactly [L] after; no
// ROW-047   validation message, no dialog, no reload.
// ROW-047 controls: ROW-048's target — a host of letters, digits, hyphens and several labels is accepted through the
// ROW-047   same presses, so the refusal is about the five characters.
// ROW-047 technique: named examples with a near miss (the hyphen, which a host may hold) and a fresh decoy.
// ROW-047 cases: ROW-047 target=tests/invariants/row-047-048-050-req-007-hosts-and-generated.spec.js::ROW-047_a_host_with_characters_a_host_name_cannot_hold_shows_no_link control=tests/invariants/row-047-048-050-req-007-hosts-and-generated.spec.js::ROW-048_a_hyphenated_host_with_several_labels_shows_a_link
//
// ROW-048 promise: control of ROW-047 — https://my-site.example.com, a host with a hyphen and several labels, shows
// ROW-048   a link. Authority: REQ-007 (letters, digits and hyphens, at least one dot); A-009.
// ROW-048 wrong product: a host pattern [a-z0-9]+\.[a-z]+ — no hyphen, exactly two labels — that refuses it.
// ROW-048 given: the row's own address, plus a fresh decoy https://my-<fresh>.example.com.
// ROW-048 when: each shot by the button and by Enter.
// ROW-048 then: each shot replaces the shown link with exactly one new link of the shape https://shooter.app/<6
// ROW-048   letters or digits>, visible on the page (absent before the first shot).
// ROW-048 controls: the control case shows the page opens from disk, reads typed text back, and shows no link before
// ROW-048   any shot — the starting state.
// ROW-048 technique: the row's named example plus a fresh decoy; before/after through both presses.
// ROW-048 cases: ROW-048 target=tests/invariants/row-047-048-050-req-007-hosts-and-generated.spec.js::ROW-048_a_hyphenated_host_with_several_labels_shows_a_link control=tests/invariants/row-047-048-050-req-007-hosts-and-generated.spec.js::ROW-048_control_the_page_opens_and_takes_typed_text_with_no_link_shown
//
// ROW-050 promise: 200 addresses built at random — http or https in random letter case, a host of 2 to 4 labels of
// ROW-050   a-z, 0-9 and inner hyphens (each label starting and ending with a letter or digit), an optional random path,
// ROW-050   query and anchor drawn only from a-z, 0-9, / - _ . = & — each show a link; each one mutated by a port
// ROW-050   :<digits> right after the host, a space or a tab strictly inside after the scheme and before the last
// ROW-050   character, the scheme dropped, or every dot in the host dropped, shows no link. Authority: REQ-007 (whole
// ROW-050   text; fail-if 1, 4, 6, 8, 9, 10, 11); A-009, A-018, A-019, A-020.
// ROW-050 wrong product: a check tuned to the named examples — e.g. a host [a-z]+(\.[a-z]+)+ that refuses digits or
// ROW-050   hyphens in labels, or a scheme test /^https?:/ without the i flag (refuses hTTp), or a path class missing
// ROW-050   = or &, or a refusal of whitespace only in the host — which the named rows pass and a generated case fails.
// ROW-050 given: a seeded generator (the seed fresh per run, printed in every failure so a failure replays) built
// ROW-050   only from the row's grammar; one page load; the link shown before each mutant is the one its valid
// ROW-050   original just made. Plus one named example from the space: HtTpS://my-site.ex4mple.co/a_b.c=d&e?x=1&y=2#top.
// ROW-050 when: each valid address shot (button or Enter, drawn at random), then each of its four mutants pressed.
// ROW-050 then: each valid shot replaces the shown link with exactly one new link of the promised shape; each mutant
// ROW-050   press leaves the whole page state equal to the state before it, the link the same.
// ROW-050 controls: the control case checks the generator against a grammar written from the row's text (every
// ROW-050   address matches it, every mutant fails it and differs from its original) and shoots https://example.com
// ROW-050   to show the page path is reached — so a red target is the product's, not the generator's.
// ROW-050 technique: a property over 200 generated inputs plus one named example; the mutants are near misses one
// ROW-050   rule away from a value the product just accepted; failures collected (at most 5) so a wrong product ends
// ROW-050   fast and every failure names the seed.
// ROW-050 cases: ROW-050 target=tests/invariants/row-047-048-050-req-007-hosts-and-generated.spec.js::ROW-050_200_generated_addresses_show_a_link_and_each_mutant_shows_no_link control=tests/invariants/row-047-048-050-req-007-hosts-and-generated.spec.js::ROW-050_control_the_generator_obeys_the_row_grammar_and_a_plain_address_shows_a_link
'use strict';
const { test, expect } = require('@playwright/test');
const { randomInt } = require('crypto');
const h = require('./harness');

const VIAS = ['button', 'enter'];

test('ROW-048 control the page opens and takes typed text with no link shown', async ({ page }) => {
  await h.openPage(page, 'file');
  const text = `https://example.com/${h.fresh('c')}`;
  await h.typeInto(page, text);
  expect(await h.fieldValue(page)).toBe(text);
  expect(await h.resultLinks(page)).toEqual([]);
});

test('ROW-048 a hyphenated host with several labels shows a link', async ({ page }) => {
  await h.openPage(page, 'file');
  expect(await h.resultLinks(page)).toEqual([]);
  const shots = await h.shootEach(page, ['https://my-site.example.com', `https://my-${h.fresh('m')}.example.com`], VIAS);
  for (const s of shots) {
    const label = `ROW-048 ${s.address} by ${s.via}`;
    expect(s.after.length, `${label}: one link`).toBe(1);
    expect(s.after[0], `${label}: the link's shape`).toMatch(h.LINK_RE);
    expect(s.after, `${label}: a new link replaced the one before`).not.toEqual(s.before);
    expect(s.visible, `${label}: the link is visible`).toContain(s.after[0]);
  }
});

test('ROW-047 a host with characters a host name cannot hold shows no link', async ({ page }) => {
  const dialogs = h.watchDialogs(page);
  await h.openPage(page, 'file');
  const sentinel = await h.plantSentinel(page);
  const navs = h.watchNavigations(page);
  const inputs = [
    'https://exa%20mple.com', 'https://exa<mple.com', 'https://a"b.com', 'https://exa_mple.com/', 'https://a*b.com',
    `https://${h.fresh('x')}_x.com`,
  ];
  let links = [];
  for (const phase of ['no link yet', 'link shown']) {
    if (phase === 'link shown') {
      const [s] = await h.shootEach(page, [`https://example.com/${h.fresh('p')}`], ['button']);
      links = s.after;
      expect(links.length, 'ROW-047 setup: a valid shot shows one link').toBe(1);
    }
    for (const p of await h.pressEach(page, inputs, VIAS)) {
      const label = `ROW-047 ${phase}, ${JSON.stringify(p.text)} by ${p.via}`;
      expect(p.after, `${label}: the page state after the press equals the state before it`).toEqual(p.before);
      expect(p.links, `${label}: the result area's links`).toEqual(links);
      expect(p.after.validationMessage, `${label}: no browser validation message`).toBe('');
      expect(dialogs, `${label}: no dialog`).toEqual([]);
      expect(navs, `${label}: no navigation`).toEqual([]);
      expect(await h.sentinelIntact(page, sentinel), `${label}: no reload`).toBe(true);
    }
  }
});

// ---- ROW-050: the generator, built only from the row's grammar ----

/** A small seeded random source (mulberry32): the same seed replays the same addresses. */
function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ALNUM = 'abcdefghijklmnopqrstuvwxyz0123456789';
const TAIL = `${ALNUM}/-_.=&`;

/** n addresses from the row's grammar, each with its four mutants (port, whitespace, no scheme, no dots in host). */
function generate(seed, n) {
  const r = seeded(seed);
  const int = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
  const pick = (s) => s[int(0, s.length - 1)];
  const out = [];
  for (let k = 0; k < n; k++) {
    const scheme = `${(r() < 0.5 ? 'http' : 'https').split('').map((c) => (r() < 0.5 ? c.toUpperCase() : c)).join('')}://`;
    const labels = [];
    for (let i = int(2, 4); i > 0; i--) {
      const len = int(1, 8);
      let label = pick(ALNUM);
      if (len > 1) {
        for (let j = 0; j < len - 2; j++) label += pick(`${ALNUM}-`);
        label += pick(ALNUM);
      }
      labels.push(label);
    }
    const host = labels.join('.');
    const run = () => { let s = ''; for (let j = int(0, 10); j > 0; j--) s += pick(TAIL); return s; };
    const tail = (r() < 0.5 ? `/${run()}` : '') + (r() < 0.5 ? `?${run()}` : '') + (r() < 0.5 ? `#${run()}` : '');
    const address = scheme + host + tail;
    const at = int(scheme.length, address.length - 1);
    out.push({
      address,
      via: VIAS[int(0, 1)],
      mutants: {
        port: `${scheme}${host}:${int(0, 99999)}${tail}`,
        whitespace: address.slice(0, at) + (r() < 0.5 ? ' ' : '\t') + address.slice(at),
        'no scheme': host + tail,
        'no dots in host': scheme + host.replace(/\./g, '') + tail,
      },
    });
  }
  return out;
}

/** The row's grammar, written from its text (not from any product code): what a generated address must look like. */
const ROW_050_GRAMMAR = /^https?:\/\/[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?){1,3}(?:\/[a-z0-9/\-_.=&]*)?(?:\?[a-z0-9/\-_.=&]*)?(?:#[a-z0-9/\-_.=&]*)?$/i;

test('ROW-050 control the generator obeys the row grammar and a plain address shows a link', async ({ page }) => {
  const seed = randomInt(1, 2 ** 31);
  const cases = generate(seed, 200);
  expect(cases.length).toBe(200);
  const schemes = new Set();
  for (const c of cases) {
    expect(c.address, `ROW-050 control seed ${seed}: generated address obeys the row's grammar`).toMatch(ROW_050_GRAMMAR);
    schemes.add(c.address.split(':')[0]);
    for (const [kind, m] of Object.entries(c.mutants)) {
      expect(m, `ROW-050 control seed ${seed}: the ${kind} mutant breaks the grammar`).not.toMatch(ROW_050_GRAMMAR);
      expect(m, `ROW-050 control seed ${seed}: the ${kind} mutant differs from its original`).not.toBe(c.address);
    }
    expect(/[ \t]/.test(c.mutants.whitespace.slice(c.mutants.whitespace.indexOf('://') + 3, -1)),
      `ROW-050 control seed ${seed}: whitespace strictly inside after the scheme`).toBe(true);
  }
  expect(schemes.size, `ROW-050 control seed ${seed}: the scheme's letter case varies`).toBeGreaterThan(2);

  await h.openPage(page, 'file');
  const [s] = await h.shootEach(page, ['https://example.com'], ['button']);
  expect(s.before).toEqual([]);
  expect(s.after.length).toBe(1);
  expect(s.after[0]).toMatch(h.LINK_RE);
});

test('ROW-050 200 generated addresses show a link and each mutant shows no link', async ({ page }) => {
  test.setTimeout(300_000);
  const seed = randomInt(1, 2 ** 31);
  const cases = [{ address: 'HtTpS://my-site.ex4mple.co/a_b.c=d&e?x=1&y=2#top', via: 'button', mutants: {} },
    ...generate(seed, 200)];
  const failures = [];
  await h.openPage(page, 'file');
  for (const c of cases) {
    if (failures.length >= 5) break;
    const [s] = await h.shootEach(page, [c.address], [c.via], 2000);
    if (!(s.after.length === 1 && h.LINK_RE.test(s.after[0]) && JSON.stringify(s.after) !== JSON.stringify(s.before))) {
      failures.push(`seed ${seed}: valid ${JSON.stringify(c.address)} by ${c.via} showed ${JSON.stringify(s.after)} (before ${JSON.stringify(s.before)})`);
      continue;
    }
    for (const [kind, m] of Object.entries(c.mutants)) {
      const [p] = await h.pressEach(page, [m], [c.via], 0);
      if (JSON.stringify(p.after) !== JSON.stringify(p.before) || JSON.stringify(p.links) !== JSON.stringify(s.after)) {
        failures.push(`seed ${seed}: ${kind} mutant ${JSON.stringify(m)} of ${JSON.stringify(c.address)} by ${c.via} changed the page (links ${JSON.stringify(s.after)} -> ${JSON.stringify(p.links)})`);
      }
    }
  }
  expect(failures, 'ROW-050: every generated address shows a link and every mutant changes nothing').toEqual([]);
});
