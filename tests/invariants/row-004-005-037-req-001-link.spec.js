// Purpose: ROW-004, ROW-005, ROW-037 (REQ-001) — a valid shot shows exactly one well-formed short link, below the field, at once and with no interim text.
// Provenance: hand-authored
//
// ROW-004 promise: shooting a valid address shows exactly one link whose text is exactly https://shooter.app/ then
// ROW-004   exactly 6 characters, each A-Z, a-z or 0-9. Authority: REQ-001 fail-if (1)-(4); A-003 (6 letters and
// ROW-004   digits), A-005 (the prefix https://shooter.app/ exactly); element ids D-009.
// ROW-004 wrong product: a near-miss link — http:// or www.shooter.app, a missing slash, a 5- or 7-character code,
// ROW-004   a code with - or _ (base64url), punctuation glued to the link ("https://shooter.app/aB3dE9.") — or two
// ROW-004   links shown at once (one in #result and a copy elsewhere on the page), or no link at all.
// ROW-004 given: the page opened from disk; fresh addresses https://example.com/<fresh>/... (unique per run, so
// ROW-004   no product can hard-code their links); the visible-page link-token count before the first shot.
// ROW-004 when: three shots through the real button, each on a fresh address.
// ROW-004 then: before each shot #result holds no new link; after it #result holds exactly one whole
// ROW-004   whitespace token mentioning shooter.app, it matches LINK_RE in full, and the whole visible page holds
// ROW-004   exactly that one shooter.app token — no other, no near miss.
// ROW-004 controls: the page loads, the field takes the address, #result holds no link before any shot; and the
// ROW-004   token reader + LINK_RE, fed decoys (each near miss above) beside one right link, reject every decoy
// ROW-004   and accept the right one — so the target's pass is the instrument discriminating, not being blind.
// ROW-004 technique: whole-token reading (a wrong prefix or length stays inside the token and fails the
// ROW-004   anchored pattern, never cut to fit), decoys proven rejected, whole-page counts for "exactly one".
// ROW-004 cases: ROW-004 target=tests/invariants/row-004-005-037-req-001-link.spec.js::ROW-004_a_valid_shot_shows_exactly_one_link_of_the_prefix_and_6_letters_or_digits control=tests/invariants/row-004-005-037-req-001-link.spec.js::ROW-004_control_page_takes_an_address_and_the_link_reader_rejects_near_misses
//
// ROW-005 promise: the link appears below the field — its rendered top edge is lower than the field's bottom
// ROW-005   edge. Authority: REQ-001 fail-if (5); A-012 (shown below the field).
// ROW-005 wrong product: the result area placed above the field (before it in the markup, or flex
// ROW-005   column-reverse, or absolutely positioned over it), or beside it in a row layout so its top sits level with
// ROW-005   the field; or a layout that is below at desktop width and beside it at a phone width.
// ROW-005 given: the page opened from disk at 1280x720 and again at 360x640; a fresh valid address.
// ROW-005 when: one shot through the button at each size.
// ROW-005 then: before the shot #result carries no link text box; after it the text box carrying the link has
// ROW-005   a positive height and its top is at or below the field's bottom edge (0.5 px rounding slack).
// ROW-005 controls: on a test-made page (setContent, not the product) the same geometry reader reports a link
// ROW-005   drawn above a field as above and one drawn below as below — the measure tells the two apart.
// ROW-005 technique: measured geometry of the text node itself (not the box the implementation labelled), at
// ROW-005   two viewport widths, so a responsive layout that moves the link beside the field is caught.
// ROW-005 cases: ROW-005 target=tests/invariants/row-004-005-037-req-001-link.spec.js::ROW-005_the_link_text_is_drawn_below_the_field_at_desktop_and_phone_width control=tests/invariants/row-004-005-037-req-001-link.spec.js::ROW-005_control_the_geometry_reader_tells_a_link_above_from_a_link_below
//
// ROW-037 promise: an ordinary shot of https://example.com, by button and by Enter, shows its link within 100 ms
// ROW-037   of the press, and no interim text such as loading ever appears in the result area. Authority: REQ-001
// ROW-037   (a valid address produces the link; the demo's point is one click), the row's own figure of 100 ms.
// ROW-037 wrong product: a "shooting" effect — "Loading…" or "Shooting…" written to #result (or drawn as
// ROW-037   #result::before by a class flip) before the link, or the link revealed after a 300 ms setTimeout.
// ROW-037 given: the row's own address https://example.com, each press on a fresh page load from disk; an
// ROW-037   observer on the whole document recording every state of #result (innerText and its ::before/::after
// ROW-037   content) with performance.now(), and capture-phase listeners stamping the press (pointerdown on the
// ROW-037   button, keydown Enter in the field) before any product handler runs.
// ROW-037 when: one shot by clicking the button; on a second load, one shot by pressing Enter in the field.
// ROW-037 then: a state holding a LINK_RE link is recorded, at most 100 ms after the press stamp; every recorded
// ROW-037   state's text is empty or that final text, and its pseudo content is none or the final state's own.
// ROW-037 controls: on a test-made page (setContent) whose button writes "Loading…" and the link 300 ms later,
// ROW-037   the same instrument reports the interim text and a delay over 100 ms; on a test-made page that writes the
// ROW-037   link at once, it reports neither — the watcher sees both faults and does not invent them.
// ROW-037 technique: a threshold measured in the page's own clock from the press event to the DOM mutation, plus
// ROW-037   a complete record of intermediate states (an observer, never a sampled poll that could miss a flash).
// ROW-037 cases: ROW-037 target=tests/invariants/row-004-005-037-req-001-link.spec.js::ROW-037_a_shot_of_example_com_by_button_and_by_Enter_shows_its_link_within_100_ms_with_no_interim_text control=tests/invariants/row-004-005-037-req-001-link.spec.js::ROW-037_control_the_press_watcher_sees_a_slow_loading_product_and_clears_a_prompt_one
'use strict';
const { test, expect } = require('@playwright/test');
const h = require('./harness');

