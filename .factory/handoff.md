# Verification handoff — Chore Rulebook 1.0.5

- Work order: `chore-rulebook-verify-4`
- Verified candidate: `97e365f518aec83d61f1d7bc0804ab4b3547286a`
- Live URL: <https://chore-rulebook.sociobot.in>
- Verified: 2026-08-29 UTC
- Result: **PASS — accepted for release**

Fresh independent QA passed all 16 mandatory claim commands, `npm run check`
(12 unit tests, TypeScript, production build, and 60 desktop/mobile browser
tests), live accessibility/privacy checks, PWA offline reload and update,
routing/headers/caching, and live checkout/rate-limit verification. The live
downloadable production artifacts byte-match this candidate.

## How to verify

```sh
npm ci
npm run check
```

Run each exact command in `.factory/claims.json` separately to reproduce the
claims gate. The one-click demo is `/demo`; its `demo:chore-rulebook` storage
is separate from a real `chore-rulebook` rulebook.

## Known gap

The live manifest is sent as `application/octet-stream`. Chromium still parses
it and all PWA/offline checks pass, so it is low severity and not a release
blocker. Configure the host to return `application/manifest+json` (or JSON)
for `.webmanifest` in a follow-up. No blocker, high, or medium defects remain.

Full evidence and exact observations are in
[`.factory/verification-4.md`](verification-4.md).
