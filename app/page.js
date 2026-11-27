// Purpose: wires the page — field, button and result area — to the Shooter logic (REQ-001, REQ-003, REQ-004, REQ-005, REQ-006, REQ-009, REQ-012).
// Loaded as a classic script after app/shooter.js (D-001); element ids are D-009.
(function () {
  'use strict';
  var field = document.getElementById('url-input');
  var button = document.getElementById('shoot-button');
  var result = document.getElementById('result');

  // REQ-001, REQ-006: one shot. A rejected input changes nothing — no link, no message, the field and focus left as
  // they are. A valid one replaces the shown link (REQ-003), empties the field and puts focus back in it (REQ-004).
  function shoot() {
    if (!Shooter.isWebAddress(field.value)) return;
    // REQ-009, REQ-003: the link is set as plain text in one step — never markup, never an anchor; the whole content
    // is replaced at once so the polite live region announces it whole (REQ-010).
    result.textContent = Shooter.makeLink();
    field.value = '';
    field.focus();
  }

  // REQ-005: the button is a real <button type="button">: a click, Space or Enter on it shoots, and it never submits.
  button.addEventListener('click', function () {
    shoot();
  });

  // REQ-005: Enter in the field does what the button does, once per press — a held key's repeats are ignored (ROW-044).
  field.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter' || event.isComposing) return;
    event.preventDefault();
    if (event.repeat) return;
    shoot();
  });

  // REQ-012: focus is in the field as the page opens, so the first address can be typed at once.
  field.focus();
})();
