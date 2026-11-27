// Purpose: ROW-021, ROW-036, ROW-051 (REQ-009) — typed, pasted or dropped markup and entities never become page markup, script or decoded text.
// Provenance: hand-authored
//
// ROW-021 promise: shooting valid addresses carrying markup, such as https://example.com/?q=<svg/onload=alert(1)>
// ROW-021   and https://example.com/<b>x</b>, runs no script, adds no element to the page, and leaves every displayed
// ROW-021   text as literal characters; a rejected input carrying markup does the same. Authority: REQ-009 fail-if 1-3;
// ROW-021   A-012 (the link is plain text; typed text is never inserted into the page as HTML).
// ROW-021 wrong product: the result written as result.innerHTML = `Shot ${text}: ${link}` (or the link built into an
// ROW-021   <a> with the typed address in its title via innerHTML) — an <svg>, <b> or <img> appears, onload/onerror run,
// ROW-021   and "x" shows where "<b>x</b>" was typed.
// ROW-021 given: index.html from disk; a dialog recorder; a fresh global name no product can know, which the fresh
// ROW-021   payloads' handlers would set (window['<flag>']=1); a first plain shot so the page's link structure exists,
// ROW-021   then the page's element shape (every element's tag, in order) as the baseline. Payloads: the row's two
// ROW-021   verbatim; fresh variants https://example.com/<f>?q=<svg/onload=window['<flag>']=1>,
// ROW-021   https://example.com/<f>/<img/src="x"/onerror="window['<flag>']=1">, https://example.com/<f>/<b>x</b>;
// ROW-021   rejected inputs <script>alert(1)</script>, hello <img src=x onerror="window['<flag>']=1"> <f>,
// ROW-021   <b>x</b> <f>, https://exa mple.com/<svg/onload=alert(1)>.
// ROW-021 when: each shot by the button and by Enter.
// ROW-021 then: for the row's own two, which it calls valid, the shot is taken (a new link appears — so a page that
// ROW-021   ignores its input cannot pass); after every shot (and a bounded window for a late insertion) the element
// ROW-021   shape equals the baseline, no dialog opened, the flag is unset, the title is unchanged, and every place
// ROW-021   carrying the fresh token carries the whole typed text literally; a rejected press leaves the whole page
// ROW-021   state equal and the field holding exactly the typed characters.
// ROW-021 controls: the control case shows the row's two addresses are accepted (each shows a link — the harmful
// ROW-021   input reaches the code that renders a result), and that each probe can fire: an element the test plants
// ROW-021   changes the shape, a flag the test sets reads set, an alert the test raises is recorded.
// ROW-021 technique: before/after on the page's element shape against a baseline that already holds a link, with a
// ROW-021   fresh script flag and a dialog recorder; both press paths; valid and rejected inputs.
// ROW-021 cases: ROW-021 target=tests/invariants/row-021-036-051-req-009-typed-markup.spec.js::ROW-021_addresses_and_inputs_carrying_markup_run_no_script_and_add_no_element control=tests/invariants/row-021-036-051-req-009-typed-markup.spec.js::ROW-021_control_the_markup_addresses_are_accepted_and_each_probe_can_fire
//
// ROW-036 promise: pasting or dropping clipboard content that carries HTML markup (an image tag with an onerror
// ROW-036   handler) into the field adds no element, runs no script, leaves only plain text in the field, and a
// ROW-036   following shot behaves as for that plain text. Authority: REQ-009 fail-if 1-3; A-012.
// ROW-036 wrong product: a contenteditable field, or a paste/drop handler that reads text/html and writes it with
// ROW-036   innerHTML (a preview, or the field's own markup), or that puts the raw HTML into the field's value.
// ROW-036 given: the browser's real clipboard (text/html + text/plain) pasted with the keyboard shortcut, and a real
// ROW-036   drop through the browser's drag input (text/html + text/plain); two contents — html
// ROW-036   <b>https://example.com/<f></b><img src="x" onerror="window['<flag>']=1"> with plain https://example.com/<f>
// ROW-036   (valid), and html <img src="x" onerror=…><i>hello</i> <f> with plain hello <f> (rejected); a baseline
// ROW-036   shape taken after a plain typed shot.
// ROW-036 when: each content pasted, then shot by the button; then each dropped, then shot by the button.
// ROW-036 then: after inserting, the field holds exactly the plain text, the shape equals the baseline, nothing else
// ROW-036   on the page changed, the flag is unset, no dialog; after the shot — valid: one new link of the promised
// ROW-036   shape; rejected: the whole page state unchanged — and the shape, flag and dialogs still clean.
// ROW-036 controls: the control case pastes and drops the same contents into a plain <input> the test owns on a
// ROW-036   file:// document and reads the plain text back — the instruments really insert, so a clean target is the
// ROW-036   product's doing.
// ROW-036 technique: before/after through the browser's own paste and drop (trusted events, default action), with a
// ROW-036   fresh script flag and the element shape; one valid and one rejected plain text.
// ROW-036 cases: ROW-036 target=tests/invariants/row-021-036-051-req-009-typed-markup.spec.js::ROW-036_pasted_or_dropped_markup_adds_no_element_runs_no_script_and_leaves_plain_text control=tests/invariants/row-021-036-051-req-009-typed-markup.spec.js::ROW-036_control_paste_and_drop_put_the_plain_text_into_a_plain_field
//
// ROW-051 promise: entities are never decoded into the page — shooting https://example.com/?a=&lt;b&gt;&amp; and one
// ROW-051   carrying &#60; leaves no text node, attribute or document title anywhere holding the decoded < or & form of
// ROW-051   the typed text. Authority: REQ-009 fail-if 2 (entities such as &lt; shown other than as their literal
// ROW-051   characters) and 3 (innerHTML or an equivalent); A-012.
// ROW-051 wrong product: the typed text echoed through innerHTML or an attribute template (title="${text}") — the
// ROW-051   parser turns &lt;b&gt;&amp; into <b>& in a text node or an attribute value.
// ROW-051 given: the row's two (https://example.com/?a=&lt;b&gt;&amp; and https://example.com/?x=&#60;y), a fresh
// ROW-051   https://example.com/<f>?a=&lt;i&gt;&amp;&#60; and a rejected hello <f> &lt;b&gt;&amp;&#60;; the decoded
// ROW-051   forms searched for: a=<b>&, x=<y, and, for the fresh ones, anything after the fresh token that is not the
// ROW-051   typed text itself.
// ROW-051 when: each shot by the button and by Enter.
// ROW-051 then: the row's own two (addresses REQ-007 accepts: no whitespace, a dotted host, a query or anchor) are
// ROW-051   each taken (a new link — so a page that ignores its input cannot pass); after every shot no text (the whole
// ROW-051   document's text, the title included), no attribute value on any element and no form field's value holds a
// ROW-051   decoded form, and every place carrying the fresh token carries the typed characters literally.
// ROW-051 controls: the control case shows the search finds nothing on the fresh page, finds a decoded form the
// ROW-051   test plants in a text node and in an attribute, and that the row's first address is accepted (shows a
// ROW-051   link), so the entity text reaches the result code.
// ROW-051 technique: before/after with decoys — the literal entity text must be absent in its decoded form only.
// ROW-051 cases: ROW-051 target=tests/invariants/row-021-036-051-req-009-typed-markup.spec.js::ROW-051_typed_entities_are_never_decoded_into_any_text_attribute_or_title control=tests/invariants/row-021-036-051-req-009-typed-markup.spec.js::ROW-051_control_the_search_finds_a_planted_decoded_form_and_the_entity_address_is_accepted
'use strict';
const { test, expect } = require('@playwright/test');
const h = require('./harness');

