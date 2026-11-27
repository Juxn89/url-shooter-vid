# URL Shooter — PRD
grammar: 0.26.11.1.2

> **Precedence rule:** the base of this file (everything above `## Appends`)
> is immutable after final ratification. All change is appended under
> `## Appends`. Later appends win over the base and over earlier appends.
> Authority order within the record: Seed and human answers > ratified
> thesis > sources > model proposals.

## Seed

An url shooter app, 1 field, 1 button, the resulta appears bellow, reset de input, the must start with https:\\shooter.app\, generete a rando code for the rest of the url, use javascript vanilla, no js framework, a single page, no designe, all in english, run in local, this is a demo non a production app

## Thesis

### Product summary

URL Shooter is a single-page local demo that turns a web address typed into one field into a short-looking link, https://shooter.app/ followed by a random code, shown below the field.

### Primary users

One person running the demo locally in a browser — the demonstrator and anyone watching — who wants to see a link shortened in one click.

### MVP focus

- G1: Turn a valid web address into a short link with the https://shooter.app/ prefix and a random code, shown below the field in one click.
- G2: Make nothing when the field is empty or holds text that is not a web address.

### Explicitly not MVP

The short link never redirects: there is no server, no storage, and no history (a new result replaces the previous one). No visual design, no framework, no languages other than English, no deployment beyond running locally. This is a demo, not a production app.

### Required core flows

- Shoot a link: type a web address, press the button, read the short link below, and find the field empty for the next one.

### Value logic

The demo's value is showing the shortening interaction end to end in one page with no setup: one field, one button, one visible result.

### Evidence basis

The seed's prefix `https:\\shooter.app\` is read as `https://shooter.app/` (A-005). No sources conflict.

## Actors and journeys

### Demonstrator

1. Decides to show how a link shortener works (off_screen)
2. Opens the page locally in a browser
3. Types or pastes a web address into the field and presses the button
4. Reads the short link shown below; the field is now empty
5. Shoots another address; the new link replaces the old one

## Mechanisms

```vid-prd-mechanisms
MECH-01 | G1 | Pressing the button builds the link from the fixed prefix and a fresh 6-character code of letters and digits, shows it below the field and empties the field. | stated: seed "generete a rando code for the rest of the url"
MECH-02 | G1 | A code already given out in this page session is never given out again. | stated: answer A-007
MECH-03 | G2 | Before building, the input is checked as non-empty and matching a web-address regular expression; otherwise nothing happens. | stated: answer A-002
```

## Content contract

```vid-prd-contract
DIM-nfr-security | NFR: security | nfr | required | covered_by: nfr, constraint, invariant, functional | status: covered
DIM-nfr-accessibility | NFR: accessibility | nfr | required | covered_by: nfr, constraint | status: covered
DIM-core-loop-continuity | Core-loop continuity (post-action journeys & recovery) | mechanism | required | covered_by: functional, ux_flow, data_entity | status: covered
DIM-url-acceptance | Which inputs count as a web address | mechanism | required | covered_by: functional, constraint, invariant | prompt: without it a builder writes its own regex and decides schemes, bare domains, localhost, ports and whitespace trimming alone | status: covered
DIM-invalid-input | What a rejected input does to the screen | mechanism | required | covered_by: functional, ux_flow, invariant | prompt: without it a builder decides whether "nothing" means silence or a message, whether the field or the previous result is cleared, and whether a browser validation tooltip appears | status: covered
DIM-submit-triggers | What starts a shot | mechanism | required | covered_by: functional, ux_flow | prompt: without it a builder decides whether Enter submits, whether the page reloads, and what rapid repeated presses make | status: covered
DIM-result-presentation | How the short link is shown | mechanism | required | covered_by: functional, ux_flow, constraint | prompt: without it a builder decides whether the link is plain text or a clickable dead link, what shows before any result, and whether typed text is inserted as HTML | status: covered
DIM-field-reset-focus | The field after a shot | mechanism | required | covered_by: functional, ux_flow | prompt: without it a builder decides whether the field empties and where keyboard focus goes for the next entry | status: covered
DIM-code-generation | The random code itself | mechanism | required | covered_by: functional, invariant, constraint | prompt: without it a builder decides the alphabet, the exact length and the random source of the code | status: covered
DIM-session-uniqueness | Code uniqueness within a session | mechanism | required | covered_by: invariant, functional, data_entity | prompt: without it a builder decides what a session is, whether the same address twice reuses its code, and how a clash is retried | status: covered
```