const LINK_SRC = h.LINK_RE.source;

// ---- ROW-004 ----

test('ROW-004 control page takes an address and the link reader rejects near misses', async ({ page }) => {
  await h.openPage(page, 'file');
  expect(await h.resultLinks(page)).toEqual([]);
  const addr = `https://example.com/${h.fresh('a')}`;
  await h.typeInto(page, addr);
  expect(await h.fieldValue(page)).toBe(addr);

  const decoys = [
    'http://shooter.app/aB3dE9', 'https://www.shooter.app/aB3dE9', 'https://shooter.appaB3dE9', 'https://shooter.app/aB3dE',
    'https://shooter.app/aB3dE9x', 'https://shooter.app/aB3-E9', 'https://shooter.app/aB3_E9', 'https://shooter.app/aB3dE9.',
    'link:https://shooter.app/aB3dE9', 'https://shooter.app//aB3dE9',
  ];
  for (const d of decoys) {
    const toks = h.linkTokens(`Your link ${d} here`);
    expect(toks).toEqual([d]);
    expect(h.LINK_RE.test(toks[0]), `decoy accepted: ${d}`).toBe(false);
  }
  const right = h.linkTokens('https://shooter.app/aB3dE9');
  expect(right).toEqual(['https://shooter.app/aB3dE9']);
  expect(h.LINK_RE.test(right[0])).toBe(true);
});

test('ROW-004 a valid shot shows exactly one link of the prefix and 6 letters or digits', async ({ page }) => {
  await h.openPage(page, 'file');
  const baseline = await h.visibleLinks(page);
  expect(baseline, 'ROW-004: the page shows a shooter.app link before any shot').toEqual([]);
  const tag = h.fresh('r4');
  let prev = [];
  for (const addr of [`https://example.com/${tag}`, `https://example.com/${tag}/deeper/page`, `https://www.example.org/${tag}`]) {
    expect(await h.resultLinks(page)).toEqual(prev);
    await h.shoot(page, addr, 'button');
    await h.waitForResultChange(page, prev);
    const shown = await h.resultLinks(page);
    expect(shown.length, `ROW-004: link tokens in #result after shooting ${addr}: ${JSON.stringify(shown)}`).toBe(1);
    expect(shown[0], 'ROW-004: the link is not the prefix plus exactly 6 letters or digits').toMatch(h.LINK_RE);
    expect(shown[0]).not.toEqual(prev[0]);
    expect(await h.visibleLinks(page), 'ROW-004: the page shows a link other than the one in #result').toEqual(shown);
    prev = shown;
  }
});

// ---- ROW-005 ----

test('ROW-005 control the geometry reader tells a link above from a link below', async ({ page }) => {
  const doc = (resultFirst) => `<!doctype html><meta charset="utf-8"><body style="margin:20px">
    ${resultFirst ? '<div id="result">https://shooter.app/aB3dE9</div>' : ''}
    <input id="url-input" style="display:block;height:30px">
    ${resultFirst ? '' : '<div id="result">https://shooter.app/aB3dE9</div>'}</body>`;
  await page.setContent(doc(true));
  const above = await h.linkBox(page);
  expect(above).not.toBeNull();
  expect(above.linkTop).toBeLessThan(above.fieldBottom - 0.5);
  await page.setContent(doc(false));
  const below = await h.linkBox(page);
  expect(below).not.toBeNull();
  expect(below.linkHeight).toBeGreaterThan(0);
  expect(below.linkTop).toBeGreaterThanOrEqual(below.fieldBottom - 0.5);
});

test('ROW-005 the link text is drawn below the field at desktop and phone width', async ({ page }) => {
  for (const size of [{ width: 1280, height: 720 }, { width: 360, height: 640 }]) {
    await page.setViewportSize(size);
    await h.openPage(page, 'file');
    expect(await h.linkBox(page), `ROW-005 at ${size.width}px: a link box exists before the shot`).toBeNull();
    await h.shoot(page, `https://example.com/${h.fresh('r5')}`, 'button');
    await h.waitForResultChange(page, []);
    const box = await h.linkBox(page);
    expect(box, `ROW-005 at ${size.width}px: no text carrying the link inside #result`).not.toBeNull();
    expect(box.linkHeight).toBeGreaterThan(0);
    expect(box.linkWidth).toBeGreaterThan(0);
    expect(box.linkTop, `ROW-005 at ${size.width}px: link top ${box.linkTop} is above field bottom ${box.fieldBottom}`)
      .toBeGreaterThanOrEqual(box.fieldBottom - 0.5);
  }
});