const VIAS = ['button', 'enter'];

/** Every element's tag, in document order: adding any element (svg, b, img, script…) changes it. */
async function shape(page) {
  return page.evaluate(() => Array.from(document.getElementsByTagName('*'), (e) => e.tagName).join(' '));
}

/** True when the fresh global a payload's handler would set has been set. */
async function flagSet(page, flag) {
  return page.evaluate((n) => Object.prototype.hasOwnProperty.call(window, n), flag);
}

/** Lets a late insertion (a timer or a frame after the press) land before the shape is read. */
async function letLateWorkLand(page) {
  await h.stateChangesWithin(page, await h.pageState(page), 150);
}

/**
 * Drops content on the element through the browser's own drag input (trusted dragenter/dragover/drop, with the
 * browser's default insertion), at the element's centre.
 */
async function dropInto(page, sel, items) {
  const box = await page.locator(sel).boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const cdp = await page.context().newCDPSession(page);
  const data = { items, dragOperationsMask: 1 | 2 | 16 };
  for (const type of ['dragEnter', 'dragOver', 'drop']) await cdp.send('Input.dispatchDragEvent', { type, x, y, data });
  await cdp.detach();
  await h.settle(page);
}

const clip = (c) => [{ mimeType: 'text/html', data: c.html }, { mimeType: 'text/plain', data: c.text }];

