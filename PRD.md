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


```vid-prd
REQ-001 | functional | T1 | When the button is pressed with a valid web address in the field, the page shows below the field one link made of the prefix https://shooter.app/ followed by a code of exactly 6 letters and digits. | fail-if: (1) a valid address produces no link; (2) the link does not start with exactly https://shooter.app/; (3) the code after the prefix is not exactly 6 characters; (4) the code holds a character that is not a letter or a digit; (5) the link appears somewhere other than below the field | serves: the whole point of the demo is seeing a long address become a short link in one click | authority: authoritative | source: seed, A-003, A-005 | covers: DIM-code-generation | phase: pilot | feature: FEAT-01 | plain: A valid address becomes a link starting https://shooter.app/ with a 6-character code of letters and digits, shown below the field.
REQ-002 | functional | T2 | Each code character is picked from upper-case A to Z, lower-case a to z and digits 0 to 9 using the browser's cryptographic random source. | fail-if: (1) across many shots the codes never contain upper-case letters, never lower-case letters or never digits; (2) the code is derived from the typed address so the same address always yields the same code; (3) the code comes from Math.random or a counter rather than crypto.getRandomValues | serves: codes that look random and are hard to guess make the demo credible | authority: provisional | confirms_via: owner-decision/no | source: A-010, A-015 | covers: DIM-code-generation | phase: pilot | feature: FEAT-01 | plain: Every code character is drawn at random from capital letters, small letters and digits.
REQ-003 | functional | T1 | The link is shown as plain text that cannot be clicked; each new link replaces the previous one, and before the first shot the result area is empty. | fail-if: (1) the link is a clickable element that navigates anywhere; (2) after a second shot the first link is still visible; (3) more than one link is shown at once; (4) something other than nothing is shown in the result area before the first shot | serves: the link is only for show, since there is no server to redirect it | authority: provisional | confirms_via: owner-decision/no | source: A-001, A-004, A-012 | covers: DIM-result-presentation | phase: pilot | feature: FEAT-01 | plain: The short link is plain text, never clickable, and each new link replaces the previous one.
REQ-004 | functional | T1 | After a successful shot the field is empty and keyboard focus is in the field, so the next address can be typed at once. | fail-if: (1) the field still holds the shot address afterwards; (2) after a shot, typing does not enter text into the field without first clicking it | serves: the demonstrator can shoot several links in a row without reaching for the mouse | authority: provisional | confirms_via: owner-decision/no | source: seed, A-013 | covers: DIM-field-reset-focus, DIM-core-loop-continuity | phase: pilot | feature: FEAT-01 | plain: After a link is made the field is cleared and ready for the next address.
REQ-005 | functional | T1 | Pressing Enter in the field does exactly what pressing the button does, and neither ever reloads or navigates the page. | fail-if: (1) Enter in the field with a valid address makes no link; (2) Enter or the button reloads the page or changes its address; (3) one press of Enter or of the button makes more than one link | serves: keyboard and mouse users both get one link per press without losing the page | authority: provisional | confirms_via: owner-decision/no | source: A-011 | covers: DIM-submit-triggers | phase: pilot | feature: FEAT-01 | plain: Pressing Enter works like the button, one press makes one link, and the page never reloads.
REQ-006 | functional | T1 | When the field is empty, holds only spaces, or holds text that fails the web-address check, pressing the button or Enter changes nothing on the page. | fail-if: (1) a rejected input produces a link; (2) a rejected input shows an error message or a browser validation tooltip; (3) a rejected input clears or changes the field's text; (4) a rejected input removes or changes the link already shown | serves: the owner wants the demo to work only with a real value and stay quiet otherwise | authority: provisional | confirms_via: owner-decision/no | source: A-002, A-008 | covers: DIM-invalid-input | phase: pilot | feature: FEAT-02 | plain: An empty or invalid entry does nothing at all: no link, no message, and the screen stays as it was.
REQ-007 | functional | T1 | The web-address check is a regular expression that, after trimming surrounding spaces, accepts an address starting with http:// or https:// in any letter case, followed by a host name with at least one dot, then an optional path, query and anchor, and rejects anything else, including an address with a port or a space inside it. | fail-if: (1) https://example.com is rejected; (2) http://example.com/a/b is rejected; (3) an address with surrounding spaces is rejected; (4) example.com with no scheme is accepted; (5) hello is accepted; (6) https://localhost with no dot is accepted; (7) ftp://example.com is accepted; (8) https://example.com/search?q=cats#top is rejected; (9) HTTPS://EXAMPLE.COM is rejected; (10) https://example.com:8080 is accepted; (11) https://exa mple.com is accepted | serves: only something that looks like a real web address deserves a short link | authority: provisional | confirms_via: owner-decision/no | source: A-006, A-009, A-018, A-019, A-020 | covers: DIM-url-acceptance | phase: pilot | feature: FEAT-02 | plain: Only text starting with http:// or https:// and a host with a dot counts as a web address; ports and inner spaces are refused.
REQ-008 | functional | T1 | Within one page load no code is ever shown twice: the same address shot again gets a new code, and a code that clashes with an earlier one is replaced by a fresh one before it is shown. | fail-if: (1) two shots in one page load show the same code; (2) shooting the same address twice shows the same code both times; (3) a clash makes no link instead of a fresh code | serves: the owner wants every link in a session to be distinct | authority: provisional | confirms_via: owner-decision/no | source: A-007, A-014 | covers: DIM-session-uniqueness | phase: pilot | feature: FEAT-01 | plain: No code repeats within one page load, even when the same address is shot twice.
REQ-009 | nfr | T1 | Text typed into the field is never interpreted as page markup or script. | fail-if: (1) typing an address containing <img src=x onerror=alert(1)> and shooting it runs script or adds an element to the page; (2) the page puts typed text into the page through innerHTML or an equivalent | serves: a demo that runs whatever is typed would be an embarrassing security hole | authority: provisional | confirms_via: owner-decision/no | source: A-012 | covers: DIM-nfr-security | phase: pilot | feature: FEAT-02 | plain: Whatever is typed is treated as plain text and can never run as code on the page.
REQ-010 | nfr | T2 | The field has a visible text label tied to it, the button has visible text, and each new link is announced by screen readers through a polite live region. | fail-if: (1) the field has no programmatically associated label; (2) the button has no text; (3) the result area is not an aria-live polite region | serves: anyone using a screen reader can follow the demo | authority: provisional | confirms_via: owner-decision/no | source: A-017 | covers: DIM-nfr-accessibility | phase: pilot | feature: FEAT-01 | plain: The field and button are labelled and screen readers announce each new link.
CON-001 | constraint | T1 | The product is one HTML page using plain JavaScript with no framework, all text in English, run locally in a browser with no server. | authority: authoritative | source: seed | feature: FEAT-01
NG-001 | non_goal | - | The short link never redirects; no server, no lookup of codes. | authority: authoritative | source: A-001
NG-002 | non_goal | - | Nothing is stored and there is no history of earlier links; a reload starts fresh. | authority: provisional | confirms_via: owner-decision/no | source: A-004, A-014
NG-003 | non_goal | - | No visual design beyond the browser's defaults. | authority: authoritative | source: seed
NG-004 | non_goal | - | Not a production app: no deployment, accounts or analytics. | authority: authoritative | source: seed
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
A-017 | model_proposed | 2026-11-27 | Q: What accessibility baseline does the page meet? | A: The field has a visible text label tied to it, the button has visible text, and the result area is a polite live region so a screen reader announces each new link. | settles: MECH-01 | shown: pause-2 2843298923
A-018 | human | 2026-11-27 | Q: Should addresses with a query (?q=cats) or an anchor (#part) count as web addresses? | A: Yes, both are accepted. | settles: REQ-007
A-019 | human | 2026-11-27 | Q: Should an address with a port number, such as example.com:8080, count? | A: No; an address with a port is rejected, to keep the demo simple. | settles: REQ-007
A-020 | human | 2026-11-27 | Q: Should HTTPS:// in capitals count, and should an address with a space inside it be rejected? | A: Yes; the scheme matches in any letter case, and an address with a space inside it is rejected. | settles: REQ-007
```

## Open decisions

## Findings

### 2026-11-27 — pause 1 sitting

The thesis red-team returned a clean verdict: no findings.

### 2026-11-27 — pause 2 sitting

```vid-prd-findings
F-01 | audit | blocking | REQ-007 | repaired | evidence: major — the address check said nothing about queries, anchors, ports, scheme letter case or inner spaces, so a pasted real link could be silently rejected; repaired from A-018, A-019, A-020
```

## Ratifications

- 2026-11-27 — thesis+contract — 4fe040f

## Appends
