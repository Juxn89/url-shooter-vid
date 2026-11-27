# URL Shooter — BASELINE

One page: what the stack IS, what it is NOT, and the rows that must never break.

## Stack

| Layer | Choice | FORBIDDEN alternatives (named) |
|---|---|---|
| Page | One static `index.html`, opened directly from disk (file://) | any server-rendered page, Next.js, a static-site generator, a bundler (webpack, Vite, Parcel) |
| Language | Plain JavaScript (ES2020) in classic `<script>` tags, no build step | TypeScript, React, Vue, Angular, Svelte, Preact, jQuery, any npm runtime dependency |
| Randomness | `crypto.getRandomValues` (A-015) | `Math.random`, a counter, a hash of the address |
| Address check | One regular expression in `app/shooter.js` (A-006, A-009, A-018 to A-020) | `new URL()` parsing as the check, a validation library, the browser's `type=url` validation |
| Storage | None: state lives in page memory for one page load (A-014) | localStorage, sessionStorage, IndexedDB, cookies |
| Styling | Browser defaults (no design) | Tailwind, Bootstrap, any CSS framework |
| Browser | Chrome only (owner hint) | Firefox, Safari/WebKit as test targets |
| Test harness | Node with Playwright driving Chromium, inside Docker | Cypress, Selenium, Puppeteer, jsdom-only tests, Firefox/WebKit projects |
| Hosting | None: local only, never deployed | any hosting platform |

## Module seams & data ownership

The seam table lives in ARCHITECTURE.md. Ownership law: each table/data store
is written by exactly one module; everyone else goes through that module's
public surface. The only data is the set of codes shown in this page load,
owned by `app`.

## Tier-0 rows

The PRD holds no T0 item: nothing in this local demo stores, sends or protects data.

| Rule | Meaning |
|---|---|
| none | no T0 item exists in the ratified PRD |

## Test environment

The ledger runs ONLY inside Docker: `sh checks/test.sh` → docker compose -f
docker-compose.test.yml. No test process ever receives real credentials.

## Owner hints (verbatim)

- Design: none given ("skip"); the seed says "no designe".
- Architecture/stack: none given ("Skip"); the seed says "use javascript vanilla, no js framework, a single page"; separately: "If you need a browser, only use chrome".

## Machine blocks

Parsed by checks/conformance.sh at every commit. Extensions space- or
newline-separated. Forbidden terms one per line: dependency/import names that
must never appear in staged source additions — pick tokens that will not
legitimately occur in code or config otherwise.

```vid-allowed-extensions
.md .html .js .json .yml .yaml .sh .txt .css
```

```vid-forbidden
react
vue
@angular
jquery
svelte
preact
cypress
selenium
puppeteer
```