test('ROW-021 control the markup addresses are accepted and each probe can fire', async ({ page }) => {
  const dialogs = h.watchDialogs(page);
  await h.openPage(page, 'file');
  // The probes, on a page load of their own: each can fire.
  const flag = h.fresh('flag');
  const before = await shape(page);
  expect(await flagSet(page, flag)).toBe(false);
  await page.evaluate((n) => { window[n] = 1; document.body.appendChild(document.createElement('b')); }, flag);
  expect(await flagSet(page, flag)).toBe(true);
  expect(await shape(page)).not.toBe(before);
  await page.evaluate(() => alert('probe'));
  expect(dialogs).toContain('alert: probe');

  // The row's two addresses reach the result code: each shows a link.
  await h.openPage(page, 'file');
  const shots = await h.shootEach(page, ['https://example.com/?q=<svg/onload=alert(1)>', 'https://example.com/<b>x</b>'], ['button']);
  for (const s of shots) {
    expect(s.after.length, `ROW-021 control ${s.address}: one link`).toBe(1);
    expect(s.after[0]).toMatch(h.LINK_RE);
    expect(s.after).not.toEqual(s.before);
  }
});

test('ROW-021 addresses and inputs carrying markup run no script and add no element', async ({ page }) => {
  const dialogs = h.watchDialogs(page);
  await h.openPage(page, 'file');
  const flag = h.fresh('flag');
  const f = h.fresh('m');
  await h.shootEach(page, [`https://example.com/${h.fresh('p')}`], ['button']);
  const baseShape = await shape(page);
  const baseTitle = await page.title();

  /** Shoots one address and asserts the page took in no markup and ran no script; returns the links before and after. */
  async function shootSafely(address, via, label, literals) {
    const before = await h.resultLinks(page);
    await h.shoot(page, address, via);
    await h.waitForResultChange(page, before, 2000);
    await letLateWorkLand(page);
    expect(await shape(page), `${label}: no element added`).toBe(baseShape);
    expect(dialogs, `${label}: no script ran (no dialog)`).toEqual([]);
    expect(await flagSet(page, flag), `${label}: no script ran (flag unset)`).toBe(false);
    expect(await page.title(), `${label}: the title unchanged`).toBe(baseTitle);
    // Every place on the page carrying the fresh token carries the typed characters after it, literally.
    expect(await decodedHits(page, [], literals), `${label}: displayed text is literal`).toEqual([]);
    return { before, after: await h.resultLinks(page) };
  }

  // The row's own two, which it calls valid: each shot is taken (a new link — the markup reached the result code)
  // and none of it became markup or script.
  for (const address of ['https://example.com/?q=<svg/onload=alert(1)>', 'https://example.com/<b>x</b>']) {
    for (const via of VIAS) {
      const label = `ROW-021 valid ${JSON.stringify(address)} by ${via}`;
      const { before, after } = await shootSafely(address, via, label, []);
      expect(after.length, `${label}: the shot was taken (one link)`).toBe(1);
      expect(after[0], `${label}: the link's shape`).toMatch(h.LINK_RE);
      expect(after, `${label}: a new link`).not.toEqual(before);
    }
  }

  // Fresh variants whose handlers would set the fresh flag; accepted or not, none of it becomes markup or script.
  for (const address of [
    `https://example.com/${f}?q=<svg/onload=window['${flag}']=1>`,
    `https://example.com/${f}/<img/src="x"/onerror="window['${flag}']=1">`,
    `https://example.com/${f}/<b>x</b>`,
  ]) {
    for (const via of VIAS) {
      await shootSafely(address, via, `ROW-021 fresh ${JSON.stringify(address)} by ${via}`, [[f, address]]);
    }
  }

  const rejected = [
    '<script>alert(1)</script>',
    `hello <img src=x onerror="window['${flag}']=1"> ${f}`,
    `<b>x</b> ${f}`,
    'https://exa mple.com/<svg/onload=alert(1)>',
  ];
  for (const p of await h.pressEach(page, rejected, VIAS)) {
    const label = `ROW-021 rejected ${JSON.stringify(p.text)} by ${p.via}`;
    expect(p.after, `${label}: the page state unchanged`).toEqual(p.before);
    expect(p.after.field, `${label}: the field holds the literal characters`).toBe(p.text);
  }
  await letLateWorkLand(page);
  expect(await shape(page), 'ROW-021 rejected inputs: no element added').toBe(baseShape);
  expect(dialogs, 'ROW-021 rejected inputs: no script ran (no dialog)').toEqual([]);
  expect(await flagSet(page, flag), 'ROW-021 rejected inputs: no script ran (flag unset)').toBe(false);
});

