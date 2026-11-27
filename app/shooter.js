// Purpose: the product logic of URL Shooter — the address check, the random code and the no-repeat memory (REQ-001, REQ-002, REQ-007, REQ-008, REQ-011).
// Loaded as a classic script (D-001); its public surface is window.Shooter (ARCHITECTURE.md seam table, D-006).
(function (global) {
  'use strict';

  // REQ-001, REQ-002: the 62 code characters, in byte order: A-Z, a-z, 0-9 (D-008).
  var ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var PREFIX = 'https://shooter.app/';
  var CODE_LENGTH = 6;
  // D-008: bytes 248..255 are redrawn so each of the 62 characters is equally likely (248 = 4 x 62).
  var BYTE_LIMIT = 248;

  // REQ-007: one regular expression for the whole trimmed input — http:// or https:// in any letter case, a host of
  // at least two dot-separated labels of ASCII letters, digits and inner hyphens (no trailing dot, no port, no user
  // name), then an optional path, query or anchor of visible ASCII characters only (D-012). Each part has exactly one
  // way to match, so a near miss is refused in linear time (ROW-024): no nested ambiguous quantifiers.
  var WEB_ADDRESS = /^https?:\/\/[a-z0-9]+(?:-+[a-z0-9]+)*(?:\.[a-z0-9]+(?:-+[a-z0-9]+)*)+(?:[\/?#][!-~]*)?$/i;

  // REQ-007: only spaces, tabs and line breaks around the address are trimmed; anything else stays and is judged.
  function isEdgeSpace(ch) {
    return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r';
  }

  // REQ-007: trims by index scanning, linear on any input length (ROW-024).
  function trimEdges(text) {
    var start = 0;
    var end = text.length;
    while (start < end && isEdgeSpace(text.charAt(start))) start++;
    while (end > start && isEdgeSpace(text.charAt(end - 1))) end--;
    return text.slice(start, end);
  }

  // REQ-008, REQ-011: every code shown in this page load (memory only; a reload starts fresh, ROW-042).
  var shownCodes = new Set();

  // REQ-002: the browser's cryptographic random source, read at call time (A-015).
  function cryptoSource(bytes) {
    return global.crypto.getRandomValues(bytes);
  }

  // REQ-002, D-008: one draw — one call for 6 bytes, a byte below 248 maps by modulo 62, a byte of 248 or more is
  // redrawn on its own until it falls below 248.
  function drawCode(randomSource) {
    var bytes = new Uint8Array(CODE_LENGTH);
    randomSource(bytes);
    var code = '';
    for (var i = 0; i < CODE_LENGTH; i++) {
      var b = bytes[i];
      while (b >= BYTE_LIMIT) {
        var one = new Uint8Array(1);
        randomSource(one);
        b = one[0];
      }
      code += ALPHABET.charAt(b % ALPHABET.length);
    }
    return code;
  }

  var Shooter = {
    // REQ-007: true only when the whole input, once trimmed of surrounding spaces, tabs and line breaks, is a web address.
    isWebAddress: function (text) {
      if (typeof text !== 'string') return false;
      return WEB_ADDRESS.test(trimEdges(text));
    },
    // REQ-001, REQ-008, REQ-011: a short link whose code was never returned before in this page load; a drawn code
    // that clashes with an earlier one is replaced by a fresh draw before it is returned. randomSource fills a
    // Uint8Array (crypto.getRandomValues by default, D-006).
    makeLink: function (randomSource) {
      var source = typeof randomSource === 'function' ? randomSource : cryptoSource;
      var code = drawCode(source);
      while (shownCodes.has(code)) code = drawCode(source);
      shownCodes.add(code);
      return PREFIX + code;
    }
  };
  global.Shooter = Shooter;
})(window);
