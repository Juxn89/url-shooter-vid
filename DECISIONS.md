# URL Shooter — DECISIONS

Append-only, except labels and replaced-by marks. One line per decision.
Trigger (law in CLAUDE.md): the choice picked between plausible
alternatives, constrains future code, or would surprise a competent
newcomer. Entries without an `| enforced:` ref, or without a label, are
rejected at commit.

Format:

    - **D-NNN** <what> | why: <why> | enforced: <test/hook ref, or "convention"> | applies-to: <ids and codes> [| origin: proposal] [| model: <id>]
    - **D-NNN** <what> | why: <why> | enforced: <test/hook ref, or "convention"> | scope: project [| origin: proposal] [| model: <id>]

## Log

- **D-001** The product is one static index.html with plain JavaScript in classic script tags (app/shooter.js, app/page.js), no build step and no ES modules, so it works opened straight from disk | why: the seed asks for vanilla JavaScript, no framework, a single page, run locally (CON-001); Chrome blocks module scripts over file://, so classic scripts keep double-click opening working | enforced: checks/conformance.sh (vid-forbidden) | scope: project | origin: proposal
- **D-002** Chrome is the only browser: tests run Playwright with Chromium only, no Firefox or WebKit projects | why: owner hint given at the first sign-off, outside the PRD; no product rule depends on other browsers | enforced: convention | scope: project
- **D-003** No hosting: the app is never deployed; access none, spend cap 0, no outside services, no email | why: the seed says run in local, a demo not a production app; the owner confirmed none for every hosting question and a cap of 0 | enforced: ARCHITECTURE.md vid-hosting block | scope: project
- **D-004** The test harness is Node with Playwright driving Chromium inside Docker, loading index.html over file:// | why: every rule is observable only in a real browser page (focus, Enter key, live region, no reload), and file:// is how the demo runs | enforced: convention | scope: project | origin: proposal
- **D-005** Release downtime tolerance is not applicable: there is no database and no deployment | why: the hosting question set asks it of every project; the answer follows from D-003 | enforced: convention | scope: project | origin: proposal
- **D-006** The address check is one regular expression in app/shooter.js exposed as Shooter.isWebAddress, and the code maker takes its random source as a parameter so a test can force a repeat | why: A-006 asks for a regex; REQ-011 needs a forced repeated draw to be testable through the public surface | enforced: convention | applies-to: REQ-007, REQ-011 | origin: proposal
- **D-007** Run budget defaults in .vid/budget: stacks=1, memory-headroom-mb=11225, claims-per-slice=60, wall-hours-per-slice=8, court-seconds=300, builder-context-tokens=400000 | why: the owner set no budget; these are ViD's defaults, with headroom read from this machine's free memory | enforced: .vid/budget | scope: project | origin: proposal | about: vid-settings
- **D-008** The code maker draws one crypto.getRandomValues call on a Uint8Array per draw, one byte per code character (6 bytes for 6 characters), maps a byte below 248 to the alphabet A-Z, a-z, 0-9 by byte modulo 62, and redraws any byte of 248 or more | why: REQ-002 sets the source and alphabet but no byte layout; ROW-007 needs a fixed layout to observe that the bytes decide the code, and rejection above 247 keeps the 62 characters equally likely | enforced: convention | applies-to: REQ-002, ROW-007 | origin: proposal
- **D-009** The page's element ids are the test contract: the field #url-input with label[for=url-input], the button #shoot-button, the result area #result; every test reaches them through the harness client | why: one stable convention lets every ledger test find the controls without reading the product's code (CLAUDE.md behaviour-keying) | enforced: convention | applies-to: REQ-001, REQ-003, REQ-004, REQ-005, REQ-010, app | origin: proposal
- **D-010** The extractor set: routes.sh (route table), results.sh (JUnit reader), dead-path.collected-fields.sh and dead-path.topology.sh (dead-path class), memory.sh (memory reader), vacuity.ledger.sh (vacuity, report-only), strength.ledger.sh (strength, report-only); no divergence or reachability extractor, since the product has one page and no configuration knobs | why: generated from the skeleton for a single static page | enforced: checks/selftest/cases/ext-routes.sh | scope: project | origin: proposal
- **D-011** localStorage, sessionStorage and Math.random leave the forbidden-word list; the page is still held to both choices by ROW-007, ROW-042 and BASELINE's stack table | why: the owner's ruling, since the ledger tests must name those words to prove they are unused | enforced: tests/invariants/row-006-007-req-002-random-code.spec.js | applies-to: REQ-002, REQ-008, ROW-007, ROW-042