test('ROW-036 control paste and drop put the plain text into a plain field', async ({ page }) => {
  await h.openPage(page, 'file');
  await page.setContent('<input id="vid-probe" type="text">');
  expect(new URL(page.url()).protocol).toBe('file:');
  const c = { html: '<b>https://example.com/p</b><img src="x">', text: 'https://example.com/p' };
  await h.pasteInto(page, '#vid-probe', c);
  expect(await page.inputValue('#vid-probe')).toBe(c.text);
  await page.fill('#vid-probe', '');
  await dropInto(page, '#vid-probe', clip(c));
  expect(await page.inputValue('#vid-probe')).toBe(c.text);
});

test('ROW-036 pasted or dropped markup adds no element runs no script and leaves plain text', async ({ page }) => {
  const dialogs = h.watchDialogs(page);
  await h.openPage(page, 'file');
  const flag = h.fresh('flag');
  await h.shootEach(page, [`https://example.com/${h.fresh('p')}`], ['button']);
  const baseShape = await shape(page);
  const f1 = h.fresh('v');
  const f2 = h.fresh('r');
  const contents = [
    { valid: true, text: `https://example.com/${f1}`,
      html: `<b>https://example.com/${f1}</b><img src="x" onerror="window['${flag}']=1">` },
    { valid: false, text: `hello ${f2}`, html: `<img src="x" onerror="window['${flag}']=1"><i>hello</i> ${f2}` },
  ];
  for (const how of ['paste', 'drop']) {
    for (const c of contents) {
      const label = `ROW-036 ${how} of ${c.valid ? 'a valid' : 'a rejected'} plain text`;
      await h.typeInto(page, '');
      const before = await h.pageState(page);
      if (how === 'paste') await h.pasteInto(page, h.SEL.field, c);
      else await dropInto(page, h.SEL.field, clip(c));
      await letLateWorkLand(page);
      const inserted = await h.pageState(page);
      expect(inserted.field, `${label}: the field holds only the plain text`).toBe(c.text);
      expect({ ...inserted, field: null }, `${label}: nothing else on the page changed`).toEqual({ ...before, field: null });
      expect(await shape(page), `${label}: no element added`).toBe(baseShape);
      expect(await flagSet(page, flag), `${label}: no script ran (flag unset)`).toBe(false);
      expect(dialogs, `${label}: no dialog`).toEqual([]);

      const links = await h.resultLinks(page);
      await page.click(h.SEL.button);
      if (c.valid) {
        await h.waitForResultChange(page, links);
        const after = await h.resultLinks(page);
        expect(after.length, `${label}, then shot: one link`).toBe(1);
        expect(after[0], `${label}, then shot: the link's shape`).toMatch(h.LINK_RE);
        expect(after, `${label}, then shot: a new link`).not.toEqual(links);
      } else {
        await h.stateChangesWithin(page, inserted, 150);
        expect(await h.pageState(page), `${label}, then shot: the page state unchanged`).toEqual(inserted);
      }
      await letLateWorkLand(page);
      expect(await shape(page), `${label}, then shot: no element added`).toBe(baseShape);
      expect(await flagSet(page, flag), `${label}, then shot: no script ran`).toBe(false);
      expect(dialogs, `${label}, then shot: no dialog`).toEqual([]);
    }
  }
});

/**
 * Searches the whole document — its text (title included), every attribute value, every form field's value — for
 * any needle, and for any place carrying a fresh token without the literal typed text after it. Returns the hits.
 */
