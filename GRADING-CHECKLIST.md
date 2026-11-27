# URL Shooter — GRADING CHECKLIST

> Owner-curated, versioned, injected VERBATIM into every grading brief
> (§7.2). This is the residue that stays human: absent guards leave no
> artifact — no orphan, no site list, no divergent knob — so no census can
> find them; only domain knowledge names them in advance. Every accepted
> absent-guard finding adds one line here: this run's blind spot becomes the
> next run's standard question. Seeded at init from the interview and the
> plugin's seed library (seed/checklist.md); lines the owner marks general
> at run end are promoted back into the seed (§7.3). A seeded line that
> fires nothing across two runs is dropped (the complexity law).

## Standing lines (every project)

- **Harness attacks.** Check that the test harness itself has not been
  defeated: assertion-neutralising equality overrides (`__eq__` and its
  analogues), early process exit before assertions run (`sys.exit(0)` and
  its analogues), test-framework monkey-patching, skipped or filtered tests
  counted as run. Measured hidden-test hack rates of 12–13% make "the suite
  exited 0" an attackable claim.
- **Example-only evidence.** A computational promise — a calculation, a
  ranking, a match, a decision — proved only by published, named examples
  is unproved: find the implementation that branches on the fixture and
  answers correctly for exactly those inputs. Generated or independently
  sampled inputs are the standard (exact fixture-named assertions can be
  satisfied by branching on the fixture names, with no engine built).
- **Probe fixture realism.** Tidy stand-in fixtures carry none of the
  hostile properties of real input: check that a hostility probe's input
  is hostile in every field the product stores or renders, not only the
  one the probe asserts on, and that filenames, addresses and markup look
  like the real thing (hostile markup planted in the description alone
  leaves every other field between a hostile feed and stored script).
- **Assertion strength on Tier-0.** A Tier-0 row whose test asserts only
  that something EXISTS — an element is present, a record count is at
  least one, a status is in a set spanning success and redirect — is a
  finding: name the value or behaviour the assertion should have pinned
  (the ladder: existence → type → status → value → behaviour; presence
  assertions can outnumber real visibility assertions many times over).

## Domain lines

- **Focus indicator.** Do author styles remove the visible focus indicator on the field or the button (outline none with no visible replacement)? | origin: domain
- **Zoom.** Does any viewport setting block zoom (user-scalable=no, or a maximum-scale below 2)? | origin: domain
- **Reflow.** At a 320 px window or 200% zoom, is the whole link still visible, not clipped or pushed off screen? | origin: domain
- **Typed text goes nowhere.** Does any code path copy the field's value anywhere other than the address check: the title, the page address, storage, the console, attributes or ids? | origin: domain
- **Order and labels.** Do reading and Tab order run label, field, button, result, with no positive tabindex, and does the label name the field's purpose? | origin: domain
- **Plain field.** Is the field an input of type text (not a textarea, contenteditable, url or email input), with no paste or drop handler that reads HTML? | origin: domain
- **No form history.** Does the field turn off browser autocomplete and form history, so no earlier address is offered back after a reload? | origin: domain
- **Input-method Enter.** Does the Enter handler ignore Enter pressed to finish an input-method composition (isComposing)? | origin: domain
- **Visible words.** Is every visible string plain English with no placeholder or debug text, does the label say a web address goes in, and does the button name the action? | origin: domain
- **Contrast.** Do the label, button text and result text keep at least 4.5:1 contrast and stay visible under forced-colors, with no author colour, opacity or background-image tricks? | origin: domain

## Fences (non-goals: building any of these is a defect)

- NG-001: the short link never redirects; no server, no lookup of codes.
- NG-002: nothing is stored and there is no history of earlier links; a reload starts fresh.
- NG-003: no visual design beyond the browser's defaults.
- NG-004: not a production app: no deployment, accounts or analytics.
- D-002: Chrome only; other browsers are not a test target.