// ---- ROW-037 ----

/** Installs the press-and-states watcher on the loaded page (window.__vidPress). Reads #result afresh on every mutation. */
async function armPressWatch(page) {
  await page.evaluate(([sel, linkSrc]) => {
    const re = new RegExp(linkSrc);
    const pseudo = (el, p) => { const c = getComputedStyle(el, p).content; return c === 'none' || c === 'normal' || c === '""' || c === "''" ? '' : c; };
    const read = () => {
      const el = document.querySelector(sel.result);
      if (!el) return { text: null, before: '', after: '' };
      return { text: el.innerText.trim(), before: pseudo(el, '::before'), after: pseudo(el, '::after') };
    };
    const w = { press: null, linkAt: null, states: [{ t: performance.now(), ...read() }] };
    window.__vidPress = w;
    const stamp = () => { if (w.press === null) w.press = performance.now(); };
    document.querySelector(sel.button).addEventListener('pointerdown', stamp, true);
    window.addEventListener('pointerdown', (e) => { if (e.target && e.target.closest && e.target.closest(sel.button)) stamp(); }, true);
    window.addEventListener('keydown', (e) => { if (e.key === 'Enter') stamp(); }, true);
    new MutationObserver(() => {
      const s = { t: performance.now(), ...read() };
      const last = w.states[w.states.length - 1];
      if (s.text !== last.text || s.before !== last.before || s.after !== last.after) w.states.push(s);
      if (w.linkAt === null && s.text && s.text.split(/\s+/).some((tok) => re.test(tok))) w.linkAt = s.t;
    }).observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true });
  }, [h.SEL, LINK_SRC]);
}

/** Presses (button or Enter), waits (bounded) for a link state, lets the page settle, and returns the record. */
async function pressAndRead(page, via) {
  await armPressWatch(page);
  if (via === 'enter') await page.press(h.SEL.field, 'Enter');
  else await page.click(h.SEL.button);
  await page.waitForFunction(() => window.__vidPress && window.__vidPress.linkAt !== null, null, { timeout: 3000 }).catch(() => null);
  await h.settle(page);
  await h.settle(page);
  return page.evaluate(() => window.__vidPress);
}

/** Judges a record: the delay from press to link (null when no link came) and every state that is interim. */
function judge(rec) {
  const final = rec.states[rec.states.length - 1];
  const first = rec.states[0];
  const interim = rec.states.filter((s) => !(
    (s.text === '' || s.text === final.text || s.text === first.text)
    && [s.before, s.after].every((p) => p === '' || p === final.before || p === final.after)));
  return { delay: rec.linkAt === null || rec.press === null ? null : rec.linkAt - rec.press, interim, final };
}

test('ROW-037 control the press watcher sees a slow loading product and clears a prompt one', async ({ page }) => {
  const decoy = (slow) => `<!doctype html><meta charset="utf-8"><body>
    <input id="url-input"><button id="shoot-button">Shoot</button><div id="result"></div>
    <script>
      document.getElementById('shoot-button').addEventListener('click', () => {
        const r = document.getElementById('result');
        const link = 'https://shooter.app/aB3dE9';
        ${slow ? "r.textContent = 'Loading…'; setTimeout(() => { r.textContent = link; }, 300);" : 'r.textContent = link;'}
      });
    </script></body>`;
  await page.setContent(decoy(true));
  const slow = judge(await pressAndRead(page, 'button'));
  expect(slow.delay).not.toBeNull();
  expect(slow.delay).toBeGreaterThan(100);
  expect(slow.interim.map((s) => s.text)).toContain('Loading…');

  await page.setContent(decoy(false));
  const fast = judge(await pressAndRead(page, 'button'));
  expect(fast.delay).not.toBeNull();
  expect(fast.delay).toBeLessThanOrEqual(100);
  expect(fast.interim).toEqual([]);
});

test('ROW-037 a shot of example com by button and by Enter shows its link within 100 ms with no interim text', async ({ page }) => {
  for (const via of ['button', 'enter']) {
    await h.openPage(page, 'file');
    await h.typeInto(page, 'https://example.com');
    expect(await h.resultLinks(page)).toEqual([]);
    const rec = await pressAndRead(page, via);
    const j = judge(rec);
    expect(rec.press, `ROW-037 (${via}): the press was not seen`).not.toBeNull();
    expect(j.delay, `ROW-037 (${via}): no link appeared in #result; states ${JSON.stringify(rec.states)}`).not.toBeNull();
    expect(j.final.text.split(/\s+/).filter((t) => h.LINK_RE.test(t)).length).toBe(1);
    expect(j.delay, `ROW-037 (${via}): link shown ${j.delay} ms after the press`).toBeLessThanOrEqual(100);
    expect(j.interim, `ROW-037 (${via}): interim states in #result`).toEqual([]);
  }
});
