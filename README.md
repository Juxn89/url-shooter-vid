# URL Shooter

A single-page local demo: type a web address, press the button, and a made-up short link `https://shooter.app/<6 letters and digits>` appears below the field. The link is only shown; it never redirects. Plain JavaScript, no framework, English only, run locally in Chrome. A demo, not a production app.

The spec is PRD.md. How to run, how to test (`sh checks/test.sh`) and the preview command arrive with the code skeleton.

## Before you put this online

Not a framework. A sticky note. With /vid deploy, items 1, 2, 4 and 5 are
enforced structurally — the rest still matter.

1. Restore one backup before you trust backups — actually run the restore, once, end to end.
2. Redirect a week of outbound email to your own inbox first; read what the product sends.
3. Try one real feed/integration end-to-end before switching them all on.
4. Rotate any secret an agent ever saw — every key that was ever pasted into a session.
5. Agents never hold prod credentials. Deploys happen from your hands, not from a session.
6. Put a spending cap on every paid API and on the hosting account.
7. Check each Tier-0 row in BASELINE.md by hand once, in the real environment.
8. Keep a copy of PRD.md and DECISIONS.md somewhere off the server.
9. First week: read the logs daily. Boring logs are the goal.
10. When something is wrong, run /vid:vid-fix and answer its questions — don't patch by hand.
