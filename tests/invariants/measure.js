// Purpose: the measure module — the one driver that reads computed properties of elements on a loaded page, in one evaluate (no design/ exists yet; kept for the surface instrument's contract).
// Provenance: hand-authored
'use strict';

/**
 * Reads, in ONE evaluate on the already-loaded page, the computed style properties named for each selector.
 * spec: { <selector>: [<css property>, ...] }. Returns { <selector>: { <property>: <value> } | 'missing element' }.
 * It never navigates.
 */
async function measure(page, spec) {
  return page.evaluate((s) => {
    const out = {};
    for (const [sel, props] of Object.entries(s)) {
      const el = document.querySelector(sel);
      if (!el) { out[sel] = 'missing element'; continue; }
      const cs = getComputedStyle(el);
      const vals = {};
      for (const p of props) vals[p] = cs.getPropertyValue(p);
      out[sel] = vals;
    }
    return out;
  }, spec);
}

module.exports = { measure };