async function decodedHits(page, needles, literals) {
  return page.evaluate(([ns, lits]) => {
    const places = [['document text', document.documentElement.textContent], ['title', document.title]];
    for (const el of document.getElementsByTagName('*')) {
      for (const a of el.attributes) places.push([`${el.tagName.toLowerCase()}@${a.name}`, a.value]);
      if ('value' in el && typeof el.value === 'string') places.push([`${el.tagName.toLowerCase()}.value`, el.value]);
    }
    const hits = [];
    for (const [where, s] of places) {
      for (const n of ns) if (s.includes(n)) hits.push(`${where} holds ${JSON.stringify(n)}`);
      for (const [token, literal] of lits) {
        let i = s.indexOf(token);
        while (i !== -1) {
          const lit = literal.slice(literal.indexOf(token));
          if (!s.startsWith(lit, i)) hits.push(`${where} carries ${token} without the literal typed text`);
          i = s.indexOf(token, i + 1);
        }
      }
    }
    return hits;
  }, [needles, literals]);
}

test('ROW-051 control the search finds a planted decoded form and the entity address is accepted', async ({ page }) => {
  await h.openPage(page, 'file');
  const f = h.fresh('e');
  const literal = `https://example.com/${f}?a=&lt;i&gt;&amp;&#60;`;
  expect(await decodedHits(page, ['a=<b>&'], [[f, literal]])).toEqual([]);
  await page.evaluate((t) => {
    const span = document.createElement('span');
    span.textContent = 'a=<b>&';
    span.setAttribute('data-probe', `${t}?a=<i>&<`);
    document.body.appendChild(span);
  }, f);
  const hits = await decodedHits(page, ['a=<b>&'], [[f, literal]]);
  expect(hits.some((x) => x.startsWith('document text holds'))).toBe(true);
  expect(hits.some((x) => x.startsWith('span@data-probe carries'))).toBe(true);

  // The row's first address reaches the result code: it shows a link.
  await h.openPage(page, 'file');
  const [s] = await h.shootEach(page, ['https://example.com/?a=&lt;b&gt;&amp;'], ['button']);
  expect(s.after.length).toBe(1);
  expect(s.after[0]).toMatch(h.LINK_RE);
});

test('ROW-051 typed entities are never decoded into any text attribute or title', async ({ page }) => {
  await h.openPage(page, 'file');
  const f = h.fresh('e');
  const g = h.fresh('e');
  const inputs = [
    'https://example.com/?a=&lt;b&gt;&amp;',
    'https://example.com/?x=&#60;y',
    `https://example.com/${f}?a=&lt;i&gt;&amp;&#60;`,
    `hello ${g} &lt;b&gt;&amp;&#60;`,
  ];
  const needles = ['a=<b>&', 'x=<y', `${f}?a=<`, `${g} <`];
  const literals = [[f, inputs[2]], [g, inputs[3]]];
  expect(await decodedHits(page, needles, literals), 'ROW-051 before any shot').toEqual([]);

  /** Shoots one input and asserts no decoded form is anywhere on the page; returns the links before and after. */
  async function shootUndecoded(text, via) {
    const before = await h.resultLinks(page);
    await h.shoot(page, text, via);
    await h.waitForResultChange(page, before, 1000);
    await letLateWorkLand(page);
    expect(await decodedHits(page, needles, literals), `ROW-051 ${JSON.stringify(text)} by ${via}: no decoded form`).toEqual([]);
    return { before, after: await h.resultLinks(page) };
  }

  // The row's own two, addresses REQ-007 accepts (no whitespace, a dotted host, a query or anchor): each shot is
  // taken (a new link — the entity text reached the result code) and nothing decoded appears.
  for (const text of inputs.slice(0, 2)) {
    for (const via of VIAS) {
      const { before, after } = await shootUndecoded(text, via);
      expect(after.length, `ROW-051 ${JSON.stringify(text)} by ${via}: the shot was taken (one link)`).toBe(1);
      expect(after[0]).toMatch(h.LINK_RE);
      expect(after, `ROW-051 ${JSON.stringify(text)} by ${via}: a new link`).not.toEqual(before);
    }
  }
  // The fresh variant and a rejected input: accepted or not, nothing decoded appears.
  for (const text of inputs.slice(2)) {
    for (const via of VIAS) await shootUndecoded(text, via);
  }
});
