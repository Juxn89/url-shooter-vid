// Purpose: the harness client — the one door every ledger test uses to reach URL Shooter (no actor kinds: the page has no sign-in).
// Provenance: hand-authored
// Contract: element ids are D-009 (#url-input with label[for=url-input], #shoot-button, #result). The page is opened
// from disk (file:// under VID_FILE_ROOT, as the owner runs it) or over the product service (VID_PRODUCT_URL).
// Every helper reads the page through its public surface (the DOM a user sees, the browser's own events); none reads
// application source. Readiness is awaited by polling a condition, never by a fixed sleep.
// Actor kinds: anonymous only (the page has no sign-in). Deployed shape: none (the product ships no process beside
// the page), so a journey test's deployed-selector is none.
'use strict';
const path = require('path');
const { randomUUID } = require('crypto');

/** Base URL of the product service, reached over the network by its service name (never an in-process server). */
const PRODUCT_URL = process.env.VID_PRODUCT_URL || 'http://product:80';
/** Folder holding the product's files as the owner opens them from disk (the read-only checkout mount). */
const FILE_ROOT = process.env.VID_FILE_ROOT || '/app';

/** The page's element conventions (D-009): every test finds the controls by these ids. */
const SEL = { field: '#url-input', button: '#shoot-button', result: '#result', label: 'label[for="url-input"]' };

/** The short-link shape REQ-001 promises: exactly the prefix and exactly 6 letters or digits, nothing else. */
const LINK_RE = /^https:\/\/shooter\.app\/[A-Za-z0-9]{6}$/;

/** A fresh value, unique per call and per run, for probes and sentinels no product can hard-code. */
function fresh(tag = 'v') {
  return `${tag}${Date.now().toString(36)}${randomUUID().replace(/-/g, '').slice(0, 10)}`;
}

/** The file:// address of index.html as the owner opens it from disk. */
function fileUrl() {
  return 'file://' + path.join(FILE_ROOT, 'index.html');
}

/** Opens the page. how: 'file' (index.html straight from disk, as the owner runs it) or 'http' (the product service). */
async function openPage(page, how = 'file') {
  const url = how === 'file' ? fileUrl() : PRODUCT_URL + '/index.html';
  await page.goto(url, { waitUntil: 'load' });
  return url;
}

/** Puts text in the field exactly as given (fill replaces what was there). */
async function typeInto(page, text) {
  await page.fill(SEL.field, text);
}

/** One shot through the real control. via: 'button' (click) or 'enter' (Enter pressed in the field). */
async function shoot(page, text, via = 'button') {
  if (text !== undefined) await typeInto(page, text);
  if (via === 'enter') await page.press(SEL.field, 'Enter');
  else await page.click(SEL.button);
}

/** The result area's text, trimmed. */
async function resultText(page) {
  return ((await page.textContent(SEL.result)) || '').trim();
}

/** The field's current value. */
async function fieldValue(page) {
  return page.inputValue(SEL.field);
}

/** True when keyboard focus is on the field. */
async function fieldFocused(page) {
  return page.evaluate((sel) => document.activeElement === document.querySelector(sel), SEL.field);
}

/**
 * Every whitespace-separated token of text that mentions shooter.app — the whole token, so a wrong prefix
 * (http://, www.) or a wrong code length is kept in the token and fails LINK_RE instead of being cut to fit.
 */
function linkTokens(text) {
  return (text || '').split(/\s+/).filter((t) => t.toLowerCase().includes('shooter.app'));
}

/** The link tokens in the result area's text. */
async function resultLinks(page) {
  return linkTokens(await page.textContent(SEL.result));
}

/** The link tokens anywhere the user can see on the page (body innerText: rendered, visible text only). */
async function visibleLinks(page) {
  return linkTokens(await page.evaluate(() => document.body.innerText));
}

/**
 * Waits (bounded) until the result area holds link tokens that differ from `before`, then lets the page settle.
 * A timeout is not an error here: the caller's assertions on the result name what is missing.
 */
async function waitForResultChange(page, before, timeout = 5000) {
  const want = JSON.stringify(before);
  await page.waitForFunction(
    ([sel, w]) => {
      const el = document.querySelector(sel);
      const toks = ((el && el.textContent) || '').split(/\s+/).filter((t) => t.toLowerCase().includes('shooter.app'));
      return toks.length > 0 && JSON.stringify(toks) !== w ? toks : null;
    },
    [SEL.result, want],
    { timeout },
  ).catch(() => null);
  await settle(page);
}

/**
 * Geometry of the shown link against the field: the box of the text inside #result that carries the link,
 * and the field's box. null when #result holds no such text node.
 */
