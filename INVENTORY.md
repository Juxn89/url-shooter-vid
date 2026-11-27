# URL Shooter — TEST INVENTORY

> Ratified at init, same standing as PRD.md: the owner ratified these ROWS —
> what will be verified — before any code existed. Mechanically derived from
> three enumerable sets (PRD requirements + Fail-ifs; design pack @screen
> markers via the resolved design-join table; the scaffold's route table via
> the ratified routes extractor), plus the auth-state × surface axis and the
> genus-row proposals (origin: domain). Rows are generated, never authored;
> only exceptions are hand-touched. Additions during development are
> permitted, never silent — checks/inventory.sh fails a commit whose new
> route has no row here, and every change to this block is a law change:
> a standalone commit, nothing else in it (pre-commit, §4.1). Development is
> "make the ledger green": every row below was materialised as a failing
> ledger test at init (proved red — the red gate), or carries
> `owed: <reason>` until its test can exist.

## Row schema

    ROW-NNN | kind | subject | actor/state | marker | obligation | derived-from | test

- `kind` — `surface` · `journey` · `shell` · `behavior` · `reachability`
- `subject` — route (`/account`, in the scaffold's own literal form), screen
  id, or requirement id
- `actor/state` — `anonymous` · `candidate` · `operator:<role>` · `n/a` ·
  `(process)` (v0.9.3 3.2, R3: a machine journey or a trigger row — the
  product acting on what enters at an external input boundary, with no
  person at a browser)
- `marker` — the design pack marker this row binds to (`P03/expired`), or `n/a`
- `obligation` — one falsifiable sentence a fresh-context grader can check
- `derived-from` — `REQ-NNN` and/or a design marker; never "authored"
- a **journey** row's obligation carries the narrative followed by
  `transitions:` — one numbered item per transition, `<actor> at <state>
  · <entry control> · <action> · <next state> · <observable effect>`
  (v0.9.2 3.5, R8); an `(off_screen)` phase stays in the narrative and is
  no transition. The row is paid per transition, in a real browser,
  operating the real control; setup may reach the starting state through
  the API or a fixture and never performs a transition; the verdict pass
  returns one verdict per transition and the row is KEPT only when every
  transition is.
- a **machine journey** (v0.9.3 3.2, R3) is a journey row with actor
  `(process)`: every external input boundary ARCHITECTURE.md declares
  (feeds, uploads, webhooks, scheduled pulls, inbound mail) × every
  observable consequence the PRD promises for what enters there
  (searchable, matched, notified, exported, expired, deleted); its
  `transitions:` are the stages as the PRD states them (enter · parse ·
  store · index · notify · expire), each with its observable effect; paid
  per stage at the boundary's real entry point, the external party played
  by the harness's fake (itself a `difference` row), never a browser.
- **the deployed population** (v0.9.3 3.3, R4): every row of kind
  `journey`, and every row whose actor is `(process)`, is paid by the close
  run's deployed pass — the product's declared processes running on the
  same image, nothing inline — and that report alone is its receipt (a row
  absent from it is red, whatever the inline report says). Scoped runs stay
  inline.
- `test` — path under tests/invariants/, or `owed: <reason>` (owed rows block
  completion — checks/inventory.sh --strict and checks/coverage.sh --strict).
  One owed reason has its own standing (v0.9.1 3.6): `owed: paid by /vid
  deploy gate <1|2|3> — <what the rung observes>` — a row whose obligation
  can only be observed through something the harness substitutes (a DIF
  row's paying step, a seam with `credentials: not-yet`, a deployed
  worker consuming a schedule). Reported as `deploy-owed`, outside the
  owed gaps; completion requires it present and named, never silently
  absent; it is paid only by that rung's evidence and stamped `| paid-at:
  gate-N <date> <deploy log row>` in a law commit. Any other shape in this
  field is a GAP, never silent — a typo'd path must not exit the evidence
  join.

  **Deferral is a closed vocabulary (v0.9.2 3.2, R3).** Under a block
  whose first line inside the fence is `grammar: 0.9.2` — or `grammar:
  0.9.3`, which carries every 0.9.2 rule — an owed reason
  reads `owed: <class> — <detail>`, the class one of the table below and
  the detail naming the missing dependency and its payment point; a legal
  word alone does not pass, and any other reason is a GAP at every commit
  (`unclassed deferral`, checks/inventory.sh). "Materialised when its
  surface exists", "lands with the screen's slice", "in the slice that
  builds the subject" are not classes: they describe a red test — a test
  against a missing route or marker IS a red test, and is written. A
  block without the line keeps the pre-0.9.2 reading (any reason,
  reported).

  | class | when it is legal | detail must name |
  |---|---|---|
  | `guard-first` | a hostility probe or control sibling whose guard does not exist yet | the protection row; paid in the slice that builds it |
  | `census-armed` | a rule row before any site exists; and a rule row during a sanctioned rule-shaped repair (every enumerated site being guarded — citing a test arms the census at once) | for the repair: `sites being guarded, fix <finding id>`; paid by the owed→path flip once every site is guarded |
  | `probe-capture` | a seam probe awaiting the capture | the seam id; paid before the first client line, or at deploy gate 2 (R15) |
  | `golden-set` | the row awaits its ratified golden set | the fixture path to be ratified |
  | `fixture-source` | a fixture from an external source not yet held | the source; when it is expected |
  | `prerequisite` | a fixture or interface contract the harness lacks (a test-author pass's `unwritable: missing prerequisite`) | what is missing; paid at which slice or boundary |
  | `spec-only` | a row ratified at a spec-only init whose test is not written yet (v0.26.10.9); develop's code skeleton writes it, or, in ticket mode, the ticket that carries it | exactly `first stage`; `ticket` for a row appended under ticket mode |
  | `owner-decision` | the existing visible-debt class | `OQ-n` |
  | `reverted` | **legacy** — written by 0.9.2's develop at the two-attempt bound; 0.9.3 never writes it (a row past the bound stays materialised and is held, below) and an upgraded project keeps the rows it has | the verdict's one-line reason, quoted |
  | `paid by /vid deploy gate <1\|2\|3>` | the v0.9.1 deploy-owed form above, verbatim | what the rung observes (its own `deploy-owed=N` and `paid-at:` semantics, never re-classed) |

  The par (v0.9.2 R4): checks/inventory.sh prints `par: rows=R
  materialised=N legitimate=K (by class) deploy-owed=D other=J` under the
  line, and the red gate fails while `J > 0` or `N + K + D ≠ R` — every
  row is materialised or legitimately deferred, and the count of
  legitimate deferrals is printed at the gate. A surface row may be
  deferred ONLY as `prerequisite` naming a harness fixture the state
  needs and the harness lacks; a missing route, a 404 or a missing
  marker is a failing case of the surface instrument, never a deferral.

**A row's verdicts (v0.9.3 3.6, 3.7; R8–R11).** Under `grammar: 0.9.3` a
materialised row is ledger-tested only when its cases pass in the current
receipt AND its latest verdict is KEPT (`checks/coverage.sh --strict`,
per row, whatever the row derives from). KEPT means the promise holds in
the product AND the test observes it. BREACHED carries its class:
`product` (the product violates the Fail-if), `test` (the test cannot
observe the promise — it asserts what was already true, stops before the
effect, binds the wrong boundary) or `harness` (the instrument failed); a
row whose transitions differ takes `product` if any transition's latest
breach is, else `test`, else `harness`. A `test` or `harness` breach costs
no attempt and leaves the row `unverdicted` until a fresh verdict. Rounds,
attempts and holds are computed from the verdict events by
`checks/metrics.sh`, never written: two `product` rounds since the row's
latest KEPT, reissue or amendment hold it (`reason=bound`), two `test`
rounds likewise (`reason=test`), two `harness` rounds with no harness
repair between them (`reason=harness`). A held row stays materialised —
this field unchanged, no law commit — counts `breached`, is left out of
the automatic claim and waits for the owner; an owner answer
(`reissued`), an amendment, or a KEPT from a fix's blind re-grade releases
it. An amended obligation, or a changed `fail-if:` of the item a row
derives from, wipes the row's verdicts and its attempt history
(`checks/hooks/post-commit` records `amended row=ID sha=<commit>`); a
verdict quoted before the amendment does not count.

Every row may carry optional trailing labeled fields, in any order:

- `| origin: REQ-NNN | domain | finding-NNN | derivation <date>` — provenance:
  which requirement, genus-row proposal, grade finding, or re-derivation
  sitting produced the row. `| origin: incorporation <date> D-NNN` — the decision line an incorporation (/vid:vid-incorporate) added; a rule row names its REQs after it.
- `| paid-at: gate-N <date> <deploy log row>` — on a deploy-owed row, the
  rung that paid it (v0.9.1 3.6); written by /vid deploy, never by a
  sandbox run.
- `| proved-red: <commit-sha>` — the commit at which the row's test was
  observed failing (§3.6). Init stamps it for materialised rows; a test added
  later records the parent commit where it was red. A row test with no
  proved-red has the same standing as `owed` — an unproved test is not
  evidence, and checks/inventory.sh counts it accordingly. The stamp is
  joined, not merely present (v0.8.1d): the sha must resolve, the cited
  file must exist at it, and the file there must name the row (its ROW id
  or its `derived-from` REQ id) — a sha at which the test was never red
  is a GAP. Cited test paths resolve against the commit under construction
  (the staged index, then HEAD), never the working tree: the rhythm is
  test (free ledger addition, observed red) → row (law commit, stamped with
  the parent) → code.
- `| golden: tests/invariants/<fixture>` and `| divergence: DIF-NNN` —
  on a row derived from a `derives: golden-set` item: the ratified golden
  set the row's test reads (one line per query: `query | must-appear |
  must-outrank | must-not-appear`, proposed by a fresh-context lens, never
  by the build or tuning context), and the difference row that legalises
  a model or engine divergence on that path. A named DIF must exist and
  carry a `paying-step:` (below) — checks/inventory.sh joins the two.

**Row shapes with no new class (v0.8.1d).** One row per independently
breakable promise of a requirement's complete block — the ROW is the
atomic unit, no sub-ids. A **trigger-existence row** (kind `behavior`,
subject the item, actor `(process)` under `grammar: 0.9.3` — so the
deployed pass pays it) for every time-worded Fail-if. A **volume row** per
list surface once a scale item exists. A **control sibling** of every
guard/never row — the allowed case demonstrably works, effect observed —
an ordinary ROW, `derived-from` the same REQ, obligation opening
`control of ROW-NNN: …`. **Property-form rows** through the public
surface: many-input datasets, and the four invariance relations —
reorder-invariance, rename-invariance of aggregates, repeat-idempotence,
unrelated-state-unchanged — each a falsifiable predicate over the
product's own outputs, never a reference implementation.

**Two tiers.** `tests/invariants/` is the ledger and the only tier rows
cite. `tests/scaffolding/` is the builder's non-law tier: implementation-
keyed instruments, never cited, never evidence, outside the coverage join,
proved-red, the extractors and the deletion tripwire; deletable without a
law commit; never run by the gate. Every fixture file under `tests/`
opens with a one-line `Provenance:` header — `hand-authored`, `captured
from <seam probe>`, or `generated by <generator path under tests/>` — so
a fixture whose expected value the system under test produced (circular)
is visible to the vacuity extractor.

## Census row classes (v0.7 — read by checks/census.sh)

    rule       | RULE-NNN | statement | census-command | tier | test
    difference | DIF-NNN  | knob | test-value | prod-value | why-safe [| paying-step: <rung> — <what re-runs against the real component>]
    exception  | EXC-NNN  | subject | census-class | why-rule-does-not-apply
    suppression| SUP-NNN  | subject | census-class | extractor-gap | fix-by

- A **rule** row's census command is its denominator — it enumerates every
  site the rule applies to; new code that adds a site is automatically in
  scope on the next run. Three forms: a ratified extractor path
  (`checks/extractors/invariant.<name>.sh`); two enumerations
  `<sites-cmd> :: <guarded-cmd>` (orphans = left minus right); or a single
  enumeration (a pure denominator the row's ledger test asserts over). The
  command may contain pipes; the statement field may not. An empty
  population is a FAILURE, never a pass (zero-denominator guard) — except
  while the rule's test is still `owed:`, when orphans AND an empty
  population report `pending` (ratified, not yet armed); materialising the
  test arms the census fail-closed.
- **State-machine variant (v0.8, §6.1).** A rule row whose statement field
  begins `state-machine <field>:` declares a transition table and is the
  landing spot for a lifecycle decision (publication status, alert
  lifecycle, consent):

      rule | RULE-NNN | state-machine <field>: draft>published published>archived | census-command | tier | test

  The declared transitions are the field's whole legal vocabulary
  (space-separated `from>to` pairs; a bare token declares a state with no
  transition, e.g. an initial state nothing transitions into). The census
  command enumerates every site that mutates or guard-reads the field,
  one line per site: `<site> <from>><to>` for a mutation, `<site> <state>`
  for a guard read. The engine convicts any site whose transition is not
  declared or whose state is outside the vocabulary — fail-closed, naming
  the site (grade brief instruction: find a state mutation outside the
  declared table). Zero-denominator, debt-awareness, and the population=1
  flag apply as for any rule row.
- A **difference** row is the only legal way for a knob to differ between
  test and prod. The census prints the full divergence table every run —
  the owner sees exactly what the green ledger did NOT validate. Every
  fake the harness substitutes is a divergence by construction — derived
  at materialisation, never waited for. A DIF that legalises a model or
  engine divergence on a golden-set item's path carries `paying-step:` —
  the deploy rung and the re-run that pays it (the golden set against
  the real component): a deferred test with a named step, never a
  permanent shrug. **The paying step `close run, profile=deployed`**
  (v0.9.3 3.3): a difference whose knob is the inline switch, a scheduler
  stand-in or the absent workers is paid by the close run's deployed pass,
  locally, and its deploy gate-2 sibling stays, narrowed to the platform
  half ("the platform's worker consumes it"); a knob whose real component
  exists only on the platform keeps `paying-step: staging`.
- An **exception** says the rule genuinely does not apply to this subject.
  Exceptions count toward the complexity law's ceremony threshold
  (CLAUDE.md §2): a rule whose exception list exceeds ~15–20% of its
  population is ceremony and is deleted.
- A **suppression** says the rule applies but the extractor cannot yet see
  the site — it never counts toward deletion and stands as a to-do against
  the extractor, printed every run. `census-class` in exception and
  suppression rows names the extractor class (`dead-path`, `divergence`,
  `reachability`, `vacuity`) for extractor orphans, and MUST name the
  specific `RULE-NNN` for a rule row's orphans — the class word is not a
  skeleton key across rules.

## Provider seam rows (v0.8 — read by checks/seams.sh)

    seam | SEAM-NNN | service | purpose | chosen: D-NNN | credentials: <held|not-yet|never> | probe: <owed | probed(YYYY-MM-DD) | unreachable-risk(reason)> | evidence: <contract-test path + captured-response path, or owed> | quirks: <one per ";", or "none yet"> [| module: <module id>] [| place: dev]

- One row per EXTERNAL service the product depends on — payments, mail,
  feeds, search, auth, storage: anything on the other side of the network
  this repo does not own. Two discovery doors (§3.2): init's architecture
  step declares known seams (an external boundary without a row cannot be
  ratified), and checks/seams.sh rejects a staged outbound destination no
  row covers — discovery is mechanical, not remembered.
- **Born owing a probe** — same debt semantics as every other row. Two
  legal exits: pay it (`probe: probed(date)`) or declare
  `unreachable-risk(reason)` with the reason stated. Never silent coverage.
- **The probe (§3.3) comes before the first client line:** the smallest
  real calls that answer the questions — never discover a limit by
  exceeding it (that is load-testing someone else's service; where docs
  are silent, chunk conservatively). Observed shapes, error semantics, and
  identifier-namespace behavior are written into the contract tests the
  evidence field names; the captured response becomes those tests' sample
  data — the surviving, shape-scoped form of fixture provenance. Contract
  tests are ledger additions (free) and are how the probe is paid; the row
  flip `owed → probed(date)` is a law change, standalone.
- Routing per the two-channel rule: a technical quirk is logged in the
  quirks field and pinned by a contract test; a quirk touching product
  meaning ("empty response cannot be distinguished from a broken feed")
  goes to the owner as a product question, never a silent log line.
- Optional `| module: <module id>` names the module of ARCHITECTURE.md's
  module table that talks to the service (its Module column, a dotted
  label read as a path). The project viewer lists the service among that
  module's contracts; no court reads it.
- Optional `| place: dev` (needs `credentials: held`) says the developers
  can reach the service from where they work, with credentials of their
  own, so its one real action is a test of the step that first builds
  against it. Only ticket mode reads it (checks/planner.sh); develop and
  every other court do as without it. Absent, the service is checked on
  the test site, at deploy gate 2.
- Optional trailing `| match: <tokens>` names the greppable tokens that
  identify code touching this seam (client-library import names,
  hostnames, space-separated). Absent, the service field is the match
  token. Pick tokens that will not legitimately occur otherwise — the
  vid-forbidden rule, applied here.
- checks/seams.sh (presence-gated, fail-closed): app-source additions
  matching an OWED seam's tokens are rejected naming the row (tests/ is
  exempt — contract tests are the probe's own artifact); a staged outbound
  destination covered by no seam row demands one before the code lands. A
  destination that is content, not an outbound call (a footer link), takes
  an exception row naming class `seam`.
- The grade brief carries this table with a standing instruction — find a
  behavior of this service the probe did not pin. vid-deploy's "one real
  action per provider seam" gate is these rows' re-verification, not a
  separate concept.

## Hostility rows (v0.8 §4 — read by checks/inventory.sh)

    hostility | HOS-NNN | attempt | protects: <RULE-NNN|REQ-NNN|ROW-NNN> | disable: <toggle> | test [| proved-red: <sha>]

- One row per **Tier-0 protection**, and for a Tier-0 requirement one per
  fail-if arm and, per arm, one per way in that reaches its subject (the
  bounded set, below): the sibling of a ratified Tier-0 rule
  row (`tier` = 0) or Tier-0 requirement, which *attempts the forbidden
  thing* against the locally running app through its real public surface,
  in the same Docker-only harness as every other ledger test. Reads confirm
  a guard is present and correct; only an attempt establishes that it
  holds. The measured class: a correct publication guard defeated by a
  different path erasing the state it read, and a rate-limit bound defeated
  by one rotated client-identity header — both present, both correct, both
  bypassed. The must-never-happen list, executed instead of trusted.
- `attempt` — one falsifiable sentence naming the forbidden thing the probe
  commits, never the guard it hopes to meet ("submit the same form twice
  concurrently, expect exactly one record", not "double-submit is guarded").
- `protects:` — the ratified protection this row is a sibling of: a
  Tier-0 rule row, a Tier-0 requirement, or a Tier-0 ROW (a ratified genus
  protection — the court resolves a ROW target to its REQ). Absent,
  the row is a sibling of nothing and is rejected.
- `disable:` — the named, reversible way that protection is turned OFF so
  the probe can be watched failing. Required; `none` and `n/a` are not
  values. It is a LOCAL mutation performed at materialisation and reverted
  in the same sitting (remove the guard clause, build without it) — never a
  runtime switch that ships. A guard with a production kill-switch is not a
  guard; the toggle is written down so the ritual can be re-run, not so the
  product can be unlocked.
- `test` — path under tests/invariants/, or `owed: <reason>`, as for any row.
- `proved-red:` is **mandatory** here, not optional as it is for a ROW row:
  a cited probe test with no proved-red is a GAP, not debt. A probe never
  observed failing is not evidence, and unlike an ordinary row it is
  evidence with the polarity that reassures.

### The bounded set

Derived mechanically from the ratified Tier-0 protections, never invented:
one probe per Tier-0 rule or invariant; for a Tier-0 requirement, one per
fail-if arm (as `checks/prd.sh` splits them) and, per arm, one per way in
that reaches its subject — the design's screens, each journey's entry
control, every input boundary ARCHITECTURE.md declares — the way in named
in the `attempt` sentence (0.26.10.29.4 phase 3, R3). checks/inventory.sh
prints `NOTE  REQ-n — <a> arms, <p> probes` for a requirement that fewer
rows protect than it has arms, counted as `arm-probes=<n>` on its
`inventory notes:` line; never owed. A fixed
list — explicitly not a fuzzer, not a scanner, no generated or open-ended
input exploration. Probes beyond the ratified protections are ceremony and
are deleted under the complexity law; the way to add one is to ratify the
protection it is the sibling of. The shapes these protections take,
stated as behavior so they carry to any stack:

- concurrent double-submit of the same action → exactly one record
- a replayed one-time link or token → exactly one effect, one timestamp
- a valid session for actor A requesting actor B's resource → refused, with
  an audit entry
- a transition attempted out of a state that forbids it (reject, then
  publish) → refused, whichever path sets the state
- a rotated client-identity header against a rate limit → the bound holds
- refresh mid-flow, expired-form resubmit, stale-state action → no double
  effect
- **dependency failure during the protected operation** (v0.8.1d): the
  seam the operation touches fails mid-way → the forbidden effect does
  not occur and the failure is recorded, never a silent success; the
  `disable:` toggle is the fail-closed handling itself (the measured
  class: an erasure that failed open when its store was down, whose probe
  counted residue through the pointer it had just blanked)
- **concurrency against the protected operation** (v0.8.1d): two
  simultaneous attempts → exactly one effect; the toggle is the
  serialisation guard

### The fail-first ritual (mandatory, §4.2)

A hostility probe passing proves nothing until it has been watched failing:
"refused" is equally green when the attempt was malformed and never reached
the guard at all. At materialisation, in one sitting, per probe:

1. **Prove the runner can go red** — invoke it with a selector naming a test
   that does not exist. Runners commonly exit 0 on a selection that matches
   nothing; wired that way, every probe below is a green that can never go
   red, which is worse than no probe at all. If it exits 0, fix the
   invocation before any probe is trusted.
2. **Disable** the protection by the row's own `disable:` toggle and run the
   probe. It MUST fail, and fail on its assertion about the forbidden effect
   — not on a connection error, a 404, or a fixture fault. A red for the
   wrong reason is the same false assurance in the other direction.
3. **Restore** the protection and run the probe. It MUST pass.
4. **Stamp** `proved-red: <sha>` — the commit at which step 2 was observed.

A probe with no verified failing state is REJECTED at materialisation: the
row stays `owed:` until the ritual is performed. checks/inventory.sh
enforces the mechanical half — a missing `protects:`, a missing or `none`
`disable:` toggle, and a cited test with no `proved-red` are GAPs that fail
the commit; a Tier-0 rule row with no hostility sibling is owed debt that
blocks completion (`--strict`); a ROW a hostility row's `protects:` names
by its ROW id, with no control sibling, is a NOTE, counted on its own line
(`inventory notes: control-siblings=<n>`) and never owed (0.26.10.29.3,
R5). The honesty of steps 1–3 is the builder's,
and the row is what the graders read.

Granularity is **screen × state** — the zero-results, expired, and error
variants are where gaps hide. Mandatory row classes, generated, not
judged: (1) every drawn screen × state, one surface row per applicable auth
state; (2) every requirement with a Fail-if, one behavior row; (3) **the
shell** in each auth state — header, footer, primary nav, error pages, empty
states; (4) reachability — every required surface reachable from an entry
point in its auth state, every default-navigation link resolves, a session
implies a sign-out control, no anonymous-only control shown authenticated or
vice versa; (5) every critical PRD journey end-to-end, one row each.

Browser-class rows (shell, reachability, journeys, the surface
instrument) are ledger tests in the engines the harness contract declares,
inside the container-only harness. **The sizing is law (v0.9.2 3.4,
R7):** ~5 shell rows + ~10 journey rows + one instrument for all screens
— written, for new projects, as a ledger test file per screen (its states
together, up to 5 rows a file; v0.9.8.1 R18), every file through the one
measure module, produced by the surface test-author pass
from the rows, the canvases and the measure module, one case per surface
row (screen × state × auth state), loading each state once per engine,
reading every load-bearing paint property in one evaluate, checking the
state's content, stray controls (the denominator: the whole page minus
the shell) and console errors, then the row's `pins:` hook on that same
loaded page. Surface rows cite their screen's file (its head carries the
row table); a surface test, or a pins hook, written by the builder is a
defect. Other new test files hold one row, or up to 5 related rows.

## Rows

```vid-inventory
grammar: 0.9.3
ROW-001 | shell | index.html | anonymous | n/a | Opened from disk (file://) in Chrome, the page shows one text field with a visible associated label, one button with visible text and an empty result area, and logs no console error. | REQ-003, REQ-010 | tests/invariants/row-001-shell-index.spec.js | origin: derivation 2026-11-27 | proved-red: dba6930
ROW-002 | reachability | index.html | anonymous | n/a | The page works opened straight from disk with no server: shooting https://example.com from a file:// load shows a link, and no request leaves the page. | REQ-001 | tests/invariants/row-002-reachability-file.spec.js | origin: derivation 2026-11-27 | proved-red: dba6930
ROW-003 | journey | Demonstrator | anonymous | n/a | The demonstrator decides to show a link shortener (off_screen), opens the page, shoots an address, reads the link, then shoots another that replaces it. transitions: 1. demonstrator at page opened · the field · types https://example.com/a and presses the button · link shown · a link https://shooter.app/ plus 6 letters and digits appears below the field, the field is empty and focused; 2. demonstrator at link shown · the field · types https://example.org and presses Enter · new link shown · exactly one link is visible, its code differs from the first, the field is empty and focused | REQ-001, REQ-003, REQ-004, REQ-005 | tests/invariants/row-003-journey-demonstrator.spec.js | origin: derivation 2026-11-27 | proved-red: dba6930
ROW-004 | behavior | REQ-001 | anonymous | n/a | Shooting a valid address shows exactly one link whose text is exactly https://shooter.app/ followed by exactly 6 characters, each a letter A-Z, a-z or a digit 0-9. | REQ-001 | tests/invariants/row-004-005-037-req-001-link.spec.js | origin: REQ-001 | proved-red: dba6930
ROW-005 | behavior | REQ-001 | anonymous | n/a | The link appears below the field: its rendered top edge is lower than the field's bottom edge. | REQ-001 | tests/invariants/row-004-005-037-req-001-link.spec.js | origin: REQ-001 | proved-red: dba6930
ROW-006 | behavior | REQ-002 | anonymous | n/a | Across 2,000 shots in one page load, the codes together contain every one of the 62 characters A-Z, a-z and 0-9, and no other character. | REQ-002 | tests/invariants/row-006-007-req-002-random-code.spec.js | origin: REQ-002 | proved-red: dba6930
ROW-007 | behavior | REQ-002 | anonymous | n/a | The code comes from crypto.getRandomValues: with that function replaced before load by a stub returning one fixed byte sequence whose first 6 bytes all lie within 0 to 61, and then varying bytes, the same fixed sequence gives the same first code on two fresh loads, a different fixed sequence gives a different first code, changing any one of the first 6 bytes to another value within 0 to 61 changes the first code, and replacing Math.random with a constant changes nothing about the codes shown. | REQ-002 | tests/invariants/row-006-007-req-002-random-code.spec.js | origin: REQ-002 | proved-red: dba6930
ROW-008 | behavior | REQ-003 | anonymous | n/a | The link is not clickable: the result area holds no anchor or element with a navigating href, and clicking the link text leaves the page address unchanged. | REQ-003 | tests/invariants/row-008-009-010-035-042-req-003-result.spec.js | origin: REQ-003 | proved-red: dba6930
ROW-009 | behavior | REQ-003 | anonymous | n/a | After a second valid shot exactly one link is visible and it is the second one; the first link's text appears nowhere on the page. | REQ-003 | tests/invariants/row-008-009-010-035-042-req-003-result.spec.js | origin: REQ-003 | proved-red: dba6930
ROW-010 | behavior | REQ-003 | anonymous | n/a | Before the first shot the result area shows nothing: its innerText is empty, it has no child elements, and the computed content of its ::before and ::after is none or empty. | REQ-003 | tests/invariants/row-008-009-010-035-042-req-003-result.spec.js | origin: REQ-003 | proved-red: dba6930
ROW-011 | behavior | REQ-004 | anonymous | n/a | After a valid shot the field's value is empty. | REQ-004 | tests/invariants/row-011-012-req-004-field-reset.spec.js | origin: REQ-004 | proved-red: dba6930
ROW-012 | behavior | REQ-004 | anonymous | n/a | After a valid shot made by clicking the button, typing on the keyboard without clicking enters the text into the field. | REQ-004 | tests/invariants/row-011-012-req-004-field-reset.spec.js | origin: REQ-004 | proved-red: dba6930
ROW-013 | behavior | REQ-005 | anonymous | n/a | Pressing Enter in the field holding a valid address shows a link, as the button does. | REQ-005 | tests/invariants/row-013-req-005-presses.spec.js | origin: REQ-005 | proved-red: dba6930
ROW-014 | behavior | REQ-005 | anonymous | n/a | Neither the button nor Enter reloads or navigates: a marker set on window before the shot survives it and the page address is unchanged, for a valid and for a rejected input. | REQ-005 | tests/invariants/row-014-req-005-page-stays.spec.js | origin: REQ-005 | proved-red: dba6930
ROW-015 | behavior | REQ-005 | anonymous | n/a | One press of the button, and one press of Enter, each change the result exactly once: the result area's text changes once per press, and ten rapid presses yield ten distinct codes in sequence. | REQ-005 | tests/invariants/row-013-req-005-presses.spec.js | origin: REQ-005 | proved-red: dba6930
ROW-016 | behavior | REQ-006 | anonymous | n/a | With a link already shown, and the field then emptied or holding only spaces, pressing the button or Enter keeps the same link, leaves the field unchanged, shows no message, and the field reports no browser validation message (validationMessage empty, checkValidity true); the same holds before any link exists. | REQ-006 | tests/invariants/row-016-017-029-032-req-006-rejected-shot.spec.js | origin: REQ-006 | proved-red: dba6930
ROW-017 | behavior | REQ-006 | anonymous | n/a | With a link already shown and the field holding hello, pressing the button or Enter keeps the earlier link, keeps hello in the field, shows no message and the field reports no browser validation message. | REQ-006 | tests/invariants/row-016-017-029-032-req-006-rejected-shot.spec.js | origin: REQ-006 | proved-red: dba6930
ROW-018 | behavior | REQ-007 | anonymous | n/a | control of ROW-019: each address in the accepted set (https://example.com, http://example.com/a/b, with surrounding spaces, https://example.com/search?q=cats#top, HTTPS://EXAMPLE.COM, https://sub.example.co.uk/path, https://example.com/a:b, https://example.com/?t=10:30) shot through the page shows a link. | REQ-007 | tests/invariants/row-018-019-052-053-req-007-named-sets.spec.js | origin: REQ-007 | proved-red: dba6930
ROW-019 | behavior | REQ-007 | anonymous | n/a | Each input in the rejected set (example.com, hello, https://localhost, https://localhost/a.b, https://localhost?x=a.b, https://localhost#a.b, ftp://example.com, https://example.com:8080, https://exa mple.com, https://, empty) shot through the page shows no link and changes nothing. | REQ-007 | tests/invariants/row-018-019-052-053-req-007-named-sets.spec.js | origin: REQ-007 | proved-red: dba6930
ROW-020 | behavior | REQ-008 | anonymous | n/a | Across 500 shots in one page load, half of them the same address, no code is shown twice. | REQ-008 | tests/invariants/row-020-023-req-008-011-no-repeat.spec.js | origin: REQ-008 | proved-red: dba6930
ROW-021 | behavior | REQ-009 | anonymous | n/a | Shooting valid addresses carrying markup, such as https://example.com/?q=<svg/onload=alert(1)> and https://example.com/<b>x</b>, runs no script, adds no element to the page, and leaves every displayed text as literal characters; a rejected input carrying markup does the same. | REQ-009 | tests/invariants/row-021-036-051-req-009-typed-markup.spec.js | origin: REQ-009 | proved-red: dba6930
ROW-022 | behavior | REQ-010 | anonymous | n/a | The result area carries aria-live polite and its text changes on every shot, including one that replaces an earlier link, so each new link is announced. | REQ-010 | tests/invariants/row-022-req-010-live-region.spec.js | origin: REQ-010 | proved-red: dba6930
ROW-023 | behavior | REQ-011 | anonymous | n/a | After at least 5 shots, with the random source stubbed to repeat once the bytes of the first code shown and then vary, the next shot shows a link whose code differs from every earlier code in this page load. | REQ-011 | tests/invariants/row-020-023-req-008-011-no-repeat.spec.js | origin: REQ-011 | proved-red: dba6930
ROW-024 | behavior | REQ-007 | anonymous | n/a | Shooting a 30,000-character near-miss such as https:// followed by 15,000 a. pairs and a trailing space, and a valid address of about 100,000 characters, are each decided within 1 second of the press; the near-miss shows no link, the long valid one shows one link, and a following valid shot works. | REQ-007 | tests/invariants/row-024-req-007-long-input-in-time.spec.js | origin: domain | proved-red: dba6930
ROW-025 | behavior | REQ-007 | anonymous | n/a | The check covers the whole input, not a part of it: hello https://example.com, xhttps://example.com, javascript:https://example.com, https://example.com https://evil.com and two addresses separated by a newline each show no link and change nothing. | REQ-007 | tests/invariants/row-025-026-027-028-049-req-007-malformed.spec.js | origin: domain | proved-red: dba6930
ROW-026 | behavior | REQ-007 | anonymous | n/a | An address with any whitespace inside it is rejected, not only the plain space: https://exa followed by a tab then mple.com, one with a non-breaking space, one with a zero-width space and one with a right-to-left override character each show no link. | REQ-007 | tests/invariants/row-025-026-027-028-049-req-007-malformed.spec.js | origin: domain | proved-red: dba6930
ROW-027 | behavior | REQ-007 | anonymous | n/a | A host that is not a real dotted name is rejected: https://., https://.., https://.com, https://a..b, https:///example.com and https://-.- each show no link. | REQ-007 | tests/invariants/row-025-026-027-028-049-req-007-malformed.spec.js | origin: domain | proved-red: dba6930
ROW-028 | behavior | REQ-007 | anonymous | n/a | A port is rejected wherever it sits: https://example.com:8080/path and https://example.com:/ each show no link. | REQ-007 | tests/invariants/row-025-026-027-028-049-req-007-malformed.spec.js | origin: domain | proved-red: dba6930
ROW-029 | behavior | REQ-006 | anonymous | n/a | A rejection does not stick: after shooting hello and then an empty field, shooting https://example.com by the button shows a link, and the same sequence by Enter does too. | REQ-006 | tests/invariants/row-016-017-029-032-req-006-rejected-shot.spec.js | origin: domain | proved-red: dba6930
ROW-030 | behavior | REQ-005 | anonymous | n/a | Shots log nothing to the console: shooting every input of the accepted and rejected sets, by button and by Enter, raises no uncaught error and logs no console error. | REQ-005 | tests/invariants/row-014-req-005-page-stays.spec.js | origin: domain | proved-red: dba6930
ROW-031 | behavior | REQ-005 | anonymous | n/a | The button is a real control for keyboard users: it is reached by Tab right after the field, and with focus on it both Space and Enter shoot the address in the field exactly as a click does. | REQ-005 | tests/invariants/row-013-req-005-presses.spec.js | origin: domain | proved-red: dba6930
ROW-032 | behavior | REQ-006 | anonymous | n/a | A rejected shot does not lose the keyboard user's place: after Enter with an invalid input focus stays in the field, and after the button with an invalid input focus is on the button, never on the page body. | REQ-006 | tests/invariants/row-016-017-029-032-req-006-rejected-shot.spec.js | origin: domain | proved-red: dba6930
ROW-033 | behavior | REQ-010 | anonymous | n/a | The polite live region exists at page load, before the first shot, is not aria-hidden, and is the same element whose text later becomes the link. | REQ-010 | tests/invariants/row-022-req-010-live-region.spec.js | origin: domain | proved-red: dba6930
ROW-034 | behavior | REQ-010 | anonymous | n/a | The page declares its language as English (lang en on the html element) and has a non-empty English title. | REQ-010 | tests/invariants/row-034-req-010-names-and-keyboard.spec.js | origin: domain | proved-red: dba6930
ROW-035 | behavior | REQ-003 | anonymous | n/a | The link is real page text that can be selected and copied: after a shot, selecting the result area gives exactly the shown link text, and the link is not drawn by CSS content, a canvas or an image. | REQ-003 | tests/invariants/row-008-009-010-035-042-req-003-result.spec.js | origin: domain | proved-red: dba6930
ROW-036 | behavior | REQ-009 | anonymous | n/a | Pasting or dropping clipboard content that carries HTML markup, such as an image tag with an onerror handler, into the field adds no element to the page, runs no script, leaves only plain text in the field, and a following shot behaves as for that plain text. | REQ-009 | tests/invariants/row-021-036-051-req-009-typed-markup.spec.js | origin: domain | proved-red: dba6930
ROW-037 | behavior | REQ-001 | anonymous | n/a | An ordinary shot of https://example.com, by button and by Enter, shows its link within 100 ms of the press, and no interim text such as loading ever appears in the result area. | REQ-001 | tests/invariants/row-004-005-037-req-001-link.spec.js | origin: domain | proved-red: dba6930
ROW-038 | behavior | REQ-010 | anonymous | n/a | At page load the result area is rendered: its computed display is not none, its visibility is visible and it has no hidden attribute, while its text is empty. | REQ-010 | tests/invariants/row-022-req-010-live-region.spec.js | origin: domain | proved-red: dba6930
ROW-039 | behavior | REQ-010 | anonymous | n/a | Each control's computed accessible name contains its visible words: the button's name contains its visible text and the field's name contains its visible label text. | REQ-010 | tests/invariants/row-034-req-010-names-and-keyboard.spec.js | origin: domain | proved-red: dba6930
ROW-040 | behavior | REQ-010 | anonymous | n/a | The button is never disabled or taken out of the keyboard path: with the field empty, and again holding hello, Tab from the field lands on the button and it reports neither disabled nor aria-disabled. | REQ-010 | tests/invariants/row-034-req-010-names-and-keyboard.spec.js | origin: domain | proved-red: dba6930
ROW-041 | behavior | REQ-001 | anonymous | n/a | The page works wherever its folder is copied: copied to a new directory whose path holds a space and a non-ASCII letter and opened from there by file://, shooting https://example.com shows a link with no console error and no failed resource load. | REQ-001 | tests/invariants/row-041-045-req-001-portable-page.spec.js | origin: domain | proved-red: dba6930
ROW-042 | behavior | REQ-003 | anonymous | n/a | A reload starts fresh: after typing https://example.com without shooting, or after a shot, a reload shows an empty field and an empty result area. | REQ-003 | tests/invariants/row-008-009-010-035-042-req-003-result.spec.js | origin: domain | proved-red: dba6930
ROW-043 | behavior | REQ-005 | anonymous | n/a | A shot adds no browser history entry: history.length is the same before and after a valid shot and a rejected shot, by the button and by Enter. | REQ-005 | tests/invariants/row-014-req-005-page-stays.spec.js | origin: domain | proved-red: dba6930
ROW-044 | behavior | REQ-005 | anonymous | n/a | Holding Enter makes one link: with a valid address in the field, one Enter keydown followed by at least 10 keydown events with repeat true, then one keyup, changes the result area exactly once. | REQ-005 | tests/invariants/row-013-req-005-presses.spec.js | origin: domain | proved-red: dba6930
ROW-045 | behavior | REQ-001 | anonymous | n/a | The page declares UTF-8 within its first 1024 bytes, and opened from file:// its visible text, title and accessible names show no replacement or mis-decoded characters. | REQ-001 | tests/invariants/row-041-045-req-001-portable-page.spec.js | origin: domain | proved-red: dba6930
ROW-046 | behavior | REQ-010 | anonymous | n/a | Each new link is announced whole: after a second shot, either the result area carries aria-atomic true or its whole content is replaced at once by one text holding the full link, prefix included. | REQ-010 | tests/invariants/row-022-req-010-live-region.spec.js | origin: domain | proved-red: dba6930
ROW-047 | behavior | REQ-007 | anonymous | n/a | A host holding characters a host name cannot hold is rejected: https://exa%20mple.com, https://exa<mple.com, https://a"b.com, https://exa_mple.com/ and https://a*b.com each show no link and change nothing. | REQ-007 | tests/invariants/row-047-048-050-req-007-hosts-and-generated.spec.js | origin: domain | proved-red: dba6930
ROW-048 | behavior | REQ-007 | anonymous | n/a | control of ROW-047: https://my-site.example.com, a host with a hyphen and several labels, shows a link. | REQ-007 | tests/invariants/row-047-048-050-req-007-hosts-and-generated.spec.js | origin: domain | proved-red: dba6930
ROW-049 | behavior | REQ-007 | anonymous | n/a | A malformed scheme separator is rejected: https:\\example.com, https:/example.com, https:example.com and https//example.com each show no link and change nothing. | REQ-007 | tests/invariants/row-025-026-027-028-049-req-007-malformed.spec.js | origin: domain | proved-red: dba6930
ROW-050 | behavior | REQ-007 | anonymous | n/a | Generated addresses, not only named examples: 200 addresses built at random from http or https in random letter case, a host of 2 to 4 labels of a-z, 0-9 and inner hyphens (each label starting and ending with a letter or digit), and an optional random path, query and anchor drawn only from a-z, 0-9, / - _ . = and & each show a link; each one then mutated by inserting a port written :<digits> right after the host, inserting a space or a tab strictly inside the address after the scheme and before its last character (never a line break), dropping the scheme, or dropping every dot in the host shows no link. | REQ-007 | tests/invariants/row-047-048-050-req-007-hosts-and-generated.spec.js | origin: domain | proved-red: dba6930
ROW-051 | behavior | REQ-009 | anonymous | n/a | Entities are never decoded into the page: shooting https://example.com/?a=&lt;b&gt;&amp; and one carrying &#60; leaves no text node, attribute or document title anywhere holding the decoded < or & form of the typed text. | REQ-009 | tests/invariants/row-021-036-051-req-009-typed-markup.spec.js | origin: domain | proved-red: dba6930
ROW-052 | behavior | REQ-007 | anonymous | n/a | control of ROW-053: https://example.com with a tab before it, and with a line break after it, pasted into the field and shot shows a link. | REQ-007 | tests/invariants/row-018-019-052-053-req-007-named-sets.spec.js | origin: REQ-007 | proved-red: dba6930
ROW-053 | behavior | REQ-007 | anonymous | n/a | https://münchen.de, https://user:pass@example.com, https://google.com@evil.com and https://example. each show no link and change nothing. | REQ-007 | tests/invariants/row-018-019-052-053-req-007-named-sets.spec.js | origin: REQ-007 | proved-red: dba6930
ROW-054 | behavior | REQ-012 | anonymous | n/a | When the page opens from file://, typing on the keyboard without clicking puts the text into the field. | REQ-012 | tests/invariants/row-054-req-012-file-focus.spec.js | origin: REQ-012 | proved-red: dba6930
exception | EXC-001 | product | seam | the harness's own product service, reached by the tests inside the test stack's network at http://product:80; no call leaves the machine and the product itself makes no outbound call (NG-001, A-001)
```
