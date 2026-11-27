// Purpose: ledger tests for REQ-010's page-level accessibility — English language and title, names that contain the visible words, a button always in the keyboard path (ROW-034, ROW-039, ROW-040).
// Provenance: hand-authored
// Rows served: ROW-034, ROW-039, ROW-040 (REQ-010). Element ids are D-009, reached through the harness client.
'use strict';
const { test, expect } = require('@playwright/test');
const h = require('./harness');

/** Escapes text for use inside a RegExp. */
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Collapses runs of whitespace and trims — the visible words as a reader hears them. */
const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

// ROW-034 promise: the page declares its language as English (lang en on the html element) and has a non-empty
//   English title (REQ-010 "anyone using a screen reader can follow the demo"; CLAUDE.md "English only").
// ROW-034 wrong product: an index.html without lang (the reader guesses, often the user's own language) or with
//   lang="es" left from a template, or with an empty <title> (the tab and the reader say "index.html").
// ROW-034 given, when, then: given the page just loaded from disk; when <html lang> and document.title are read; then
//   lang's primary subtag is "en", and the title, trimmed, is non-empty, holds at least one letter, and is made of
//   printable ASCII only. Limit, stated: an English word list is not used, so a title in another language written in
//   plain ASCII letters is not separated here.
// ROW-034 controls: the control case shows the page read is the product, opened from disk (the field and button D-009
//   names are present) — a page without lang or title still passes it.
// ROW-034 technique: exact attribute value on one exact element (the root), no fallback to any other element's lang.
// cases: ROW-034 target=tests/invariants/row-034-req-010-names-and-keyboard.spec.js::ROW-034_REQ-010_html_lang_is_en_and_title_is_non_empty_english control=tests/invariants/row-034-req-010-names-and-keyboard.spec.js::ROW-034_control_page_is_the_product
test('ROW-034_REQ-010_html_lang_is_en_and_title_is_non_empty_english', async ({ page }) => {
  await h.openPage(page, 'file');
  const lang = await page.evaluate(() => document.documentElement.getAttribute('lang'));
  expect(lang, 'ROW-034: <html> must carry a lang attribute').not.toBeNull();
  expect(lang.trim().split('-')[0].toLowerCase(), `ROW-034: <html lang> must be English (en), got "${lang}"`).toBe('en');
  const title = (await page.title()).trim();
  expect(title, 'ROW-034: the page must have a non-empty title').not.toBe('');
  expect(title, 'ROW-034: the title must hold at least one letter').toMatch(/[A-Za-z]/);
  expect(title, `ROW-034: the title must be plain English text (printable ASCII), got "${title}"`).toMatch(/^[\x20-\x7E]+$/);
  expect(title.toLowerCase(), 'ROW-034: the title must not be the file name').not.toBe('index.html');
});