async function linkBox(page) {
  return page.evaluate(([fieldSel, resultSel]) => {
    const field = document.querySelector(fieldSel);
    const result = document.querySelector(resultSel);
    if (!field || !result) return null;
    const walker = document.createTreeWalker(result, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent.toLowerCase().includes('shooter.app')) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const r = range.getBoundingClientRect();
        const f = field.getBoundingClientRect();
        return { linkTop: r.top, linkHeight: r.height, linkWidth: r.width, fieldBottom: f.bottom };
      }
    }
    return null;
  }, [SEL.field, SEL.result]);
}

/** Marks the live document with a fresh value; a reload or a navigation wipes it (see sentinelIntact). */
async function plantSentinel(page) {
  const v = fresh('s');
  await page.evaluate((x) => { window.__vidSentinel = x; }, v);
  return v;
}

/** True when the document still carries the sentinel planted earlier — no reload, no navigation since. */
async function sentinelIntact(page, v) {
  return page.evaluate((x) => window.__vidSentinel === x, v);
}

/**
 * Collects, from the moment it is called: console errors, uncaught page errors, and requests that failed (a script
 * or stylesheet the page names but cannot load — e.g. one Chrome refuses over file://). Call it before openPage.
 */
function collectErrors(page) {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${String(e)}`));
  page.on('requestfailed', (r) => errors.push(`requestfailed: ${r.url()} ${(r.failure() || {}).errorText || ''}`));
  return errors;
}

/**
 * Records every request that leaves the page — any scheme but the local ones (file:, data:, blob:, about:,
 * chrome-extension:) — and every WebSocket, from the moment it is called, across the whole browser context (frames
 * and workers included). The URLs are recorded as the browser reports them, i.e. normalised (a default port such as
 * :80 is dropped): match them by a fresh token (seenWith), never by the URL string the test built.
 */
function watchOutbound(context) {
  const out = [];
  const local = /^(file|data|blob|about|chrome-extension):/i;
  context.on('request', (r) => { if (!local.test(r.url())) out.push(r.url()); });
  context.on('page', (p) => p.on('websocket', (ws) => out.push(ws.url())));
  for (const p of context.pages()) p.on('websocket', (ws) => out.push(ws.url()));
  return out;
}

/** True when some recorded outbound URL carries the fresh token. */
function seenWith(outbound, token) {
  return outbound.some((u) => u.includes(token));
}

/** Records every main-frame navigation of the page from the moment it is called (a reload counts). */
function watchNavigations(page) {
  const navs = [];
  page.on('framenavigated', (f) => { if (f === page.mainFrame()) navs.push(f.url()); });
  return navs;
}

/** Lets the page finish the work a press started: two animation frames and a macrotask (a readiness wait, not a sleep). */
async function settle(page) {
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 0)))));
}

/** Waits (bounded) until the page has had no network activity for 500 ms — so a late request would have been seen. */
async function quietNetwork(page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/** Replaces crypto.getRandomValues before the page's scripts run: bytesFor(callIndex, length) returns the bytes of each call. */
async function stubRandom(page, bytesForSource) {
  await page.addInitScript(`(() => {
    const bytesFor = ${bytesForSource};
    let call = 0;
    const real = crypto.getRandomValues.bind(crypto);
    crypto.getRandomValues = function (arr) {
      const b = bytesFor(call++, arr.length);
      if (!b) return real(arr);
      for (let i = 0; i < arr.length; i++) arr[i] = b[i % b.length];
      return arr;
    };
  })();`);
}

module.exports = {
  PRODUCT_URL, FILE_ROOT, SEL, LINK_RE, fresh, fileUrl, openPage, typeInto, shoot, resultText, fieldValue, fieldFocused,
  linkTokens, resultLinks, visibleLinks, waitForResultChange, linkBox, plantSentinel, sentinelIntact, collectErrors,
  watchOutbound, seenWith, watchNavigations, settle, quietNetwork, stubRandom,
};

// ---- Added by test-author (slice 0, brief test-author-5): helpers shared by the REQ-005 and REQ-010 press rows. ----

/**
 * Starts recording, on the already-loaded page, every change of the result area's text. Each time a MutationObserver
 * delivery runs — after every event listener the browser calls, so two listeners answering one press are seen
 * apart — the trimmed text of the element now at #result is read and kept when it differs from the last kept value.
 * It observes the whole document, so a product that swaps the #result element for a new one is still seen. A reload
 * or a navigation wipes the record (resultTextLog then answers null).
 */
async function watchResultText(page) {
  await page.evaluate((sel) => {
    const read = () => { const el = document.querySelector(sel); return el ? el.textContent.trim() : null; };
    const log = [];
    let last = read();
    window.__vidResultLog = log;
    new MutationObserver(() => {
      const t = read();
      if (t !== last) { last = t; log.push(t); }
    }).observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: false });
  }, SEL.result);
}

/** The result-area texts recorded since watchResultText, in order (one entry per change); null when not recording. */
async function resultTextLog(page) {
  return page.evaluate(() => (Array.isArray(window.__vidResultLog) ? window.__vidResultLog.slice() : null));
}

/** Waits (bounded) until at least n result-area changes are recorded, then lets the page settle. A timeout is no error. */
async function waitForResultTextCount(page, n, timeout = 5000) {
  await page.waitForFunction(
    (k) => Array.isArray(window.__vidResultLog) && window.__vidResultLog.length >= k, n, { timeout },
  ).catch(() => null);
  await settle(page);
}

/** The id of the element holding keyboard focus ('' for an element without id, null for none/body). */
async function focusedId(page) {
  return page.evaluate(() => {
    const a = document.activeElement;
    return a && a !== document.body ? a.id || '' : null;
  });
}

Object.assign(module.exports, { watchResultText, resultTextLog, waitForResultTextCount, focusedId });

// ---- Added by test-author (slice 0, brief test-author-4): helpers shared by the REQ-002, REQ-008 and REQ-011 rows. ----

/**
 * Replaces crypto.getRandomValues, before the page's scripts run, with a byte stream: each call first gets the
 * page's real random bytes, then has its leading bytes overwritten from the queue's head (the array's own bytes,
 * whatever its element type) until the queue is empty — so the bytes queued are exactly the next bytes the page
 * draws, and every byte after them varies. window.__vidRandom = { queue, served, calls, requested } shows what
 * the page drew: served counts queued bytes handed out, requested every byte asked for.
 */
async function stubRandomQueue(page, firstBytes = []) {
  await page.addInitScript((first) => {
    const real = crypto.getRandomValues.bind(crypto);
    const state = { queue: first.slice(), served: 0, calls: 0, requested: 0 };
    window.__vidRandom = state;
    crypto.getRandomValues = function getRandomValues(arr) {
      real(arr);
      state.calls++;
      const view = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
      state.requested += view.length;
      for (let i = 0; i < view.length && state.queue.length; i++) { view[i] = state.queue.shift(); state.served++; }
      return arr;
    };
  }, firstBytes);
}

/** Puts bytes at the end of the queue stubRandomQueue installed (on the already-loaded page): the page's next draws get them. */
async function queueRandomBytes(page, bytes) {
  await page.evaluate((b) => { window.__vidRandom.queue.push(...b); }, bytes);
}

/** What the page drew from the stubbed source: { queued, served, calls, requested }; null when no stub is installed. */
async function randomState(page) {
  return page.evaluate(() => {
    const s = window.__vidRandom;
    return s ? { queued: s.queue.length, served: s.served, calls: s.calls, requested: s.requested } : null;
  });
}

/**
 * Many shots in one page load, fast, through the page's own controls: for each address, the field's value is set
 * through its native setter with an input event, the button's click() is called, and the shot waits (bounded,
 * per animation frame, never a fixed sleep) until the result area holds link tokens that differ from the ones it
 * held before. Returns one { address, links, changed } per shot taken; stops early after `stopAfter` shots in a
 * row that changed nothing, so a product that repeats or shows nothing ends the loop quickly instead of hanging.
 */
async function shootMany(page, addresses, { perShot = 1000, stopAfter = 3 } = {}) {
  return page.evaluate(async ([sel, addrs, limit, stopN]) => {
    const tokens = () => {
      const el = document.querySelector(sel.result);
      return ((el && el.textContent) || '').split(/\s+/).filter((t) => t.toLowerCase().includes('shooter.app'));
    };
    const frame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
    const shots = [];
    let still = 0;
    for (const a of addrs) {
      const field = document.querySelector(sel.field);
      const button = document.querySelector(sel.button);
      const before = JSON.stringify(tokens());
      Object.getOwnPropertyDescriptor(Object.getPrototypeOf(field), 'value').set.call(field, a);
      field.dispatchEvent(new Event('input', { bubbles: true }));
      button.click();
      const t0 = performance.now();
      let now = tokens();
      while (!(now.length > 0 && JSON.stringify(now) !== before) && performance.now() - t0 < limit) {
        await frame();
        now = tokens();
      }
      const changed = now.length > 0 && JSON.stringify(now) !== before;
      shots.push({ address: a, links: now, changed });
      if (changed) still = 0; else if (++still >= stopN) break;
    }
    return shots;
  }, [SEL, addresses, perShot, stopAfter]);
}

Object.assign(module.exports, { stubRandomQueue, queueRandomBytes, randomState, shootMany });

// ---- Added by test-author (slice 0, brief test-author-3): helpers shared by the REQ-006, REQ-007 and REQ-009 rows. ----

/**
 * The page's whole observable state, for "changes nothing" (REQ-006): the URL, the title, the document's markup,
 * the visible and the full text of the body, the element count, the field's value and its browser validity
 * (validationMessage, and validity.valid: what checkValidity() answers, read without firing an invalid event),
 * and the result area's text. Two states compare equal only when nothing a user could see has changed.
 */
async function pageState(page) {
  return page.evaluate((sel) => {
    const f = document.querySelector(sel.field);
    const r = document.querySelector(sel.result);
    return {
      url: location.href,
      title: document.title,
      markup: document.documentElement.outerHTML,
      text: document.body ? document.body.innerText : '',
      allText: document.body ? document.body.textContent : '',
      elements: document.getElementsByTagName('*').length,
      field: f ? f.value : null,
      validationMessage: f ? f.validationMessage : null,
      valid: f ? f.validity.valid : null,
      result: r ? r.textContent : null,
    };
  }, SEL);
}

/**
 * Waits, frame by frame and at most `ms` milliseconds, for the page state to differ from `before`; returns true
 * at the first difference, false when the window closes with nothing changed. A readiness wait for an effect
 * that must not happen: a late (timer- or frame-deferred) change still lands inside the window.
 */
async function stateChangesWithin(page, before, ms = 150) {
  const want = JSON.stringify(before);
  const end = Date.now() + ms;
  do {
    await settle(page);
    if (JSON.stringify(await pageState(page)) !== want) return true;
  } while (Date.now() < end);
  return false;
}

/**
 * One press observed whole: records the state before typing (base), puts text in the field, records the state
 * again (before), presses (via 'button' clicks the button, 'enter' presses Enter in the field), waits up to
 * windowMs for any change, and returns { base, before, after }. Asserts nothing.
 */
async function pressAndObserve(page, text, via = 'button', windowMs = 150) {
  const base = await pageState(page);
  await typeInto(page, text);
  const before = await pageState(page);
  if (via === 'enter') await page.press(SEL.field, 'Enter');
  else await page.click(SEL.button);
  await stateChangesWithin(page, before, windowMs);
  const after = await pageState(page);
  return { base, before, after };
}

/** Records every dialog the page opens (alert, confirm, prompt), from the moment it is called, and dismisses it. */
function watchDialogs(page) {
  const seen = [];
  page.on('dialog', (d) => { seen.push(`${d.type()}: ${d.message()}`); d.dismiss().catch(() => {}); });
  return seen;
}

/**
 * Pastes through the browser's real clipboard: puts text/plain (and text/html when given) on the clipboard, focuses
 * the element at sel, selects its text and presses the paste shortcut, so the browser itself inserts what it takes
 * from the clipboard. The page must be a secure context (file:// is).
 */
async function pasteInto(page, sel, { text, html } = {}) {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.bringToFront();
  await page.focus(sel);
  await page.evaluate(async ([t, hm]) => {
    const parts = { 'text/plain': new Blob([t], { type: 'text/plain' }) };
    if (hm !== null) parts['text/html'] = new Blob([hm], { type: 'text/html' });
    await navigator.clipboard.write([new ClipboardItem(parts)]);
  }, [text, html === undefined ? null : html]);
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.press('ControlOrMeta+V');
  await settle(page);
}

Object.assign(module.exports, { pageState, stateChangesWithin, pressAndObserve, watchDialogs, pasteInto });

// ---- Added by test-author (slice 0, brief test-author-3), second block: observation loops for the REQ-007 rows. ----

/**
 * Shoots each address by each path in vias ('button' | 'enter'), in order, on the already-open page, waiting
 * (bounded) for the result to change after each. Returns one { address, via, before, after, visible } per shot:
 * the result area's link tokens before and after the shot, and the link tokens visible anywhere on the page after.
 * Asserts nothing.
 */
async function shootEach(page, addresses, vias = ['button', 'enter'], timeout = 5000) {
  const shots = [];
  for (const address of addresses) {
    for (const via of vias) {
      const before = await resultLinks(page);
      await shoot(page, address, via);
      await waitForResultChange(page, before, timeout);
      shots.push({ address, via, before, after: await resultLinks(page), visible: await visibleLinks(page) });
    }
  }
  return shots;
}

/**
 * Presses each input by each path in vias on the already-open page, observing each press whole (pressAndObserve).
 * Returns one { text, via, base, before, after, links } per press, links being the result area's link tokens after
 * it. Asserts nothing.
 */
async function pressEach(page, inputs, vias = ['button', 'enter'], windowMs = 150) {
  const presses = [];
  for (const text of inputs) {
    for (const via of vias) {
      const obs = await pressAndObserve(page, text, via, windowMs);
      presses.push({ text, via, ...obs, links: await resultLinks(page) });
    }
  }
  return presses;
}

Object.assign(module.exports, { shootEach, pressEach });