## Criticality tiers

- **T0** — must never break or leak.
- **T1** — core behavior; getting it wrong is a defect.
- **T2** — desirable; getting it wrong is a fix-round item.

## Items

```vid-prd-features
FEAT-01 | G1 | Shoot a link
FEAT-02 | G2 | Input check
```


## Answer ledger

```vid-prd-answers
A-001 | human | 2026-11-27 | Q: Should the short link open the original page when clicked, or only be shown? | A: Only shown; there is no server and the link never redirects. | settles: thesis
A-002 | human | 2026-11-27 | Q: What happens when the field is empty or the text is not a web address? | A: Nothing happens; a link is made only when the field holds a value. | settles: MECH-03
A-003 | human | 2026-11-27 | Q: How should the random part of the link look? | A: 6 letters and digits. | settles: MECH-01
A-004 | human | 2026-11-27 | Q: When a new link is made, what happens to the previous result? | A: It is replaced by the new one; only the latest result is shown. | settles: thesis
A-005 | human | 2026-11-27 | Q: Is the prefix https://shooter.app/ with forward slashes? | A: Yes, the prefix is https://shooter.app/ exactly. | settles: MECH-01
A-006 | human | 2026-11-27 | Q: Boundary challenge — keep checking that the input is a real web address? | A: Keep it; the check is a regular expression on the input. | settles: MECH-03
A-007 | human | 2026-11-27 | Q: Boundary challenge — keep the guarantee that no two links in a session share a code? | A: Keep it. | settles: MECH-02
A-008 | model_proposed | 2026-11-27 | Q: What happens when the input fails the web-address check? | A: The same as an empty field: no link, no error message, no browser validation tooltip; the previous result and the field are left as they were. | settles: MECH-03 | shown: pause-1 1086670630
A-009 | model_proposed | 2026-11-27 | Q: Which addresses does the web-address check accept? | A: Addresses starting with http:// or https:// followed by a host name with at least one dot, optionally a path; surrounding spaces are trimmed first. | settles: MECH-03 | shown: pause-1 2657018212
A-010 | model_proposed | 2026-11-27 | Q: Which letters may the code use? | A: Upper-case A to Z, lower-case a to z and digits 0 to 9, each character picked at random. | settles: MECH-01 | shown: pause-1 2687710725
A-011 | model_proposed | 2026-11-27 | Q: Does pressing Enter in the field act like the button? | A: Yes, pressing Enter in the field does the same as pressing the button. | settles: MECH-01 | shown: pause-1 1552630307
A-012 | model_proposed | 2026-11-27 | Q: How is the short link shown? | A: As plain text below the field, not a clickable link; before the first shot the result area is empty; typed text is never inserted into the page as HTML. | settles: MECH-01 | shown: pause-1 2137301198
A-013 | model_proposed | 2026-11-27 | Q: Where does keyboard focus go after a shot? | A: Back to the emptied field, ready for the next address. | settles: MECH-01 | shown: pause-1 2958417310
A-014 | model_proposed | 2026-11-27 | Q: What is a session, and does the same address twice reuse its code? | A: A session is one page load; nothing is stored, so a reload starts fresh; the same address shot twice gets a new code each time; a code clash is retried until a free code is found. | settles: MECH-02 | shown: pause-1 644883112
A-015 | model_proposed | 2026-11-27 | Q: Which random source makes the code? | A: The browser's cryptographic random source (crypto.getRandomValues). | settles: MECH-01 | shown: pause-1 2975303643
A-016 | human | 2026-11-27 | Q: Contract sitting — which qualities must the requirements cover? | A: Accepted as recommended: keep security, accessibility, core-loop continuity and the seven panel qualities (url acceptance, invalid input, submit triggers, result presentation, field reset and focus, code generation, session uniqueness); search-engine visibility and other languages ruled out; the other fifteen catalog qualities struck as not applying to a local demo with no accounts and no storage. | settles: contract
```

## Open decisions

## Findings

### 2026-11-27 — pause 1 sitting

The thesis red-team returned a clean verdict: no findings.

## Ratifications

## Appends
