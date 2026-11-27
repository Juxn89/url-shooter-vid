# URL Shooter — ARCHITECTURE

The seam table. One row per module. Updated in the same commit as any seam
change (law in CLAUDE.md). This table is EXECUTED, not descriptive: it is the
import court's rule source (checks/imports.sh reads it at every commit). A
module with no row cannot be imported; a row that lies fails the build.

Import court: enforce

## Column contract (machine-read — keep the shapes exact)

- **Module** — the module's repo path; `/src/` segments in real file paths are collapsed when matching.
- **Public surface** — leads with the module's import specifier(s) in
  backticks; prose may follow. Importing any path DEEPER than a declared
  specifier is a violation.
- **Dependents** — comma-separated Module paths that may import this module,
  or `all`, or `none`.

| Module | Responsibility | Owned tables/data | Public surface | Dependents |
|---|---|---|---|---|
| app | The whole product: the address check, the code, the no-repeat memory (`app/shooter.js`), and the page wiring of field, button and result (`app/page.js`), loaded by `index.html` as classic scripts | the set of codes shown in this page load (memory only) | `app/shooter.js` — `Shooter.isWebAddress(text)`, `Shooter.makeLink(randomSource)`; `app/page.js` — wires the page, no exports | tests/invariants |

Laws:

- A module without a row here should not be committed to — add the row in the
  same commit.
- Cross-module access goes through the public-surface column only.
- The dependents column is the blast-radius map: a fix in module X re-grades
  X plus its declared dependents, not the whole product (/vid fix law).

External boundaries: none. The page talks to no service over the network
(A-001: the link never redirects; no server).

## Where it runs

```vid-hosting
platform: none
region: none
staging: none
production: none
sending: none
spend-cap: 0
access: none
dns-access: none
owner-only: none
providers: none
```
