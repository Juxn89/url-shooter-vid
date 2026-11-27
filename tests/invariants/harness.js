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