test('ROW-034_control_page_is_the_product', async ({ page }) => {
  await h.openPage(page, 'file');
  expect(page.url(), 'ROW-034 control: the page is opened from disk').toMatch(/^file:\/\//);
  await expect(page.locator(h.SEL.field), 'ROW-034 control: the field must be on the page').toHaveCount(1);
  await expect(page.locator(h.SEL.button), 'ROW-034 control: the button must be on the page').toHaveCount(1);
});

// ROW-039 promise: each control's computed accessible name contains its visible words — the button's name contains
//   its visible text and the field's name contains its visible label text (REQ-010 fail-if (1)(2); A-017 "a visible
//   text label tied to it, the button has visible text").
// ROW-039 wrong product: the button shows "Shoot" but carries aria-label="Submit", so a voice-control user saying
//   "click Shoot" gets nothing; or the field's visible label reads "Web address" while aria-label="url" (or an
//   aria-labelledby to a hidden span) overrides it.
// ROW-039 given, when, then: given the page from disk; when the button's rendered text and label[for=url-input]'s
//   rendered text are read (both visible, both non-empty), and the browser engine's computed accessible name of
//   #shoot-button and #url-input is read; then each name contains its visible text, whitespace collapsed, ignoring
//   letter case.
// ROW-039 controls: the visible texts are asserted non-empty and visible (a "contains ''" would pass anything); the
//   control case shows the name reader is not blind — on the loaded page, a scratch button with aria-label "Other"
//   and visible text "Go" reads the name "Other".
// ROW-039 technique: the engine's accessible-name computation (Playwright toHaveAccessibleName), compared against the
//   visible text read from the same page — no name is computed by the test.
// cases: ROW-039 target=tests/invariants/row-034-req-010-names-and-keyboard.spec.js::ROW-039_REQ-010_button_and_field_accessible_names_contain_their_visible_words control=tests/invariants/row-034-req-010-names-and-keyboard.spec.js::ROW-039_control_accessible_name_reader_sees_an_aria_label_override
test('ROW-039_REQ-010_button_and_field_accessible_names_contain_their_visible_words', async ({ page }) => {
  await h.openPage(page, 'file');
  const button = page.locator(h.SEL.button);
  const field = page.locator(h.SEL.field);
  const label = page.locator(h.SEL.label);
  await expect(button, 'ROW-039: #shoot-button must be visible').toBeVisible();
  await expect(label.first(), 'ROW-039: label[for=url-input] must be visible').toBeVisible();
  const buttonText = norm(await button.innerText());
  const labelText = norm(await label.first().innerText());
  expect(buttonText, 'ROW-039: the button must show visible text').not.toBe('');
  expect(labelText, 'ROW-039: the field label must show visible text').not.toBe('');
  await expect(button, `ROW-039: the button's accessible name must contain its visible text "${buttonText}"`)
    .toHaveAccessibleName(new RegExp(esc(buttonText).replace(/ /g, '\\s+'), 'i'));
  await expect(field, `ROW-039: the field's accessible name must contain its visible label text "${labelText}"`)
    .toHaveAccessibleName(new RegExp(esc(labelText).replace(/ /g, '\\s+'), 'i'));
});

test('ROW-039_control_accessible_name_reader_sees_an_aria_label_override', async ({ page }) => {
  await h.openPage(page, 'file');
  await expect(page.locator(h.SEL.button), 'ROW-039 control: the button must be on the page').toHaveCount(1);
  const id = h.fresh('b');
  await page.evaluate((i) => {
    const b = document.createElement('button');
    b.id = i; b.textContent = 'Go'; b.setAttribute('aria-label', 'Other');
    document.body.appendChild(b);
  }, id);
  await expect(page.locator('#' + id)).toHaveAccessibleName('Other');
  await expect(page.locator('#' + id)).not.toHaveAccessibleName(/Go/);
});

// ROW-040 promise: the button is never disabled or taken out of the keyboard path — with the field empty, and again
//   holding hello, Tab from the field lands on the button and it reports neither disabled nor aria-disabled (REQ-010,
//   with REQ-006: an invalid entry is met by silence, not by a greyed control).
// ROW-040 wrong product: the common "disable submit until the input is valid" — <button disabled> while the field is
//   empty or invalid (Tab skips a disabled button, so focus leaves the page) — or aria-disabled="true", or
//   tabindex="-1" on the button.
// ROW-040 given, when, then: given the page from disk; when the field is emptied (and again filled with hello, which
//   fires the field's input event), focus put in the field and Tab pressed; then focus is on #shoot-button, its
//   disabled property is false and its aria-disabled is absent or not "true".
// ROW-040 controls: the control case puts a valid address in the field and shows Tab lands on an enabled button —
//   the Tab path itself works, so a failure with empty/hello is the disabling.
// ROW-040 technique: the row's two named states (empty, hello) through the real Tab key; exact focused element.
// cases: ROW-040 target=tests/invariants/row-034-req-010-names-and-keyboard.spec.js::ROW-040_REQ-010_button_stays_enabled_and_tab_reachable_with_empty_field_and_hello control=tests/invariants/row-034-req-010-names-and-keyboard.spec.js::ROW-040_control_tab_from_field_with_valid_address_lands_on_enabled_button
async function tabToButtonState(page, text) {
  await h.typeInto(page, text);
  await page.focus(h.SEL.field);
  expect(await h.focusedId(page), `ROW-040 (${JSON.stringify(text)}): focus must start in the field`).toBe('url-input');
  await page.keyboard.press('Tab');
  return page.evaluate((sel) => {
    const b = document.querySelector(sel);
    const a = document.activeElement;
    return {
      focused: a && a !== document.body ? a.id || a.tagName : null,
      disabled: b ? b.disabled === true || b.matches(':disabled') : null,
      ariaDisabled: b ? (b.getAttribute('aria-disabled') || '').trim().toLowerCase() : null,
    };
  }, h.SEL.button);
}

test('ROW-040_REQ-010_button_stays_enabled_and_tab_reachable_with_empty_field_and_hello', async ({ page }) => {
  await h.openPage(page, 'file');
  for (const text of ['', 'hello']) {
    const s = await tabToButtonState(page, text);
    const what = text === '' ? 'with the field empty' : 'with the field holding hello';
    expect(s.focused, `ROW-040: ${what}, Tab from the field must land on #shoot-button`).toBe('shoot-button');
    expect(s.disabled, `ROW-040: ${what}, the button must not be disabled`).toBe(false);
    expect(s.ariaDisabled, `ROW-040: ${what}, the button must not be aria-disabled`).not.toBe('true');
  }
});

test('ROW-040_control_tab_from_field_with_valid_address_lands_on_enabled_button', async ({ page }) => {
  await h.openPage(page, 'file');
  const s = await tabToButtonState(page, `https://example.com/${h.fresh('p')}`);
  expect(s.focused, 'ROW-040 control: with a valid address, Tab from the field must land on #shoot-button').toBe('shoot-button');
  expect(s.disabled, 'ROW-040 control: with a valid address the button must be enabled').toBe(false);
});
